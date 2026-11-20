// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { MIGRATIONS_DIR } from "@/lib/db/migration-files";

import { BOX_CIPHERTEXT_LENGTH, BOX_TTL_DAYS, MAX_BOOK_CIPHERTEXT_LENGTH, MAX_BOX_LIFE_DAYS, NONCE_LENGTH } from "./limits";

describe("friend size limits", () => {
  const sql = readFileSync(join(MIGRATIONS_DIR, "0008_friends.sql"), "utf8");

  it("match the CHECK constraints in drizzle/0008_friends.sql", () => {
    expect(BOX_CIPHERTEXT_LENGTH).toBe(2752);
    expect(MAX_BOOK_CIPHERTEXT_LENGTH).toBe(43712);
    expect(sql).toContain(`length(ciphertext) = ${BOX_CIPHERTEXT_LENGTH}`);
    expect(sql).toContain(`length(nonce) = ${NONCE_LENGTH}`);
    expect(sql).toContain(`length(ciphertext) <= ${MAX_BOOK_CIPHERTEXT_LENGTH}`);
  });

  it("keep every box within the 7 weeks the privacy policy promises, weekly rounding included", () => {
    for (const days of Object.values(BOX_TTL_DAYS)) expect(days + 7).toBeLessThanOrEqual(MAX_BOX_LIFE_DAYS);
    expect(MAX_BOX_LIFE_DAYS).toBe(7 * 7);
  });

  it("give friend_boxes no account column and no write time", () => {
    const table = /CREATE TABLE IF NOT EXISTS friend_boxes \(([^;]*)\);/.exec(sql)?.[1] ?? "";
    expect(table).not.toMatch(/account|created_at|updated_at|pubkey/i);
  });
});
