// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NO_ACCOUNT_CODE } from "@/lib/auth-codes";
import { createWallet, signChallenge } from "@/lib/crypto/wallet";

// The route with everything around it stubbed: no database, no cookies.
const state = vi.hoisted(() => ({
  exists: false,
  created: [] as string[],
  sessions: [] as string[],
  buckets: [] as string[],
  limited: new Set<string>(),
  opens: [] as string[],
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (task: () => unknown) => void task(),
}));
vi.mock("@/lib/db", () => ({ getDb: () => ({}) }));
vi.mock("@/lib/server/auth-challenges", () => ({ consumeChallenge: async () => true }));
vi.mock("@/lib/server/rate-limit", () => {
  const take = (bucket: string) => {
    state.buckets.push(bucket);
    return !state.limited.has(bucket);
  };
  return {
    sourceKey: () => "test",
    takeRateLimit: async (_db: unknown, bucket: string) => take(bucket),
    takeRateLimits: async (_db: unknown, hits: { bucket: string }[]) => hits.map((hit) => take(hit.bucket)).every(Boolean),
    tooManyRequests: () => new Response(null, { status: 429 }),
  };
});
vi.mock("@/lib/server/create-account", () => ({
  accountExists: async () => state.exists,
  createAccountIfMissing: async (_db: unknown, values: { pubkeyHash: string }) => {
    state.created.push(values.pubkeyHash);
    return true;
  },
}));
vi.mock("@/lib/server/session", () => ({
  setSessionCookie: async (pubkeyHash: string) => {
    state.sessions.push(pubkeyHash);
  },
}));
vi.mock("@/lib/server/account-activity", () => ({
  recordAccountOpen: async (_db: unknown, pubkeyHash: string) => {
    state.opens.push(pubkeyHash);
  },
}));

const { POST } = await import("@/app/api/auth/verify/route");

function verifyRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/auth/verify", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function signedBody(vault?: { ciphertext: string; nonceVault: string; schemaVersion: number }) {
  const wallet = createWallet();
  const nonce = "a1b2c3d4".repeat(8);
  return {
    pubkeyHash: wallet.pubkeyHash,
    pubkey: wallet.publicKeyHex,
    nonce,
    signature: signChallenge(wallet, nonce),
    ...vault,
  };
}

function signIn(vault?: { ciphertext: string; nonceVault: string; schemaVersion: number }, client?: string) {
  return POST(verifyRequest(signedBody(vault), client ? { "x-ciclo-client": client } : {}));
}

describe("POST /api/auth/verify", () => {
  beforeEach(() => {
    state.exists = false;
    state.created = [];
    state.sessions = [];
    state.buckets = [];
    state.limited = new Set();
    state.opens = [];
  });

  it("refuses a phrase with no account when no first diary comes with it, and creates nothing", async () => {
    const response = await signIn();
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ code: NO_ACCOUNT_CODE });
    expect(state.created).toEqual([]);
    expect(state.sessions).toEqual([]);
  });

  it("creates the account on sign-up, when the first diary comes with it", async () => {
    const response = await signIn({ ciphertext: "00ff", nonceVault: "0a0b", schemaVersion: 6 });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, created: true });
    expect(state.created).toHaveLength(1);
    expect(state.sessions).toHaveLength(1);
    expect(state.buckets).toEqual(["auth-verify", "account-create", "account-create-burst"]);
  });

  it("signs in to an account that exists, with or without a diary, and records the day's open", async () => {
    state.exists = true;
    const response = await signIn();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, created: false });
    expect(state.created).toEqual([]);
    expect(state.sessions).toHaveLength(1);
    expect(state.opens).toEqual(state.sessions);
    // Signing in again never counts against the sign-up limits.
    expect(state.buckets).toEqual(["auth-verify"]);
  });

  it("refuses a sign-up over the per-network limit with 429 and creates nothing", async () => {
    state.limited.add("account-create-burst");
    const response = await signIn({ ciphertext: "00ff", nonceVault: "0a0b", schemaVersion: 6 });
    expect(response.status).toBe(429);
    expect(state.created).toEqual([]);
    expect(state.sessions).toEqual([]);
  });

  it("checks the per-IP limit before any signature work", async () => {
    state.limited.add("auth-verify");
    const body = signedBody();
    // A wrong signature would be a 401 if it were checked.
    const response = await POST(verifyRequest({ ...body, signature: "ab".repeat(64) }));
    expect(response.status).toBe(429);
    expect(state.sessions).toEqual([]);
  });

  it("refuses a signature that is not exactly 128 hex characters, before the limit", async () => {
    const body = signedBody();
    for (const signature of [body.signature.slice(0, 126), `${body.signature}00`, "zz".repeat(64), 12]) {
      const response = await POST(verifyRequest({ ...body, signature }));
      expect(response.status).toBe(400);
    }
    expect(state.buckets).toEqual([]);
  });

  it("answers 400 for malformed JSON and 415 without the JSON content type", async () => {
    expect((await POST(verifyRequest("{not json"))).status).toBe(400);
    const plain = new Request("http://localhost/api/auth/verify", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: JSON.stringify(signedBody()),
    });
    expect((await POST(plain)).status).toBe(415);
  });

  describe("with MIN_ANDROID_VERSION_CODE set", () => {
    beforeEach(() => {
      vi.stubEnv("MIN_ANDROID_VERSION_CODE", "5");
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("still signs an outdated build in, so it can sign out and delete the account", async () => {
      state.exists = true;
      const response = await signIn(undefined, "android/4");
      expect(response.status).toBe(200);
      expect(state.sessions).toHaveLength(1);
    });

    it("refuses to create an account from an outdated build", async () => {
      const response = await signIn({ ciphertext: "00ff", nonceVault: "0a0b", schemaVersion: 6 }, "android/4");
      expect(response.status).toBe(426);
      expect(state.created).toEqual([]);
      expect(state.sessions).toEqual([]);
    });

    it("creates the account for a current build", async () => {
      const response = await signIn({ ciphertext: "00ff", nonceVault: "0a0b", schemaVersion: 6 }, "android/5");
      expect(response.status).toBe(200);
      expect(state.created).toHaveLength(1);
    });
  });
});
