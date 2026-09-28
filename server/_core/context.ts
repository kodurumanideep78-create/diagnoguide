import { parse as parseCookieHeader } from "cookie";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "../../shared/const";
import { getUserById } from "../db";
import { getCredentialSessionUserId } from "../credentialSession";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  /** Existing signed-in accounts may use this identity only for one-time password conversion. */
  legacyUser: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  let legacyUser: User | null = null;

  try {
    const userId = await getCredentialSessionUserId(opts.req);
    if (userId) user = (await getUserById(userId)) ?? null;
  } catch {
    // Public procedures remain available if credentials or the database are unavailable.
  }

  if (!user) {
    let hasLegacySession = false;
    try {
      const cookies = parseCookieHeader(opts.req.headers.cookie ?? "");
      hasLegacySession = Boolean(cookies[COOKIE_NAME]);
    } catch {
      hasLegacySession = false;
    }
    const authorization = opts.req.headers.authorization;
    if (!hasLegacySession && typeof authorization === "string" && authorization.startsWith("Bearer ")) {
      hasLegacySession = true;
    }
    if (hasLegacySession) {
      try {
        legacyUser = await sdk.authenticateRequest(opts.req);
      } catch {
        // A stale legacy session is not an authenticated password account.
      }
    }
  }

  return { req: opts.req, res: opts.res, user, legacyUser };
}
