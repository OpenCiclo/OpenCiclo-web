// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { lt, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { bytesToHex, utf8ToBytes } from "@/lib/crypto/bytes";
import type * as schema from "@/lib/db/schema";
import { authChallenges, friendBoxes, mailboxPending, rateLimitHits, recoveryAttempts } from "@/lib/db/schema";
import { FRIENDS_AVAILABLE } from "@/lib/features";
import { hashIp, jsonError, requireSecret } from "@/lib/server/env";
import { describeError } from "@/lib/server/http";

type Db = PostgresJsDatabase<typeof schema>;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** `alert`: a refusal is logged as `RATE_LIMIT_REFUSED <bucket>`, a stable line to alert on. */
export type RateLimit = { max: number; windowMs: number; alert?: boolean };

// Per client IP (an IPv6 address counts as its /64) unless the name says
// otherwise. Generous on purpose: many people can share one IP (mobile
// carriers, offices, student halls). The goal is to stop scripts from filling
// the database, spamming mail, guessing codes, or poisoning the research pool,
// not to throttle people.
export const RATE_LIMITS = {
  "auth-challenge": { max: 60, windowMs: 10 * MINUTE },
  // Checked before the signature, so junk requests cost no Ed25519 work.
  "auth-verify": { max: 60, windowMs: 10 * MINUTE },
  // Only when verify creates an account. A day cap and a burst cap.
  "account-create": { max: 100, windowMs: DAY },
  "account-create-burst": { max: 20, windowMs: 10 * MINUTE },
  "pool-contribute": { max: 20, windowMs: HOUR },
  "recovery-fetch": { max: 30, windowMs: HOUR },
  // Code mails: per IP, per account, per address (keyed hash of the email
  // lookup, per hour and per day), and a host-wide spend cap far above real
  // sign-ups. All taken before register branches on taken/new, so they count
  // the same for both. The per-address day cap bounds guessing: 6 codes x 5
  // attempts a day for one address.
  "recovery-register": { max: 10, windowMs: HOUR },
  "code-send-account": { max: 10, windowMs: DAY },
  "code-send-email": { max: 3, windowMs: HOUR, alert: true },
  "code-send-email-day": { max: 6, windowMs: DAY, alert: true },
  "code-send-global": { max: 1000, windowMs: HOUR, alert: true },
  // Guessing the 6-digit code: per IP and per account, on top of the five
  // attempts each code allows.
  "recovery-confirm": { max: 30, windowMs: HOUR },
  "recovery-confirm-account": { max: 15, windowMs: HOUR },
  // Per account. Every day-sheet save is one PUT; this is far above what a
  // person editing all day sends, and stops a loop from churning the table.
  "vault-write": { max: 600, windowMs: HOUR },
  // Friends, per account: a device publishes its status to each friend a few
  // times a day and reads all of them when the Friends tab opens. Plus a
  // host-wide cap on box writes, far above real use, to alert on.
  "friends-book-write": { max: 300, windowMs: HOUR },
  "friends-box-write": { max: 300, windowMs: HOUR },
  "friends-box-write-day": { max: 1500, windowMs: DAY },
  "friends-box-read": { max: 600, windowMs: HOUR },
  "friends-box-write-global": { max: 20_000, windowMs: HOUR, alert: true },
  // New box addresses (what takes storage): a person needs a handful a day
  // (invites, answers, one status per new friend). Host-wide, at most about
  // 6 MB of new boxes a day (2752-character ciphertext each); a refusal is
  // the alert to look at, since boxes cannot be attributed to purge them.
  "friends-box-create": { max: 60, windowMs: DAY },
  "friends-box-create-global": { max: 2_000, windowMs: DAY, alert: true },
} as const satisfies Record<string, RateLimit>;

export type RateLimitBucket = keyof typeof RATE_LIMITS;

export type RateLimitHit = { bucket: RateLimitBucket; keyHash: string };

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

function ipv6Groups(address: string): number[] | null {
  let text = address;
  // An embedded IPv4 tail (::ffff:192.0.2.1) becomes two groups.
  const v4 = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(text);
  if (v4) {
    const bytes = v4.slice(1).map(Number);
    if (bytes.some((byte) => byte > 255)) return null;
    text = `${text.slice(0, v4.index)}${((bytes[0] << 8) | bytes[1]).toString(16)}:${((bytes[2] << 8) | bytes[3]).toString(16)}`;
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  const parse = (part: string) => (part === "" ? [] : part.split(":"));
  const head = parse(halves[0]);
  const tail = halves.length === 2 ? parse(halves[1]) : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null;
  const groups = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  if (!groups.every((group) => /^[0-9a-f]{1,4}$/i.test(group))) return null;
  return groups.map((group) => Number.parseInt(group, 16));
}

/**
 * What a per-IP limit counts: an IPv4 address as is, an IPv6 address by its
 * /64 prefix (one subscriber usually gets a whole /64, so counting single
 * addresses would let one client rotate through billions of them). An
 * IPv4-mapped IPv6 address counts as its IPv4 address.
 */
export function ipLimitSubject(ip: string): string {
  const address = ip.trim().replace(/^\[|\]$/g, "").replace(/%.*$/, "");
  if (!address.includes(":")) return address;
  const groups = ipv6Groups(address);
  if (!groups) return address.toLowerCase();
  if (groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff) {
    return [groups[6] >> 8, groups[6] & 0xff, groups[7] >> 8, groups[7] & 0xff].join(".");
  }
  return `${groups
    .slice(0, 4)
    .map((group) => group.toString(16))
    .join(":")}::/64`;
}

/** HMAC of the client IP (its /64 for IPv6). The raw IP is never stored. */
export function sourceKey(request: Request): string {
  return hashIp(ipLimitSubject(clientIp(request)));
}

/**
 * Keyed hash for a non-IP limit (an account id, an email lookup). The raw value
 * never reaches `rate_limit_hits` or the logs, and the hash differs from the
 * value stored in other tables, so the rows cannot be joined to them by value.
 * Timing is another matter: a per-account hit written right before a friend
 * box write can link that box to its writer for as long as the hit is kept
 * (about a day); docs/threat-model.md and the privacy policy say so.
 */
export function limitKey(kind: "account" | "email", value: string): string {
  const secret = requireSecret("EMAIL_LOOKUP_SECRET");
  return bytesToHex(hmac(sha256, utf8ToBytes(secret), utf8ToBytes(`rate-limit:${kind}:${value}`)));
}

/** The single key of a global budget. */
export const GLOBAL_KEY = "global";

/**
 * Counts this request against every limit in `hits`, all or nothing: returns
 * false, recording nothing, if any of them is already full. Atomic: each key is
 * locked (`pg_advisory_xact_lock`) for the transaction, so parallel requests
 * cannot all read a count under the limit and all pass. A refusal by a limit
 * marked `alert` is logged with a stable code (never the key).
 */
export async function takeRateLimits(db: Db, hits: RateLimitHit[], now = new Date()): Promise<boolean> {
  const refused = await applyLimits(
    db,
    hits.map((hit) => ({ ...hit, limit: RATE_LIMITS[hit.bucket] })),
    now,
  );
  for (const bucket of refused) {
    if ((RATE_LIMITS[bucket as RateLimitBucket] as RateLimit | undefined)?.alert) {
      console.warn(`RATE_LIMIT_REFUSED ${bucket}`);
    }
  }
  return refused.length === 0;
}

export async function takeRateLimit(
  db: Db,
  bucket: RateLimitBucket,
  keyHash: string,
  now = new Date(),
): Promise<boolean> {
  return takeRateLimits(db, [{ bucket, keyHash }], now);
}

/** takeRateLimits with explicit limits. Exported for tests. */
export async function takeLimits(
  db: Db,
  hits: { bucket: string; keyHash: string; limit: RateLimit }[],
  now = new Date(),
): Promise<boolean> {
  return (await applyLimits(db, hits, now)).length === 0;
}

/**
 * Returns the buckets that were full (nothing recorded then), or [] after
 * recording one hit in each. Three round trips whatever the number of limits:
 * BEGIN, the lock and count-and-insert statements (sent together), COMMIT.
 */
async function applyLimits(
  db: Db,
  hits: { bucket: string; keyHash: string; limit: RateLimit }[],
  now: Date,
): Promise<string[]> {
  if (hits.length === 0) return [];
  const refused = await db.transaction(async (tx) => {
    // One statement takes every lock, in hash order, so two requests that
    // share keys always lock them in the same order and cannot deadlock.
    const lockKeys = sql.join(
      hits.map((hit) => sql`${`${hit.bucket}:${hit.keyHash}`}`),
      sql`, `,
    );
    const locking = tx.execute(
      sql`SELECT pg_advisory_xact_lock(k) FROM (SELECT DISTINCT hashtext(x) AS k FROM unnest(ARRAY[${lockKeys}]::text[]) AS x ORDER BY k) AS locks`,
    );
    // Counts every limit and, only if none is full, inserts one hit per limit,
    // in one statement. It must stay a statement of its own after the locks:
    // Postgres takes its snapshot when it starts, which is once the locks are
    // held, so it sees every hit committed by whoever held them before. Sent
    // without waiting for the lock's answer (pipelined); Postgres still runs
    // it only after the lock statement has finished.
    const rows = sql.join(
      hits.map(
        (hit) =>
          sql`(${hit.bucket}::text, ${hit.keyHash}::text, ${hit.limit.max}::int, ${new Date(now.getTime() - hit.limit.windowMs).toISOString()}::timestamptz)`,
      ),
      sql`, `,
    );
    const counting = tx.execute<{ refused: string[] | null }>(sql`
      WITH hits (bucket, key_hash, max, since) AS (VALUES ${rows}),
      full_buckets AS (
        SELECT h.bucket FROM hits h
        WHERE (
          SELECT count(*) FROM (
            SELECT 1 FROM ${rateLimitHits} r
            WHERE r.bucket = h.bucket AND r.key_hash = h.key_hash AND r.created_at > h.since
            LIMIT h.max
          ) AS recent
        ) >= h.max
      ),
      inserted AS (
        INSERT INTO ${rateLimitHits} (bucket, key_hash, created_at)
        SELECT bucket, key_hash, ${now.toISOString()}::timestamptz FROM hits
        WHERE NOT EXISTS (SELECT 1 FROM full_buckets)
        RETURNING 1
      )
      SELECT (SELECT array_agg(bucket ORDER BY bucket) FROM full_buckets) AS refused,
             (SELECT count(*) FROM inserted)::int AS inserted
    `);
    const [, result] = await Promise.all([locking, counting]);
    return result[0]?.refused ?? [];
  });
  if (refused.length === 0 && Math.random() * PRUNE_ONE_IN < 1) await pruneEphemeralRows(db, now);
  return refused;
}

/**
 * Deletes bookkeeping that can no longer matter: rate-limit hits and recovery
 * attempts older than a day, auth challenges and pending email confirmations
 * that have expired, and expired friend boxes (sealed, no account; reads skip
 * them already). None of these rows hold diary data; a pending row holds a
 * wrapped kit and HMAC(email) for a sign-up that was never confirmed.
 */
export async function pruneEphemeralRows(db: Db, now = new Date()) {
  const cutoff = new Date(now.getTime() - KEEP_MS);
  await db.delete(rateLimitHits).where(lt(rateLimitHits.createdAt, cutoff));
  await db.delete(recoveryAttempts).where(lt(recoveryAttempts.createdAt, cutoff));
  await db.delete(authChallenges).where(lt(authChallenges.expiresAt, now));
  await db.delete(mailboxPending).where(lt(mailboxPending.expiresAt, now));
  // Only once Friends is on: until then production may not have 0008 yet, and
  // a missing table must never fail the request this cleanup rides on.
  if (FRIENDS_AVAILABLE) {
    await db
      .delete(friendBoxes)
      .where(lt(friendBoxes.expiresAt, now))
      .catch((error: unknown) => console.error(`FRIEND_BOX_PRUNE_FAILED ${describeError(error)}`));
  }
}

export function tooManyRequests(): Response {
  return jsonError("Too many attempts", 429);
}
