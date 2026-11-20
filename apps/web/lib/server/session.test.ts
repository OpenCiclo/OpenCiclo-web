// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { macsEqual } from "./session";

describe("session MAC comparison", () => {
  it("matches equal MACs only", () => {
    const mac = "ab".repeat(32);
    expect(macsEqual(mac, mac)).toBe(true);
    expect(macsEqual(mac, `${"ab".repeat(31)}ac`)).toBe(false);
    expect(macsEqual(mac, mac.slice(0, 62))).toBe(false);
    expect(macsEqual(mac, "")).toBe(false);
  });
});
