// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { addDaysIso, parseDiary } from "@/lib/diary";
import { daysBetween } from "@/lib/forecast/math";
import { predict } from "@/lib/forecast/predict";
import {
  estimatedOvulationDates,
  knownCycleOvulation,
  openCycleOvulation,
  WIDE_OVULATION_WINDOW_DAYS,
} from "@/lib/cycle/ovulation";
import { cycleOverview, phaseAtDate } from "@/lib/cycle/phases";

function diaryWithStarts(starts: string[]) {
  const days = Object.fromEntries(starts.map((iso) => [iso, { flow: "medium", symptoms: {} }]));
  return parseDiary({ schemaVersion: 3, locale: "en", periodStarts: starts, days });
}

describe("ovulation windows", () => {
  it("counts a known cycle back from its next start", () => {
    const window = knownCycleOvulation("2026-10-23", "2026-11-20", 5);
    expect(window).toMatchObject({ start: "2026-11-05", end: "2026-11-10", mostLikely: "2026-11-08", days: 6 });
    expect(window?.probability).toBeGreaterThanOrEqual(0.8);
    expect(window?.wide).toBe(false);
  });

  it("widens the open cycle's window when the cycles vary, and never reaches the expected start", () => {
    const regular = ["2026-01-01", "2026-01-29", "2026-02-26", "2026-03-26", "2026-04-23", "2026-05-21"];
    const irregular = ["2025-11-01", "2025-12-15", "2026-01-10", "2026-03-01"];
    const a = openCycleOvulation(predict(regular, "2026-05-21"), 5, null)!;
    const b = openCycleOvulation(predict(irregular, "2026-03-01"), 5, "2026-04-07")!;
    expect(b.days).toBeGreaterThan(a.days);
    expect(b.wide).toBe(b.days >= WIDE_OVULATION_WINDOW_DAYS);
    expect(b.end < "2026-04-07").toBe(true);
    expect(b.mostLikely >= b.start && b.mostLikely <= b.end).toBe(true);
  });

  it("marks every closed cycle and the open one, with one most likely day each", () => {
    const starts = ["2026-06-29", "2026-06-01", "2026-07-27"];
    const open = openCycleOvulation(predict([...starts].sort(), "2026-07-27"), 5, "2026-08-24");
    const marks = estimatedOvulationDates(starts, open, 5);
    expect(marks.mostLikely).toEqual(new Set(["2026-06-17", "2026-07-15", open!.mostLikely]));
    expect(marks.window.has("2026-06-14")).toBe(true);
    expect(marks.window.has("2026-06-20")).toBe(false);
    for (let day = open!.start; day <= open!.end; day = addDaysIso(day, 1)) expect(marks.window.has(day)).toBe(true);
    expect(estimatedOvulationDates([], null, 5).window.size).toBe(0);
  });
});

describe("cycle overview and the phase heuristic", () => {
  const diary = diaryWithStarts(["2026-06-01", "2026-06-29", "2026-07-27"]);

  it("gives the open cycle's window, its most likely day inside the ovulation chapter", () => {
    const overview = cycleOverview(diary, "2026-08-01");
    const window = overview.ovulation!;
    expect(window.cycleStart).toBe("2026-07-27");
    expect(window.end < overview.nextPeriodDate!).toBe(true);
    const phase = phaseAtDate(diary, window.mostLikely, overview.nextPeriodDate);
    expect(phase?.phase).toBe("ovulation");
    const before = daysBetween(window.mostLikely, overview.nextPeriodDate!);
    expect(before).toBeGreaterThanOrEqual(11);
    expect(before).toBeLessThanOrEqual(14);
  });

  it("has no window with the forecast off", () => {
    expect(cycleOverview({ ...diary, forecastingEnabled: false }, "2026-08-01").ovulation).toBeNull();
  });

  it("never says ovulation on or after the expected start", () => {
    const overview = cycleOverview(diary, "2026-08-01");
    const next = overview.nextPeriodDate!;
    for (const offset of [0, 1, 4]) {
      expect(phaseAtDate(diary, addDaysIso(next, offset), next)?.phase).toBe("luteal");
    }
  });
});
