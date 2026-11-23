// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { LUTEAL_MAX_DAYS, LUTEAL_MIN_DAYS } from "./constants";
import {
  estimateOvulation,
  estimateOvulationKnownLength,
  lutealPmf,
  mostLikelyIndex,
  ovulationPmf,
  pointMass,
  shortestInterval,
  type OvulationEstimate,
} from "./ovulation";
import { predict } from "./predict";

type Expected = {
  cycle_start: string;
  offsets: number[];
  probabilities: number[];
  most_likely_offset: number;
  window_start_offset: number;
  window_end_offset: number;
  window_probability: number;
} | null;

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), "../../../../tests/fixtures/forecast_parity.json");
const parity = JSON.parse(readFileSync(fixturePath, "utf8")) as {
  ovulation: {
    luteal: { days: number[]; probabilities: number[] };
    from_forecast: { history: string[]; reference_date: string; bleed_days: number; expected: Expected }[];
    known_length: { cycle_start: string; next_start: string; bleed_days: number; expected: Expected }[];
  };
};

function expectSame(got: OvulationEstimate | null, expected: Expected) {
  if (expected === null) {
    expect(got).toBeNull();
    return;
  }
  expect(got).not.toBeNull();
  if (!got) return;
  expect(got.cycleStart).toBe(expected.cycle_start);
  expect(got.offsets).toEqual(expected.offsets);
  expect(got.probabilities).toHaveLength(expected.probabilities.length);
  got.probabilities.forEach((value, index) => expect(value).toBeCloseTo(expected.probabilities[index], 12));
  expect(got.mostLikelyOffset).toBe(expected.most_likely_offset);
  expect(got.windowStartOffset).toBe(expected.window_start_offset);
  expect(got.windowEndOffset).toBe(expected.window_end_offset);
  expect(got.windowProbability).toBeCloseTo(expected.window_probability, 12);
}

describe("estimated ovulation: Python parity", () => {
  it("matches the luteal distribution", () => {
    const luteal = lutealPmf();
    expect(luteal.days).toEqual(parity.ovulation.luteal.days);
    luteal.probabilities.forEach((value, index) =>
      expect(value).toBeCloseTo(parity.ovulation.luteal.probabilities[index], 14),
    );
  });

  it("matches the open cycle's estimate from a forecast", () => {
    for (const testCase of parity.ovulation.from_forecast) {
      const forecast = predict(testCase.history, testCase.reference_date);
      expectSame(estimateOvulation(forecast, testCase.bleed_days), testCase.expected);
    }
  });

  it("matches a cycle with a known next start", () => {
    for (const testCase of parity.ovulation.known_length) {
      expectSame(
        estimateOvulationKnownLength(testCase.cycle_start, testCase.next_start, testCase.bleed_days),
        testCase.expected,
      );
    }
  });
});

describe("estimated ovulation", () => {
  it("is the next start minus the luteal phase", () => {
    const pmf = ovulationPmf(pointMass(29), 5);
    expect(pmf?.offsets[0]).toBe(29 - LUTEAL_MAX_DAYS);
    expect(pmf?.offsets.at(-1)).toBe(29 - LUTEAL_MIN_DAYS);
    expect(pmf && pmf.offsets[mostLikelyIndex(pmf.probabilities)]).toBe(17);
  });

  it("never falls on a day of expected bleeding", () => {
    const pmf = ovulationPmf(pointMass(20), 6);
    expect(pmf?.offsets[0]).toBe(6);
    expect(pmf?.probabilities.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12);
    expect(ovulationPmf(pointMass(8), 7)).toBeNull();
  });

  it("takes the shortest window with the most mass, then the earliest", () => {
    expect(shortestInterval([0.1, 0.4, 0.4, 0.1], 0.8)).toMatchObject({ start: 1, end: 2 });
    expect(shortestInterval([0.25, 0.25, 0.25, 0.25], 0.5)).toMatchObject({ start: 0, end: 1 });
    expect(mostLikelyIndex([0.2, 0.4, 0.4])).toBe(1);
  });

  it("stays put through the cycle", () => {
    const starts = ["2026-01-01", "2026-01-29", "2026-02-26", "2026-03-26"];
    const early = estimateOvulation(predict(starts, "2026-03-26"), 5);
    const late = estimateOvulation(predict(starts, "2026-04-22"), 5);
    expect(late?.mostLikelyDate).toBe(early?.mostLikelyDate);
    expect([late?.windowStart, late?.windowEnd]).toEqual([early?.windowStart, early?.windowEnd]);
  });
});
