// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { DailyProbability } from "@/lib/forecast/types";

export const PERIOD_START_DISPLAY_THRESHOLD = 0.12;

export function isCurrentCalendarMonth(viewYear: number, viewMonth: number, today: string): boolean {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  return viewYear === year && viewMonth === month;
}

export function isEditableDiaryDate(iso: string, today: string): boolean {
  return iso <= today;
}

export function possiblePeriodStartDates(
  daily: DailyProbability[],
  today: string,
  threshold = PERIOD_START_DISPLAY_THRESHOLD,
): Set<string> {
  return new Set(
    daily.filter((item) => item.date >= today && item.probability >= threshold).map((item) => item.date),
  );
}

/** Future possible-start dots use the moving forecast. Hide them once the anchored day is in the past. */
export function visiblePossiblePeriodStarts(
  daily: DailyProbability[] | null | undefined,
  today: string,
  nextPeriodInDays: number | null,
): Set<string> {
  if (!daily || (nextPeriodInDays !== null && nextPeriodInDays < 0)) return new Set();
  return possiblePeriodStartDates(daily, today);
}

export function isEstimatedBleedingDate(
  date: string,
  window: { dates: string[] } | null | undefined,
): boolean {
  return Boolean(window?.dates.includes(date));
}
