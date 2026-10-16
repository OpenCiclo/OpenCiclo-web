// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { describe, expect, it } from "vitest";

import * as schema from "@/lib/db/schema";
import { upsertPoolContribution } from "@/lib/server/research-pool";

describe("research pool upsert", () => {
  it("repeats the partial index predicate so Postgres can match ON CONFLICT", () => {
    const migration = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../drizzle/0001_pool_upsert.sql"),
      "utf8",
    );
    expect(migration).toContain("WHERE contributor_key_hash IS NOT NULL");

    const db = drizzle.mock({ schema });
    const { sql } = upsertPoolContribution(db, "a".repeat(64), [28, 29]).toSQL();
    expect(sql).toMatch(
      /on conflict \("contributor_key_hash"\) where "[a-z_."]*contributor_key_hash" is not null do update/,
    );
  });
});
