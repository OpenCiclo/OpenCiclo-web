// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { eq } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";

import { ACCOUNT_HEADER, ACCOUNT_MISMATCH_CODE } from "@/lib/auth-codes";
import { createWallet } from "@/lib/crypto/wallet";
import { accounts } from "@/lib/db/schema";
import { inRolledBackTransaction, testDatabaseUrl } from "@/lib/db/test-db";
import { createAccountIfMissing } from "@/lib/server/create-account";

// requireAccount against a real Postgres (the local stack; a non-local host is
// refused, and everything is rolled back): the account the app names is the
// wallet's pubkeyHash, which is exactly what sign-up stores in
// accounts.pubkey_hash and sign-in puts in the session cookie.
const state = vi.hoisted(() => ({ db: null as unknown, session: null as { pubkeyHash: string } | null }));

vi.mock("@/lib/db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db")>()),
  getDb: () => state.db,
}));
vi.mock("@/lib/server/session", () => ({ readSession: async () => state.session }));

const { requireAccount } = await import("@/lib/server/account");

function request(headers: Record<string, string>) {
  return new Request("http://localhost/api/vault", { method: "PUT", headers });
}

describe.skipIf(!testDatabaseUrl)("requireAccount and x-ciclo-account against Postgres", () => {
  it("takes the wallet's own pubkeyHash, refuses another account's, and serves requests without one", async () => {
    await inRolledBackTransaction(async (db) => {
      const wallet = createWallet();
      const other = createWallet();
      // As /api/auth/verify creates the account and sets the cookie, from the client's pubkeyHash.
      await createAccountIfMissing(db, {
        pubkeyHash: wallet.pubkeyHash,
        pubkey: wallet.publicKeyHex,
        ciphertext: "ct",
        nonce: "n",
        schemaVersion: 6,
      });
      const [row] = await db
        .select({ id: accounts.id, pubkeyHash: accounts.pubkeyHash })
        .from(accounts)
        .where(eq(accounts.pubkeyHash, wallet.pubkeyHash));
      expect(row.pubkeyHash).toBe(wallet.pubkeyHash);
      state.db = db;
      state.session = { pubkeyHash: wallet.pubkeyHash };

      const named = await requireAccount(request({ [ACCOUNT_HEADER]: wallet.pubkeyHash }));
      expect(named).toEqual({ error: null, account: { id: row.id } });
      expect(await requireAccount(request({}))).toEqual({ error: null, account: { id: row.id } });

      const refused = await requireAccount(request({ [ACCOUNT_HEADER]: other.pubkeyHash }));
      expect(refused.account).toBeNull();
      expect(refused.error?.status).toBe(409);
      expect(await refused.error?.json()).toMatchObject({ code: ACCOUNT_MISMATCH_CODE });
    });
  });
});
