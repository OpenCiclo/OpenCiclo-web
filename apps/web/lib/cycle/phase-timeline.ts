// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The days and dates of each phase in one cycle, for the phase card. Same
// calendar heuristic as `phaseAtDate` (lib/cycle/phases.ts): the expected
// bleed from the start, the estimated ovulation window 16–10 days before the
// next start, follicular before it and luteal after. Not the forecast engine.

import { addDaysIso } from "@/lib/diary";
import { daysBetween } from "@/lib/forecast/math";
import { CYCLE_PHASES, type CycleOverview, type CyclePhase } from "@/lib/cycle/phases";

/**
 * Whether the phase card shows the expected period instead of a phase: the
 * most likely start day has come or gone, with a forecast and no bleeding
 * logged today. The phase heuristic keeps calling those days "luteal ·
 * estimated" (the open cycle stays open), so the card decides here.
 */
export function showsPeriodDue(overview: CycleOverview): boolean {
  if (!overview.forecastingEnabled || !overview.forecast) return false;
  if (overview.nextPeriodInDays === null || overview.nextPeriodInDays > 0) return false;
  return overview.currentPhase === null || overview.currentPhase.source === "estimated";
}

/** Days before the next start where the estimated ovulation window opens and closes. */
const OVULATION_OPENS = 16;
const OVULATION_CLOSES = 10;

export type PhaseSpan = {
  phase: CyclePhase;
  /** Cycle days, 1-based, inclusive. */
  startDay: number;
  endDay: number;
  /** ISO dates, inclusive. */
  start: string;
  end: string;
};

export type CycleTimeline = {
  cycleStart: string;
  nextStart: string;
  /** Days from this start to the next one. */
  length: number;
  /** The phases in order. A very short cycle can leave one out (no room for it). */
  spans: PhaseSpan[];
};

/**
 * The phases of the cycle that started on `cycleStart`, when the next one is
 * expected on `nextStart` and a period lasts `periodLength` days. Null when
 * the dates make no cycle (next start not after this one).
 */
export function cycleTimeline(cycleStart: string, nextStart: string, periodLength: number): CycleTimeline | null {
  const length = daysBetween(cycleStart, nextStart);
  if (length < 1) return null;
  const bleed = Math.min(length, Math.max(1, Math.round(periodLength)));
  // Bleeding wins over the ovulation window, as in phaseAtDate.
  const ovulationStart = Math.max(bleed + 1, length + 1 - OVULATION_OPENS);
  const ovulationEnd = length + 1 - OVULATION_CLOSES;
  const days: Record<CyclePhase, [number, number]> = {
    menstrual: [1, bleed],
    follicular: [bleed + 1, ovulationStart - 1],
    ovulation: [ovulationStart, ovulationEnd],
    luteal: [Math.max(bleed + 1, ovulationEnd + 1), length],
  };
  const spans = CYCLE_PHASES.flatMap((phase): PhaseSpan[] => {
    const [startDay, endDay] = days[phase];
    if (endDay < startDay) return [];
    return [{ phase, startDay, endDay, start: addDaysIso(cycleStart, startDay - 1), end: addDaysIso(cycleStart, endDay - 1) }];
  });
  return { cycleStart, nextStart, length, spans };
}

/**
 * How much of each phase has gone by on cycle day `day`, from 0 to 1, in
 * timeline order. Days past the end of the cycle count as all of it.
 */
export function phaseProgress(timeline: CycleTimeline, day: number): number[] {
  return timeline.spans.map((span) => {
    if (day >= span.endDay) return 1;
    if (day < span.startDay) return 0;
    return (day - span.startDay + 1) / (span.endDay - span.startDay + 1);
  });
}

/** Where cycle day `day` sits along the timeline, from 0 to 1 (the middle of the day). */
export function dayPosition(timeline: CycleTimeline, day: number): number {
  return Math.min(1, Math.max(0, (day - 0.5) / timeline.length));
}

/**
 * Where the estimated ovulation sits along the timeline, from 0 to 1: the
 * middle of its window. The first half of the cycle (estrogen) ends there and
 * the second (progesterone) begins.
 */
export function ovulationPosition(timeline: CycleTimeline): number | null {
  const window = timeline.spans.find((span) => span.phase === "ovulation");
  if (!window) return null;
  return (window.startDay - 1 + (window.endDay - window.startDay + 1) / 2) / timeline.length;
}
