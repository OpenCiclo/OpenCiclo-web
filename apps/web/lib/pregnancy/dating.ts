// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Pregnancy dates: the due date from what she knows, and the gestational age,
// trimester and term on any day. Pure. Mirrors openciclo/pregnancy.py (parity
// vectors in tests/fixtures/forecast_parity.json, "pregnancy").
//
// Sources (docs/modeling.md "Pregnancy dates"):
// - ACOG Committee Opinion 700 (2017), Methods for Estimating the Due Date: a
//   due date is 280 days after the last menstrual period, 266 days after
//   ovulation or conception; an embryo transfer adds 266 minus the embryo's age
//   in days; a first-trimester ultrasound is the most accurate dating and
//   replaces the others.
// - Naegele's rule with Parikh's correction for cycle length (StatPearls,
//   Estimated Date of Delivery): add (usual cycle − 28) days. Capped here at
//   ±7 days; outside 21–35-day cycles the app recommends dating by ultrasound.
// - ACOG Committee Opinion 579 (2013), Definition of Term Pregnancy: early term
//   37+0–38+6, full term 39+0–40+6, late term 41+0–41+6, postterm from 42+0.
// - Trimesters as usually counted: first to 13+6, second 14+0–27+6, third from 28+0.
// - Natural length varies: Jukic et al. 2013 found a range of 37 days among
//   pregnancies dated by ovulation. The app shows 37+0 to 42+0 as the likely window.

import { addDays, daysBetween } from "@/lib/forecast/math";

export const PREGNANCY_DAYS = 280;
export const OVULATION_TO_DUE_DAYS = 266;
export const STANDARD_CYCLE_DAYS = 28;
export const MAX_CYCLE_CORRECTION_DAYS = 7;
/** Outside this range of usual cycle lengths the app recommends ultrasound dating. */
export const REGULAR_CYCLE_RANGE = { min: 21, max: 35 } as const;
export const EMBRYO_AGES = [3, 5] as const;
export type EmbryoAge = (typeof EMBRYO_AGES)[number];
export const SECOND_TRIMESTER_DAYS = 14 * 7;
export const THIRD_TRIMESTER_DAYS = 28 * 7;
/**
 * First movements are usually felt from 16 to 24 weeks (NHS): the "coming up"
 * window starts here, and the day sheet offers "Felt the baby move" from here on.
 */
export const MOVEMENTS_FROM_DAYS = 16 * 7;
/** The likely window for the birth: 37+0 to 42+0. */
export const LIKELY_WINDOW_FROM_DAYS = 37 * 7;
export const LIKELY_WINDOW_TO_DAYS = 42 * 7;
/** After 42+0 with no end logged, the card stops counting and asks whether it is still going on. */
export const STILL_GOING_ASK_DAYS = 42 * 7;
/** Ultrasound dating: gestational age at the scan, in days, that the app accepts. */
export const MAX_SCAN_AGE_DAYS = 42 * 7;

export const DATING_METHODS = ["lmp", "dueDate", "ultrasound", "conception", "transfer"] as const;
export type DatingMethod = (typeof DATING_METHODS)[number];

/** What she entered to date the pregnancy. Only the fields of the chosen method are set. */
export type PregnancyDating =
  | { method: "lmp"; lmp: string; cycleLength: number | null }
  | { method: "dueDate"; dueDate: string }
  | { method: "ultrasound"; scanDate: string; weeks: number; days: number }
  | { method: "conception"; conception: string }
  | { method: "transfer"; transfer: string; embryoAge: EmbryoAge };

/** Parikh's correction in days for a usual cycle length, capped at ±7. Zero without one. */
export function cycleCorrection(cycleLength: number | null): number {
  if (cycleLength === null || !Number.isFinite(cycleLength)) return 0;
  const raw = Math.round(cycleLength) - STANDARD_CYCLE_DAYS;
  return Math.max(-MAX_CYCLE_CORRECTION_DAYS, Math.min(MAX_CYCLE_CORRECTION_DAYS, raw));
}

/** Whether a usual cycle length is outside 21–35 days (date by ultrasound instead). */
export function irregularForLmpDating(cycleLength: number | null): boolean {
  if (cycleLength === null) return false;
  return cycleLength < REGULAR_CYCLE_RANGE.min || cycleLength > REGULAR_CYCLE_RANGE.max;
}

/** The due date for what she entered. */
export function dueDateFrom(dating: PregnancyDating): string {
  switch (dating.method) {
    case "lmp":
      return addDays(dating.lmp, PREGNANCY_DAYS + cycleCorrection(dating.cycleLength));
    case "dueDate":
      return dating.dueDate;
    case "ultrasound":
      return addDays(dating.scanDate, PREGNANCY_DAYS - (dating.weeks * 7 + dating.days));
    case "conception":
      return addDays(dating.conception, OVULATION_TO_DUE_DAYS);
    case "transfer":
      return addDays(dating.transfer, OVULATION_TO_DUE_DAYS - dating.embryoAge);
  }
}

/** Gestational age in days on `date` (0 on the first day of the last-period equivalent). */
export function gestationalDays(dueDate: string, date: string): number {
  return PREGNANCY_DAYS - daysBetween(date, dueDate);
}

export type GestationalAge = { weeks: number; days: number; totalDays: number };

/** Weeks and days on `date`, counted from 0 ("12 weeks and 3 days"). Negative ages clamp to 0+0. */
export function gestationalAge(dueDate: string, date: string): GestationalAge {
  const totalDays = Math.max(0, gestationalDays(dueDate, date));
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays };
}

export type Trimester = 1 | 2 | 3;

export function trimesterFor(totalDays: number): Trimester {
  if (totalDays >= THIRD_TRIMESTER_DAYS) return 3;
  if (totalDays >= SECOND_TRIMESTER_DAYS) return 2;
  return 1;
}

export type TermLabel = "preterm" | "earlyTerm" | "fullTerm" | "lateTerm" | "postterm";

export function termFor(totalDays: number): TermLabel {
  if (totalDays >= 42 * 7) return "postterm";
  if (totalDays >= 41 * 7) return "lateTerm";
  if (totalDays >= 39 * 7) return "fullTerm";
  if (totalDays >= 37 * 7) return "earlyTerm";
  return "preterm";
}

/** The day gestational age reaches `totalDays`. */
export function dateAtGestationalDays(dueDate: string, totalDays: number): string {
  return addDays(dueDate, totalDays - PREGNANCY_DAYS);
}

/** First day of the last-period equivalent (0+0). */
export function pregnancyStart(dueDate: string): string {
  return dateAtGestationalDays(dueDate, 0);
}

/** The estimated day of conception (2+0): bleeding from here on is never a period start. */
export function conceptionDate(dueDate: string): string {
  return dateAtGestationalDays(dueDate, PREGNANCY_DAYS - OVULATION_TO_DUE_DAYS);
}

/** The likely window for the birth, 37+0 to 42+0. */
export function likelyWindow(dueDate: string): { start: string; end: string } {
  return {
    start: dateAtGestationalDays(dueDate, LIKELY_WINDOW_FROM_DAYS),
    end: dateAtGestationalDays(dueDate, LIKELY_WINDOW_TO_DAYS),
  };
}

/** First day of each trimester. */
export function trimesterStarts(dueDate: string): [string, string, string] {
  return [
    pregnancyStart(dueDate),
    dateAtGestationalDays(dueDate, SECOND_TRIMESTER_DAYS),
    dateAtGestationalDays(dueDate, THIRD_TRIMESTER_DAYS),
  ];
}

/** Whole weeks left until the due date on `date` (never below zero). */
export function weeksLeft(dueDate: string, date: string): number {
  return Math.max(0, Math.floor(daysBetween(date, dueDate) / 7));
}

/** The longest a pregnancy that goes on can have lasted on the day it is entered: 44 weeks. */
export const MAX_ONGOING_AGE_DAYS = 44 * 7;

/** Whether the dating she entered makes sense on `today`: a pregnancy that has started and is not past 44 weeks. */
export function plausibleDueDate(dueDate: string, today: string): boolean {
  const age = gestationalDays(dueDate, today);
  return age >= 0 && age <= MAX_ONGOING_AGE_DAYS;
}

/** Whether a pregnancy dated like this would be over by `today`: it can only be added as a past one. */
export function alreadyOver(dueDate: string, today: string): boolean {
  return gestationalDays(dueDate, today) > MAX_ONGOING_AGE_DAYS;
}
