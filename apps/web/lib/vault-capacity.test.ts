// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { MAX_VAULT_CIPHERTEXT_LENGTH } from "@/lib/server/vault-limits";

describe("vault capacity", () => {
  it("allows multi-year short daily notes under the ciphertext cap", () => {
    expect(MAX_VAULT_CIPHERTEXT_LENGTH).toBe(512 * 1024);
    // Rough upper bound: a 200-character note every day for 5 years, UTF-8 JSON
    // + base64 overhead. The largest diary in production (November 2026) was
    // under 5,000 characters.
    const roughPlainChars = 200 * 365 * 5;
    const roughCipherChars = Math.ceil(roughPlainChars * 1.4);
    expect(roughCipherChars).toBeLessThan(MAX_VAULT_CIPHERTEXT_LENGTH);
  });
});
