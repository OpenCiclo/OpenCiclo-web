// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { isDraftChanged } from "@/lib/client/day-draft";
import { emptyDayLog, type DayLog } from "@/lib/diary";

const saved: DayLog = { flow: "light", cervicalMucus: "creamy", symptoms: { cramps: "mild" }, note: "tired" };

describe("isDraftChanged", () => {
  it("is false for an untouched day, logged or not", () => {
    expect(isDraftChanged(emptyDayLog(), undefined)).toBe(false);
    expect(isDraftChanged({ ...saved, symptoms: { ...saved.symptoms } }, saved)).toBe(false);
  });

  it("treats an emptied note like no note", () => {
    expect(isDraftChanged({ symptoms: {}, note: "" }, undefined)).toBe(false);
    expect(isDraftChanged({ symptoms: {}, note: undefined }, { symptoms: {}, note: "" })).toBe(false);
  });

  it("sees each kind of change", () => {
    expect(isDraftChanged({ ...saved, flow: "heavy" }, saved)).toBe(true);
    expect(isDraftChanged({ ...saved, flow: undefined }, saved)).toBe(true);
    expect(isDraftChanged({ ...saved, cervicalMucus: undefined }, saved)).toBe(true);
    expect(isDraftChanged({ ...saved, note: "tired!" }, saved)).toBe(true);
    expect(isDraftChanged({ ...saved, symptoms: { cramps: "severe" } }, saved)).toBe(true);
    expect(isDraftChanged({ ...saved, symptoms: {} }, saved)).toBe(true);
    expect(isDraftChanged({ ...saved, symptoms: { cramps: "mild", headache: "mild" } }, saved)).toBe(true);
    expect(isDraftChanged({ symptoms: {}, flow: "spotting" }, undefined)).toBe(true);
  });
});
