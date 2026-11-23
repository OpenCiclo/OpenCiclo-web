// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Estimated ovulation windows (`lib/forecast/ovulation.ts`), two ways from the same
// luteal model (their most likely days are at most a day or so apart):
// - the open cycle's window for the calendar and the phase card's "estimated
//   ovulation" row: the forecast's full cycle-length distribution, so it widens
//   when there is little history or the cycles vary (about 80% of ovulations fall
//   inside it, docs/evaluation.md);
// - a cycle counted back from a known or expected next start, for the phase
//   chapters (`phaseAtDate`, `cycleTimeline`) and closed cycles: only the luteal
//   spread. A friend's card works its phase out the same way from the shared
//   status, so the sharer's card and the friend's always agree.
// An estimate from the calendar: never a confirmed ovulation, never contraception.

import { addDaysIso } from "@/lib/diary";
import { daysBetween } from "@/lib/forecast/math";
import {
  estimateOvulation,
  estimateOvulationKnownLength,
  type OvulationEstimate,
} from "@/lib/forecast/ovulation";
import type { Forecast } from "@/lib/forecast/types";

/** From this many days on, the card says the window is wide because the cycles vary a lot. */
export const WIDE_OVULATION_WINDOW_DAYS = 15;

export type OvulationWindow = {
  cycleStart: string;
  /** First and last day of the window, inclusive. Never on a day of expected bleeding. */
  start: string;
  end: string;
  /** The single most likely day. */
  mostLikely: string;
  /** Days in the window. */
  days: number;
  /** Probability inside the window (about 80%). */
  probability: number;
  wide: boolean;
};

function windowFrom(estimate: OvulationEstimate, nextStart: string | null): OvulationWindow {
  let end = estimate.windowEnd;
  // Never on or after the expected next start, even when the cycle is very irregular.
  if (nextStart && end >= nextStart) end = addDaysIso(nextStart, -1);
  const start = estimate.windowStart <= end ? estimate.windowStart : end;
  const mostLikely =
    estimate.mostLikelyDate < start ? start : estimate.mostLikelyDate > end ? end : estimate.mostLikelyDate;
  const days = daysBetween(start, end) + 1;
  return {
    cycleStart: estimate.cycleStart,
    start,
    end,
    mostLikely,
    days,
    probability: estimate.windowProbability,
    wide: days >= WIDE_OVULATION_WINDOW_DAYS,
  };
}

/** The open cycle's window from a forecast, ending before `nextStart` (the anchored next start). */
export function openCycleOvulation(
  forecast: Forecast,
  bleedDays: number,
  nextStart: string | null,
): OvulationWindow | null {
  const estimate = estimateOvulation(forecast, bleedDays);
  return estimate ? windowFrom(estimate, nextStart) : null;
}

/** A cycle whose next start is known: only the luteal spread. */
export function knownCycleOvulation(cycleStart: string, nextStart: string, bleedDays: number): OvulationWindow | null {
  const estimate = estimateOvulationKnownLength(cycleStart, nextStart, bleedDays);
  return estimate ? windowFrom(estimate, nextStart) : null;
}

export type OvulationMarks = { window: Set<string>; mostLikely: Set<string> };

/**
 * Every calendar date inside an estimated ovulation window: each closed cycle
 * (known next start) and the open one. Worked out once per diary or forecast
 * change, not per calendar cell.
 */
export function estimatedOvulationDates(
  periodStarts: readonly string[],
  open: OvulationWindow | null,
  bleedDays: number,
): OvulationMarks {
  const marks: OvulationMarks = { window: new Set(), mostLikely: new Set() };
  const ordered = [...periodStarts].sort();
  const windows: OvulationWindow[] = [];
  for (let i = 0; i < ordered.length - 1; i += 1) {
    const window = knownCycleOvulation(ordered[i], ordered[i + 1], bleedDays);
    if (window) windows.push(window);
  }
  if (open) windows.push(open);
  for (const window of windows) {
    for (let day = window.start; day <= window.end; day = addDaysIso(day, 1)) marks.window.add(day);
    marks.mostLikely.add(window.mostLikely);
  }
  return marks;
}
