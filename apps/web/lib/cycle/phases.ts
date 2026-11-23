// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { addDaysIso, type Diary } from "@/lib/diary";
import { mostLikelyLength } from "@/lib/forecast/distribution";
import { daysBetween } from "@/lib/forecast/math";
import type { Forecast } from "@/lib/forecast/types";
import type { Messages } from "@/lib/i18n";
import { knownCycleOvulation, openCycleOvulation, type OvulationWindow } from "@/lib/cycle/ovulation";
import {
  forecastFor,
  insidePregnancy,
  pregnancyStatus,
  validCycleLengths,
  type PregnancyStatus,
} from "@/lib/cycle/segments";
import {
  estimatePeriodDuration,
  expectedBleedingWindow,
  periodRuns,
  type PeriodDurationStats,
  type PeriodRun,
} from "@/lib/cycle/period-duration";

export const CYCLE_PHASES = ["menstrual", "follicular", "ovulation", "luteal"] as const;
export type CyclePhase = (typeof CYCLE_PHASES)[number];
export type PhaseSource = "observed" | "estimated";
export const CYCLE_SEASONS = ["winter", "spring", "summer", "fall"] as const;
export type CycleSeason = (typeof CYCLE_SEASONS)[number];

export type { PeriodRun };

export type PhaseAtDate = {
  phase: CyclePhase;
  source: PhaseSource;
  cycleDay: number;
  cycleStart: string;
  nextStart: string;
};

export type CycleOverview = {
  currentCycleDay: number | null;
  currentPhase: PhaseAtDate | null;
  avgCycleLength: number | null;
  avgPeriodLength: number | null;
  expectedPeriodLength: number | null;
  expectedBleedingWindow: { start: string; end: string; dates: string[] } | null;
  periodLengthRange: { min: number; max: number } | null;
  nextPeriodDate: string | null;
  nextPeriodInDays: number | null;
  /** Untruncated probability that the open cycle starts on `today`. Null when forecasting is off. */
  initialStartProbability: number | null;
  forecast: Forecast | null;
  /** The open cycle's estimated ovulation window. Null when forecasting is off. */
  ovulation: OvulationWindow | null;
  forecastingEnabled: boolean;
  periodRuns: PeriodRun[];
  periodDuration: PeriodDurationStats;
  /** Where a pregnancy stands (lib/cycle/segments.ts): while one goes on, or until her period comes back, no forecast. */
  pregnancy: PregnancyStatus;
};

export const DEFAULT_PERIOD_LENGTH = 5;

export const PHASE_COPY: Record<CyclePhase, { label: keyof Messages; body: keyof Messages }> = {
  menstrual: { label: "phaseMenstrual", body: "phaseMenstrualBody" },
  follicular: { label: "phaseFollicular", body: "phaseFollicularBody" },
  ovulation: { label: "phaseOvulation", body: "phaseOvulationBody" },
  luteal: { label: "phaseLuteal", body: "phaseLutealBody" },
};

const PHASE_SEASONS: Record<CyclePhase, CycleSeason> = {
  menstrual: "winter",
  follicular: "spring",
  ovulation: "summer",
  luteal: "fall",
};

export function phaseSeason(phase: CyclePhase): CycleSeason {
  return PHASE_SEASONS[phase];
}

export function phaseLabel(phase: CyclePhase, t: Messages): string {
  return String(t[PHASE_COPY[phase].label]);
}

export function phaseBody(phase: CyclePhase, t: Messages): string {
  return String(t[PHASE_COPY[phase].body]);
}

export { periodRuns };

export function averagePeriodLength(runs: PeriodRun[]): number {
  if (runs.length === 0) return DEFAULT_PERIOD_LENGTH;
  const total = runs.reduce((sum, run) => sum + run.length, 0);
  return Math.max(1, Math.round(total / runs.length));
}

export function meanRounded(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.max(1, Math.round(values.reduce((sum, value) => sum + value, 0) / values.length));
}

export function lastPeriodStartOnOrBefore(starts: string[], date: string): string | null {
  let start: string | null = null;
  for (const candidate of [...starts].sort()) {
    if (candidate <= date) start = candidate;
    else break;
  }
  return start;
}

export function cycleDayAtDate(starts: string[], date: string): number | null {
  const start = lastPeriodStartOnOrBefore(starts, date);
  if (!start) return null;
  return daysBetween(start, date) + 1;
}

export function cycleContaining(date: string, starts: string[], predictedNext: string | null) {
  const ordered = [...starts].sort();
  if (ordered.length === 0) return null;
  if (date < ordered[0]) return null;
  for (let i = 0; i < ordered.length; i += 1) {
    const current = ordered[i];
    const loggedNext = ordered[i + 1] ?? null;
    if (loggedNext) {
      if (date >= current && date < loggedNext) return { start: current, next: loggedNext };
      continue;
    }
    if (date < current || !predictedNext) return null;
    // The open cycle stays open after the expected start until a new start is logged.
    return { start: current, next: predictedNext };
  }
  return null;
}

/** Most likely start from the full length distribution, before dates already passed are dropped. */
export function anchoredPeriodDate(forecast: Forecast): string {
  return addDaysIso(forecast.lastPeriodStart, mostLikelyLength(forecast.cycleLengthDistribution));
}

/** Probability of `date` on the untruncated length distribution. Zero when the day is outside support. */
export function untruncatedStartProbability(forecast: Forecast, date: string): number {
  const length = daysBetween(forecast.lastPeriodStart, date);
  const index = forecast.cycleLengthDistribution.supportDays.indexOf(length);
  if (index < 0) return 0;
  return forecast.cycleLengthDistribution.probabilities[index] ?? 0;
}

export function phaseAtDate(
  diary: Diary,
  date: string,
  predictedNext: string | null = null,
  periodLength = estimatePeriodDuration(diary).expectedDays ?? DEFAULT_PERIOD_LENGTH,
  options: { includeEstimated?: boolean } = {},
): PhaseAtDate | null {
  const includeEstimated = options.includeEstimated ?? true;
  // A day inside a pregnancy, or before her period comes back after one, has no phase.
  if (insidePregnancy(date, diary.periodStarts, diary.pregnancies ?? [])) return null;
  const bounds = cycleContaining(date, diary.periodStarts, predictedNext);
  if (diary.days[date]?.flow) {
    const start = bounds?.start ?? lastPeriodStartOnOrBefore(diary.periodStarts, date);
    if (!start) return null;
    return {
      phase: "menstrual",
      source: "observed",
      cycleDay: daysBetween(start, date) + 1,
      cycleStart: start,
      nextStart: bounds?.next ?? start,
    };
  }
  if (!includeEstimated || !bounds) return null;
  const cycleDay = daysBetween(bounds.start, date) + 1;
  const menstrualEnd = addDaysIso(bounds.start, periodLength - 1);
  if (date <= menstrualEnd) {
    return {
      phase: "menstrual",
      source: "estimated",
      cycleDay,
      cycleStart: bounds.start,
      nextStart: bounds.next,
    };
  }
  // Counted back from the (expected) next start, as `cycleTimeline` and a friend's card do.
  const ovulation = knownCycleOvulation(bounds.start, bounds.next, periodLength);
  // After the expected start the open cycle stays open, but ovulation is behind it.
  if (ovulation && date < bounds.next && date >= ovulation.start && date <= ovulation.end) {
    return {
      phase: "ovulation",
      source: "estimated",
      cycleDay,
      cycleStart: bounds.start,
      nextStart: bounds.next,
    };
  }
  const follicular = ovulation ? date < ovulation.start : date < bounds.next;
  return {
    phase: follicular ? "follicular" : "luteal",
    source: "estimated",
    cycleDay,
    cycleStart: bounds.start,
    nextStart: bounds.next,
  };
}

/** The bleed length the estimates assume: the diary's expected period length, else 5 days. */
export function expectedBleedDays(overview: CycleOverview): number {
  return overview.expectedPeriodLength ?? DEFAULT_PERIOD_LENGTH;
}

export function isPeriodDueOrOverdue(overview: CycleOverview): boolean {
  return Boolean(
    overview.forecastingEnabled &&
      overview.forecast &&
      !overview.currentPhase &&
      overview.nextPeriodInDays !== null &&
      overview.nextPeriodInDays <= 0,
  );
}

/**
 * `today` is the person's calendar date (`useTodayIso()`, in the zone chosen in
 * Settings). It is required: a UTC default was a day off for part of every day
 * outside UTC.
 */
export function cycleOverview(diary: Diary, today: string): CycleOverview {
  const runs = periodRuns(diary);
  const periodDuration = estimatePeriodDuration(diary);
  const starts = [...diary.periodStarts].sort();
  const pregnancies = diary.pregnancies ?? [];
  const avgCycleLength = meanRounded(validCycleLengths(starts, pregnancies));
  const pregnancy = pregnancyStatus(starts, pregnancies);
  // Days since the last start mean nothing while pregnant or before the period comes back.
  const currentCycleDay = insidePregnancy(today, starts, pregnancies) ? null : cycleDayAtDate(starts, today);
  const forecastingEnabled = diary.forecastingEnabled !== false;
  const empty: CycleOverview = {
    currentCycleDay,
    currentPhase: null,
    avgCycleLength,
    avgPeriodLength: periodDuration.meanDays,
    expectedPeriodLength: periodDuration.expectedDays,
    expectedBleedingWindow: null,
    periodLengthRange: periodDuration.range,
    nextPeriodDate: null,
    nextPeriodInDays: null,
    initialStartProbability: null,
    forecast: null,
    ovulation: null,
    forecastingEnabled,
    periodRuns: runs,
    periodDuration,
    pregnancy,
  };

  if (starts.length === 0) {
    return { ...empty, currentCycleDay: null };
  }

  const menstrualLength = periodDuration.expectedDays ?? DEFAULT_PERIOD_LENGTH;
  if (!forecastingEnabled) {
    return {
      ...empty,
      currentPhase: phaseAtDate(diary, today, null, menstrualLength, { includeEstimated: false }),
    };
  }

  const forecast = forecastFor(starts, pregnancies, today);
  if (!forecast) {
    return {
      ...empty,
      currentPhase: phaseAtDate(diary, today, null, menstrualLength, { includeEstimated: false }),
    };
  }
  const anchorDate = anchoredPeriodDate(forecast);
  const currentPhase = phaseAtDate(diary, today, anchorDate, menstrualLength, {
    includeEstimated: true,
  });
  return {
    ...empty,
    currentPhase,
    currentCycleDay: currentPhase?.cycleDay ?? currentCycleDay,
    expectedBleedingWindow: expectedBleedingWindow(anchorDate, periodDuration.expectedDays),
    nextPeriodDate: anchorDate,
    nextPeriodInDays: daysBetween(today, anchorDate),
    initialStartProbability: untruncatedStartProbability(forecast, today),
    forecast,
    ovulation: openCycleOvulation(forecast, menstrualLength, anchorDate),
  };
}
