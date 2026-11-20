// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { parseDiary } from "@/lib/diary";
import { periodRuns } from "@/lib/cycle/period-duration";
import { cyclePattern, cycleRegularity, cycleVariation } from "@/lib/patterns/cycle-rows";
import { recurringSymptoms } from "@/lib/patterns/stats";

// Three completed cycles (28, 30, 29 days) and an open one.
const diary = parseDiary({
  schemaVersion: 3,
  locale: "en",
  periodStarts: ["2026-05-01", "2026-05-29", "2026-06-28", "2026-07-27"],
  days: {
    "2026-05-01": { flow: "medium", symptoms: { cramps: "present" } },
    "2026-05-02": { flow: "medium", symptoms: { cramps: "present" } },
    "2026-05-03": { flow: "light", symptoms: {} },
    "2026-05-25": { symptoms: { fatigue: "present" } },
    "2026-05-29": { flow: "medium", symptoms: { cramps: "present" } },
    "2026-06-12": { symptoms: { headache: "mild" } },
    "2026-06-24": { symptoms: { fatigue: "present" } },
    "2026-06-28": { flow: "medium", symptoms: { cramps: "present" } },
    "2026-07-12": { symptoms: { headache: "mild" } },
    "2026-07-27": { flow: "medium", symptoms: {} },
  },
});

describe("cyclePattern", () => {
  const pattern = cyclePattern(diary, periodRuns(diary), recurringSymptoms(diary));

  it("lays out the completed cycles oldest first, and the open one apart", () => {
    expect(pattern.completed.map((cycle) => [cycle.start, cycle.length])).toEqual([
      ["2026-05-01", 28],
      ["2026-05-29", 30],
      ["2026-06-28", 29],
    ]);
    expect(pattern.current).toMatchObject({ start: "2026-07-27", length: null, marks: [] });
  });

  it("counts the bleeding days logged from each start", () => {
    expect(pattern.completed[0].bleed).toBe(3);
    expect(pattern.completed[1].bleed).toBe(1);
  });

  it("marks the first day each symptom was logged in a cycle", () => {
    expect(pattern.completed[0].marks).toEqual(
      expect.arrayContaining([
        { id: "cramps", day: 1 },
        { id: "fatigue", day: 25 },
      ]),
    );
    expect(pattern.completed[1].marks).toEqual(expect.arrayContaining([{ id: "headache", day: 15 }]));
  });

  it("says in which cycles each symptom was logged, the open one last", () => {
    expect(pattern.presence.cramps).toEqual([true, true, true, false]);
    expect(pattern.presence.fatigue).toEqual([true, true, false, false]);
    expect(pattern.presence.headache).toEqual([false, true, true, false]);
  });

  it("places a symptom at the start, before the period or around a day", () => {
    const when = Object.fromEntries(pattern.timings.map((timing) => [timing.id, timing.when]));
    expect(when).toEqual({ cramps: "start", fatigue: "beforePeriod", headache: "around" });
    expect(pattern.timings.find((timing) => timing.id === "headache")?.day).toBe(15);
  });

  it("gives no timing to a symptom logged in one cycle only", () => {
    const once = parseDiary({
      schemaVersion: 3,
      locale: "en",
      periodStarts: ["2026-05-01", "2026-05-29"],
      days: { "2026-05-10": { symptoms: { headache: "mild" } } },
    });
    expect(cyclePattern(once, periodRuns(once), recurringSymptoms(once)).timings).toEqual([]);
  });

  it("is empty for a diary with no period start", () => {
    const blank = parseDiary({ schemaVersion: 3, locale: "en", periodStarts: [], days: {} });
    expect(cyclePattern(blank, [], [])).toEqual({ completed: [], current: null, symptoms: [], presence: {}, timings: [] });
  });
});

describe("cycle variation and regularity", () => {
  it("measures the largest distance from the average, in whole days", () => {
    expect(cycleVariation([28, 30, 29, 31, 28, 29])).toBe(2);
    expect(cycleVariation([28, 28, 28])).toBe(0);
    expect(cycleVariation([28])).toBeNull();
    expect(cycleVariation([])).toBeNull();
  });

  it("calls cycles regular within three days, like the tip of that name", () => {
    expect(cycleRegularity([28, 31])).toBe("regular");
    expect(cycleRegularity([28, 32])).toBe("somewhat");
    expect(cycleRegularity([26, 35])).toBe("variable");
    expect(cycleRegularity([28])).toBeNull();
  });
});
