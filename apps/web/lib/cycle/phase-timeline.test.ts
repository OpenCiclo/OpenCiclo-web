// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { addDaysIso, parseDiary, type Diary } from "@/lib/diary";
import { cycleOverview, phaseAtDate } from "@/lib/cycle/phases";
import {
  cycleTimeline,
  dayPosition,
  ovulationPosition,
  phaseProgress,
  showsPeriodDue,
} from "@/lib/cycle/phase-timeline";

function diaryWithStarts(starts: string[], extraDays: Record<string, object> = {}) {
  const days = Object.fromEntries(starts.map((iso) => [iso, { flow: "medium", symptoms: {} }]));
  return parseDiary({ schemaVersion: 3, locale: "en", periodStarts: starts, days: { ...days, ...extraDays } });
}

describe("period due card", () => {
  const diary = diaryWithStarts(["2026-06-01", "2026-06-29"]);
  const anchor = cycleOverview(diary, "2026-07-10").nextPeriodDate!;

  it("shows the phase before the most likely start", () => {
    expect(showsPeriodDue(cycleOverview(diary, addDaysIso(anchor, -1)))).toBe(false);
  });

  it("shows the expected period on the most likely day and after it", () => {
    expect(showsPeriodDue(cycleOverview(diary, anchor))).toBe(true);
    expect(showsPeriodDue(cycleOverview(diary, addDaysIso(anchor, 3)))).toBe(true);
  });

  it("shows the phase once bleeding is logged", () => {
    const bleeding = diaryWithStarts(["2026-06-01", "2026-06-29"], { [anchor]: { flow: "light", symptoms: {} } });
    expect(showsPeriodDue(cycleOverview(bleeding, anchor))).toBe(false);
  });

  it("never shows it with forecasting off", () => {
    const off = { ...diary, forecastingEnabled: false };
    expect(showsPeriodDue(cycleOverview(off, addDaysIso(anchor, 3)))).toBe(false);
  });
});

const days = (timeline: ReturnType<typeof cycleTimeline>) =>
  timeline?.spans.map((span) => [span.phase, span.startDay, span.endDay]);

describe("cycle timeline", () => {
  it("splits a 28-day cycle with a 5-day period", () => {
    const timeline = cycleTimeline("2026-10-23", "2026-11-20", 5);
    expect(timeline?.length).toBe(28);
    expect(days(timeline)).toEqual([
      ["menstrual", 1, 5],
      ["follicular", 6, 12],
      ["ovulation", 13, 19],
      ["luteal", 20, 28],
    ]);
    expect(timeline?.spans[0]).toMatchObject({ start: "2026-10-23", end: "2026-10-27" });
    expect(timeline?.spans[3]).toMatchObject({ start: "2026-11-11", end: "2026-11-19" });
  });

  it("moves the ovulation window with the cycle length", () => {
    expect(days(cycleTimeline("2026-01-01", "2026-02-05", 5))).toEqual([
      ["menstrual", 1, 5],
      ["follicular", 6, 19],
      ["ovulation", 20, 26],
      ["luteal", 27, 35],
    ]);
  });

  it("leaves out a phase that has no room in a short cycle", () => {
    expect(days(cycleTimeline("2026-01-01", "2026-01-22", 5))).toEqual([
      ["menstrual", 1, 5],
      ["ovulation", 6, 12],
      ["luteal", 13, 21],
    ]);
  });

  it("follows the logged period length", () => {
    expect(days(cycleTimeline("2026-10-23", "2026-11-20", 7))?.slice(0, 2)).toEqual([
      ["menstrual", 1, 7],
      ["follicular", 8, 12],
    ]);
  });

  it("returns nothing when the next start is not after this one", () => {
    expect(cycleTimeline("2026-10-23", "2026-10-23", 5)).toBeNull();
  });

  it("agrees with phaseAtDate on every day of the cycle", () => {
    const start = "2026-03-02";
    const diary = { periodStarts: [start], days: {} } as unknown as Diary;
    for (const [length, period] of [[28, 5], [24, 4], [33, 6], [21, 5]]) {
      const next = addDaysIso(start, length);
      const timeline = cycleTimeline(start, next, period);
      for (let day = 1; day <= length; day += 1) {
        const date = addDaysIso(start, day - 1);
        const expected = phaseAtDate(diary, date, next, period)?.phase;
        const span = timeline?.spans.find((item) => day >= item.startDay && day <= item.endDay);
        expect(span?.phase, `length ${length}, day ${day}`).toBe(expected);
      }
    }
  });

  it("measures progress, today's position and the estrogen/progesterone split", () => {
    const timeline = cycleTimeline("2026-10-23", "2026-11-20", 5)!;
    expect(phaseProgress(timeline, 22)).toEqual([1, 1, 1, 3 / 9]);
    expect(phaseProgress(timeline, 31)).toEqual([1, 1, 1, 1]);
    expect(dayPosition(timeline, 1)).toBeCloseTo(0.5 / 28);
    expect(dayPosition(timeline, 40)).toBe(1);
    expect(ovulationPosition(timeline)).toBeCloseTo(15.5 / 28);
  });
});
