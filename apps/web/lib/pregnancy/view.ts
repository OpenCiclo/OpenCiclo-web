// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// What the screens show of a pregnancy, worked out without React: the card,
// the calendar marks, and what the day sheet says about bleeding or a test.
// After the end nothing here gives a week, a trimester or a due date again
// (ESTUDIO 2: no counters, no anniversaries).

import { addDaysIso, type Diary } from "@/lib/diary";
import { daysBetween } from "@/lib/forecast/math";
import {
  PREGNANCY_DAYS,
  STILL_GOING_ASK_DAYS,
  gestationalAge,
  likelyWindow,
  pregnancyStart,
  trimesterFor,
  trimesterStarts,
  weeksLeft,
  type GestationalAge,
  type Trimester,
} from "@/lib/pregnancy/dating";
import {
  activePregnancy,
  lastEndedPregnancy,
  noPeriodUntil,
  type BleedAnswer,
  type PregnancyRecord,
} from "@/lib/pregnancy/record";
import { bleedRunStart } from "@/lib/pregnancy/actions";

export type PregnancyCardData = {
  record: PregnancyRecord;
  age: GestationalAge;
  trimester: Trimester;
  weeksLeft: number;
  dueDate: string;
  window: { start: string; end: string };
  trimesterStarts: [string, string, string];
  /** 0–1 along the 40 weeks, for the ring. */
  progress: number;
  /** Past 42+0 with no end logged: the card stops counting and asks if it goes on. */
  askStillGoing: boolean;
};

export function pregnancyCardData(record: PregnancyRecord, today: string): PregnancyCardData {
  const age = gestationalAge(record.dueDate, today);
  return {
    record,
    age,
    trimester: trimesterFor(age.totalDays),
    weeksLeft: weeksLeft(record.dueDate, today),
    dueDate: record.dueDate,
    window: likelyWindow(record.dueDate),
    trimesterStarts: trimesterStarts(record.dueDate),
    progress: Math.min(1, age.totalDays / PREGNANCY_DAYS),
    askStillGoing: age.totalDays >= STILL_GOING_ASK_DAYS,
  };
}

export type PregnancyMarks = {
  /** The first day of each week of the pregnancy that goes on, with its number. */
  weekStarts: Map<string, number>;
  /** The first day of the second and third trimesters. */
  trimesterStarts: Set<string>;
  dueDate: string | null;
  /** 37+0 to 42+0. */
  likely: Set<string>;
  /** Days of ended pregnancies she kept (not hidden): a thin neutral line. */
  past: Set<string>;
  /** The day each of those ended. */
  endDays: Set<string>;
};

const MAX_MARKED_WEEK = 42;

export function pregnancyCalendarMarks(pregnancies: readonly PregnancyRecord[]): PregnancyMarks {
  const marks: PregnancyMarks = {
    weekStarts: new Map(),
    trimesterStarts: new Set(),
    dueDate: null,
    likely: new Set(),
    past: new Set(),
    endDays: new Set(),
  };
  const active = activePregnancy(pregnancies);
  if (active) {
    const start = pregnancyStart(active.dueDate);
    for (let week = 1; week <= MAX_MARKED_WEEK; week += 1) marks.weekStarts.set(addDaysIso(start, week * 7), week);
    const [, second, third] = trimesterStarts(active.dueDate);
    marks.trimesterStarts.add(second);
    marks.trimesterStarts.add(third);
    marks.dueDate = active.dueDate;
    const window = likelyWindow(active.dueDate);
    for (let day = window.start; day <= window.end; day = addDaysIso(day, 1)) marks.likely.add(day);
  }
  for (const record of pregnancies) {
    if (!record.end || record.hidden) continue;
    for (let day = pregnancyStart(record.dueDate); day <= record.end.date; day = addDaysIso(day, 1)) marks.past.add(day);
    marks.endDays.add(record.end.date);
  }
  return marks;
}

/** The ended pregnancy whose kept line covers `iso`, for "Embarazo · del … al …". */
export function pastPregnancyOn(pregnancies: readonly PregnancyRecord[], iso: string): PregnancyRecord | null {
  for (const record of pregnancies) {
    if (record.end && !record.hidden && iso >= pregnancyStart(record.dueDate) && iso <= record.end.date) return record;
  }
  return null;
}

export type BleedContext =
  | { kind: "none" }
  /** A pregnancy goes on: bleeding is logged, never a period start. */
  | { kind: "pregnancy" }
  /** Within the window after the end: never a period start. */
  | { kind: "afterEnd" }
  /** The first bleed after that window: "has your period come back?" (yes unless she says not yet). */
  | { kind: "ask"; record: PregnancyRecord; runStart: string; answer: BleedAnswer | null };

/** What the day sheet says about bleeding logged (or about to be) on `iso`. */
export function bleedContext(diary: Diary, iso: string): BleedContext {
  const pregnancies = diary.pregnancies ?? [];
  const active = activePregnancy(pregnancies);
  if (active && iso >= pregnancyStart(active.dueDate)) return { kind: "pregnancy" };
  const ended = lastEndedPregnancy(pregnancies);
  if (!ended?.end || iso < ended.end.date) return { kind: "none" };
  const until = noPeriodUntil(ended) ?? ended.end.date;
  const runStart = bleedRunStart(diary, iso);
  if (runStart <= until) return { kind: "afterEnd" };
  // Only the first bleed after the window is asked about: once a period start
  // came after the end, later bleeds are ordinary.
  const earlierStart = diary.periodStarts.some((start) => start > until && start < runStart);
  if (earlierStart) return { kind: "none" };
  return { kind: "ask", record: ended, runStart, answer: ended.bleedAnswers[runStart] ?? null };
}

/** After an end, a positive test can stay positive for weeks (NICE NG126): no offer for 6 weeks. */
export const TEST_QUIET_DAYS_AFTER_END = 42;

export type PregnancyTestContext = "offer" | "recentEnd" | "none";

/** What the day sheet offers when a positive pregnancy test is logged on `iso`. */
export function pregnancyTestContext(diary: Diary, iso: string): PregnancyTestContext {
  const pregnancies = diary.pregnancies ?? [];
  if (activePregnancy(pregnancies)) return "none";
  const ended = lastEndedPregnancy(pregnancies);
  if (ended?.end) {
    const since = daysBetween(ended.end.date, iso);
    if (since >= 0 && since < TEST_QUIET_DAYS_AFTER_END) return "recentEnd";
  }
  return "offer";
}
