// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { readMigrations, statements } from "@/lib/db/migration-files";

// Production holds real diaries. Migrations must be additive and safe to re-run.
// A statement that can lose or rewrite data needs an entry in REVIEWED, so the
// change shows up in code review next to its reason.

const DESTRUCTIVE: Record<string, RegExp> = {
  DROP: /\bDROP\b/i,
  TRUNCATE: /\bTRUNCATE\b/i,
  DELETE: /\bDELETE\s+FROM\b/i,
  UPDATE: /^UPDATE\b/i,
  RENAME: /\bRENAME\b/i,
  "ALTER COLUMN": /\bALTER\s+COLUMN\b/i,
};

const REVIEWED: Record<string, Partial<Record<keyof typeof DESTRUCTIVE, string>>> = {
  "0003_mailbox_pending.sql": {
    UPDATE: "Backfills verified_at for mailboxes created before email confirmation existed.",
  },
};

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const migrations = readMigrations();

describe("drizzle/*.sql migrations", () => {
  it("are numbered 0000, 0001, … with no gaps", () => {
    migrations.forEach(({ file }, position) => {
      expect(file).toMatch(/^\d{4}_[a-z0-9_]+\.sql$/);
      expect(Number(file.slice(0, 4))).toBe(position);
    });
  });

  it("only create objects idempotently, so re-running a file is harmless", () => {
    for (const { file, sql } of migrations) {
      for (const statement of statements(sql)) {
        if (/^CREATE (UNIQUE )?(TABLE|INDEX)\b/i.test(statement)) {
          expect(statement, file).toMatch(/\bIF NOT EXISTS\b/i);
        }
        for (const addColumn of statement.match(/\bADD COLUMN\b(?! IF NOT EXISTS)/gi) ?? []) {
          expect.fail(`${file}: "${addColumn}" without IF NOT EXISTS`);
        }
      }
    }
  });

  it("contain no destructive statement unless it is reviewed", () => {
    const found: string[] = [];
    for (const { file, sql } of migrations) {
      for (const statement of statements(sql)) {
        for (const [kind, pattern] of Object.entries(DESTRUCTIVE)) {
          if (pattern.test(statement) && !REVIEWED[file]?.[kind]) {
            found.push(`${file}: ${kind} in "${statement.slice(0, 80)}"`);
          }
        }
      }
    }
    expect(found).toEqual([]);
  });

  it.each([
    "../../docker-compose.yml",
    "README.md",
    "content/help/run-it-yourself.md",
    "content/help/host-on-vercel.md",
  ])("are all listed in %s", (path) => {
    const text = readFileSync(join(webRoot, path), "utf8");
    const missing = migrations.map(({ file }) => file).filter((file) => !text.includes(file));
    expect(missing).toEqual([]);
  });
});
