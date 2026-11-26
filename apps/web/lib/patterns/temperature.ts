// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// What Patterns' temperature card draws, worked out without React: the
// readings of each cycle by cycle day, and plain numbers about them. It only
// arranges what she logged. No rise, cover line, shift or ovulation day is
// computed here, and none may be added (agents.txt, "Temperature").

import type { Diary } from "@/lib/diary";
import { daysBetween } from "@/lib/forecast/math";
import { completedCycles, openCycleStart } from "@/lib/patterns/stats";
import { inUnit, type TemperatureUnit } from "@/lib/temperature";

/** The fewest days the chart of an open cycle shows across, so its first days are not stretched. */
export const MIN_OPEN_CYCLE_DAYS = 28;

export type TemperatureReading = {
  /** Cycle day, counted from 1. */
  day: number;
  iso: string;
  celsius: number;
};

export type TemperatureCycle = {
  start: string;
  /** The next period start (not part of the cycle); null for the open cycle. */
  end: string | null;
  open: boolean;
  /** Days across the chart: the cycle's length, or for the open one the days so far (28 at least). */
  length: number;
  /** Cycle days with bleeding logged. */
  bleedDays: number[];
  readings: TemperatureReading[];
  /** The readings in runs of consecutive days: a line joins a run, never a gap. */
  runs: TemperatureReading[][];
  /** In degrees Celsius. */
  stats: { count: number; min: number; max: number; mean: number };
};

function buildCycle(diary: Diary, start: string, end: string | null, length: number): TemperatureCycle | null {
  const readings: TemperatureReading[] = [];
  const bleedDays: number[] = [];
  for (const iso of Object.keys(diary.days).sort()) {
    if (iso < start || (end !== null && iso >= end)) continue;
    const log = diary.days[iso];
    const day = daysBetween(start, iso) + 1;
    if (log.flow) bleedDays.push(day);
    if (log.bbt !== undefined) readings.push({ day, iso, celsius: log.bbt });
  }
  if (readings.length === 0) return null;
  const runs: TemperatureReading[][] = [];
  for (const reading of readings) {
    const run = runs[runs.length - 1];
    if (run && run[run.length - 1].day === reading.day - 1) run.push(reading);
    else runs.push([reading]);
  }
  const values = readings.map((reading) => reading.celsius);
  const last = readings[readings.length - 1].day;
  return {
    start,
    end,
    open: end === null,
    length: Math.max(length, last),
    bleedDays,
    readings,
    runs,
    stats: {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((sum, value) => sum + value, 0) / values.length,
    },
  };
}

/**
 * The cycles that hold at least one reading, oldest first, the open one last.
 * Cycles come from `completedCycles` and `openCycleStart`, so an interval that
 * held a pregnancy is not one, and there is no open cycle while a pregnancy
 * goes on or before her period comes back.
 */
export function temperatureCycles(diary: Diary, today: string): TemperatureCycle[] {
  const cycles: TemperatureCycle[] = [];
  for (const cycle of completedCycles(diary)) {
    const built = buildCycle(diary, cycle.start, cycle.end, cycle.length);
    if (built) cycles.push(built);
  }
  const open = openCycleStart(diary);
  if (open && open <= today) {
    const built = buildCycle(diary, open, null, Math.max(daysBetween(open, today) + 1, MIN_OPEN_CYCLE_DAYS));
    if (built) cycles.push(built);
  }
  return cycles;
}

/** Readings that belong to no cycle drawn: before the first period start, or in days that held a pregnancy. */
export function readingsOutsideCycles(diary: Diary, today: string): number {
  const total = Object.values(diary.days).filter((log) => log.bbt !== undefined).length;
  const drawn = temperatureCycles(diary, today).reduce((sum, cycle) => sum + cycle.readings.length, 0);
  return total - drawn;
}

export type TemperatureAxis = { min: number; max: number; ticks: number[] };

/**
 * The chart's vertical axis in `unit`. It never spans less than 1 °C (2 °F):
 * a flat cycle must not be stretched until it looks like a rise.
 */
export function temperatureAxis(cycle: TemperatureCycle, unit: TemperatureUnit): TemperatureAxis {
  let low = inUnit(cycle.stats.min, unit);
  let high = inUnit(cycle.stats.max, unit);
  const minSpan = unit === "f" ? 2 : 1;
  if (high - low < minSpan) {
    const middle = (low + high) / 2;
    low = middle - minSpan / 2;
    high = middle + minSpan / 2;
  }
  // Steps in tenths of a degree, as whole numbers, so no tick reads 36.400000000000006.
  let step = unit === "f" ? 5 : 2;
  let from = Math.floor((low * 10) / step) * step;
  let to = Math.ceil((high * 10) / step) * step;
  while ((to - from) / step > 6) {
    step *= 2;
    from = Math.floor((low * 10) / step) * step;
    to = Math.ceil((high * 10) / step) * step;
  }
  const ticks: number[] = [];
  for (let tick = from; tick <= to; tick += step) ticks.push(tick / 10);
  return { min: from / 10, max: to / 10, ticks };
}
