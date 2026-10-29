// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from "vitest";

import { NO_ACCOUNT_CODE } from "@/lib/auth-codes";
import { createWallet, signChallenge } from "@/lib/crypto/wallet";

// The route with everything around it stubbed: no database, no cookies.
const state = vi.hoisted(() => ({ exists: false, created: [] as string[], sessions: [] as string[] }));

vi.mock("@/lib/db", () => ({ getDb: () => ({}) }));
vi.mock("@/lib/server/auth-challenges", () => ({ consumeChallenge: async () => true }));
vi.mock("@/lib/server/rate-limit", () => ({
  sourceKey: () => "test",
  takeRateLimit: async () => true,
  tooManyRequests: () => new Response(null, { status: 429 }),
}));
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
vi.mock("@/lib/server/account-activity", () => ({ recordAccountOpen: async () => {} }));

const { POST } = await import("@/app/api/auth/verify/route");

function signIn(vault?: { ciphertext: string; nonceVault: string; schemaVersion: number }) {
  const wallet = createWallet();
  const nonce = "a1b2c3d4";
  return POST(
    new Request("http://localhost/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({
        pubkeyHash: wallet.pubkeyHash,
        pubkey: wallet.publicKeyHex,
        nonce,
        signature: signChallenge(wallet, nonce),
        ...vault,
      }),
    }),
  );
}

describe("POST /api/auth/verify", () => {
  beforeEach(() => {
    state.exists = false;
    state.created = [];
    state.sessions = [];
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
  });

  it("signs in to an account that exists, with or without a diary", async () => {
    state.exists = true;
    const response = await signIn();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, created: false });
    expect(state.created).toEqual([]);
    expect(state.sessions).toHaveLength(1);
  });
});
