// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  conceptionDate,
  cycleCorrection,
  dueDateFrom,
  gestationalAge,
  irregularForLmpDating,
  likelyWindow,
  plausibleDueDate,
  pregnancyStart,
  termFor,
  trimesterFor,
  trimesterStarts,
  weeksLeft,
  type PregnancyDating,
} from "./dating";

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), "../../../../tests/fixtures/forecast_parity.json");
const parity = JSON.parse(readFileSync(fixturePath, "utf8")) as {
  pregnancy: {
    due_dates: { dating: PregnancyDating; due_date: string }[];
    ages: {
      due_date: string;
      date: string;
      weeks: number;
      days: number;
      total_days: number;
      trimester: number;
      term: string;
      weeks_left: number;
    }[];
    conception: { due_date: string; expected: string };
    likely_window: { due_date: string; start: string; end: string };
  };
};

describe("pregnancy dates: Python parity", () => {
  it("matches every dating method", () => {
    for (const testCase of parity.pregnancy.due_dates) {
      expect(dueDateFrom(testCase.dating), JSON.stringify(testCase.dating)).toBe(testCase.due_date);
    }
  });

  it("matches gestational age, trimester, term and weeks left", () => {
    for (const testCase of parity.pregnancy.ages) {
      const age = gestationalAge(testCase.due_date, testCase.date);
      expect([age.weeks, age.days, age.totalDays], testCase.date).toEqual([
        testCase.weeks,
        testCase.days,
        testCase.total_days,
      ]);
      expect(trimesterFor(age.totalDays)).toBe(testCase.trimester);
      expect(termFor(age.totalDays)).toBe(testCase.term);
      expect(weeksLeft(testCase.due_date, testCase.date)).toBe(testCase.weeks_left);
    }
  });

  it("matches the conception date and the likely window", () => {
    expect(conceptionDate(parity.pregnancy.conception.due_date)).toBe(parity.pregnancy.conception.expected);
    expect(likelyWindow(parity.pregnancy.likely_window.due_date)).toEqual({
      start: parity.pregnancy.likely_window.start,
      end: parity.pregnancy.likely_window.end,
    });
  });
});

describe("pregnancy dates", () => {
  it("adds 280 days to the last period, corrected for her usual cycle up to a week", () => {
    expect(dueDateFrom({ method: "lmp", lmp: "2026-01-10", cycleLength: null })).toBe("2026-10-17");
    expect(dueDateFrom({ method: "lmp", lmp: "2026-01-10", cycleLength: 28 })).toBe("2026-10-17");
    expect(cycleCorrection(32)).toBe(4);
    expect(cycleCorrection(45)).toBe(7);
    expect(cycleCorrection(18)).toBe(-7);
    expect(irregularForLmpDating(36)).toBe(true);
    expect(irregularForLmpDating(29)).toBe(false);
    expect(irregularForLmpDating(null)).toBe(false);
  });

  it("dates an ultrasound by the age it gave on that day", () => {
    expect(dueDateFrom({ method: "ultrasound", scanDate: "2026-03-02", weeks: 8, days: 3 })).toBe("2026-10-09");
  });

  it("counts weeks from zero and splits the trimesters at 14+0 and 28+0", () => {
    expect(gestationalAge("2026-10-17", "2026-04-13")).toEqual({ weeks: 13, days: 2, totalDays: 93 });
    expect(trimesterFor(13 * 7 + 6)).toBe(1);
    expect(trimesterFor(14 * 7)).toBe(2);
    expect(trimesterFor(28 * 7)).toBe(3);
    expect(trimesterStarts("2026-10-17")).toEqual(["2026-01-10", "2026-04-18", "2026-07-25"]);
    expect(pregnancyStart("2026-10-17")).toBe("2026-01-10");
  });

  it("only accepts a due date for a pregnancy under way and not past 44 weeks", () => {
    expect(plausibleDueDate("2026-10-17", "2026-03-01")).toBe(true);
    expect(plausibleDueDate("2026-10-17", "2026-01-09")).toBe(false);
    expect(plausibleDueDate("2026-10-17", "2026-11-15")).toBe(false);
  });
});
