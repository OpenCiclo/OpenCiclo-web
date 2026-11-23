// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import * as schema from "@/lib/db/schema";
import { inRolledBackTransaction, testDatabaseUrl } from "@/lib/db/test-db";
import { deleteFeedback, feedbackCounts, insertFeedback, listFeedback, type FeedbackInput } from "@/lib/server/feedback";
import { FEEDBACK_KEEP_MS, pruneEphemeralRows } from "@/lib/server/rate-limit";

const DAY = 24 * 60 * 60 * 1000;

function input(overrides: Partial<FeedbackInput> = {}): FeedbackInput {
  return { kind: "problem", body: "It broke", contactEmail: null, platform: "web", appVersion: "web", locale: "en", ...overrides };
}

describe.skipIf(!testDatabaseUrl)("feedback store", () => {
  it("stores feedback with no account column, lists it newest first, filters, pages and deletes", async () => {
    await inRolledBackTransaction(async (db) => {
      await db.delete(schema.feedback);
      await insertFeedback(db, input({ body: "first" }));
      await db.execute(sql`UPDATE feedback SET created_at = now() - interval '1 hour'`);
      await insertFeedback(db, input({ kind: "idea", body: "second", contactEmail: "a@example.org" }));

      const all = await listFeedback(db);
      expect(all.map((row) => row.body)).toEqual(["second", "first"]);
      expect(all[0]?.contactEmail).toBe("a@example.org");
      expect(Object.keys(all[0] ?? {}).sort()).toEqual(
        ["appVersion", "body", "contactEmail", "createdAt", "id", "kind", "locale", "platform"].sort(),
      );

      expect((await listFeedback(db, { kind: "idea" })).map((row) => row.body)).toEqual(["second"]);
      expect((await listFeedback(db, { before: all[0]!.createdAt })).map((row) => row.body)).toEqual(["first"]);

      expect(await feedbackCounts(db)).toEqual({ total: 2, last7d: 2, last30d: 2 });

      expect(await deleteFeedback(db, all[0]!.id)).toBe(true);
      expect(await deleteFeedback(db, all[0]!.id)).toBe(false);
      expect((await listFeedback(db)).map((row) => row.body)).toEqual(["first"]);
    });
  });

  it("refuses what the SQL checks refuse", async () => {
    await inRolledBackTransaction(async (db) => {
      await expect(
        db.execute(sql`INSERT INTO feedback (kind, body, platform) VALUES ('rant', 'x', 'web')`),
      ).rejects.toThrow();
    });
    await inRolledBackTransaction(async (db) => {
      await expect(
        db.execute(sql`INSERT INTO feedback (kind, body, platform) VALUES ('idea', '', 'web')`),
      ).rejects.toThrow();
    });
  });

  it("the cleanup deletes feedback older than 12 months and keeps the rest", async () => {
    await inRolledBackTransaction(async (db) => {
      await db.delete(schema.feedback);
      const now = new Date();
      await insertFeedback(db, input({ body: "old" }));
      await db.execute(
        sql`UPDATE feedback SET created_at = ${new Date(now.getTime() - FEEDBACK_KEEP_MS - DAY).toISOString()}::timestamptz`,
      );
      await insertFeedback(db, input({ body: "recent" }));
      await pruneEphemeralRows(db, now);
      expect((await listFeedback(db)).map((row) => row.body)).toEqual(["recent"]);
    });
  });
});
