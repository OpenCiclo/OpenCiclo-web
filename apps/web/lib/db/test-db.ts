// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Test helper: runs code against the local Postgres (DATABASE_URL, the
// docker-compose `db` service) inside a transaction that is always rolled
// back, so it leaves no rows behind. Never point DATABASE_URL at production.

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { isLocalDatabaseUrl, LOCAL_DATABASE_HOSTS } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export type TestDb = PostgresJsDatabase<typeof schema>;

/**
 * DATABASE_URL for database tests, or undefined (they skip) when it is not set.
 * A URL whose host is not local (LOCAL_DATABASE_HOSTS) makes every database
 * test file fail on import: no test may ever write to a remote database.
 */
export function localTestDatabaseUrl(url = process.env.DATABASE_URL): string | undefined {
  if (!url) return undefined;
  if (!isLocalDatabaseUrl(url)) {
    throw new Error(
      `Database tests run only against a local Postgres (${[...LOCAL_DATABASE_HOSTS].join(", ")}). Unset DATABASE_URL or point it at the local stack.`,
    );
  }
  return url;
}

export const testDatabaseUrl = localTestDatabaseUrl();

class Rollback extends Error {}

export async function inRolledBackTransaction(run: (db: TestDb) => Promise<void>): Promise<void> {
  const client = postgres(testDatabaseUrl as string, { max: 1, onnotice: () => {} });
  try {
    const db = drizzle(client, { schema });
    await db
      .transaction(async (tx) => {
        await run(tx as unknown as TestDb);
        throw new Rollback();
      })
      .catch((error) => {
        if (!(error instanceof Rollback)) throw error;
      });
  } finally {
    await client.end();
  }
}

/** A throwaway account inside the test transaction. */
export async function insertTestAccount(db: TestDb, label: string): Promise<{ id: string; pubkeyHash: string }> {
  const pubkeyHash = `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const [account] = await db
    .insert(schema.accounts)
    .values({ pubkeyHash, pubkey: "pub", ciphertext: "ct", nonce: "n", schemaVersion: 6 })
    .returning({ id: schema.accounts.id });
  return { id: account.id, pubkeyHash };
}
