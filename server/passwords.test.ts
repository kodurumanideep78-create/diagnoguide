import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { CREDENTIAL_SESSION_COOKIE, createCredentialSession, credentialSessionSecretIsConfigured, getCredentialSessionUserId } from "./credentialSession";
import { hashPassword, verifyPassword } from "./passwords";

describe("credential security primitives", () => {
  it("stores only distinct salted scrypt hashes and verifies the correct password", async () => {
    const password = "correct horse battery staple";
    const first = await hashPassword(password);
    const second = await hashPassword(password);

    expect(first).not.toContain(password);
    expect(first).not.toBe(second);
    await expect(verifyPassword(password, first)).resolves.toBe(true);
    await expect(verifyPassword("incorrect password", first)).resolves.toBe(false);
  });

  it("rejects malformed or unsupported password-hash encodings", async () => {
    await expect(verifyPassword("anything", "scrypt$1$2$3$bad$hash")).resolves.toBe(false);
    await expect(verifyPassword("anything", "not-a-hash")).resolves.toBe(false);
  });

  it("uses the dedicated secret to sign and validate an account session cookie", async () => {
    expect(credentialSessionSecretIsConfigured()).toBe(true);
    const token = await createCredentialSession(42, false);
    const req = { headers: { cookie: `${CREDENTIAL_SESSION_COOKIE}=${token}` } } as Request;
    await expect(getCredentialSessionUserId(req)).resolves.toBe(42);
  });
});
