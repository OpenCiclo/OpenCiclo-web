// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Estimated ovulation as a distribution over days of the cycle. Mirrors
// openciclo/forecasting/ovulation.py (parity vectors in tests/fixtures/forecast_parity.json).
// Ovulation day = next start − luteal phase: the forecast's cycle-length distribution
// combined with a population luteal distribution. An estimate from the calendar: it never
// confirms ovulation and is not contraception.

import {
  LUTEAL_MAX_DAYS,
  LUTEAL_MEAN_DAYS,
  LUTEAL_MIN_DAYS,
  LUTEAL_SD_DAYS,
  OVULATION_INTERVAL_COVERAGE,
} from "./constants";
import { addDays, daysBetween } from "./math";
import type { Forecast, LengthDistribution } from "./types";

/** Masses closer than this count as equal, so Python and TypeScript pick the same day. */
const TIE_TOLERANCE = 1e-12;

export type LutealDistribution = { days: number[]; probabilities: number[] };

export type OvulationEstimate = {
  /** First day of the cycle (offset 0). */
  cycleStart: string;
  /** Days after `cycleStart`, consecutive, with `probabilities` summing to 1. */
  offsets: number[];
  probabilities: number[];
  mostLikelyOffset: number;
  windowStartOffset: number;
  windowEndOffset: number;
  /** Probability inside the window (at least `coverage`). */
  windowProbability: number;
  coverage: number;
  mostLikelyDate: string;
  windowStart: string;
  windowEnd: string;
};

/** Discrete normal on `low..high` days (density at each whole day, normalised). */
export function lutealPmf(
  mean = LUTEAL_MEAN_DAYS,
  sd = LUTEAL_SD_DAYS,
  low = LUTEAL_MIN_DAYS,
  high = LUTEAL_MAX_DAYS,
): LutealDistribution {
  if (sd <= 0 || high < low) throw new Error("luteal distribution needs sd > 0 and high >= low");
  const days: number[] = [];
  const weights: number[] = [];
  for (let day = low; day <= high; day += 1) {
    days.push(day);
    weights.push(Math.exp(-0.5 * ((day - mean) / sd) ** 2));
  }
  const total = weights.reduce((sum, value) => sum + value, 0);
  return { days, probabilities: weights.map((value) => value / total) };
}

const DEFAULT_LUTEAL = lutealPmf();

/** A cycle whose next start is known (a closed cycle, or a friend's shared status). */
export function pointMass(lengthDays: number): LengthDistribution {
  return {
    supportDays: [lengthDays],
    probabilities: [1],
    pointEstimate: lengthDays,
    scale: 0,
    assumption: "known_length",
  };
}

/**
 * Probability of ovulation on each offset from the cycle start. Days of expected
 * bleeding (offsets below `bleedDays`) get none and the rest is renormalised. Null when
 * nothing is left (a cycle too short for any luteal length).
 */
export function ovulationPmf(
  lengths: LengthDistribution,
  bleedDays: number,
  luteal: LutealDistribution = DEFAULT_LUTEAL,
): { offsets: number[]; probabilities: number[] } | null {
  const first = Math.max(Math.trunc(bleedDays), 0);
  const mass = new Map<number, number>();
  for (let i = 0; i < lengths.supportDays.length; i += 1) {
    const pLength = lengths.probabilities[i] ?? 0;
    if (pLength <= 0) continue;
    for (let j = 0; j < luteal.days.length; j += 1) {
      const offset = lengths.supportDays[i] - luteal.days[j];
      if (offset < first) continue;
      mass.set(offset, (mass.get(offset) ?? 0) + pLength * luteal.probabilities[j]);
    }
  }
  if (mass.size === 0) return null;
  let total = 0;
  let lo = Infinity;
  let hi = -Infinity;
  for (const [offset, value] of mass) {
    total += value;
    lo = Math.min(lo, offset);
    hi = Math.max(hi, offset);
  }
  if (total <= 0) return null;
  const offsets: number[] = [];
  const probabilities: number[] = [];
  for (let offset = lo; offset <= hi; offset += 1) {
    offsets.push(offset);
    probabilities.push((mass.get(offset) ?? 0) / total);
  }
  return { offsets, probabilities };
}

/** Index of the largest mass; the earliest one among ties. */
export function mostLikelyIndex(probabilities: number[]): number {
  let best = 0;
  for (let i = 0; i < probabilities.length; i += 1) {
    if (probabilities[i] > probabilities[best] + TIE_TOLERANCE) best = i;
  }
  return best;
}

/**
 * Shortest run of consecutive indices holding at least `coverage` of the mass. Among
 * runs of that length the one with the most mass wins, then the earliest. Inclusive.
 */
export function shortestInterval(
  probabilities: number[],
  coverage: number,
): { start: number; end: number; mass: number } {
  const n = probabilities.length;
  if (n === 0) throw new Error("empty distribution");
  const cumulative = [0];
  for (const value of probabilities) cumulative.push(cumulative[cumulative.length - 1] + value);
  const target = Math.min(Math.max(coverage, 0), 1) * cumulative[n];
  for (let width = 1; width <= n; width += 1) {
    let bestStart = -1;
    let bestMass = -1;
    for (let start = 0; start + width <= n; start += 1) {
      const inside = cumulative[start + width] - cumulative[start];
      if (inside > bestMass + TIE_TOLERANCE) {
        bestStart = start;
        bestMass = inside;
      }
    }
    if (bestMass >= target - TIE_TOLERANCE) return { start: bestStart, end: bestStart + width - 1, mass: bestMass };
  }
  return { start: 0, end: n - 1, mass: cumulative[n] };
}

export function ovulationEstimate(
  cycleStart: string,
  lengths: LengthDistribution,
  bleedDays: number,
  coverage = OVULATION_INTERVAL_COVERAGE,
): OvulationEstimate | null {
  const pmf = ovulationPmf(lengths, bleedDays);
  if (!pmf) return null;
  const { offsets, probabilities } = pmf;
  const peak = mostLikelyIndex(probabilities);
  const window = shortestInterval(probabilities, coverage);
  const mostLikelyOffset = offsets[peak];
  const windowStartOffset = offsets[window.start];
  const windowEndOffset = offsets[window.end];
  return {
    cycleStart,
    offsets,
    probabilities,
    mostLikelyOffset,
    windowStartOffset,
    windowEndOffset,
    windowProbability: window.mass,
    coverage,
    mostLikelyDate: addDays(cycleStart, mostLikelyOffset),
    windowStart: addDays(cycleStart, windowStartOffset),
    windowEnd: addDays(cycleStart, windowEndOffset),
  };
}

/**
 * Estimated ovulation in the open cycle of `forecast`, from the full cycle-length
 * distribution (not the one cut at the reference date), so it stays put through the
 * cycle like the anchored next start does.
 */
export function estimateOvulation(
  forecast: Forecast,
  bleedDays: number,
  coverage = OVULATION_INTERVAL_COVERAGE,
): OvulationEstimate | null {
  return ovulationEstimate(forecast.lastPeriodStart, forecast.cycleLengthDistribution, bleedDays, coverage);
}

/** Estimated ovulation in a cycle whose next start is known: only the luteal spread. */
export function estimateOvulationKnownLength(
  cycleStart: string,
  nextStart: string,
  bleedDays: number,
  coverage = OVULATION_INTERVAL_COVERAGE,
): OvulationEstimate | null {
  const length = daysBetween(cycleStart, nextStart);
  if (length < 1) return null;
  return ovulationEstimate(cycleStart, pointMass(length), bleedDays, coverage);
}
