// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Which intervals between period starts are cycles. The one that held a
// pregnancy is not (PLAN 4.9): the forecast, Patterns, the averages, Friends and
// the research pool all read cycle lengths through here, so none of them counts
// it. Also where a pregnancy stands for the forecast: none while one goes on or
// until the period comes back after it ends (ESTUDIO 4.1).

import { daysBetween } from "@/lib/forecast/math";
import { predict, releasedConfig, releasedPrior } from "@/lib/forecast/predict";
import type { Forecast } from "@/lib/forecast/types";
import { conceptionDate } from "@/lib/pregnancy/dating";
import { activePregnancy, lastEndedPregnancy, type PregnancyRecord } from "@/lib/pregnancy/record";

/**
 * After a pregnancy that ended without a birth, the forecast reuses her cycles
 * from before but with a wider spread for this many cycles: the Laplace scale is
 * at least `POST_PREGNANCY_MIN_SCALE` days (the literature prior's MAD). A
 * documented assumption with no data behind it (ESTUDIO 5). After a birth the
 * forecast starts again from the prior instead.
 */
export const POST_LOSS_WIDE_CYCLES = 3;
export const POST_PREGNANCY_MIN_SCALE = 3;

type Starts = readonly string[];
type Pregnancies = readonly PregnancyRecord[];

export type CycleSegment = {
  start: string;
  next: string;
  length: number;
  /** The pregnancy this interval held, if any: then it is not a cycle. */
  pregnancy: PregnancyRecord | null;
};

/** The pregnancy whose span (estimated conception to its end, or on) overlaps `start`–`next`. */
function pregnancyIn(start: string, next: string, pregnancies: Pregnancies): PregnancyRecord | null {
  for (const record of pregnancies) {
    const from = conceptionDate(record.dueDate);
    const to = record.end?.date ?? "9999-12-31";
    if (from < next && to >= start) return record;
  }
  return null;
}

/** Every interval between two logged starts, with the pregnancy it held. */
export function cycleSegments(periodStarts: Starts, pregnancies: Pregnancies = []): CycleSegment[] {
  const ordered = [...periodStarts].sort();
  const segments: CycleSegment[] = [];
  for (let i = 0; i < ordered.length - 1; i += 1) {
    segments.push({
      start: ordered[i],
      next: ordered[i + 1],
      length: daysBetween(ordered[i], ordered[i + 1]),
      pregnancy: pregnancyIn(ordered[i], ordered[i + 1], pregnancies),
    });
  }
  return segments;
}

/** Cycle lengths: every interval except one that held a pregnancy. */
export function validCycleLengths(periodStarts: Starts, pregnancies: Pregnancies = []): number[] {
  return cycleSegments(periodStarts, pregnancies)
    .filter((segment) => !segment.pregnancy)
    .map((segment) => segment.length);
}

/**
 * Starts whose following length the forecast leaves out: the intervals that held
 * a pregnancy and, after a birth, every interval before it (the forecast starts
 * again from the prior: breastfeeding changes the pattern).
 */
export function forecastExcludedStarts(periodStarts: Starts, pregnancies: Pregnancies = []): string[] {
  let restartFrom = "";
  for (const record of pregnancies) {
    if (record.end?.outcome === "birth" && record.end.date > restartFrom) restartFrom = record.end.date;
  }
  return cycleSegments(periodStarts, pregnancies)
    .filter((segment) => segment.pregnancy || segment.start < restartFrom)
    .map((segment) => segment.start);
}

export type PregnancyStatus =
  | { kind: "none" }
  /** A pregnancy goes on: no forecast, no phases. */
  | { kind: "active"; record: PregnancyRecord }
  /** It ended and no period has been logged since: no forecast, never "late". */
  | { kind: "resuming"; record: PregnancyRecord }
  /** It ended and her period came back `cyclesSinceReturn` completed cycles ago (0: the cycle that came back). */
  | { kind: "returned"; record: PregnancyRecord; cyclesSinceReturn: number };

export function pregnancyStatus(periodStarts: Starts, pregnancies: Pregnancies = []): PregnancyStatus {
  const active = activePregnancy(pregnancies);
  if (active) return { kind: "active", record: active };
  const ended = lastEndedPregnancy(pregnancies);
  if (!ended?.end) return { kind: "none" };
  const endDate = ended.end.date;
  const after = periodStarts.filter((iso) => iso > endDate).length;
  if (after === 0) return { kind: "resuming", record: ended };
  return { kind: "returned", record: ended, cyclesSinceReturn: after - 1 };
}

/**
 * Whether `date` falls inside a pregnancy as the cycle sees it: from its
 * estimated conception day until the first period start after its end (or on,
 * while it goes on). Such a day has no phase, observed or estimated.
 */
export function insidePregnancy(date: string, periodStarts: Starts, pregnancies: Pregnancies = []): boolean {
  for (const record of pregnancies) {
    // Before its estimated conception a day is an ordinary cycle day, unless
    // the pregnancy had already ended by then (one dated from a recent period
    // and ended within days): from its end on there is no cycle either way.
    if (date < conceptionDate(record.dueDate) && !(record.end && date >= record.end.date)) continue;
    if (!record.end) return true;
    const endDate = record.end.date;
    const back = [...periodStarts].sort().find((iso) => iso > endDate);
    if (!back || date < back) return true;
  }
  return false;
}

/**
 * The forecast for the open cycle, or null when a pregnancy goes on or her
 * period has not come back after one. Leaves out the intervals that are not
 * cycles and, for the first cycles after a pregnancy ended without a birth,
 * widens the spread.
 */
export function forecastFor(periodStarts: string[], pregnancies: Pregnancies, today: string): Forecast | null {
  if (periodStarts.length === 0) return null;
  const status = pregnancyStatus(periodStarts, pregnancies);
  if (status.kind === "active" || status.kind === "resuming") return null;
  const config = releasedConfig();
  const widen =
    status.kind === "returned" &&
    status.record.end?.outcome === "ended" &&
    status.cyclesSinceReturn < POST_LOSS_WIDE_CYCLES;
  return predict(
    periodStarts,
    today,
    releasedPrior(),
    widen ? { ...config, minLaplaceScale: Math.max(config.minLaplaceScale, POST_PREGNANCY_MIN_SCALE) } : config,
    forecastExcludedStarts(periodStarts, pregnancies),
  );
}
