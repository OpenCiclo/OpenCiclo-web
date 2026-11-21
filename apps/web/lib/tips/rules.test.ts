// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { messages } from "@/lib/i18n";
import { selectTips, symptomAdvice } from "@/lib/tips/rules";
import type { TipContext } from "@/lib/tips/types";

const base: TipContext = {
  currentPhase: "luteal",
  nextPeriodInDays: 8,
  avgCycleLength: 28,
  cycleLengthRange: { min: 27, max: 29 },
  completedCycleCount: 4,
  topSymptom: { id: "cramps", dayCount: 6, cycleCount: 3, cycleTotal: 4, ratio: 1 },
};

describe("tip rules", () => {
  it("returns period-soon before the top-symptom card", () => {
    const tips = selectTips({ ...base, nextPeriodInDays: 2 }, messages.en, 3);
    expect(tips[0]?.id).toBe("period-soon");
    expect(tips.some((tip) => tip.id === "top-symptom")).toBe(true);
  });

  it("keeps one tip per category and caps the list", () => {
    const tips = selectTips({ ...base, currentPhase: "ovulation", nextPeriodInDays: 12 }, messages.en, 3);
    const categories = tips.map((tip) => tip.category);
    expect(new Set(categories).size).toBe(categories.length);
    expect(tips.length).toBeLessThanOrEqual(3);
  });

  it("localizes tip copy in Spanish", () => {
    const tips = selectTips({ ...base, nextPeriodInDays: 1 }, messages.es, 3);
    expect(tips[0]?.title).toBe(messages.es.tipPeriodSoonTitle);
  });

  it("never calls a sex entry a symptom, and keeps its advice for the sex card", () => {
    const tips = selectTips(
      {
        ...base,
        nextPeriodInDays: 10,
        topSymptom: {
          id: "sexualActivity",
          dayCount: 4,
          cycleCount: 2,
          cycleTotal: 4,
          ratio: 1,
        },
      },
      messages.en,
      3,
    );
    expect(tips.find((item) => item.id === "top-symptom")).toBeUndefined();
    expect(symptomAdvice("sexualActivity", 4, messages.en)).toContain("4");
    expect(symptomAdvice("backache", 4, messages.en)).toBeNull();
  });

  it("does not invent medical advice for custom symptoms", () => {
    const tips = selectTips(
      {
        ...base,
        topSymptom: {
          id: "custom-migraine1",
          dayCount: 4,
          cycleCount: 2,
          cycleTotal: 4,
          ratio: 1,
        },
      },
      messages.en,
      3,
    );
    expect(tips.some((item) => item.id === "top-symptom")).toBe(false);
  });
});
