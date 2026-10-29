// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { slideProgress } from "@/lib/client/screen-carousel";

describe("screen carousel", () => {
  it("moves the screens exactly as far as the finger, in a straight line", () => {
    expect(slideProgress(1, 1, 1)).toBe(0);
    expect(slideProgress(1.25, 1, 1)).toBeCloseTo(0.25);
    expect(slideProgress(1.5, 1, 1)).toBeCloseTo(0.5);
    expect(slideProgress(1.75, 1, 1)).toBeCloseTo(0.75);
  });

  it("goes toward the previous tab too", () => {
    expect(slideProgress(0.6, 1, -1)).toBeCloseTo(0.4);
  });

  it("stops at the two screens it is between", () => {
    expect(slideProgress(2.4, 1, 1)).toBe(1);
    expect(slideProgress(0.8, 1, 1)).toBe(0);
  });
});
