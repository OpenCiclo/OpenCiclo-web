// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// A pregnancy as the encrypted diary stores it (diary format v7), and the one
// rule that changes which logged bleeding counts as a period start. The record
// holds nothing about the baby (a day can hold that she felt it move: the
// Pregnancy symptom group, diary v8), and the reason a pregnancy ended is never asked
// (PLAN 4.2 and ESTUDIO-final-del-embarazo: "nació mi bebé" or "el embarazo
// terminó", and the date). Read by `parseDiary` (lib/diary.ts).

import { addDays, daysBetween } from "@/lib/forecast/math";
import { isIsoDate } from "@/lib/iso-date";
import {
  DATING_METHODS,
  EMBRYO_AGES,
  MAX_SCAN_AGE_DAYS,
  SECOND_TRIMESTER_DAYS,
  conceptionDate,
  dueDateFrom,
  gestationalDays,
  pregnancyStart,
  type DatingMethod,
  type EmbryoAge,
  type PregnancyDating,
} from "@/lib/pregnancy/dating";

export const PREGNANCY_OUTCOMES = ["birth", "ended"] as const;
export type PregnancyOutcome = (typeof PREGNANCY_OUTCOMES)[number];

/** What friends see while the pregnancy is private (PLAN 4.8). */
export const FRIENDS_PRIVATE_MODES = ["noNews", "simulated"] as const;
export type FriendsPrivateMode = (typeof FRIENDS_PRIVATE_MODES)[number];

/** Her answer to "has your period come back?" for a bleed after the end. */
export const BLEED_ANSWERS = ["period", "notPeriod"] as const;
export type BleedAnswer = (typeof BLEED_ANSWERS)[number];

export type PregnancyEnd = { date: string; outcome: PregnancyOutcome };

export type PregnancyRecord = {
  /** Random, so two devices' edits of the same pregnancy merge. */
  id: string;
  dating: PregnancyDating;
  /** The reference date: weeks always count from it. */
  dueDate: string;
  end: PregnancyEnd | null;
  /** An ended pregnancy kept in the diary but not drawn on the calendar. */
  hidden: boolean;
  friendsMode: FriendsPrivateMode;
  /** Bleeds after the end she answered about, by the first day of the bleed. */
  bleedAnswers: Record<string, BleedAnswer>;
};

/**
 * After the end, bleeding that starts within this many days is never a period
 * start (ESTUDIO 4.2): the bleeding of the end itself lasts up to two weeks,
 * spotting up to three, and ovulation comes on day 13 at the earliest.
 */
export const NO_PERIOD_DAYS_AFTER_END = 20;
/**
 * The same window after a birth or a pregnancy that ended from 14+0 on: six
 * weeks, as long as bleeding after a birth can last (lochia). For a loss after
 * 13 weeks this is an assumption with no study behind it (docs/modeling.md).
 */
export const NO_PERIOD_DAYS_AFTER_LATE_END = 42;
export const MAX_PREGNANCIES = 30;
const MAX_BLEED_ANSWERS = 60;
const PREGNANCY_ID = /^[0-9a-f]{16,64}$/;

/** A new random id for a pregnancy. */
export function newPregnancyId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Days after the end during which bleeding is never a period start. */
export function noPeriodDaysAfter(record: PregnancyRecord): number {
  if (!record.end) return 0;
  if (record.end.outcome === "birth") return NO_PERIOD_DAYS_AFTER_LATE_END;
  return gestationalDays(record.dueDate, record.end.date) >= SECOND_TRIMESTER_DAYS
    ? NO_PERIOD_DAYS_AFTER_LATE_END
    : NO_PERIOD_DAYS_AFTER_END;
}

/** The last day of the no-period window after the end, or null while the pregnancy goes on. */
export function noPeriodUntil(record: PregnancyRecord): string | null {
  return record.end ? addDays(record.end.date, noPeriodDaysAfter(record)) : null;
}

// diary-format:begin
// What a stored diary keeps of its pregnancies, and which bleeding is never a
// period start. lib/diary-schema.test.ts pins a hash of this code.

function isInt(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}

function sanitizeDating(raw: unknown): PregnancyDating | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const method = value.method;
  if (typeof method !== "string" || !(DATING_METHODS as readonly string[]).includes(method)) return null;
  const date = (key: string) => (typeof value[key] === "string" && isIsoDate(value[key] as string) ? (value[key] as string) : null);
  switch (method as DatingMethod) {
    case "lmp": {
      const lmp = date("lmp");
      if (!lmp) return null;
      const cycleLength = isInt(value.cycleLength, 10, 90) ? value.cycleLength : null;
      return { method: "lmp", lmp, cycleLength };
    }
    case "dueDate": {
      const dueDate = date("dueDate");
      return dueDate ? { method: "dueDate", dueDate } : null;
    }
    case "ultrasound": {
      const scanDate = date("scanDate");
      if (!scanDate || !isInt(value.weeks, 0, 44) || !isInt(value.days, 0, 6)) return null;
      if (value.weeks * 7 + value.days > MAX_SCAN_AGE_DAYS) return null;
      return { method: "ultrasound", scanDate, weeks: value.weeks, days: value.days };
    }
    case "conception": {
      const conception = date("conception");
      return conception ? { method: "conception", conception } : null;
    }
    case "transfer": {
      const transfer = date("transfer");
      const embryoAge = value.embryoAge;
      if (!transfer || !(EMBRYO_AGES as readonly unknown[]).includes(embryoAge)) return null;
      return { method: "transfer", transfer, embryoAge: embryoAge as EmbryoAge };
    }
  }
}

function sanitizeEnd(raw: unknown, dueDate: string): PregnancyEnd | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.date !== "string" || !isIsoDate(value.date)) return null;
  if (typeof value.outcome !== "string" || !(PREGNANCY_OUTCOMES as readonly string[]).includes(value.outcome)) {
    return null;
  }
  // An end before the pregnancy began is a typo: it ended the day it was dated from.
  const start = pregnancyStart(dueDate);
  return { date: value.date < start ? start : value.date, outcome: value.outcome as PregnancyOutcome };
}

function sanitizeBleedAnswers(raw: unknown): Record<string, BleedAnswer> {
  const answers: Record<string, BleedAnswer> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return answers;
  const entries = Object.entries(raw as Record<string, unknown>)
    .filter(([iso, answer]) => isIsoDate(iso) && (BLEED_ANSWERS as readonly unknown[]).includes(answer))
    .sort(([left], [right]) => (left < right ? -1 : 1))
    .slice(-MAX_BLEED_ANSWERS);
  for (const [iso, answer] of entries) answers[iso] = answer as BleedAnswer;
  return answers;
}

export function sanitizePregnancy(raw: unknown): PregnancyRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.id !== "string" || !PREGNANCY_ID.test(value.id)) return null;
  const dating = sanitizeDating(value.dating);
  if (!dating) return null;
  const dueDate = typeof value.dueDate === "string" && isIsoDate(value.dueDate) ? value.dueDate : dueDateFrom(dating);
  if (!isIsoDate(dueDate)) return null;
  const end = sanitizeEnd(value.end, dueDate);
  return {
    id: value.id,
    dating,
    dueDate,
    end,
    hidden: end !== null && value.hidden === true,
    friendsMode:
      typeof value.friendsMode === "string" && (FRIENDS_PRIVATE_MODES as readonly string[]).includes(value.friendsMode)
        ? (value.friendsMode as FriendsPrivateMode)
        : "noNews",
    bleedAnswers: end ? sanitizeBleedAnswers(value.bleedAnswers) : {},
  };
}

/** The pregnancies a stored diary keeps: valid ones, one per id, oldest first. */
export function sanitizePregnancies(raw: unknown): PregnancyRecord[] {
  if (!Array.isArray(raw)) return [];
  const byId = new Map<string, PregnancyRecord>();
  for (const item of raw) {
    const record = sanitizePregnancy(item);
    if (record && !byId.has(record.id)) byId.set(record.id, record);
  }
  return [...byId.values()]
    .sort((left, right) => (left.dueDate < right.dueDate ? -1 : left.dueDate > right.dueDate ? 1 : left.id < right.id ? -1 : 1))
    .slice(-MAX_PREGNANCIES);
}

/**
 * Whether a bleed that starts on `runStart` is never a period start: from the
 * estimated conception day of a pregnancy that goes on; through the window
 * after its end; and afterwards when she said it was not her period.
 */
export function excludedPeriodStart(runStart: string, pregnancies: readonly PregnancyRecord[]): boolean {
  for (const record of pregnancies) {
    if (runStart < conceptionDate(record.dueDate)) continue;
    if (!record.end) return true;
    if (runStart <= addDays(record.end.date, noPeriodDaysAfter(record))) return true;
    if (record.bleedAnswers[runStart] === "notPeriod") return true;
  }
  return false;
}

// diary-format:end

/** The pregnancy that goes on (no end logged), if any: the one due last. */
export function activePregnancy(pregnancies: readonly PregnancyRecord[]): PregnancyRecord | null {
  let active: PregnancyRecord | null = null;
  for (const record of pregnancies) if (!record.end) active = record;
  return active;
}

/** The pregnancy that ended last, if any. */
export function lastEndedPregnancy(pregnancies: readonly PregnancyRecord[]): PregnancyRecord | null {
  let last: PregnancyRecord | null = null;
  for (const record of pregnancies) {
    if (record.end && (!last || record.end.date >= (last.end?.date ?? ""))) last = record;
  }
  return last;
}

/** Days from the end of `record` to `date` (0 on the end day), or null while it goes on. */
export function daysSinceEnd(record: PregnancyRecord, date: string): number | null {
  return record.end ? daysBetween(record.end.date, date) : null;
}
