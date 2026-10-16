// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { isNotNull } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/lib/db/schema";
import { researchContributions } from "@/lib/db/schema";

// 0001_pool_upsert.sql makes contributor_key_hash unique through a partial index
// (WHERE contributor_key_hash IS NOT NULL). Postgres only matches a partial index
// in ON CONFLICT when the same predicate is repeated, so targetWhere is required.
export function upsertPoolContribution(
  db: PostgresJsDatabase<typeof schema>,
  contributorKeyHash: string,
  cycleLengths: number[],
) {
  return db
    .insert(researchContributions)
    .values({ contributorKeyHash, cycleLengths })
    .onConflictDoUpdate({
      target: researchContributions.contributorKeyHash,
      targetWhere: isNotNull(researchContributions.contributorKeyHash),
      set: { cycleLengths, updatedAt: new Date() },
    });
}
