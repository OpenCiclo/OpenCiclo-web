// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { labelScale, resist, stepSpring, stretchScale, type Spring } from "@/lib/client/tab-motion";

describe("tab bar selection motion", () => {
  it("never pulls past the resistance limit", () => {
    expect(resist(100, 0.3)).toBeLessThanOrEqual(0.3);
    expect(resist(-100, 0.3)).toBeGreaterThanOrEqual(-0.3);
    expect(resist(0, 0.3)).toBe(0);
  });

  it("stretches along the bar and flattens across it", () => {
    const stretched = stretchScale(1);
    expect(stretched.x).toBeGreaterThan(1);
    expect(stretched.y).toBeLessThan(1);
    expect(stretchScale(0)).toEqual({ x: 1, y: 1 });
    expect(stretchScale(5)).toEqual(stretchScale(1));
  });

  it("stretches the label under the selection a little more, like gum", () => {
    const gum = labelScale(stretchScale(1));
    expect(gum.x).toBeGreaterThan(stretchScale(1).x);
    expect(gum.x).toBeLessThan(1.3);
    expect(labelScale({ x: 1, y: 1 })).toEqual({ x: 1, y: 1 });
  });

  it("springs to the target with a small overshoot", () => {
    const spring: Spring = { value: 0, velocity: 0 };
    let peak = 0;
    for (let step = 0; step < 240; step++) {
      stepSpring(spring, 1, 1 / 240, 420, 0.7);
      peak = Math.max(peak, spring.value);
    }
    expect(peak).toBeGreaterThan(1);
    expect(peak).toBeLessThan(1.1);
    expect(spring.value).toBeCloseTo(1, 3);
  });
});
