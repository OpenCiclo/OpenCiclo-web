// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import {
  PERIOD_START_DISPLAY_THRESHOLD,
  isEditableDiaryDate,
  isEstimatedBleedingDate,
  possiblePeriodStartDates,
  visiblePossiblePeriodStarts,
} from "./calendar-markers";

describe("calendar markers", () => {
  it("keeps current or future dates at or above the 12% threshold in any month", () => {
    const dates = possiblePeriodStartDates(
      [
        { date: "2026-08-17", probability: 0.2 },
        { date: "2026-08-18", probability: 0.119 },
        { date: "2026-08-19", probability: 0.12 },
        { date: "2026-09-02", probability: 0.4 },
      ],
      "2026-08-18",
    );
    expect([...dates].sort()).toEqual(["2026-08-19", "2026-09-02"]);
    expect(PERIOD_START_DISPLAY_THRESHOLD).toBe(0.12);
  });

  it("includes the most likely date when it sits above the display threshold", () => {
    const dates = possiblePeriodStartDates(
      [
        { date: "2026-09-14", probability: 0.13 },
        { date: "2026-09-15", probability: 0.17 },
        { date: "2026-09-16", probability: 0.11 },
      ],
      "2026-08-21",
    );
    expect([...dates].sort()).toEqual(["2026-09-14", "2026-09-15"]);
  });

  it("hides future possible starts once the anchored day is late", () => {
    const daily = [
      { date: "2026-10-10", probability: 0.3 },
      { date: "2026-10-11", probability: 0.15 },
      { date: "2026-10-12", probability: 0.11 },
    ];
    expect([...visiblePossiblePeriodStarts(daily, "2026-10-08", 2)].sort()).toEqual([
      "2026-10-10",
      "2026-10-11",
    ]);
    expect(visiblePossiblePeriodStarts(daily, "2026-10-12", -2).size).toBe(0);
    expect(visiblePossiblePeriodStarts(null, "2026-10-12", 1).size).toBe(0);
  });

  it("blocks writing diary dates after today", () => {
    expect(isEditableDiaryDate("2026-08-18", "2026-08-18")).toBe(true);
    expect(isEditableDiaryDate("2026-08-17", "2026-08-18")).toBe(true);
    expect(isEditableDiaryDate("2026-08-19", "2026-08-18")).toBe(false);
  });

  it("marks inclusive estimated bleeding days from the expected window", () => {
    const window = {
      start: "2026-07-27",
      end: "2026-07-30",
      dates: ["2026-07-27", "2026-07-28", "2026-07-29", "2026-07-30"],
    };
    expect(isEstimatedBleedingDate("2026-07-27", window)).toBe(true);
    expect(isEstimatedBleedingDate("2026-07-30", window)).toBe(true);
    expect(isEstimatedBleedingDate("2026-07-26", window)).toBe(false);
    expect(isEstimatedBleedingDate("2026-07-28", null)).toBe(false);
  });
});
