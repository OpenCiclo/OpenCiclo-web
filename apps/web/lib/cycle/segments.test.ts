// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { cycleOverview, phaseAtDate } from "@/lib/cycle/phases";
import {
  POST_PREGNANCY_MIN_SCALE,
  cycleSegments,
  forecastExcludedStarts,
  forecastFor,
  insidePregnancy,
  pregnancyStatus,
  validCycleLengths,
} from "@/lib/cycle/segments";
import { addDaysIso, parseDiary, upsertDay, withPregnancies, type Diary } from "@/lib/diary";
import { patternStats } from "@/lib/patterns/stats";
import type { PregnancyRecord } from "@/lib/pregnancy/record";

const BEFORE = ["2025-11-10", "2025-12-08", "2026-01-05", "2026-02-02"];

function pregnancy(overrides: Partial<PregnancyRecord> = {}): PregnancyRecord {
  return {
    id: "0123456789abcdef0123456789abcdef",
    dating: { method: "lmp", lmp: "2026-02-02", cycleLength: null },
    dueDate: "2026-11-09",
    end: null,
    hidden: false,
    friendsMode: "noNews",
    bleedAnswers: {},
    ...overrides,
  };
}

function bleed(diary: Diary, start: string, count = 4): Diary {
  let next = diary;
  for (let i = 0; i < count; i += 1) next = upsertDay(next, addDaysIso(start, i), { flow: "medium", symptoms: {} });
  return next;
}

function diaryWith(starts: string[], record: PregnancyRecord | null): Diary {
  let diary = parseDiary({ schemaVersion: 7, locale: "en", periodStarts: [], days: {} });
  if (record) diary = withPregnancies(diary, [record]);
  for (const start of starts) diary = bleed(diary, start);
  return diary;
}

describe("cycle segments", () => {
  const ended = pregnancy({ end: { date: "2026-03-20", outcome: "ended" } });
  const starts = [...BEFORE, "2026-04-25", "2026-05-24"];

  it("marks the interval that held a pregnancy and leaves it out of cycle lengths", () => {
    const segments = cycleSegments(starts, [ended]);
    expect(segments.map((segment) => Boolean(segment.pregnancy))).toEqual([false, false, false, true, false]);
    expect(validCycleLengths(starts, [ended])).toEqual([28, 28, 28, 29]);
    expect(forecastExcludedStarts(starts, [ended])).toEqual(["2026-02-02"]);
  });

  it("after a birth, the forecast also leaves out every cycle before it", () => {
    const birth = pregnancy({ end: { date: "2026-11-01", outcome: "birth" } });
    const later = [...BEFORE, "2027-01-20", "2027-02-18"];
    expect(forecastExcludedStarts(later, [birth])).toEqual(BEFORE);
    expect(validCycleLengths(later, [birth])).toEqual([28, 28, 28, 29]);
  });

  it("follows a pregnancy from going on, to waiting for the period, to cycles again", () => {
    expect(pregnancyStatus(BEFORE, [pregnancy()]).kind).toBe("active");
    expect(pregnancyStatus(BEFORE, [ended]).kind).toBe("resuming");
    expect(pregnancyStatus([...BEFORE, "2026-04-25"], [ended])).toMatchObject({ kind: "returned", cyclesSinceReturn: 0 });
    expect(pregnancyStatus(starts, [ended])).toMatchObject({ kind: "returned", cyclesSinceReturn: 1 });
    expect(pregnancyStatus(BEFORE, []).kind).toBe("none");
  });

  it("knows which days fall inside a pregnancy", () => {
    expect(insidePregnancy("2026-02-10", BEFORE, [ended])).toBe(false);
    expect(insidePregnancy("2026-02-16", BEFORE, [ended])).toBe(true);
    expect(insidePregnancy("2026-04-24", [...BEFORE, "2026-04-25"], [ended])).toBe(true);
    expect(insidePregnancy("2026-04-25", [...BEFORE, "2026-04-25"], [ended])).toBe(false);
  });

  it("has no open cycle after a pregnancy that ended before its estimated conception day", () => {
    // Dated from a period five days ago and ended today: the estimated conception is still ahead.
    const early = pregnancy({
      dating: { method: "lmp", lmp: "2026-03-26", cycleLength: null },
      dueDate: "2026-12-31",
      end: { date: "2026-03-31", outcome: "ended" },
    });
    const withStart = [...BEFORE, "2026-03-26"];
    expect(pregnancyStatus(withStart, [early]).kind).toBe("resuming");
    expect(insidePregnancy("2026-03-30", withStart, [early])).toBe(false);
    expect(insidePregnancy("2026-03-31", withStart, [early])).toBe(true);
    expect(insidePregnancy("2026-04-05", withStart, [early])).toBe(true);
    expect(insidePregnancy("2026-04-28", [...withStart, "2026-04-28"], [early])).toBe(false);
  });
});

describe("the forecast around a pregnancy", () => {
  it("gives none while it goes on or before the period comes back", () => {
    expect(forecastFor(BEFORE, [pregnancy()], "2026-03-01")).toBeNull();
    expect(forecastFor(BEFORE, [pregnancy({ end: { date: "2026-03-20", outcome: "ended" } })], "2026-04-10")).toBeNull();
  });

  it("after a loss reuses her cycles from before, with a wider spread for three cycles", () => {
    const ended = pregnancy({ end: { date: "2026-03-20", outcome: "ended" } });
    const back = [...BEFORE, "2026-04-25"];
    const first = forecastFor(back, [ended], "2026-04-26");
    expect(first?.nLengths).toBe(3);
    expect(first?.scale).toBeGreaterThanOrEqual(POST_PREGNANCY_MIN_SCALE);
    const later = [...back, "2026-05-23", "2026-06-20", "2026-07-18"];
    expect(forecastFor(later, [ended], "2026-07-19")?.scale).toBeLessThan(POST_PREGNANCY_MIN_SCALE);
  });

  it("after a birth starts again from the population prior", () => {
    const birth = pregnancy({ end: { date: "2026-11-01", outcome: "birth" } });
    const forecast = forecastFor([...BEFORE, "2027-01-20"], [birth], "2027-01-21");
    expect(forecast?.nLengths).toBe(0);
    expect(forecast?.usedPrior).toBe(true);
  });
});

describe("cycle overview around a pregnancy", () => {
  it("while it goes on: no phase, no cycle day, no expected period, even with bleeding today", () => {
    const diary = bleed(diaryWith(BEFORE, pregnancy()), "2026-03-10", 1);
    const overview = cycleOverview(diary, "2026-03-10");
    expect(overview.pregnancy.kind).toBe("active");
    expect(overview.currentPhase).toBeNull();
    expect(overview.currentCycleDay).toBeNull();
    expect(overview.nextPeriodDate).toBeNull();
    expect(overview.forecast).toBeNull();
    expect(overview.ovulation).toBeNull();
    expect(diary.periodStarts).toEqual(BEFORE);
    expect(phaseAtDate(diary, "2026-03-10", null)).toBeNull();
  });

  it("after the end and before the period: never late, no forecast", () => {
    const diary = bleed(diaryWith(BEFORE, pregnancy({ end: { date: "2026-03-20", outcome: "ended" } })), "2026-03-20", 6);
    const overview = cycleOverview(diary, "2026-05-30");
    expect(overview.pregnancy.kind).toBe("resuming");
    expect(overview.nextPeriodInDays).toBeNull();
    expect(overview.currentPhase).toBeNull();
    expect(diary.periodStarts).toEqual(BEFORE);
  });

  it("once the period is back: phases and a forecast again, averages without the pregnancy", () => {
    const diary = diaryWith([...BEFORE, "2026-04-25"], pregnancy({ end: { date: "2026-03-20", outcome: "ended" } }));
    const overview = cycleOverview(diary, "2026-04-27");
    expect(overview.pregnancy.kind).toBe("returned");
    expect(overview.currentPhase?.phase).toBe("menstrual");
    expect(overview.nextPeriodDate).not.toBeNull();
    expect(overview.avgCycleLength).toBe(28);
    expect(patternStats(diary, "2026-04-27").completedCycles.map((cycle) => cycle.length)).toEqual([28, 28, 28]);
  });
});
