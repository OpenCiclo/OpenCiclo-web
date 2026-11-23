// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The days and dates of each phase in one cycle, for the phase card and a
// friend's card. Same heuristic as `phaseAtDate` (lib/cycle/phases.ts): the
// expected bleed from the start, the ovulation window counted back from the next
// start with the luteal spread (`knownCycleOvulation`), follicular before it and
// luteal after.

import { addDaysIso } from "@/lib/diary";
import { daysBetween } from "@/lib/forecast/math";
import { knownCycleOvulation } from "@/lib/cycle/ovulation";
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
  /** Cycle day (1-based) of the most likely ovulation, inside the ovulation span. Null without one. */
  ovulationDay: number | null;
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
  const window = knownCycleOvulation(cycleStart, nextStart, bleed);
  // Bleeding wins over the ovulation window, as in phaseAtDate.
  const ovulationStart = window ? Math.max(bleed + 1, daysBetween(cycleStart, window.start) + 1) : length + 1;
  const ovulationEnd = window ? Math.min(length, daysBetween(cycleStart, window.end) + 1) : length;
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
  const hasOvulation = spans.some((span) => span.phase === "ovulation");
  const likely = window ? daysBetween(cycleStart, window.mostLikely) + 1 : null;
  const ovulationDay =
    hasOvulation && likely !== null ? Math.min(Math.max(likely, ovulationStart), ovulationEnd) : null;
  return { cycleStart, nextStart, length, spans, ovulationDay };
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
 * middle of its most likely day. The first half of the cycle (estrogen) ends
 * there and the second (progesterone) begins.
 */
export function ovulationPosition(timeline: CycleTimeline): number | null {
  if (timeline.ovulationDay === null) return null;
  return (timeline.ovulationDay - 0.5) / timeline.length;
}
