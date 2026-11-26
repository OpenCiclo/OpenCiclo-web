// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { parseDiary, withPregnancies, type DayLog, type Diary } from "@/lib/diary";
import { readingsOutsideCycles, temperatureAxis, temperatureCycles } from "@/lib/patterns/temperature";
import type { PregnancyRecord } from "@/lib/pregnancy/record";

function diary(days: Record<string, Partial<DayLog>>): Diary {
  return parseDiary({
    schemaVersion: 9,
    locale: "en",
    periodStarts: [],
    days: Object.fromEntries(Object.entries(days).map(([iso, log]) => [iso, { symptoms: {}, ...log }])),
  });
}

describe("temperature by cycle", () => {
  const logged = diary({
    "2026-05-01": { flow: "medium", bbt: 36.4 },
    "2026-05-02": { flow: "light", bbt: 36.45 },
    "2026-05-03": { bbt: 36.5 },
    "2026-05-06": { bbt: 36.8 },
    "2026-05-29": { flow: "medium" },
    "2026-06-02": { bbt: 36.3 },
  });

  it("lays each cycle's readings on its own days, oldest cycle first, the open one last", () => {
    const cycles = temperatureCycles(logged, "2026-06-10");
    expect(cycles.map((cycle) => [cycle.start, cycle.end, cycle.open, cycle.length])).toEqual([
      ["2026-05-01", "2026-05-29", false, 28],
      ["2026-05-29", null, true, 28],
    ]);
    expect(cycles[0].readings.map((reading) => [reading.day, reading.celsius])).toEqual([
      [1, 36.4],
      [2, 36.45],
      [3, 36.5],
      [6, 36.8],
    ]);
    expect(cycles[0].bleedDays).toEqual([1, 2]);
    expect(cycles[1].readings.map((reading) => reading.day)).toEqual([5]);
    expect(cycles[1].bleedDays).toEqual([1]);
  });

  it("joins consecutive days only: a gap in the log stays a gap", () => {
    const [first] = temperatureCycles(logged, "2026-06-10");
    expect(first.runs.map((run) => run.map((reading) => reading.day))).toEqual([[1, 2, 3], [6]]);
  });

  it("counts plain numbers, in degrees Celsius", () => {
    const [first] = temperatureCycles(logged, "2026-06-10");
    expect(first.stats.count).toBe(4);
    expect(first.stats.min).toBe(36.4);
    expect(first.stats.max).toBe(36.8);
    expect(first.stats.mean).toBeCloseTo(36.5375, 6);
  });

  it("leaves out a cycle with no reading", () => {
    const sparse = diary({
      "2026-05-01": { flow: "medium" },
      "2026-05-29": { flow: "medium", bbt: 36.6 },
    });
    expect(temperatureCycles(sparse, "2026-06-10").map((cycle) => cycle.start)).toEqual(["2026-05-29"]);
  });

  it("grows the open cycle's chart with the days gone by, never under four weeks", () => {
    const open = diary({ "2026-05-01": { flow: "medium", bbt: 36.5 } });
    expect(temperatureCycles(open, "2026-05-03")[0].length).toBe(28);
    expect(temperatureCycles(open, "2026-06-30")[0].length).toBe(61);
  });

  it("says how many readings belong to no cycle: before the first period, or in days that held a pregnancy", () => {
    const early = diary({
      "2026-04-20": { bbt: 36.5 },
      "2026-05-01": { flow: "medium", bbt: 36.4 },
    });
    expect(temperatureCycles(early, "2026-05-10")).toHaveLength(1);
    expect(readingsOutsideCycles(early, "2026-05-10")).toBe(1);

    const none = diary({ "2026-04-20": { bbt: 36.5 } });
    expect(temperatureCycles(none, "2026-05-10")).toEqual([]);
    expect(readingsOutsideCycles(none, "2026-05-10")).toBe(1);

    const record: PregnancyRecord = {
      id: "0123456789abcdef0123456789abcdef",
      dating: { method: "lmp", lmp: "2026-05-29", cycleLength: null },
      dueDate: "2027-03-05",
      end: null,
      hidden: false,
      friendsMode: "noNews",
      bleedAnswers: {},
    };
    const pregnant = withPregnancies(logged, [record]);
    // The cycle before it is still drawn; the days since her last period are no cycle.
    expect(temperatureCycles(pregnant, "2026-08-10").map((cycle) => cycle.start)).toEqual(["2026-05-01"]);
    expect(readingsOutsideCycles(pregnant, "2026-08-10")).toBe(1);
  });
});

describe("temperature axis", () => {
  const cycleOf = (values: number[]) =>
    temperatureCycles(
      diary(
        Object.fromEntries(
          values.map((bbt, index) => [`2026-05-${String(index + 1).padStart(2, "0")}`, index === 0 ? { flow: "medium", bbt } : { bbt }]),
        ),
      ),
      "2026-05-20",
    )[0];

  it("never spans less than 1 °C or 2 °F, so a flat cycle is not stretched into a rise", () => {
    const flat = cycleOf([36.5, 36.52, 36.48]);
    const celsius = temperatureAxis(flat, "c");
    expect(celsius.max - celsius.min).toBeGreaterThanOrEqual(1);
    const fahrenheit = temperatureAxis(flat, "f");
    expect(fahrenheit.max - fahrenheit.min).toBeGreaterThanOrEqual(2);
  });

  it("holds every reading between its ends, with a few round ticks", () => {
    for (const values of [[36.2, 36.9], [35.1, 38.4], [34, 42], [36.55]]) {
      const cycle = cycleOf(values);
      for (const unit of ["c", "f"] as const) {
        const axis = temperatureAxis(cycle, unit);
        const shown = values.map((value) => (unit === "f" ? (value * 9) / 5 + 32 : value));
        expect(axis.min).toBeLessThanOrEqual(Math.min(...shown));
        expect(axis.max).toBeGreaterThanOrEqual(Math.max(...shown));
        expect(axis.ticks.length).toBeGreaterThanOrEqual(2);
        expect(axis.ticks.length).toBeLessThanOrEqual(7);
        expect(axis.ticks[0]).toBe(axis.min);
        expect(axis.ticks[axis.ticks.length - 1]).toBe(axis.max);
        for (const tick of axis.ticks) expect(Number(tick.toFixed(1))).toBe(tick);
      }
    }
  });
});
