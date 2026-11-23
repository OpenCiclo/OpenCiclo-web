// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { Diary, SymptomId } from "@/lib/diary";
import { daysBetween } from "@/lib/forecast/math";
import type { PeriodRun } from "@/lib/cycle/period-duration";
import { completedCycles, openCycleStart, type CompletedCycle, type RecurringSymptom } from "@/lib/patterns/stats";

/** How many completed cycles the Patterns screen draws (the same window `recurringSymptoms` counts over). */
export const CYCLE_LOOKBACK = 6;

/** Symptoms drawn on the cycle rows: more would not be told apart by colour. */
export const MAX_ROW_SYMPTOMS = 4;

/** A symptom's first logged day in one cycle (1 = the day the period started). */
export type SymptomMark = { id: SymptomId; day: number };

export type CycleRow = {
  start: string;
  /** Days from this start to the next one; null for the cycle still open. */
  length: number | null;
  /** Days of bleeding logged from the start (0 when none was logged). */
  bleed: number;
  marks: SymptomMark[];
};

/** Where in the cycle a symptom tends to show: at its start, in the days before the next period, or around a day. */
export type SymptomTiming = { id: SymptomId; when: "start" | "beforePeriod" | "around"; day: number };

export type CyclePattern = {
  /** Completed cycles, oldest first (at most CYCLE_LOOKBACK). */
  completed: CycleRow[];
  /** The cycle that started with the last logged period, when it is still open. */
  current: CycleRow | null;
  /** The symptoms drawn, most recurring first. */
  symptoms: SymptomId[];
  /** For every recurring symptom and every entry of `others`, whether it was logged in each cycle (completed, then current), oldest first. */
  presence: Record<string, boolean[]>;
  timings: SymptomTiming[];
};

/** A symptom counts as "before the period" when it first shows this many days or fewer before the next start. */
const BEFORE_PERIOD_DAYS = 7;
/** ...and as "at the start" when it first shows by this cycle day. */
const START_DAYS = 3;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

/**
 * The last cycles laid out for the Patterns screen: one row per cycle with its
 * length, its bleeding days and the first day each recurring symptom was
 * logged in it. Everything comes from the diary as logged; nothing here is a
 * forecast. `recurring` is `recurringSymptoms` from the stats (already
 * ranked): the rows and the timings draw from it. `others` (the sex entries)
 * only get their `presence`.
 */
export function cyclePattern(
  diary: Diary,
  runs: PeriodRun[],
  recurring: RecurringSymptom[],
  others: RecurringSymptom[] = [],
): CyclePattern {
  const cycles: CompletedCycle[] = completedCycles(diary).slice(-CYCLE_LOOKBACK);
  // Null while a pregnancy goes on or before her period comes back: no open cycle.
  const lastStart = openCycleStart(diary);
  const symptoms = recurring.slice(0, MAX_ROW_SYMPTOMS).map((item) => item.id);
  const dayKeys = Object.keys(diary.days).sort();

  function row(start: string, end: string | null, length: number | null): CycleRow {
    const marks: SymptomMark[] = [];
    for (const id of symptoms) {
      const first = dayKeys.find((iso) => iso >= start && (end === null || iso < end) && Boolean(diary.days[iso]?.symptoms[id]));
      if (first) marks.push({ id, day: daysBetween(start, first) + 1 });
    }
    const bleed = runs.find((run) => run.start === start)?.length ?? 0;
    return { start, length, bleed: length === null ? bleed : Math.min(bleed, length), marks };
  }

  const completed = cycles.map((cycle) => row(cycle.start, cycle.end, cycle.length));
  const current = lastStart ? row(lastStart, null, null) : null;
  const all = current ? [...completed, current] : completed;

  // Each cycle's own end, not the next row's start: an interval that held a
  // pregnancy sits between two rows and belongs to neither.
  const ends: (string | null)[] = [...cycles.map((cycle) => cycle.end), ...(current ? [null] : [])];
  const presence: Record<string, boolean[]> = {};
  for (const { id } of [...recurring, ...others]) {
    presence[id] = all.map((cycle, index) => {
      const end = ends[index];
      return dayKeys.some((iso) => iso >= cycle.start && (end === null || iso < end) && Boolean(diary.days[iso]?.symptoms[id]));
    });
  }

  const timings: SymptomTiming[] = [];
  for (const id of symptoms) {
    const days: number[] = [];
    const beforeEnd: number[] = [];
    for (const cycle of all) {
      const mark = cycle.marks.find((entry) => entry.id === id);
      if (!mark) continue;
      days.push(mark.day);
      if (cycle.length !== null) beforeEnd.push(cycle.length - mark.day + 1);
    }
    // One cycle is a coincidence, not a pattern.
    if (days.length < 2) continue;
    const day = median(days);
    const when =
      day <= START_DAYS
        ? "start"
        : beforeEnd.length >= 2 && median(beforeEnd) <= BEFORE_PERIOD_DAYS
          ? "beforePeriod"
          : "around";
    timings.push({ id, when, day });
  }

  return { completed, current, symptoms, presence, timings };
}

/**
 * How far a cycle strayed from the average, in whole days: the largest
 * distance between a cycle's length and the mean of `lengths`. Null with
 * fewer than two cycles (nothing to compare).
 */
export function cycleVariation(lengths: number[]): number | null {
  if (lengths.length < 2) return null;
  const mean = lengths.reduce((sum, value) => sum + value, 0) / lengths.length;
  return Math.round(Math.max(...lengths.map((value) => Math.abs(value - mean))));
}

/** How alike the cycle lengths are, from the gap between the shortest and the longest. */
export function cycleRegularity(lengths: number[]): "regular" | "somewhat" | "variable" | null {
  if (lengths.length < 2) return null;
  const spread = Math.max(...lengths) - Math.min(...lengths);
  // "Regular" matches the tip of that name (lib/tips/rules.ts): three days or fewer.
  return spread <= 3 ? "regular" : spread <= 7 ? "somewhat" : "variable";
}
