// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { classifyMoonPhase, isMainPhaseDay, lunarDayInfo, MOON_PHASE_IDS, nextFullOrNewMoon } from "./phases";

describe("lunar phases", () => {
  it("snaps continuous phase values to the eight named phases", () => {
    expect(classifyMoonPhase(0)).toBe("newMoon");
    expect(classifyMoonPhase(0.125)).toBe("waxingCrescent");
    expect(classifyMoonPhase(0.25)).toBe("firstQuarter");
    expect(classifyMoonPhase(0.5)).toBe("fullMoon");
    expect(classifyMoonPhase(0.75)).toBe("lastQuarter");
    expect(classifyMoonPhase(0.999)).toBe("newMoon");
  });

  it("covers all eight phase ids exactly once around the cycle", () => {
    const ids = Array.from({ length: 8 }, (_, index) => classifyMoonPhase(index / 8));
    expect(ids).toEqual([...MOON_PHASE_IDS]);
  });

  it("classifies known astronomical dates near major phases", () => {
    // Full moon around 2026-08-28 UTC (within a day tolerance).
    const nearFull = lunarDayInfo("2026-08-28");
    expect(["waxingGibbous", "fullMoon", "waningGibbous"]).toContain(nearFull.phaseId);
    expect(nearFull.fraction).toBeGreaterThan(0.85);

    // New moon around 2026-08-12 UTC.
    const nearNew = lunarDayInfo("2026-08-12");
    expect(["waningCrescent", "newMoon", "waxingCrescent"]).toContain(nearNew.phaseId);
    expect(nearNew.fraction).toBeLessThan(0.2);
  });

  it("marks only the four principal phases as major", () => {
    expect(lunarDayInfo("2026-08-28").isMajor || lunarDayInfo("2026-08-27").isMajor).toBe(true);
    const midCrescent = lunarDayInfo("2026-08-16");
    if (midCrescent.phaseId === "waxingCrescent" || midCrescent.phaseId === "waxingGibbous") {
      expect(midCrescent.isMajor).toBe(false);
    }
  });

  it("returns a rounded illuminated percentage", () => {
    const info = lunarDayInfo("2026-08-20");
    expect(info.percent).toBeGreaterThanOrEqual(0);
    expect(info.percent).toBeLessThanOrEqual(100);
    expect(info.percent).toBe(Math.round(info.fraction * 100));
  });
});

describe("main phase days", () => {
  const november = Array.from({ length: 30 }, (_, index) => `2026-11-${String(index + 1).padStart(2, "0")}`);

  it("marks one day for each main phase of a month", () => {
    // November 2026: last quarter on the 1st, new moon on the 9th, first quarter on the 17th, full moon on the 24th.
    expect(november.filter(isMainPhaseDay)).toEqual(["2026-11-01", "2026-11-09", "2026-11-17", "2026-11-24"]);
  });

  it("finds the next full or new moon, never the day itself", () => {
    expect(nextFullOrNewMoon("2026-11-20")).toEqual({ iso: "2026-11-24", phaseId: "fullMoon" });
    expect(nextFullOrNewMoon("2026-11-05")).toEqual({ iso: "2026-11-09", phaseId: "newMoon" });
    expect(nextFullOrNewMoon("2026-11-24")?.phaseId).toBe("newMoon");
    expect(nextFullOrNewMoon("2026-11-30")?.iso.startsWith("2026-12")).toBe(true);
  });
});
