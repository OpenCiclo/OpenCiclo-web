// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { addDaysIso, emptyDiary, parseDiary, upsertDay, withPregnancies, type Diary } from "@/lib/diary";
import { mergeDiaryEdits } from "@/lib/diary-merge";
import {
  activePregnancy,
  excludedPeriodStart,
  lastEndedPregnancy,
  newPregnancyId,
  noPeriodUntil,
  sanitizePregnancies,
  sanitizePregnancy,
  type PregnancyRecord,
} from "@/lib/pregnancy/record";

const ID = "0123456789abcdef0123456789abcdef";

function pregnancy(overrides: Partial<PregnancyRecord> = {}): PregnancyRecord {
  return {
    id: ID,
    dating: { method: "lmp", lmp: "2026-01-10", cycleLength: null },
    dueDate: "2026-10-17",
    end: null,
    hidden: false,
    friendsMode: "noNews",
    bleedAnswers: {},
    ...overrides,
  };
}

function bleed(diary: Diary, start: string, days = 3): Diary {
  let next = diary;
  for (let i = 0; i < days; i += 1) next = upsertDay(next, addDaysIso(start, i), { flow: "medium", symptoms: {} });
  return next;
}

describe("pregnancy record", () => {
  it("keeps only what it understands", () => {
    expect(sanitizePregnancy({ ...pregnancy(), id: "short" })).toBeNull();
    expect(sanitizePregnancy({ ...pregnancy(), dating: { method: "guess" } })).toBeNull();
    expect(sanitizePregnancy({ ...pregnancy(), dating: { method: "ultrasound", scanDate: "2026-03-02", weeks: 50, days: 0 } })).toBeNull();
    const noDue = sanitizePregnancy({ ...pregnancy(), dueDate: undefined });
    expect(noDue?.dueDate).toBe("2026-10-17");
    const odd = sanitizePregnancy({ ...pregnancy(), hidden: true, friendsMode: "shout", bleedAnswers: { "2026-05-01": "period" } });
    expect(odd).toMatchObject({ hidden: false, friendsMode: "noNews", bleedAnswers: {} });
    const early = sanitizePregnancy({ ...pregnancy(), end: { date: "2025-12-01", outcome: "ended" } });
    expect(early?.end).toEqual({ date: "2026-01-10", outcome: "ended" });
    expect(sanitizePregnancy({ ...pregnancy(), end: { date: "2026-03-01", outcome: "reason" } })?.end).toBeNull();
  });

  it("stores one record per id, oldest first", () => {
    const later = pregnancy({ id: "f".repeat(32), dueDate: "2027-09-01", dating: { method: "dueDate", dueDate: "2027-09-01" } });
    const list = sanitizePregnancies([later, pregnancy(), pregnancy(), "junk"]);
    expect(list.map((item) => item.id)).toEqual([ID, "f".repeat(32)]);
    expect(newPregnancyId()).toMatch(/^[0-9a-f]{32}$/);
  });

  it("finds the pregnancy that goes on and the one that ended last", () => {
    const ended = pregnancy({ end: { date: "2026-03-01", outcome: "ended" } });
    const current = pregnancy({ id: "a".repeat(32), dueDate: "2027-05-01", dating: { method: "dueDate", dueDate: "2027-05-01" } });
    expect(activePregnancy([ended, current])?.id).toBe(current.id);
    expect(lastEndedPregnancy([ended, current])?.id).toBe(ID);
    expect(activePregnancy([ended])).toBeNull();
  });
});

describe("bleeding that is never a period start", () => {
  it("during a pregnancy, from the estimated conception day", () => {
    const record = pregnancy();
    expect(excludedPeriodStart("2026-01-10", [record])).toBe(false);
    expect(excludedPeriodStart("2026-01-24", [record])).toBe(true);
    expect(excludedPeriodStart("2026-05-01", [record])).toBe(true);
  });

  it("for 20 days after an early end, then it is a period unless she says no", () => {
    const record = pregnancy({ end: { date: "2026-03-01", outcome: "ended" } });
    expect(noPeriodUntil(record)).toBe("2026-03-21");
    expect(excludedPeriodStart("2026-03-01", [record])).toBe(true);
    expect(excludedPeriodStart("2026-03-21", [record])).toBe(true);
    expect(excludedPeriodStart("2026-03-22", [record])).toBe(false);
    const answered = { ...record, bleedAnswers: { "2026-03-22": "notPeriod" as const } };
    expect(excludedPeriodStart("2026-03-22", [answered])).toBe(true);
  });

  it("for six weeks after a birth or an end from 14 weeks on", () => {
    const late = pregnancy({ end: { date: "2026-04-25", outcome: "ended" } }); // 15+0
    expect(noPeriodUntil(late)).toBe("2026-06-06");
    const birth = pregnancy({ end: { date: "2026-10-10", outcome: "birth" } });
    expect(excludedPeriodStart("2026-11-20", [birth])).toBe(true);
    expect(excludedPeriodStart("2026-11-22", [birth])).toBe(false);
  });

  it("drives the diary's period starts, and they follow when the pregnancy changes", () => {
    let diary = bleed(emptyDiary("en"), "2026-01-10");
    diary = withPregnancies(diary, [pregnancy()]);
    diary = bleed(diary, "2026-02-20", 2);
    expect(diary.periodStarts).toEqual(["2026-01-10"]);
    diary = withPregnancies(diary, [pregnancy({ end: { date: "2026-03-01", outcome: "ended" } })]);
    diary = bleed(diary, "2026-03-02", 5);
    diary = bleed(diary, "2026-03-30", 4);
    expect(diary.periodStarts).toEqual(["2026-01-10", "2026-03-30"]);
    const reread = parseDiary(JSON.stringify(diary));
    expect(reread.periodStarts).toEqual(diary.periodStarts);
    expect(reread.pregnancies).toEqual(diary.pregnancies);
  });

  it("deleting it completely leaves the diary as if it had never existed", () => {
    const without = bleed(bleed(emptyDiary("en"), "2026-01-10"), "2026-02-20", 2);
    const withIt = bleed(bleed(withPregnancies(emptyDiary("en"), [pregnancy()]), "2026-01-10"), "2026-02-20", 2);
    expect(withIt.periodStarts).toEqual(["2026-01-10"]);
    expect(withPregnancies(withIt, [])).toEqual(without);
  });

  it("an old diary has none", () => {
    expect(parseDiary({ ...emptyDiary("en"), schemaVersion: 6, pregnancies: undefined }).pregnancies).toEqual([]);
  });
});

describe("merging pregnancies from two devices", () => {
  const base = withPregnancies(bleed(emptyDiary("en"), "2026-01-10"), [pregnancy()]);

  it("keeps an end made on one device while the other edits a note", () => {
    const local = withPregnancies(base, [pregnancy({ end: { date: "2026-03-01", outcome: "ended" } })]);
    const remote = upsertDay(base, "2026-02-01", { symptoms: {}, note: "hello" });
    const merged = mergeDiaryEdits(base, local, remote);
    expect(merged.pregnancies[0].end).toEqual({ date: "2026-03-01", outcome: "ended" });
    expect(merged.days["2026-02-01"]?.note).toBe("hello");
  });

  it("keeps a deletion even when the other device changed the pregnancy", () => {
    const local = withPregnancies(base, []);
    const remote = withPregnancies(base, [pregnancy({ friendsMode: "simulated" })]);
    expect(mergeDiaryEdits(base, local, remote).pregnancies).toEqual([]);
    expect(mergeDiaryEdits(base, remote, local).pregnancies).toEqual([]);
  });

  it("adds a pregnancy made on either side and merges bleed answers by day", () => {
    const empty = bleed(emptyDiary("en"), "2026-01-10");
    const remote = withPregnancies(empty, [pregnancy()]);
    expect(mergeDiaryEdits(empty, empty, remote).pregnancies.map((item) => item.id)).toEqual([ID]);
    const ended = pregnancy({ end: { date: "2026-03-01", outcome: "ended" } });
    const start = withPregnancies(empty, [ended]);
    const a = withPregnancies(start, [{ ...ended, bleedAnswers: { "2026-03-25": "notPeriod" } }]);
    const b = withPregnancies(start, [{ ...ended, hidden: true }]);
    expect(mergeDiaryEdits(start, a, b).pregnancies[0]).toMatchObject({
      hidden: true,
      bleedAnswers: { "2026-03-25": "notPeriod" },
    });
  });
});
