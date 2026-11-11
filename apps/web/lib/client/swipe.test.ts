// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import {
  MONTH_TURN_AT,
  SWIPE_SLOP,
  VelocityTracker,
  monthSwipeIntent,
  monthSwipeStep,
  sheetDragIntent,
  sheetShouldClose,
} from "@/lib/client/swipe";

describe("month swipe", () => {
  it("waits until the finger has moved past the slop", () => {
    expect(monthSwipeIntent(SWIPE_SLOP, 0)).toBe("pending");
    expect(monthSwipeIntent(-4, 6)).toBe("pending");
  });

  it("takes clearly sideways moves and leaves vertical or slanted ones to the page", () => {
    expect(monthSwipeIntent(-24, 4)).toBe("swipe");
    expect(monthSwipeIntent(24, -10)).toBe("swipe");
    expect(monthSwipeIntent(3, 20)).toBe("other");
    expect(monthSwipeIntent(16, 14)).toBe("other");
  });

  it("turns to the next month when the finger moves left, and the previous when it moves right", () => {
    expect(monthSwipeStep(-(MONTH_TURN_AT + 0.01), 0)).toBe(1);
    expect(monthSwipeStep(MONTH_TURN_AT + 0.01, 0)).toBe(-1);
  });

  it("keeps the month after a short or slow drag", () => {
    expect(monthSwipeStep(0, 0)).toBe(0);
    expect(monthSwipeStep(-0.2, -0.4)).toBe(0);
    expect(monthSwipeStep(0.05, 3)).toBe(0);
  });

  it("turns on a flick after less travel", () => {
    expect(monthSwipeStep(-0.15, -2)).toBe(1);
    expect(monthSwipeStep(0.15, 2)).toBe(-1);
  });

  it("keeps the month when the finger heads back as it lifts", () => {
    expect(monthSwipeStep(-0.6, 1)).toBe(0);
    expect(monthSwipeStep(0.6, -1)).toBe(0);
  });
});

describe("sheet drag", () => {
  it("takes vertical moves and leaves sideways ones alone", () => {
    expect(sheetDragIntent(2, 8)).toBe("pending");
    expect(sheetDragIntent(4, 20)).toBe("swipe");
    expect(sheetDragIntent(-3, -14)).toBe("swipe");
    expect(sheetDragIntent(20, 6)).toBe("other");
  });

  it("closes past a share of its height, capped on tall sheets", () => {
    expect(sheetShouldClose(100, 0, 300)).toBe(true);
    expect(sheetShouldClose(80, 0, 300)).toBe(false);
    expect(sheetShouldClose(150, 0, 700)).toBe(true);
    expect(sheetShouldClose(120, 0, 700)).toBe(false);
  });

  it("closes on a flick down, but not on a jab or a drag up", () => {
    expect(sheetShouldClose(40, 900, 700)).toBe(true);
    expect(sheetShouldClose(10, 2000, 700)).toBe(false);
    expect(sheetShouldClose(-30, 900, 700)).toBe(false);
  });

  it("stays open when the finger heads back up as it lifts", () => {
    expect(sheetShouldClose(300, -500, 700)).toBe(false);
  });
});

describe("velocity tracker", () => {
  it("measures the speed of the last moves", () => {
    const tracker = new VelocityTracker();
    tracker.reset(0, 0);
    tracker.add(10, 5);
    tracker.add(20, 10);
    expect(tracker.velocity(20)).toBeCloseTo(500);
  });

  it("forgets old moves", () => {
    const tracker = new VelocityTracker();
    tracker.reset(0, 0);
    tracker.add(50, 200);
    tracker.add(200, 210);
    tracker.add(210, 220);
    expect(tracker.velocity(210)).toBeCloseTo(1000);
  });

  it("reads no speed from a finger that rested before lifting", () => {
    const tracker = new VelocityTracker();
    tracker.reset(0, 0);
    tracker.add(10, 40);
    tracker.add(20, 80);
    expect(tracker.velocity(400)).toBe(0);
  });
});
