// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, desc, eq, lt, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { CLIENT_HEADER, parseClientId } from "@/lib/client-version";
import type * as schema from "@/lib/db/schema";
import { feedback } from "@/lib/db/schema";
import { FEEDBACK_KINDS, FEEDBACK_MAX_LENGTH, isFeedbackKind, type FeedbackKind } from "@/lib/feedback";
import { isLocale } from "@/lib/i18n";
import { parseMailboxEmail } from "@/lib/server/mailbox";

// Feedback sent from Settings (0009). Anonymous: nothing here says which
// account or device sent it (no account id, no pubkey, no IP). The text and
// the optional email are plain text; the form says so. Never log either.

type Db = PostgresJsDatabase<typeof schema>;

export type FeedbackInput = {
  kind: FeedbackKind;
  body: string;
  contactEmail: string | null;
  platform: "web" | "android";
  appVersion: string | null;
  locale: string | null;
};

export type FeedbackRow = {
  id: string;
  createdAt: Date;
  kind: FeedbackKind;
  body: string;
  contactEmail: string | null;
  platform: string;
  appVersion: string | null;
  locale: string | null;
};

/** A line of printable text (the version label): control characters out, capped. */
function shortLabel(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return text ? text.slice(0, max) : null;
}

/**
 * Reads a feedback request. `error` names what is wrong (400); the email is
 * optional, but one that is typed must look like an address.
 */
export function parseFeedback(
  body: Record<string, unknown>,
  headers: Headers,
): { ok: true; value: FeedbackInput } | { ok: false; error: string } {
  if (!isFeedbackKind(body.kind)) return { ok: false, error: `kind must be one of ${FEEDBACK_KINDS.join(", ")}` };
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (text.length < 1 || text.length > FEEDBACK_MAX_LENGTH) {
    return { ok: false, error: `body must be 1–${FEEDBACK_MAX_LENGTH} characters` };
  }
  let contactEmail: string | null = null;
  if (typeof body.contactEmail === "string") {
    if (body.contactEmail.trim() !== "") {
      contactEmail = parseMailboxEmail(body.contactEmail);
      if (!contactEmail) return { ok: false, error: "contactEmail is not an email address" };
    }
  } else if (body.contactEmail !== undefined && body.contactEmail !== null) {
    return { ok: false, error: "contactEmail must be a string" };
  }
  const client = parseClientId(headers.get(CLIENT_HEADER));
  return {
    ok: true,
    value: {
      kind: body.kind,
      body: text,
      contactEmail,
      platform: client?.platform === "android" ? "android" : "web",
      appVersion: shortLabel(body.appVersion, 40),
      locale: isLocale(body.locale) ? body.locale : null,
    },
  };
}

export async function insertFeedback(db: Db, input: FeedbackInput): Promise<void> {
  await db.insert(feedback).values(input);
}

export const FEEDBACK_PAGE_SIZE = 50;

/** Newest first; `before` continues from the last row of the previous page. */
export async function listFeedback(
  db: Db,
  options: { kind?: FeedbackKind | null; before?: Date | null; limit?: number } = {},
): Promise<FeedbackRow[]> {
  const conditions = [
    options.kind ? eq(feedback.kind, options.kind) : undefined,
    options.before ? lt(feedback.createdAt, options.before) : undefined,
  ].filter((condition) => condition !== undefined);
  const rows = await db
    .select()
    .from(feedback)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(feedback.createdAt))
    .limit(options.limit ?? FEEDBACK_PAGE_SIZE);
  return rows.map((row) => ({ ...row, kind: row.kind as FeedbackKind }));
}

/** True when a row was deleted. */
export async function deleteFeedback(db: Db, id: string): Promise<boolean> {
  const deleted = await db.delete(feedback).where(eq(feedback.id, id)).returning({ id: feedback.id });
  return deleted.length > 0;
}

/** Counts for the console's overview (aggregate SQL, no rows loaded). */
export async function feedbackCounts(db: Db, now = new Date()): Promise<{ total: number; last7d: number; last30d: number }> {
  const day = 24 * 60 * 60 * 1000;
  const since7 = new Date(now.getTime() - 7 * day);
  const since30 = new Date(now.getTime() - 30 * day);
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      last7d: sql<number>`(count(*) FILTER (WHERE ${feedback.createdAt} >= ${since7.toISOString()}::timestamptz))::int`,
      last30d: sql<number>`(count(*) FILTER (WHERE ${feedback.createdAt} >= ${since30.toISOString()}::timestamptz))::int`,
    })
    .from(feedback);
  return { total: row?.total ?? 0, last7d: row?.last7d ?? 0, last30d: row?.last30d ?? 0 };
}
