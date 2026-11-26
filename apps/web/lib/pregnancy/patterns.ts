// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// What the Patterns screen shows while a pregnancy goes on, worked out without
// React: what she logged week by week, and what usually comes when, with the
// dates counted from her due date. Nothing here is stored: the week texts
// live in lib/pregnancy/guide.ts. "Felt the baby move" is a day's mark she
// logged, shown as logged, never read as a count or a sign of anything.

import type { Diary, SymptomId } from "@/lib/diary";
import { addDays, daysBetween } from "@/lib/forecast/math";
import { MOVEMENTS_FROM_DAYS, dateAtGestationalDays, gestationalDays, pregnancyStart } from "@/lib/pregnancy/dating";
import { BABY_MOVEMENT_ID, findSymptomMeta } from "@/lib/symptoms/catalog";
import type { SymptomCategory } from "@/lib/symptoms/definitions";

/** How many weeks of logs the screen draws, the one she is in last. */
export const SYMPTOM_WEEKS = 10;
/** The most symptoms it draws, the ones logged on most days first. */
export const MAX_SYMPTOM_ROWS = 4;

/**
 * What counts as "how she felt": tests, pills, exercise and sex are logged
 * with the same picker but are not symptoms (sex never is, lib/patterns/stats.ts).
 */
const FELT: ReadonlySet<SymptomCategory | "custom"> = new Set([
  "mood",
  "symptoms",
  "vaginalDischarge",
  "digestionAndStool",
  "pregnancy",
  "other",
  "custom",
]);

export type SymptomWeeks = {
  /** The weeks drawn, counted from zero like her card ("week 14" is 14+0 to 14+6), oldest first. */
  weeks: number[];
  /** One row per symptom: days logged in the whole pregnancy so far, and in each week drawn. */
  rows: { id: SymptomId; total: number; days: number[] }[];
};

/** The weeks the log draws: the last SYMPTOM_WEEKS up to the one `today` is in, counted from zero. */
function loggedWeeks(dueDate: string, today: string): { current: number; first: number; weeks: number[] } {
  const current = Math.max(0, Math.floor(gestationalDays(dueDate, today) / 7));
  const first = Math.max(0, current - SYMPTOM_WEEKS + 1);
  return { current, first, weeks: Array.from({ length: current - first + 1 }, (_, index) => first + index) };
}

/**
 * Days with each symptom logged, per week of the pregnancy, up to `today`.
 * "Felt the baby move" is not a symptom and is not ranked: `babyMovementLog`.
 */
export function pregnancySymptomWeeks(diary: Diary, dueDate: string, today: string): SymptomWeeks {
  const start = pregnancyStart(dueDate);
  const { current, first, weeks } = loggedWeeks(dueDate, today);
  const counts = new Map<SymptomId, { total: number; days: number[] }>();
  for (const [iso, log] of Object.entries(diary.days)) {
    if (iso < start || iso > today) continue;
    const week = Math.floor(daysBetween(start, iso) / 7);
    for (const [key, value] of Object.entries(log.symptoms)) {
      if (!value) continue;
      const id = key as SymptomId;
      if (id === BABY_MOVEMENT_ID) continue;
      const meta = findSymptomMeta(id, diary.customSymptoms);
      // "Everything fine" and "no discharge" say nothing was felt.
      if (!meta || meta.noneRole || !FELT.has(meta.category)) continue;
      const entry = counts.get(id) ?? { total: 0, days: weeks.map(() => 0) };
      entry.total += 1;
      if (week >= first && week <= current) entry.days[week - first] += 1;
      counts.set(id, entry);
    }
  }
  const rows = [...counts.entries()]
    .map(([id, entry]) => ({ id, ...entry }))
    .sort((left, right) => right.total - left.total || (left.id < right.id ? -1 : 1))
    .slice(0, MAX_SYMPTOM_ROWS);
  return { weeks, rows };
}

export type BabyMovementLog = {
  /** The first day she logged "Felt the baby move" in this pregnancy, with its week (from zero); null if none. */
  first: { date: string; week: number } | null;
  /** The weeks drawn, the same as `pregnancySymptomWeeks`'s. */
  weeks: number[];
  /** Days logged in each of those weeks. */
  days: number[];
};

/**
 * The days she marked "Felt the baby move", up to `today`: when she first did,
 * and how many days a week since. Only what she logged: a week with fewer marks
 * says nothing about the baby.
 */
export function babyMovementLog(diary: Diary, dueDate: string, today: string): BabyMovementLog {
  const start = pregnancyStart(dueDate);
  const { current, first, weeks } = loggedWeeks(dueDate, today);
  const days = weeks.map(() => 0);
  let earliest: string | null = null;
  for (const [iso, log] of Object.entries(diary.days)) {
    if (iso < start || iso > today || !log.symptoms[BABY_MOVEMENT_ID]) continue;
    if (earliest === null || iso < earliest) earliest = iso;
    const week = Math.floor(daysBetween(start, iso) / 7);
    if (week >= first && week <= current) days[week - first] += 1;
  }
  return {
    first: earliest === null ? null : { date: earliest, week: Math.floor(daysBetween(start, earliest) / 7) },
    weeks,
    days,
  };
}

/**
 * What usually comes when, in days of gestational age: a window (`to` set) or
 * a day. One window each, though ACOG/CDC, NICE/NHS and SEGO differ: the
 * first-trimester scan is Spain's 11+0 to 13+6 (11+2 to 14+1 in the UK); the
 * mid-pregnancy scan runs to 21+6 (20+6 in the UK, 22 weeks in the US); the
 * whooping cough vaccine is the US window, 27 to 36 weeks (Spain from 27,
 * ideally 27 or 28; the UK from 16); RSV from 28 weeks as in the UK (32 to 36
 * in season in the US; Spain protects the baby after birth); a growth scan
 * at 34 to 36 weeks is routine in Spain only; group B strep screening in the US
 * and Spain, not in the UK). What is offered, and when, differs by country and
 * clinic: each text says "usually" or "in some countries", and the screen says
 * so under the list. Sources: GUIDE_SOURCES, lib/pregnancy/guide-weeks.ts.
 */
export const MILESTONES = [
  { id: "firstScan", from: 11 * 7, to: 13 * 7 + 6 },
  { id: "secondTrimester", from: 14 * 7, to: null },
  { id: "movements", from: MOVEMENTS_FROM_DAYS, to: 24 * 7 },
  { id: "anatomyScan", from: 18 * 7, to: 21 * 7 + 6 },
  { id: "glucose", from: 24 * 7, to: 28 * 7 },
  { id: "whoopingCough", from: 27 * 7, to: 36 * 7 },
  { id: "thirdTrimester", from: 28 * 7, to: null },
  { id: "antiD", from: 28 * 7, to: null },
  { id: "rsvVaccine", from: 28 * 7, to: 36 * 7 + 6 },
  { id: "growthScan", from: 34 * 7, to: 36 * 7 + 6 },
  { id: "groupBStrep", from: 36 * 7, to: 37 * 7 + 6 },
  { id: "term", from: 37 * 7, to: null },
  { id: "fullTerm", from: 39 * 7, to: null },
  { id: "dueDate", from: 40 * 7, to: null },
  { id: "pastDue", from: 41 * 7, to: null },
] as const;

export type MilestoneId = (typeof MILESTONES)[number]["id"];

export type MilestoneDate = {
  id: MilestoneId;
  start: string;
  /** The last day of a window; null for a single day. */
  end: string | null;
  /** Over by `today`. */
  past: boolean;
  /** `today` is the day, or inside the window. */
  now: boolean;
  /** Days from `today` to its start (0 or less once it has begun). */
  inDays: number;
};

/** Every milestone with its dates for this due date, in order. */
export function milestoneDates(dueDate: string, today: string): MilestoneDate[] {
  return MILESTONES.map((item) => {
    const start = dateAtGestationalDays(dueDate, item.from);
    const end = item.to === null ? null : dateAtGestationalDays(dueDate, item.to);
    const last = end ?? start;
    return { id: item.id, start, end, past: today > last, now: today >= start && today <= last, inDays: daysBetween(today, start) };
  });
}

/** The next `count` milestones that are not over, the ones going on first. */
export function comingUp(dueDate: string, today: string, count: number): MilestoneDate[] {
  return milestoneDates(dueDate, today)
    .filter((item) => !item.past)
    .slice(0, count);
}

/** The first and last day of week `week` (counted from zero) of this pregnancy. */
export function weekDates(dueDate: string, week: number): { start: string; end: string } {
  const start = dateAtGestationalDays(dueDate, week * 7);
  return { start, end: addDays(start, 6) };
}
