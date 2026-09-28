import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  getUserById: vi.fn(),
  getPasswordCredentialByEmail: vi.fn(),
  getPasswordCredentialByUserId: vi.fn(),
  getUserByEmail: vi.fn(),
  createPasswordUser: vi.fn(),
  attachPasswordCredentialToUser: vi.fn(),
  touchUserLastSignedIn: vi.fn(),
  listDiagnosticRooms: vi.fn(),
  getDiagnosticRoomBySlug: vi.fn(),
  getUserProgress: vi.fn(),
  upsertUserPreferences: vi.fn(),
  upsertUserRoomProgress: vi.fn(),
}));

vi.mock("./db", () => database);

import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { COOKIE_NAME } from "../shared/const";
import { CREDENTIAL_SESSION_COOKIE, createCredentialSession } from "./credentialSession";
import type { TrpcContext } from "./_core/context";
import { hashPassword, verifyPassword } from "./passwords";

const account = {
  id: 42,
  openId: "local-test-account",
  name: "Test Account",
  email: "test@example.com",
  loginMethod: "password",
  role: "user" as const,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

function callerContext(legacyUser: TrpcContext["legacyUser"] = null) {
  const req = {
    headers: {},
    protocol: "https",
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" },
  } as Request;
  const res = { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as Response;
  const ctx: TrpcContext = { req, res, user: null, legacyUser };
  return { ctx, res };
}

describe("credential session auth endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("authenticates auth.me from a signed HttpOnly session cookie", async () => {
    database.getUserById.mockResolvedValue(account);
    const token = await createCredentialSession(account.id, false);
    const req = {
      headers: { cookie: `${CREDENTIAL_SESSION_COOKIE}=${token}` },
      protocol: "https",
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
    } as Request;
    const res = { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as Response;
    const ctx = await createContext({ req, res } as CreateExpressContextOptions);
    const result = await appRouter.createCaller(ctx).auth.me();

    expect(database.getUserById).toHaveBeenCalledWith(account.id);
    expect(result).toEqual({ id: 42, name: "Test Account", email: "test@example.com", role: "user" });
  });

  it("registers an account with a normalized email and only a salted password hash", async () => {
    database.getPasswordCredentialByEmail.mockResolvedValue(undefined);
    database.getUserByEmail.mockResolvedValue(undefined);
    database.createPasswordUser.mockResolvedValue(account);
    const { ctx, res } = callerContext();
    const password = "a long new account passphrase";

    const result = await appRouter.createCaller(ctx).auth.register({
      name: "  Test Account  ",
      email: "  TEST@example.com ",
      password,
      rememberMe: true,
    });

    const saved = database.createPasswordUser.mock.calls[0]?.[0];
    expect(saved).toMatchObject({ email: "test@example.com", name: "Test Account" });
    expect(saved.passwordHash).not.toBe(password);
    await expect(verifyPassword(password, saved.passwordHash)).resolves.toBe(true);
    expect(result.email).toBe("test@example.com");
    expect(res.cookie).toHaveBeenCalledWith(CREDENTIAL_SESSION_COOKIE, expect.any(String), expect.objectContaining({
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    }));
  });

  it("signs in only after verifying the stored password hash", async () => {
    const password = "a long login passphrase";
    const passwordHash = await hashPassword(password);
    database.getPasswordCredentialByEmail.mockResolvedValue({ userId: account.id, email: account.email, passwordHash });
    database.getUserById.mockResolvedValue(account);
    const { ctx, res } = callerContext();

    await expect(appRouter.createCaller(ctx).auth.login({
      email: "TEST@example.com",
      password,
      rememberMe: false,
    })).resolves.toMatchObject({ id: account.id, email: account.email });

    expect(database.getPasswordCredentialByEmail).toHaveBeenCalledWith(account.email);
    expect(res.cookie).toHaveBeenCalledWith(CREDENTIAL_SESSION_COOKIE, expect.any(String), expect.objectContaining({
      httpOnly: true,
      sameSite: "lax",
      maxAge: 12 * 60 * 60 * 1000,
    }));
  });

  it("converts only the existing signed-in account and retains its user ID", async () => {
    database.getPasswordCredentialByUserId.mockResolvedValue(undefined);
    database.getPasswordCredentialByEmail.mockResolvedValue(undefined);
    database.attachPasswordCredentialToUser.mockResolvedValue({ ...account, loginMethod: "password" });
    const { ctx, res } = callerContext(account);
    const password = "a long conversion passphrase";

    const result = await appRouter.createCaller(ctx).auth.convertLegacy({ password, rememberMe: false });

    const saved = database.attachPasswordCredentialToUser.mock.calls[0]?.[0];
    expect(saved.userId).toBe(account.id);
    expect(saved.email).toBe(account.email);
    expect(saved.passwordHash).not.toBe(password);
    await expect(verifyPassword(password, saved.passwordHash)).resolves.toBe(true);
    expect(result.id).toBe(account.id);
    expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_NAME, expect.any(Object));
  });
});
