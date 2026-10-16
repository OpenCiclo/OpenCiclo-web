// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { emptyDiary, parseDiary, upsertDay, type DayLog, type Diary } from "@/lib/diary";
import { mergeDiaryEdits } from "@/lib/diary-merge";

function log(partial: Partial<DayLog>): DayLog {
  return { symptoms: {}, ...partial };
}

const base: Diary = parseDiary({
  ...emptyDiary("es"),
  days: {
    "2026-09-01": log({ flow: "medium" }),
    "2026-09-02": log({ flow: "light", symptoms: { cramps: "mild" } }),
    "2026-09-10": log({ note: "base note" }),
  },
});

describe("mergeDiaryEdits", () => {
  it("keeps entries logged on two devices on different days", () => {
    const phone = upsertDay(base, "2026-10-01", log({ flow: "heavy" }));
    const laptop = upsertDay(base, "2026-10-05", log({ symptoms: { headache: "severe" } }));
    const merged = mergeDiaryEdits(base, laptop, phone);
    expect(merged.days["2026-10-01"]?.flow).toBe("heavy");
    expect(merged.days["2026-10-05"]?.symptoms.headache).toBe("severe");
    expect(merged.periodStarts).toEqual(["2026-09-01", "2026-10-01"]);
  });

  it("merges different fields edited on the same day", () => {
    const phone = upsertDay(base, "2026-09-02", log({ flow: "heavy", symptoms: { cramps: "mild" } }));
    const laptop = upsertDay(base, "2026-09-02", log({ flow: "light", symptoms: { cramps: "mild", fatigue: "present" } }));
    const merged = mergeDiaryEdits(base, laptop, phone);
    expect(merged.days["2026-09-02"]).toEqual(log({ flow: "heavy", symptoms: { cramps: "mild", fatigue: "present" } }));
  });

  it("lets the local edit win when both sides changed the same field", () => {
    const phone = upsertDay(base, "2026-09-10", log({ note: "from phone" }));
    const laptop = upsertDay(base, "2026-09-10", log({ note: "from laptop" }));
    expect(mergeDiaryEdits(base, laptop, phone).days["2026-09-10"]?.note).toBe("from laptop");
  });

  it("does not bring back a day deleted on the other device", () => {
    const phone = upsertDay(base, "2026-09-10", log({}));
    const laptop = upsertDay(base, "2026-10-05", log({ symptoms: { bloating: "present" } }));
    const merged = mergeDiaryEdits(base, laptop, phone);
    expect(merged.days["2026-09-10"]).toBeUndefined();
    expect(merged.days["2026-10-05"]).toBeDefined();
  });

  it("does not bring back a period start deleted on the other device", () => {
    const phone = upsertDay(base, "2026-09-01", log({}));
    const laptop = upsertDay(base, "2026-10-05", log({ note: "hello" }));
    const merged = mergeDiaryEdits(base, laptop, phone);
    expect(merged.days["2026-09-01"]).toBeUndefined();
    expect(merged.periodStarts).toEqual(["2026-09-02"]);
  });

  it("keeps a local deletion even if the other device did not touch that day", () => {
    const phone = upsertDay(base, "2026-10-01", log({ flow: "light" }));
    const laptop = upsertDay(base, "2026-09-02", log({}));
    const merged = mergeDiaryEdits(base, laptop, phone);
    expect(merged.days["2026-09-02"]).toBeUndefined();
    expect(merged.days["2026-10-01"]?.flow).toBe("light");
  });

  it("merges settings field by field", () => {
    const phone = { ...base, forecastingEnabled: false };
    const laptop = { ...base, locale: "en" as const };
    const merged = mergeDiaryEdits(base, laptop, phone);
    expect(merged.forecastingEnabled).toBe(false);
    expect(merged.locale).toBe("en");
  });

  it("merges custom symptoms by id", () => {
    const added = { id: "custom-aaaaaaaa-1111" as const, label: "Acné", emoji: "🔴", category: "custom" as const };
    const other = { id: "custom-bbbbbbbb-2222" as const, label: "Pills", emoji: "💊", category: "otherPills" as const };
    const phone = { ...base, customSymptoms: [added] };
    const laptop = { ...base, customSymptoms: [other] };
    const merged = mergeDiaryEdits(base, laptop, phone);
    expect(merged.customSymptoms.map((item) => item.id).sort()).toEqual([added.id, other.id].sort());
  });

  it("returns the other side unchanged when one side made no edits", () => {
    const phone = upsertDay(base, "2026-10-01", log({ flow: "heavy" }));
    expect(mergeDiaryEdits(base, base, phone)).toBe(phone);
    expect(mergeDiaryEdits(base, phone, base)).toBe(phone);
  });

  it("ignores key order when deciding what changed", () => {
    const reordered = parseDiary(JSON.parse(JSON.stringify(base)));
    reordered.days["2026-09-02"] = { symptoms: { cramps: "mild" }, flow: "light" };
    const phone = upsertDay(base, "2026-10-01", log({ flow: "heavy" }));
    const merged = mergeDiaryEdits(base, reordered, phone);
    expect(merged.days["2026-10-01"]?.flow).toBe("heavy");
  });
});
