// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { ENTRANCE_TTL_MS, entranceBetween, setTabEntrance, takeTabEntrance } from "@/lib/client/tab-entrance";

describe("tab entrance", () => {
  it("comes from the side of the tab tapped, near or far", () => {
    expect(entranceBetween(0, 1)).toBe("next");
    expect(entranceBetween(0, 3)).toBe("next");
    expect(entranceBetween(3, 0)).toBe("prev");
    expect(entranceBetween(2, 1)).toBe("prev");
  });

  it("has no direction for the same tab or a route off the tabs", () => {
    expect(entranceBetween(1, 1)).toBeNull();
    expect(entranceBetween(-1, 2)).toBeNull();
    expect(entranceBetween(2, -1)).toBeNull();
  });

  it("is taken once", () => {
    setTabEntrance("next", 1000);
    expect(takeTabEntrance(1100)).toBe("next");
    expect(takeTabEntrance(1150)).toBeNull();
  });

  it("is forgotten when no screen opened soon after the tap", () => {
    setTabEntrance("prev", 1000);
    expect(takeTabEntrance(1000 + ENTRANCE_TTL_MS + 1)).toBeNull();
  });

  it("can be cleared", () => {
    setTabEntrance("next", 1000);
    setTabEntrance(null, 1010);
    expect(takeTabEntrance(1020)).toBeNull();
  });
});
