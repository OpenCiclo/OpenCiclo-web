// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Calendar dates as YYYY-MM-DD, with no dependencies, so lib/diary.ts and the
// modules it reads with (lib/pregnancy/record.ts) can share them.

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
// A period diary has no business before 1900 or after 2999. The bounds also
// keep Date.UTC (years 0–99 mean 1900–1999) and year 10000 (no longer
// YYYY-MM-DD) away from the date math.
const MIN_DIARY_YEAR = 1900;
const MAX_DIARY_YEAR = 2999;

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

/**
 * A real calendar day as YYYY-MM-DD. "2026-02-30" and "2026-13-01" are not:
 * `new Date` would roll the first into 2 March (a day no calendar cell shows)
 * and turn the second into an Invalid Date that makes Intl throw.
 */
export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < MIN_DIARY_YEAR || year > MAX_DIARY_YEAR) return false;
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= daysInMonth(year, month);
}

