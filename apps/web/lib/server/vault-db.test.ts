// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { describe, expect, it } from "vitest";

import * as schema from "@/lib/db/schema";

import { deleteAccountRow, writeVault } from "./vault";

// Runs against a real Postgres when DATABASE_URL is set (the local stack:
// `docker compose up -d db`). Everything happens in a transaction that is
// rolled back, so it leaves no rows behind.
const databaseUrl = process.env.DATABASE_URL;

class Rollback extends Error {}

async function inRolledBackTransaction(run: (db: Parameters<typeof writeVault>[0], accountId: string) => Promise<void>) {
  const client = postgres(databaseUrl as string, { max: 1 });
  try {
    const db = drizzle(client, { schema });
    await db
      .transaction(async (tx) => {
        const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const [account] = await tx
          .insert(schema.accounts)
          .values({ pubkeyHash: `vault-test-${stamp}`, pubkey: "pub", ciphertext: "v6", nonce: "n", schemaVersion: 6 })
          .returning({ id: schema.accounts.id });
        await run(tx as unknown as Parameters<typeof writeVault>[0], account.id);
        throw new Rollback();
      })
      .catch((error) => {
        if (!(error instanceof Rollback)) throw error;
      });
  } finally {
    await client.end();
  }
}

describe.skipIf(!databaseUrl)("vault writes against Postgres", () => {
  it("never saves an older diary format over a newer one, with or without a base version", async () => {
    await inRolledBackTransaction(async (db, accountId) => {
      const newer = await writeVault(db, accountId, { ciphertext: "v7", nonce: "n", schemaVersion: 7 }, 0);
      expect(newer).toEqual({ ok: true, version: 1 });

      const older = await writeVault(db, accountId, { ciphertext: "v6", nonce: "n", schemaVersion: 6 }, 1);
      expect(older).toEqual({ ok: false, current: { ciphertext: "v7", nonce: "n", schemaVersion: 7, version: 1 } });

      const legacy = await writeVault(db, accountId, { ciphertext: "v6", nonce: "n", schemaVersion: 6 }, null);
      expect(legacy.ok).toBe(false);

      const same = await writeVault(db, accountId, { ciphertext: "v7b", nonce: "n", schemaVersion: 7 }, 1);
      expect(same).toEqual({ ok: true, version: 2 });
    });
  });

  it("still refuses a stale base version", async () => {
    await inRolledBackTransaction(async (db, accountId) => {
      await writeVault(db, accountId, { ciphertext: "a", nonce: "n", schemaVersion: 6 }, 0);
      const stale = await writeVault(db, accountId, { ciphertext: "b", nonce: "n", schemaVersion: 6 }, 0);
      expect(stale).toMatchObject({ ok: false, current: { ciphertext: "a", version: 1 } });
    });
  });

  it("deletes the account only at the version asked for, and tells an account already gone apart", async () => {
    await inRolledBackTransaction(async (db, accountId) => {
      await writeVault(db, accountId, { ciphertext: "a", nonce: "n", schemaVersion: 6 }, 0);
      expect(await deleteAccountRow(db, accountId, 0)).toBe("changed");
      expect(await deleteAccountRow(db, accountId, 1)).toBe("deleted");
      // A second request for the same delete (its first answer was lost) must not read as "changed".
      expect(await deleteAccountRow(db, accountId, 1)).toBe("gone");
      expect(await deleteAccountRow(db, accountId, null)).toBe("gone");
    });
  });
});
