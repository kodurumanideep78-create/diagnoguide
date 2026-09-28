import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

export const CREDENTIAL_SESSION_COOKIE = "diagno_session";
const SESSION_ISSUER = "diagnoguide";
const SESSION_AUDIENCE = "diagnoguide-web";

export function credentialSessionSecretIsConfigured(): boolean {
  return Buffer.byteLength(ENV.credentialSessionSecret, "utf8") >= 32;
}

function signingKey(): Uint8Array {
  if (!credentialSessionSecretIsConfigured()) {
    throw new Error("DIAGNO_SESSION_SECRET must be configured with at least 32 bytes before credential sign-in.");
  }
  return new TextEncoder().encode(ENV.credentialSessionSecret);
}

export async function createCredentialSession(userId: number, rememberMe: boolean): Promise<string> {
  const expiresIn = rememberMe ? "30d" : "12h";
  return new SignJWT({ kind: "credential-session" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(signingKey());
}

export async function getCredentialSessionUserId(req: Request): Promise<number | null> {
  let token: string | undefined;
  try {
    token = parseCookieHeader(req.headers.cookie ?? "")[CREDENTIAL_SESSION_COOKIE];
  } catch {
    return null;
  }
  if (!token || !credentialSessionSecretIsConfigured()) return null;

  try {
    const { payload } = await jwtVerify(token, signingKey(), {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
      clockTolerance: 5,
    });
    if (payload.kind !== "credential-session") return null;
    const userId = Number(payload.sub);
    return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}
