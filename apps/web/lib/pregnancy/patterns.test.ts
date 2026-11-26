// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { addDaysIso, emptyDiary, upsertDay, type Diary, type SymptomMap } from "@/lib/diary";
import {
  MAX_SYMPTOM_ROWS,
  MILESTONES,
  SYMPTOM_WEEKS,
  babyMovementLog,
  comingUp,
  milestoneDates,
  pregnancySymptomWeeks,
  weekDates,
} from "@/lib/pregnancy/patterns";

// Last period 2026-08-14, so the due date is 2027-05-21 and 2026-11-23 is 14 weeks and 3 days.
const DUE = "2027-05-21";
const START = "2026-08-14";
const TODAY = "2026-11-23";

function log(diary: Diary, iso: string, symptoms: SymptomMap): Diary {
  return upsertDay(diary, iso, { symptoms });
}

/** `count` days in a row from the first day of week `week`. */
function weekOf(diary: Diary, week: number, count: number, symptoms: SymptomMap): Diary {
  let next = diary;
  for (let day = 0; day < count; day += 1) next = log(next, addDaysIso(START, week * 7 + day), symptoms);
  return next;
}

describe("what she logged, week by week of the pregnancy", () => {
  it("draws the last ten weeks, the one she is in last, counted from zero", () => {
    const { weeks, rows } = pregnancySymptomWeeks(emptyDiary("en"), DUE, TODAY);
    expect(weeks).toHaveLength(SYMPTOM_WEEKS);
    expect(weeks[0]).toBe(5);
    expect(weeks[weeks.length - 1]).toBe(14);
    expect(rows).toEqual([]);
    // Early on there are fewer weeks to draw.
    expect(pregnancySymptomWeeks(emptyDiary("en"), DUE, addDaysIso(START, 16)).weeks).toEqual([0, 1, 2]);
  });

  it("counts the days with each symptom in each week", () => {
    let diary = weekOf(emptyDiary("en"), 8, 6, { nausea: "moderate", fatigue: "mild" });
    diary = weekOf(diary, 9, 3, { nausea: "mild" });
    diary = log(diary, TODAY, { headache: "present" });
    const { weeks, rows } = pregnancySymptomWeeks(diary, DUE, TODAY);
    const row = (id: string) => rows.find((item) => item.id === id);
    expect(row("nausea")).toMatchObject({ total: 9, days: weeks.map((week) => (week === 8 ? 6 : week === 9 ? 3 : 0)) });
    expect(row("fatigue")?.total).toBe(6);
    expect(row("headache")?.days[weeks.length - 1]).toBe(1);
    // Most days first.
    expect(rows.map((item) => item.id)).toEqual(["nausea", "fatigue", "headache"]);
  });

  it("keeps to this pregnancy and to today: nothing from before it, nothing after today", () => {
    let diary = log(emptyDiary("en"), addDaysIso(START, -1), { nausea: "mild" });
    diary = log(diary, addDaysIso(TODAY, 1), { nausea: "mild" });
    diary = log(diary, START, { nausea: "mild" });
    // The first week is not among the ten drawn, but it counts in the total.
    const { rows } = pregnancySymptomWeeks(diary, DUE, TODAY);
    expect(rows).toEqual([{ id: "nausea", total: 1, days: Array(SYMPTOM_WEEKS).fill(0) }]);
  });

  it("leaves out what is not how she felt: sex, tests, pills, exercise", () => {
    const diary = log(emptyDiary("en"), TODAY, {
      protectedSex: "present",
      highLibido: "present",
      pregnancyTestPositive: "present",
      ovulationTestNegative: "present",
      nausea: "mild",
    });
    expect(pregnancySymptomWeeks(diary, DUE, TODAY).rows.map((item) => item.id)).toEqual(["nausea"]);
  });

  it("draws at most four symptoms", () => {
    const diary = weekOf(emptyDiary("en"), 12, 2, {
      nausea: "mild",
      fatigue: "mild",
      headache: "mild",
      backache: "mild",
      insomnia: "mild",
      bloating: "mild",
    });
    expect(pregnancySymptomWeeks(diary, DUE, TODAY).rows).toHaveLength(MAX_SYMPTOM_ROWS);
  });
});

describe("what usually comes when", () => {
  const all = milestoneDates(DUE, TODAY);
  const at = (id: string) => all.find((item) => item.id === id);

  it("counts every date from the due date", () => {
    expect(at("firstScan")).toMatchObject({ start: "2026-10-30", end: "2026-11-19", past: true, now: false });
    expect(at("secondTrimester")).toMatchObject({ start: "2026-11-20", end: null, past: true });
    expect(at("movements")).toMatchObject({ start: "2026-12-04", end: "2027-01-29", past: false, inDays: 11 });
    expect(at("anatomyScan")).toMatchObject({ start: "2026-12-18", end: "2027-01-14" });
    expect(at("thirdTrimester")?.start).toBe("2027-02-26");
    expect(at("term")?.start).toBe("2027-04-30");
    expect(at("fullTerm")?.start).toBe("2027-05-14");
    expect(at("dueDate")).toMatchObject({ start: DUE, end: null, past: false });
    expect(at("pastDue")?.start).toBe("2027-05-28");
  });

  it("lists them in order of their first day", () => {
    const starts = MILESTONES.map((item) => item.from);
    expect([...starts].sort((left, right) => left - right)).toEqual(starts);
  });

  it("says what is going on now and what comes next", () => {
    expect(comingUp(DUE, TODAY, 2).map((item) => item.id)).toEqual(["movements", "anatomyScan"]);
    // Inside a window it is "now", and it stays on the list until its last day.
    const during = milestoneDates(DUE, "2026-11-19").find((item) => item.id === "firstScan");
    expect(during).toMatchObject({ now: true, past: false });
    expect(comingUp(DUE, "2026-11-19", 1)[0].id).toBe("firstScan");
    expect(comingUp(DUE, "2026-11-20", 1)[0]).toMatchObject({ id: "secondTrimester", now: true });
    // After the last one, nothing.
    expect(comingUp(DUE, "2027-06-10", 3)).toEqual([]);
  });

  it("gives the days of a week counted from zero", () => {
    expect(weekDates(DUE, 0)).toEqual({ start: START, end: "2026-08-20" });
    expect(weekDates(DUE, 14)).toEqual({ start: "2026-11-20", end: "2026-11-26" });
    expect(weekDates(DUE, 40).start).toBe(DUE);
  });
});

describe("the Pregnancy group in what she logged", () => {
  it("counts its symptoms, but never ranks baby movement", () => {
    let diary = weekOf(emptyDiary("en"), 13, 5, { heartburn: "present", babyMovement: "present" });
    diary = weekOf(diary, 14, 3, { babyMovement: "present" });
    const { rows } = pregnancySymptomWeeks(diary, DUE, TODAY);
    expect(rows.map((row) => row.id)).toEqual(["heartburn"]);
  });

  it("gives baby movement its own line: the first day with its week, and days per week", () => {
    expect(babyMovementLog(emptyDiary("en"), DUE, TODAY).first).toBeNull();
    let diary = weekOf(emptyDiary("en"), 12, 2, { babyMovement: "present" });
    diary = weekOf(diary, 14, 3, { babyMovement: "present" });
    // After today: not counted.
    diary = log(diary, addDaysIso(TODAY, 1), { babyMovement: "present" });
    const movement = babyMovementLog(diary, DUE, TODAY);
    expect(movement.first).toEqual({ date: addDaysIso(START, 12 * 7), week: 12 });
    expect(movement.weeks).toEqual(pregnancySymptomWeeks(diary, DUE, TODAY).weeks);
    expect(movement.days.slice(-3)).toEqual([2, 0, 3]);
    expect(movement.days.reduce((sum, value) => sum + value, 0)).toBe(5);
  });

  it("puts the first movements in 'coming up' from the week the day sheet offers them", () => {
    expect(MILESTONES.find((item) => item.id === "movements")?.from).toBe(16 * 7);
  });
});
