// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { accountActivityDays } from "@/lib/db/schema";
import { inRolledBackTransaction, insertTestAccount, testDatabaseUrl } from "@/lib/db/test-db";

import { recordAccountOpen } from "./account-activity";

describe.skipIf(!testDatabaseUrl)("account activity against Postgres", () => {
  it("keeps one row per account per UTC day, however often the app opens", async () => {
    await inRolledBackTransaction(async (db) => {
      const account = await insertTestAccount(db, "activity");
      const lateEvening = new Date("2026-11-18T23:30:00Z");
      await recordAccountOpen(db, account.pubkeyHash, lateEvening);
      await recordAccountOpen(db, account.pubkeyHash, new Date("2026-11-18T08:00:00Z"));
      await recordAccountOpen(db, account.pubkeyHash, new Date("2026-11-19T00:10:00Z"));
      const rows = await db
        .select({ day: accountActivityDays.day })
        .from(accountActivityDays)
        .where(eq(accountActivityDays.accountId, account.id));
      expect(rows.map((row) => String(row.day)).sort()).toEqual(["2026-11-18", "2026-11-19"]);
    });
  });

  it("writes nothing for a key with no account", async () => {
    await inRolledBackTransaction(async (db) => {
      const day = "2999-01-01";
      await recordAccountOpen(db, "no-such-key", new Date(`${day}T12:00:00Z`));
      const rows = await db.select().from(accountActivityDays).where(eq(accountActivityDays.day, day));
      expect(rows).toEqual([]);
    });
  });
});
