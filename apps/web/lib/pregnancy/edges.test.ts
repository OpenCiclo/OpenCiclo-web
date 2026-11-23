// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The edges of pregnancy mode found by the review of 2026-11-23: screens that
// walked period starts without asking which intervals are cycles, a dating the
// sheet took and the diary dropped, two devices each turning the mode on, and
// an import bringing back a pregnancy deleted on purpose.

import { describe, expect, it } from "vitest";

import { estimatedOvulationDates } from "@/lib/cycle/ovulation";
import { cycleOverview } from "@/lib/cycle/phases";
import { insidePregnancy } from "@/lib/cycle/segments";
import { addDaysIso, parseDiary, upsertDay, type Diary } from "@/lib/diary";
import { importsPregnanciesByDefault, mergeDiaries, previewImport } from "@/lib/diary-io";
import { mergeDiaryEdits } from "@/lib/diary-merge";
import { listJournalEntries } from "@/lib/journal/entries";
import { cyclePattern } from "@/lib/patterns/cycle-rows";
import { patternStats } from "@/lib/patterns/stats";
import {
  addPastPregnancy,
  answerBleed,
  changeDating,
  deletePregnancy,
  endPregnancy,
  reopenPregnancy,
  startPregnancy,
} from "@/lib/pregnancy/actions";
import { alreadyOver, plausibleDueDate, type PregnancyDating } from "@/lib/pregnancy/dating";
import { activePregnancy } from "@/lib/pregnancy/record";
import { bleedContext } from "@/lib/pregnancy/view";

const STARTS = ["2026-01-05", "2026-02-02", "2026-03-02", "2026-03-30", "2026-04-27", "2026-05-25"];
const LMP: PregnancyDating = { method: "lmp", lmp: "2026-05-25", cycleLength: null };
const ID = "ab".repeat(8);

function diaryWith(starts: string[], extra: Record<string, unknown> = {}): Diary {
  const days: Record<string, unknown> = {};
  for (const start of starts) {
    for (let i = 0; i < 5; i += 1) days[addDaysIso(start, i)] = { flow: "medium", symptoms: {} };
  }
  return parseDiary({ schemaVersion: 7, locale: "en", periodStarts: [], days: { ...days, ...extra } });
}

function bleed(diary: Diary, start: string, length = 5): Diary {
  let next = diary;
  for (let i = 0; i < length; i += 1) next = upsertDay(next, addDaysIso(start, i), { flow: "medium", symptoms: {} });
  return next;
}

const base = diaryWith(STARTS);
const pregnant = startPregnancy(base, LMP, "noNews", ID);

describe("a dating the diary would not keep", () => {
  const tooLong: PregnancyDating = { method: "ultrasound", scanDate: "2026-06-20", weeks: 42, days: 3 };

  it("starts nothing", () => {
    expect(startPregnancy(base, tooLong)).toBe(base);
  });

  it("changes nothing, and never drops the pregnancy it was meant for", () => {
    const changed = changeDating(pregnant, ID, tooLong);
    expect(changed.pregnancies).toEqual(pregnant.pregnancies);
  });

  it("still takes 42 weeks and 0 days", () => {
    const atLimit: PregnancyDating = { method: "ultrasound", scanDate: "2026-06-20", weeks: 42, days: 0 };
    expect(changeDating(pregnant, ID, atLimit).pregnancies[0].dating).toEqual(atLimit);
  });
});

describe("the end of a pregnancy can be put right", () => {
  const ended = endPregnancy(pregnant, ID, "ended", "2026-07-20");

  it("a second end corrects the first and keeps her answers about later bleeds", () => {
    const answered = answerBleed(bleed(ended, "2026-08-24"), ID, "2026-08-24", "notPeriod");
    const corrected = endPregnancy(answered, ID, "birth", "2026-07-22");
    expect(corrected.pregnancies[0].end).toEqual({ date: "2026-07-22", outcome: "birth" });
    expect(corrected.pregnancies[0].bleedAnswers).toEqual({ "2026-08-24": "notPeriod" });
  });

  it("a first end starts with no answers", () => {
    expect(ended.pregnancies[0].bleedAnswers).toEqual({});
  });

  it("'it has not ended' makes it go on again", () => {
    const reopened = reopenPregnancy(ended, ID);
    expect(reopened.pregnancies[0].end).toBeNull();
    expect(cycleOverview(reopened, "2026-07-25").pregnancy.kind).toBe("active");
  });

  it("is refused while another pregnancy goes on", () => {
    const again = startPregnancy(ended, { method: "lmp", lmp: "2026-09-01", cycleLength: null }, "noNews", "cd".repeat(8));
    expect(reopenPregnancy(again, ID)).toBe(again);
  });
});

describe("a pregnancy that was over before she entered it", () => {
  const old: PregnancyDating = { method: "lmp", lmp: "2025-01-06", cycleLength: null };
  const today = "2026-11-23";
  const history = diaryWith(["2024-11-11", "2024-12-09", "2025-01-06", "2025-11-17", "2025-12-15"]);

  it("is not a pregnancy under way, and is recognised as over", () => {
    const dueDate = addDaysIso("2025-01-06", 280);
    expect(plausibleDueDate(dueDate, today)).toBe(false);
    expect(alreadyOver(dueDate, today)).toBe(true);
    expect(alreadyOver(addDaysIso(today, 100), today)).toBe(false);
  });

  it("is added with its end, never goes on, and takes its long interval out of the cycles", () => {
    expect(cycleOverview(history, today).avgCycleLength).toBeGreaterThan(90);
    const added = addPastPregnancy(history, old, "birth", "2025-10-10", ID);
    expect(added.pregnancies).toHaveLength(1);
    expect(activePregnancy(added.pregnancies)).toBeNull();
    expect(cycleOverview(added, today).avgCycleLength).toBe(28);
  });

  it("adds nothing for an end the diary would not keep", () => {
    expect(addPastPregnancy(history, old, "birth", "not-a-date", ID)).toBe(history);
  });
});

describe("only one pregnancy goes on at a time", () => {
  const mine = startPregnancy(base, LMP, "noNews", "11".repeat(8));
  const theirs = startPregnancy(base, { method: "lmp", lmp: "2026-05-27", cycleLength: null }, "simulated", "22".repeat(8));

  it("two devices that each turned the mode on keep this device's", () => {
    const merged = mergeDiaryEdits(base, mine, theirs);
    expect(merged.pregnancies.map((item) => item.id)).toEqual(["11".repeat(8)]);
    expect(mergeDiaryEdits(base, theirs, mine).pregnancies.map((item) => item.id)).toEqual(["22".repeat(8)]);
  });

  it("the other device then follows instead of bringing its own back", () => {
    const merged = mergeDiaryEdits(base, mine, theirs);
    // Device B held `theirs`, edits a day, and meets the merged diary on the host.
    const edited = upsertDay(theirs, "2026-06-10", { symptoms: { nausea: "present" } });
    const settled = mergeDiaryEdits(theirs, edited, merged);
    expect(settled.pregnancies.map((item) => item.id)).toEqual(["11".repeat(8)]);
    expect(settled.days["2026-06-10"]?.symptoms.nausea).toBe("present");
  });

  it("ending or deleting it leaves none going on", () => {
    const merged = mergeDiaryEdits(base, mine, theirs);
    const id = merged.pregnancies[0].id;
    expect(cycleOverview(endPregnancy(merged, id, "ended", "2026-07-20"), "2026-07-25").pregnancy.kind).toBe("resuming");
    expect(cycleOverview(deletePregnancy(merged, id), "2026-07-25").pregnancy.kind).toBe("none");
  });

  it("ended pregnancies from both sides all stay", () => {
    const endedMine = endPregnancy(mine, "11".repeat(8), "ended", "2026-07-01");
    const merged = mergeDiaryEdits(base, endedMine, theirs);
    expect(merged.pregnancies).toHaveLength(2);
    expect(merged.pregnancies.filter((item) => !item.end)).toHaveLength(1);
  });

  it("an import never adds a second one", () => {
    const merged = mergeDiaries(mine, theirs, "en");
    expect(merged.pregnancies.map((item) => item.id)).toEqual(["11".repeat(8)]);
  });
});

describe("importing a file that holds pregnancies", () => {
  const deleted = deletePregnancy(pregnant, ID);

  it("counts the ones this diary lacks", () => {
    expect(previewImport(pregnant, deleted).pregnancies).toBe(1);
    expect(previewImport(pregnant, pregnant).pregnancies).toBe(0);
    expect(previewImport(base, deleted).pregnancies).toBe(0);
  });

  it("leaves them out when she says so: a pregnancy deleted on purpose stays deleted", () => {
    const merged = mergeDiaries(deleted, pregnant, "en", { pregnancies: false });
    expect(merged.pregnancies).toEqual([]);
    expect(merged.periodStarts).toEqual(deleted.periodStarts);
  });

  it("adds them when she ticks it", () => {
    expect(mergeDiaries(deleted, pregnant, "en", { pregnancies: true }).pregnancies).toHaveLength(1);
  });

  it("is ticked by default only for a diary with nothing in it", () => {
    expect(importsPregnanciesByDefault(parseDiary({ schemaVersion: 7, locale: "en", periodStarts: [], days: {} }))).toBe(true);
    expect(importsPregnanciesByDefault(deleted)).toBe(false);
  });
});

describe("screens that walk period starts", () => {
  // A pregnancy that ended on 20 July; her period came back on 24 August.
  const back = bleed(endPregnancy(pregnant, ID, "ended", "2026-07-20"), "2026-08-24");

  it("the calendar marks no ovulation in the interval that held a pregnancy", () => {
    const overview = cycleOverview(back, "2026-08-30");
    expect(overview.pregnancy.kind).toBe("returned");
    const marks = estimatedOvulationDates(back.periodStarts, overview.ovulation, 5, back.pregnancies);
    const inside = [...marks.window].filter((iso) => insidePregnancy(iso, back.periodStarts, back.pregnancies));
    expect(inside).toEqual([]);
    // The cycles before it keep theirs.
    expect([...marks.window].some((iso) => iso > "2026-01-05" && iso < "2026-02-02")).toBe(true);
  });

  it("the day sheet calls bleeding 'during the pregnancy' from the conception day, like the rule", () => {
    const withoutLast = startPregnancy(diaryWith(STARTS.slice(0, 5)), LMP, "noNews", ID);
    // Her last period, logged afterwards: a period start, and the sheet does not say otherwise.
    expect(bleedContext(withoutLast, "2026-05-25").kind).toBe("none");
    expect(upsertDay(withoutLast, "2026-05-25", { flow: "medium", symptoms: {} }).periodStarts).toContain("2026-05-25");
    // From the estimated conception day (8 June): never a period start.
    expect(bleedContext(withoutLast, "2026-06-07").kind).toBe("none");
    expect(bleedContext(withoutLast, "2026-06-08").kind).toBe("pregnancy");
    expect(upsertDay(withoutLast, "2026-06-08", { flow: "light", symptoms: {} }).periodStarts).not.toContain("2026-06-08");
  });

  it("Patterns has no open cycle while a pregnancy goes on, and counts none of its days", () => {
    const symptomDays: Record<string, unknown> = {};
    for (let i = 30; i < 120; i += 1) symptomDays[addDaysIso("2026-05-25", i)] = { symptoms: { nausea: "present" } };
    const diary = startPregnancy(diaryWith(STARTS, symptomDays), LMP, "noNews", ID);
    const stats = patternStats(diary, "2026-10-01");
    const pattern = cyclePattern(diary, stats.periodRuns, stats.recurringSymptoms, stats.recurringSex);
    expect(stats.currentCycleDay).toBeNull();
    expect(pattern.current).toBeNull();
    expect(stats.recurringSymptoms).toEqual([]);
    expect(pattern.completed).toHaveLength(5);
  });

  it("Patterns does not give the cycle before a pregnancy what was logged during it", () => {
    let diary = bleed(endPregnancy(pregnant, ID, "ended", "2026-07-20"), "2026-08-24");
    diary = bleed(diary, "2026-09-21");
    // Logged during the pregnancy, and again in the two cycles after it.
    diary = upsertDay(diary, "2026-06-20", { symptoms: { nausea: "present" } });
    diary = upsertDay(diary, "2026-09-01", { symptoms: { nausea: "present" } });
    diary = upsertDay(diary, "2026-09-25", { symptoms: { nausea: "present" } });
    const stats = patternStats(diary, "2026-09-28");
    const pattern = cyclePattern(diary, stats.periodRuns, stats.recurringSymptoms, stats.recurringSex);
    const rows = [...pattern.completed.map((row) => row.start), pattern.current?.start];
    expect(rows.slice(-3)).toEqual(["2026-04-27", "2026-08-24", "2026-09-21"]);
    expect(pattern.presence.nausea.slice(-3)).toEqual([false, true, true]);
  });

  it("a note written during a pregnancy has no cycle day", () => {
    const noted = upsertDay(pregnant, "2026-08-10", { symptoms: {}, note: "tired" });
    expect(listJournalEntries(noted)[0]).toMatchObject({ iso: "2026-08-10", cycleDay: null, phase: null });
    const before = upsertDay(pregnant, "2026-05-27", { flow: "medium", symptoms: {}, note: "cramps" });
    expect(listJournalEntries(before)[0]).toMatchObject({ iso: "2026-05-27", cycleDay: 3 });
  });
});
