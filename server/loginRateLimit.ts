import { createHash } from "node:crypto";
import type { Request } from "express";
import { TRPCError } from "@trpc/server";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;
const MAX_SIGNUPS_PER_WINDOW = 4;
type AttemptState = { count: number; startedAt: number; blockedUntil: number };
const loginAttempts = new Map<string, AttemptState>();
const signupAttempts = new Map<string, AttemptState>();

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function ipKey(req: Request): string {
  return digest(req.ip || req.socket.remoteAddress || "unknown");
}

function boundedAdd(map: Map<string, AttemptState>, key: string, now: number, max: number): AttemptState {
  let state = map.get(key);
  if (!state || now - state.startedAt >= WINDOW_MS) {
    state = { count: 0, startedAt: now, blockedUntil: 0 };
    map.set(key, state);
  }
  if (map.size > 10_000) {
    map.forEach((staleValue, staleKey) => {
      if (now - staleValue.startedAt >= WINDOW_MS && staleValue.blockedUntil <= now) map.delete(staleKey);
    });
  }
  if (state.blockedUntil > now || state.count >= max) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please try again later." });
  }
  return state;
}

export function assertLoginAllowed(req: Request, normalizedEmail: string, now = Date.now()): void {
  boundedAdd(loginAttempts, `${ipKey(req)}:${digest(normalizedEmail)}`, now, MAX_LOGIN_FAILURES);
}

export function recordLoginFailure(req: Request, normalizedEmail: string, now = Date.now()): void {
  const key = `${ipKey(req)}:${digest(normalizedEmail)}`;
  const state = loginAttempts.get(key) ?? { count: 0, startedAt: now, blockedUntil: 0 };
  if (now - state.startedAt >= WINDOW_MS) {
    state.count = 0;
    state.startedAt = now;
  }
  state.count += 1;
  if (state.count >= MAX_LOGIN_FAILURES) state.blockedUntil = now + WINDOW_MS;
  loginAttempts.set(key, state);
}

export function clearLoginFailures(req: Request, normalizedEmail: string): void {
  loginAttempts.delete(`${ipKey(req)}:${digest(normalizedEmail)}`);
}

export function consumeSignupAttempt(req: Request, now = Date.now()): void {
  const key = ipKey(req);
  const state = boundedAdd(signupAttempts, key, now, MAX_SIGNUPS_PER_WINDOW);
  state.count += 1;
}
