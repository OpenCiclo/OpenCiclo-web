// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import {
  STILL_FRAMES,
  SWEEP_SPEED,
  SWITCH_AT,
  dragFrame,
  labelScale,
  resist,
  screenPull,
  stepSpring,
  stoppedOnTab,
  stretchScale,
  type Spring,
} from "@/lib/client/tab-drag";

describe("tab bar drag", () => {
  it("follows the finger with resistance and stays on its tab below the threshold", () => {
    const frame = dragFrame(1, 0.4, 1, 4);
    expect(frame.held).toBe(1);
    expect(frame.position).toBeGreaterThan(1);
    expect(frame.position).toBeLessThan(1.4);
    expect(frame.stretch).toBeGreaterThan(0);
  });

  it("switches to the next tab past the threshold, in both directions", () => {
    expect(dragFrame(1, SWITCH_AT + 0.01, 1, 4).held).toBe(2);
    expect(dragFrame(1, -SWITCH_AT - 0.01, 1, 4).held).toBe(0);
  });

  it("does not flicker back right after switching", () => {
    const switched = dragFrame(1, SWITCH_AT + 0.01, 1, 4);
    expect(dragFrame(1, SWITCH_AT - 0.05, switched.held, 4).held).toBe(2);
    expect(dragFrame(1, 1 - SWITCH_AT - 0.01, switched.held, 4).held).toBe(1);
  });

  it("crosses several tabs in one fast move", () => {
    expect(dragFrame(0, 2.8, 0, 4).held).toBe(3);
  });

  it("squashes against the first and last tab without leaving them", () => {
    const first = dragFrame(0, -2, 0, 4);
    expect(first.held).toBe(0);
    expect(first.stretch).toBe(-1);
    expect(first.position).toBeGreaterThan(-0.1);
    const last = dragFrame(3, 0.3, 3, 4);
    expect(last.held).toBe(3);
    expect(last.stretch).toBeLessThan(0);
  });

  it("never pulls past the resistance limit", () => {
    expect(resist(100, 0.3)).toBeLessThanOrEqual(0.3);
    expect(resist(-100, 0.3)).toBeGreaterThanOrEqual(-0.3);
    expect(resist(0, 0.3)).toBe(0);
  });

  it("stretches along the bar and squashes the other way", () => {
    const stretched = stretchScale(1);
    expect(stretched.x).toBeGreaterThan(1);
    expect(stretched.y).toBeLessThan(1);
    const squashed = stretchScale(-1);
    expect(squashed.x).toBeLessThan(1);
    expect(squashed.y).toBeGreaterThan(1);
    expect(stretchScale(0)).toEqual({ x: 1, y: 1 });
  });

  it("stretches the label under the selection a little more, like gum", () => {
    const gum = labelScale(stretchScale(1));
    expect(gum.x).toBeGreaterThan(stretchScale(1).x);
    expect(gum.x).toBeLessThan(1.3);
    expect(labelScale({ x: 1, y: 1 })).toEqual({ x: 1, y: 1 });
  });

  it("pulls the screen the other way from the selection, with resistance", () => {
    // Selection pulled toward the next tab: the screen goes left.
    expect(screenPull(1.3, 1)).toBeLessThan(0);
    expect(screenPull(0.7, 1)).toBeGreaterThan(0);
    expect(screenPull(1, 1)).toBeCloseTo(0, 6);
    // It gives less and less, and never leaves more than a quarter of the screen.
    expect(Math.abs(screenPull(1.6, 1))).toBeLessThan(2 * Math.abs(screenPull(1.3, 1)));
    expect(Math.abs(screenPull(5, 1))).toBeLessThanOrEqual(0.25);
  });

  it("changes screens where the finger stops, not on every tab a sweep passes", () => {
    // Slow enough to be stopping on this tab.
    expect(stoppedOnTab(1, 0)).toBe(true);
    // Sweeping past it, still moving.
    expect(stoppedOnTab(SWEEP_SPEED + 2, 0)).toBe(false);
    expect(stoppedOnTab(-(SWEEP_SPEED + 2), 0)).toBe(false);
    // The last move was fast, but frames went by without another: it stopped.
    expect(stoppedOnTab(SWEEP_SPEED + 2, STILL_FRAMES - 1)).toBe(false);
    expect(stoppedOnTab(SWEEP_SPEED + 2, STILL_FRAMES)).toBe(true);
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
