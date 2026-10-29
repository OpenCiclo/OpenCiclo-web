// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { followStiffness } from "@/lib/client/screen-carousel";

describe("screen carousel", () => {
  it("keeps up with the finger close by, and catches up softer from far away", () => {
    expect(followStiffness(0)).toBe(followStiffness(0.1));
    expect(followStiffness(2)).toBeLessThan(followStiffness(0.1));
    expect(followStiffness(2)).toBe(followStiffness(0.8));
    expect(followStiffness(0.3)).toBeLessThan(followStiffness(0.2));
  });
});
