// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, eq, gt, lt, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/lib/db/schema";
import { authChallenges, rateLimitHits, recoveryAttempts } from "@/lib/db/schema";
import { hashIp } from "@/lib/server/env";

type Db = PostgresJsDatabase<typeof schema>;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Per client IP. Generous on purpose: many people can share one IP (mobile
// carriers, offices). The goal is to stop scripts from filling the database,
// spamming mail, or poisoning the research pool, not to throttle people.
export const RATE_LIMITS = {
  "auth-challenge": { max: 60, windowMs: 10 * MINUTE },
  "account-create": { max: 10, windowMs: DAY },
  "pool-contribute": { max: 20, windowMs: HOUR },
  "recovery-fetch": { max: 30, windowMs: HOUR },
  "recovery-register": { max: 10, windowMs: HOUR },
} as const;

export type RateLimitBucket = keyof typeof RATE_LIMITS;

// Longest window above; rows older than this are never read again.
const KEEP_MS = DAY;
// Clean up on roughly one hit in this many, so no request pays for it often.
const PRUNE_ONE_IN = 50;

/** First hop of x-forwarded-for. Vercel overwrites this header, so clients cannot spoof it. */
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

/** HMAC of the client IP. The raw IP is never stored. */
export function sourceKey(request: Request): string {
  return hashIp(clientIp(request));
}

/**
 * Counts this request against `bucket` for `keyHash`. Returns false, without
 * recording anything, when the source is already at the limit.
 */
export async function takeRateLimit(
  db: Db,
  bucket: RateLimitBucket,
  keyHash: string,
  now = new Date(),
): Promise<boolean> {
  const { max, windowMs } = RATE_LIMITS[bucket];
  const since = new Date(now.getTime() - windowMs);
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(rateLimitHits)
    .where(
      and(eq(rateLimitHits.bucket, bucket), eq(rateLimitHits.keyHash, keyHash), gt(rateLimitHits.createdAt, since)),
    );
  if ((rows[0]?.n ?? 0) >= max) return false;
  await db.insert(rateLimitHits).values({ bucket, keyHash, createdAt: now });
  if (Math.random() * PRUNE_ONE_IN < 1) await pruneEphemeralRows(db, now);
  return true;
}

/**
 * Deletes bookkeeping that can no longer matter: rate-limit hits and recovery
 * attempts older than a day, and auth challenges that have expired. None of
 * these rows hold diary data or anything a person entered.
 */
export async function pruneEphemeralRows(db: Db, now = new Date()) {
  const cutoff = new Date(now.getTime() - KEEP_MS);
  await db.delete(rateLimitHits).where(lt(rateLimitHits.createdAt, cutoff));
  await db.delete(recoveryAttempts).where(lt(recoveryAttempts.createdAt, cutoff));
  await db.delete(authChallenges).where(lt(authChallenges.expiresAt, now));
}

export function tooManyRequests(): Response {
  return Response.json({ error: "Too many attempts" }, { status: 429 });
}
