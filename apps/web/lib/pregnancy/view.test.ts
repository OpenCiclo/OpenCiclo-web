// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { addDaysIso, emptyDiary, upsertDay, type Diary } from "@/lib/diary";
import {
  answerBleed,
  bleedRunStart,
  changeDating,
  deletePregnancy,
  endPregnancy,
  setFriendsMode,
  setPregnancyHidden,
  startPregnancy,
} from "@/lib/pregnancy/actions";
import {
  bleedContext,
  pastPregnancyOn,
  pregnancyCalendarMarks,
  pregnancyCardData,
  pregnancyDay,
  pregnancyTestContext,
} from "@/lib/pregnancy/view";

const ID = "0123456789abcdef0123456789abcdef";

function bleed(diary: Diary, start: string, count = 4): Diary {
  let next = diary;
  for (let i = 0; i < count; i += 1) next = upsertDay(next, addDaysIso(start, i), { flow: "medium", symptoms: {} });
  return next;
}

const base = bleed(bleed(emptyDiary("es"), "2025-12-13"), "2026-01-10");
const pregnant = startPregnancy(base, { method: "lmp", lmp: "2026-01-10", cycleLength: null }, "noNews", ID);

describe("pregnancy actions", () => {
  it("turns it on once, and a new dating replaces the old one", () => {
    expect(pregnant.pregnancies).toHaveLength(1);
    expect(pregnant.pregnancies[0].dueDate).toBe("2026-10-17");
    expect(startPregnancy(pregnant, { method: "dueDate", dueDate: "2027-01-01" })).toBe(pregnant);
    const scanned = changeDating(pregnant, ID, { method: "ultrasound", scanDate: "2026-03-02", weeks: 8, days: 3 });
    expect(scanned.pregnancies[0].dueDate).toBe("2026-10-09");
  });

  it("ends, hides, sets what friends see, answers about a bleed, deletes", () => {
    const ended = endPregnancy(pregnant, ID, "ended", "2026-03-01");
    expect(ended.pregnancies[0].end).toEqual({ date: "2026-03-01", outcome: "ended" });
    expect(setPregnancyHidden(ended, ID, true).pregnancies[0].hidden).toBe(true);
    expect(setPregnancyHidden(pregnant, ID, true).pregnancies[0].hidden).toBe(false);
    expect(setFriendsMode(pregnant, ID, "simulated").pregnancies[0].friendsMode).toBe("simulated");
    expect(answerBleed(ended, ID, "2026-03-25", "notPeriod").pregnancies[0].bleedAnswers).toEqual({ "2026-03-25": "notPeriod" });
    expect(deletePregnancy(ended, ID).pregnancies).toEqual([]);
  });

  it("finds where a run of bleeding starts", () => {
    const diary = bleed(base, "2026-02-20", 3);
    expect(bleedRunStart(diary, "2026-02-22")).toBe("2026-02-20");
    expect(bleedRunStart(diary, "2026-02-23")).toBe("2026-02-20");
    expect(bleedRunStart(diary, "2026-02-25")).toBe("2026-02-25");
  });
});

describe("what the screens show", () => {
  it("the card: week and days from zero, trimester, weeks left, and the question past 42 weeks", () => {
    const card = pregnancyCardData(pregnant.pregnancies[0], "2026-04-13");
    expect(card.age).toMatchObject({ weeks: 13, days: 2 });
    expect(card.trimester).toBe(1);
    expect(card.weeksLeft).toBe(26);
    expect(card.window).toEqual({ start: "2026-09-26", end: "2026-10-31" });
    expect(card.askStillGoing).toBe(false);
    expect(pregnancyCardData(pregnant.pregnancies[0], "2026-10-31").askStillGoing).toBe(true);
  });

  it("the calendar: weeks, trimesters, due date and likely window; after the end only a neutral line she can hide", () => {
    const marks = pregnancyCalendarMarks(pregnant.pregnancies);
    expect(marks.weekStarts.get("2026-01-17")).toBe(1);
    expect(marks.weekStarts.get("2026-04-18")).toBe(14);
    expect([...marks.trimesterStarts]).toEqual(["2026-04-18", "2026-07-25"]);
    expect(marks.dueDate).toBe("2026-10-17");
    expect(marks.likely.has("2026-09-26") && marks.likely.has("2026-10-31")).toBe(true);
    const ended = endPregnancy(pregnant, ID, "ended", "2026-03-01");
    const after = pregnancyCalendarMarks(ended.pregnancies);
    expect(after.dueDate).toBeNull();
    expect(after.weekStarts.size).toBe(0);
    expect(after.likely.size).toBe(0);
    expect(after.past.has("2026-01-10") && after.past.has("2026-03-01")).toBe(true);
    expect([...after.endDays]).toEqual(["2026-03-01"]);
    expect(pastPregnancyOn(ended.pregnancies, "2026-02-01")?.id).toBe(ID);
    const hidden = setPregnancyHidden(ended, ID, true);
    expect(pregnancyCalendarMarks(hidden.pregnancies).past.size).toBe(0);
    expect(pastPregnancyOn(hidden.pregnancies, "2026-02-01")).toBeNull();
  });

  it("the day sheet: bleeding during and right after never counts; the first one after asks once", () => {
    expect(bleedContext(pregnant, "2026-03-01").kind).toBe("pregnancy");
    expect(bleedContext(base, "2026-03-01").kind).toBe("none");
    let ended = endPregnancy(pregnant, ID, "ended", "2026-03-01");
    ended = bleed(ended, "2026-03-01", 6);
    expect(bleedContext(ended, "2026-03-05").kind).toBe("afterEnd");
    ended = bleed(ended, "2026-03-28", 4);
    const ask = bleedContext(ended, "2026-03-29");
    expect(ask).toMatchObject({ kind: "ask", runStart: "2026-03-28", answer: null });
    expect(ended.periodStarts).toContain("2026-03-28");
    const notYet = answerBleed(ended, ID, "2026-03-28", "notPeriod");
    expect(notYet.periodStarts).not.toContain("2026-03-28");
    expect(bleedContext(notYet, "2026-03-28")).toMatchObject({ kind: "ask", answer: "notPeriod" });
    const later = bleed(ended, "2026-04-25", 4);
    expect(bleedContext(later, "2026-04-26").kind).toBe("none");
  });

  it("a positive test: offers pregnancy mode, except during one or in the six weeks after an end", () => {
    expect(pregnancyTestContext(base, "2026-02-10")).toBe("offer");
    expect(pregnancyTestContext(pregnant, "2026-02-10")).toBe("none");
    const ended = endPregnancy(pregnant, ID, "ended", "2026-03-01");
    expect(pregnancyTestContext(ended, "2026-03-20")).toBe("recentEnd");
    expect(pregnancyTestContext(ended, "2026-04-15")).toBe("offer");
  });
});

describe("the pregnancy a day belongs to (the symptoms the day sheet offers)", () => {
  // Due 2026-10-17: 0+0 is 2026-01-10, conception (2+0) 2026-01-24, 16+0 2026-05-02.
  const records = pregnant.pregnancies;

  it("starts on the estimated conception day, not on the last period", () => {
    expect(pregnancyDay(records, "2026-01-23")).toBeNull();
    expect(pregnancyDay(records, "2026-01-24")).toMatchObject({ goingOn: true, movement: false });
  });

  it("offers baby movement from 16 weeks, and only while it goes on", () => {
    expect(pregnancyDay(records, "2026-05-01")?.movement).toBe(false);
    expect(pregnancyDay(records, "2026-05-02")?.movement).toBe(true);
    const over = endPregnancy(pregnant, ID, "ended", "2026-06-01");
    expect(pregnancyDay(over.pregnancies, "2026-05-20")).toMatchObject({ goingOn: false, movement: false });
  });

  it("covers an ended pregnancy she kept up to its end, never the days after or a hidden one", () => {
    const over = endPregnancy(pregnant, ID, "ended", "2026-06-01");
    expect(pregnancyDay(over.pregnancies, "2026-06-01")?.record.id).toBe(ID);
    expect(pregnancyDay(over.pregnancies, "2026-06-02")).toBeNull();
    const hidden = setPregnancyHidden(over, ID, true);
    expect(pregnancyDay(hidden.pregnancies, "2026-05-20")).toBeNull();
  });

  it("is null in a diary with no pregnancy", () => {
    expect(pregnancyDay([], "2026-05-02")).toBeNull();
  });
});

describe("deleting a pregnancy takes its Pregnancy entries with it", () => {
  const logged = [
    ["2026-03-01", { babyMovement: "present", nausea: "present" }],
    ["2026-03-02", { heartburn: "present" }],
    ["2025-12-01", { heartburn: "present" }],
  ] as const;
  let diary = pregnant;
  for (const [iso, symptoms] of logged) diary = upsertDay(diary, iso, { symptoms: { ...symptoms } });

  it("strips the group from its days, keeps everything else, and drops a day left empty", () => {
    const after = deletePregnancy(diary, ID);
    expect(after.pregnancies).toEqual([]);
    expect(after.days["2026-03-01"]?.symptoms).toEqual({ nausea: "present" });
    expect(after.days["2026-03-02"]).toBeUndefined();
    // Before the pregnancy's 0+0: not its day.
    expect(after.days["2025-12-01"]?.symptoms).toEqual({ heartburn: "present" });
    // Bleeding logged around it stays, so the period starts do too.
    expect(after.periodStarts).toEqual(base.periodStarts);
  });

  it("leaves a day another pregnancy kept in the diary still covers", () => {
    const over = endPregnancy(diary, ID, "ended", "2026-03-20");
    const other = { ...over.pregnancies[0], id: "f".repeat(32) };
    const both = { ...over, pregnancies: [...over.pregnancies, other] };
    const after = deletePregnancy(both, ID);
    expect(after.days["2026-03-01"]?.symptoms.babyMovement).toBe("present");
  });

  it("changes nothing for an unknown id", () => {
    expect(deletePregnancy(diary, "e".repeat(32))).toBe(diary);
  });
});
