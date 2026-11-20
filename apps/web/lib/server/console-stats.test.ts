// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { describe, expect, it } from "vitest";

import * as schema from "@/lib/db/schema";

import { loadConsoleStats, type ConsoleStats } from "./console-stats";

// Runs against a real Postgres when DATABASE_URL is set (the local stack:
// `docker compose up -d db`), inside a transaction that is rolled back.
const databaseUrl = process.env.DATABASE_URL;

class Rollback extends Error {}

type StatsDb = NonNullable<Parameters<typeof loadConsoleStats>[0]>["db"];

// Far ahead of any row a local database holds, so the 7/30-day windows and the
// charts see only the rows this test adds; totals are compared as differences.
const NOW = new Date("2030-06-15T12:00:00Z");

function dayCount(stats: ConsoleStats["accountsByDay"], day: string): number {
  return stats.find((row) => row.day === day)?.count ?? -1;
}

describe.skipIf(!databaseUrl)("console stats against Postgres", () => {
  it("counts accounts, diaries, opens, mailboxes and research rows with aggregate queries", async () => {
    const client = postgres(databaseUrl as string, { max: 1 });
    try {
      const db = drizzle(client, { schema });
      await db
        .transaction(async (tx) => {
          const statsDb = tx as unknown as StatsDb;
          const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
          const insertAccount = async (key: string, createdAt: string, updatedAt: string, ciphertext: string) => {
            const [row] = await tx
              .insert(schema.accounts)
              .values({
                pubkeyHash: `stats-test-${key}-${stamp}`,
                pubkey: "pub",
                ciphertext,
                nonce: "n",
                schemaVersion: 6,
                createdAt: new Date(createdAt),
                updatedAt: new Date(updatedAt),
              })
              .returning({ id: schema.accounts.id });
            return row.id;
          };

          // The admin's account exists before the first read, so both reads leave it out of the opens.
          const admin = await insertAccount("admin", "2030-05-01T09:00:00Z", "2030-05-02T09:00:00Z", "sealed");
          const before = await loadConsoleStats({ db: statsDb, now: NOW, adminIds: [admin] });

          const today = await insertAccount("today", "2030-06-15T10:00:00Z", "2030-06-15T10:00:00Z", "sealed");
          const yesterday = await insertAccount("yesterday", "2030-06-14T20:00:00Z", "2030-06-14T20:00:00Z", "");
          const older = await insertAccount("older", "2030-06-01T12:00:00Z", "2030-06-12T12:00:00Z", "sealed");

          await tx.insert(schema.accountActivityDays).values([
            { accountId: today, day: "2030-06-15" },
            { accountId: today, day: "2030-06-10" },
            { accountId: yesterday, day: "2030-06-14" },
            { accountId: older, day: "2030-05-20" },
            { accountId: admin, day: "2030-06-15" },
          ]);
          await tx.insert(schema.recoveryMailboxes).values({
            emailLookup: `stats-test-${stamp}`,
            wrappedSecret: "s",
            wrapNonce: "n",
            wrapSalt: "salt",
            wrapParams: {},
            accountId: today,
          });
          await tx.insert(schema.researchContributions).values([
            { cycleLengths: [28], createdAt: new Date("2030-06-10T00:00:00Z") },
            { cycleLengths: [30], createdAt: new Date("2030-01-01T00:00:00Z") },
          ]);

          const after = await loadConsoleStats({ db: statsDb, now: NOW, adminIds: [admin] });

          expect(after.accountsTotal - before.accountsTotal).toBe(3);
          expect(after.accountsNew7d - before.accountsNew7d).toBe(2);
          expect(after.accountsNew30d - before.accountsNew30d).toBe(3);
          expect(after.signupsToday - before.signupsToday).toBe(1);
          expect(after.signupsYesterday - before.signupsYesterday).toBe(1);
          expect(after.hostedDiaries - before.hostedDiaries).toBe(2);
          expect(after.diariesSaved7d - before.diariesSaved7d).toBe(2);
          expect(after.diariesSaved30d - before.diariesSaved30d).toBe(2);
          expect(after.emailAccounts - before.emailAccounts).toBe(1);
          expect(after.phraseOnlyAccounts - before.phraseOnlyAccounts).toBe(2);
          expect(after.researchRows - before.researchRows).toBe(2);
          expect(after.researchNew30d - before.researchNew30d).toBe(1);

          // Signups per UTC day: the 28 days up to NOW, oldest first.
          expect(after.accountsByDay).toHaveLength(28);
          expect(after.accountsByDay[27].day).toBe("2030-06-15");
          expect(dayCount(after.accountsByDay, "2030-06-15") - dayCount(before.accountsByDay, "2030-06-15")).toBe(1);
          expect(dayCount(after.accountsByDay, "2030-06-14") - dayCount(before.accountsByDay, "2030-06-14")).toBe(1);
          expect(dayCount(after.accountsByDay, "2030-06-01") - dayCount(before.accountsByDay, "2030-06-01")).toBe(1);

          // Opens: distinct accounts per window, the console admin left out.
          expect(after.activeToday - before.activeToday).toBe(1);
          expect(after.active7d - before.active7d).toBe(2);
          expect(after.active30d - before.active30d).toBe(3);
          expect(dayCount(after.activeByDay, "2030-06-15") - dayCount(before.activeByDay, "2030-06-15")).toBe(1);
          expect(dayCount(after.activeByDay, "2030-06-10") - dayCount(before.activeByDay, "2030-06-10")).toBe(1);
          expect(dayCount(after.activeByDay, "2030-05-20") - dayCount(before.activeByDay, "2030-05-20")).toBe(1);
          throw new Rollback();
        })
        .catch((error) => {
          if (!(error instanceof Rollback)) throw error;
        });
    } finally {
      await client.end();
    }
  });
});
