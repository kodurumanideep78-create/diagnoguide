import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "../../shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, router } from "../_core/trpc";
import {
  attachPasswordCredentialToUser,
  createPasswordUser,
  getPasswordCredentialByEmail,
  getPasswordCredentialByUserId,
  getUserByEmail,
  getUserById,
  touchUserLastSignedIn,
} from "../db";
import { CREDENTIAL_SESSION_COOKIE, createCredentialSession } from "../credentialSession";
import { assertLoginAllowed, clearLoginFailures, consumeSignupAttempt, recordLoginFailure } from "../loginRateLimit";
import { hashPassword, normalizeEmail, verifyPassword } from "../passwords";

const emailSchema = z.string().trim().email().max(320);
const newPasswordSchema = z.string().min(12, "Use at least 12 characters.").max(128);
const loginInput = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().default(false),
});
const registrationInput = z.object({
  name: z.string().trim().max(80).optional(),
  email: emailSchema,
  password: newPasswordSchema,
  rememberMe: z.boolean().default(false),
});
const conversionInput = z.object({
  password: newPasswordSchema,
  rememberMe: z.boolean().default(false),
});

type PublicUser = Pick<User, "id" | "name" | "email" | "role">;
function publicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function setCredentialCookie(ctx: { req: Parameters<typeof getSessionCookieOptions>[0]; res: { cookie: (name: string, value: string, options: Record<string, unknown>) => void } }, token: string, rememberMe: boolean) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
  ctx.res.cookie(CREDENTIAL_SESSION_COOKIE, token, {
    ...getSessionCookieOptions(ctx.req),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

function clearLegacyCookie(ctx: { req: Parameters<typeof getSessionCookieOptions>[0]; res: { clearCookie: (name: string, options: Record<string, unknown>) => void } }) {
  ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
}

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "ER_DUP_ENTRY");
}

let dummyHash: Promise<string> | null = null;
function getDummyHash() {
  dummyHash ??= hashPassword("diagnoguide-invalid-login-dummy-secret");
  return dummyHash;
}

export const authRouter = router({
  /** Email/password identity only. A legacy OAuth session is never returned as signed in. */
  me: publicProcedure.query(({ ctx }) => (ctx.user ? publicUser(ctx.user) : null)),

  login: publicProcedure.input(loginInput).mutation(async ({ ctx, input }) => {
    const email = normalizeEmail(input.email);
    assertLoginAllowed(ctx.req, email);
    const credential = await getPasswordCredentialByEmail(email);
    const comparisonHash = credential?.passwordHash ?? await getDummyHash();
    const passwordMatches = await verifyPassword(input.password, comparisonHash);
    const user = credential && passwordMatches ? await getUserById(credential.userId) : undefined;
    if (!credential || !passwordMatches || !user) {
      recordLoginFailure(ctx.req, email);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
    }

    clearLoginFailures(ctx.req, email);
    await touchUserLastSignedIn(user.id);
    const refreshedUser = await getUserById(user.id);
    if (!refreshedUser) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not load the signed-in account." });
    const token = await createCredentialSession(refreshedUser.id, input.rememberMe);
    setCredentialCookie(ctx, token, input.rememberMe);
    return publicUser(refreshedUser);
  }),

  register: publicProcedure.input(registrationInput).mutation(async ({ ctx, input }) => {
    consumeSignupAttempt(ctx.req);
    const email = normalizeEmail(input.email);
    if (await getPasswordCredentialByEmail(email)) {
      throw new TRPCError({ code: "CONFLICT", message: "An account with that email already exists. Try signing in instead." });
    }
    const legacyAccount = await getUserByEmail(email);
    if (legacyAccount) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A saved account already uses this email. Use the one-time password setup from an existing signed-in session to keep its progress.",
      });
    }

    const passwordHash = await hashPassword(input.password);
    let user: User;
    try {
      user = await createPasswordUser({ email, name: input.name?.trim() || null, passwordHash });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with that email already exists. Try signing in instead." });
      }
      throw error;
    }

    const token = await createCredentialSession(user.id, input.rememberMe);
    setCredentialCookie(ctx, token, input.rememberMe);
    return publicUser(user);
  }),

  /** Only a previously valid legacy session can convert its own stored account. */
  legacyMe: publicProcedure.query(({ ctx }) => {
    if (!ctx.legacyUser || ctx.user) return null;
    return publicUser(ctx.legacyUser);
  }),

  convertLegacy: publicProcedure.input(conversionInput).mutation(async ({ ctx, input }) => {
    const legacyUser = ctx.legacyUser;
    if (!legacyUser || ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "An active existing account session is required for this one-time conversion." });
    }
    consumeSignupAttempt(ctx.req);
    const email = normalizeEmail(legacyUser.email ?? "");
    if (!email || !z.string().email().safeParse(email).success) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This saved account does not have a usable email address. Contact the site administrator before changing accounts." });
    }
    if (await getPasswordCredentialByUserId(legacyUser.id)) {
      throw new TRPCError({ code: "CONFLICT", message: "This account has already been converted to email/password sign-in." });
    }
    const existingCredential = await getPasswordCredentialByEmail(email);
    if (existingCredential && existingCredential.userId !== legacyUser.id) {
      throw new TRPCError({ code: "CONFLICT", message: "That email is already linked to another password account." });
    }

    const passwordHash = await hashPassword(input.password);
    let user: User;
    try {
      user = await attachPasswordCredentialToUser({ userId: legacyUser.id, email, passwordHash });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new TRPCError({ code: "CONFLICT", message: "This account or email has already been converted." });
      }
      throw error;
    }

    const token = await createCredentialSession(user.id, input.rememberMe);
    setCredentialCookie(ctx, token, input.rememberMe);
    clearLegacyCookie(ctx);
    return publicUser(user);
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(CREDENTIAL_SESSION_COOKIE, {
      ...getSessionCookieOptions(ctx.req),
      sameSite: "lax",
      maxAge: -1,
    });
    clearLegacyCookie(ctx);
    return { success: true as const };
  }),
});
