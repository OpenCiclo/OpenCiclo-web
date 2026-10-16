// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, desc, eq, gt, lte, notInArray, or } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/lib/db/schema";
import { authChallenges } from "@/lib/db/schema";

export const CHALLENGE_TTL_MS = 5 * 60 * 1000;

// Several live challenges per key, so two tabs (or React StrictMode's double
// effect) signing in at once do not cancel each other. Still bounded per key.
export const MAX_LIVE_CHALLENGES_PER_KEY = 5;

type Db = PostgresJsDatabase<typeof schema>;

export async function issueChallenge(db: Db, pubkeyHash: string, now = new Date()) {
  const keep = db
    .select({ id: authChallenges.id })
    .from(authChallenges)
    .where(and(eq(authChallenges.pubkeyHash, pubkeyHash), gt(authChallenges.expiresAt, now)))
    .orderBy(desc(authChallenges.createdAt))
    .limit(MAX_LIVE_CHALLENGES_PER_KEY - 1);
  await db
    .delete(authChallenges)
    .where(
      and(
        eq(authChallenges.pubkeyHash, pubkeyHash),
        or(lte(authChallenges.expiresAt, now), notInArray(authChallenges.id, keep)),
      ),
    );

  const nonce = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const expiresAt = new Date(now.getTime() + CHALLENGE_TTL_MS);
  await db.insert(authChallenges).values({ pubkeyHash, nonce, expiresAt });
  return { nonce, expiresAt };
}

/** Deletes the matching live challenge and reports whether there was one. Single use, no race. */
export async function consumeChallenge(db: Db, pubkeyHash: string, nonce: string, now = new Date()) {
  const consumed = await db
    .delete(authChallenges)
    .where(
      and(
        eq(authChallenges.pubkeyHash, pubkeyHash),
        eq(authChallenges.nonce, nonce),
        gt(authChallenges.expiresAt, now),
      ),
    )
    .returning({ id: authChallenges.id });
  return consumed.length > 0;
}
