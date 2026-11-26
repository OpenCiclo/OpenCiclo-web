// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { MAX_BBT_CELSIUS, MIN_BBT_CELSIUS, sanitizeBbt } from "@/lib/diary";
import {
  defaultTemperatureUnit,
  formatTemperature,
  inUnit,
  parseTemperatureInput,
  parseTemperatureUnit,
  temperatureInputText,
  toFahrenheit,
} from "@/lib/temperature";

describe("temperature units", () => {
  it("reads every two-decimal Fahrenheit value back exactly as typed", () => {
    // The whole range the diary keeps, 93.20 to 107.60 °F, in hundredths.
    for (let hundredths = 9320; hundredths <= 10760; hundredths += 1) {
      const typed = (hundredths / 100).toFixed(2);
      const parsed = parseTemperatureInput(typed, "f");
      expect(parsed.kind, typed).toBe("ok");
      if (parsed.kind !== "ok") continue;
      expect(inUnit(parsed.celsius, "f").toFixed(2), typed).toBe(typed);
    }
  });

  it("reads every two-decimal Celsius value back exactly as typed", () => {
    for (let hundredths = 3400; hundredths <= 4200; hundredths += 1) {
      const typed = (hundredths / 100).toFixed(2);
      const parsed = parseTemperatureInput(typed, "c");
      expect(parsed.kind, typed).toBe("ok");
      if (parsed.kind === "ok") expect(inUnit(parsed.celsius, "c").toFixed(2), typed).toBe(typed);
    }
  });

  it("takes a comma or a dot, and spaces around", () => {
    expect(parseTemperatureInput("36,55", "c")).toEqual({ kind: "ok", celsius: 36.55 });
    expect(parseTemperatureInput(" 36.55 ", "c")).toEqual({ kind: "ok", celsius: 36.55 });
    expect(parseTemperatureInput("36.", "c")).toEqual({ kind: "ok", celsius: 36 });
    expect(parseTemperatureInput("97.83", "f")).toEqual({ kind: "ok", celsius: 36.572 });
  });

  it("is empty for nothing typed, and invalid for anything that is not a temperature in range", () => {
    expect(parseTemperatureInput("", "c")).toEqual({ kind: "empty" });
    expect(parseTemperatureInput("   ", "f")).toEqual({ kind: "empty" });
    for (const junk of ["3", "abc", "36.555", "36..5", "-36.5", "36,5,1", "1e2", "33.9", "42.1", "97.7"]) {
      expect(parseTemperatureInput(junk, "c").kind, junk).toBe("invalid");
    }
    for (const junk of ["36.5", "93.1", "107.7", "1000"]) {
      expect(parseTemperatureInput(junk, "f").kind, junk).toBe("invalid");
    }
  });

  it("keeps a reading inside the range, to three decimals of a degree Celsius", () => {
    expect(sanitizeBbt(36.5724)).toBe(36.572);
    expect(sanitizeBbt(MIN_BBT_CELSIUS)).toBe(34);
    expect(sanitizeBbt(MAX_BBT_CELSIUS)).toBe(42);
    for (const dropped of [33.9994, 42.0006, Number.NaN, Number.POSITIVE_INFINITY, "36.5", null, undefined, true]) {
      expect(sanitizeBbt(dropped)).toBeUndefined();
    }
  });

  it("switching the unit never changes the reading: the field shows it, it does not retype it", () => {
    const celsius = 36.57;
    expect(temperatureInputText(celsius, "f")).toBe("97.83");
    expect(temperatureInputText(celsius, "c")).toBe("36.57");
    expect(temperatureInputText(undefined, "c")).toBe("");
    // Typing what the field shows in Fahrenheit would move it: hence the rule above.
    const retyped = parseTemperatureInput("97.83", "f");
    expect(retyped.kind === "ok" && retyped.celsius).not.toBe(celsius);
  });

  it("shows a reading in the language's decimals", () => {
    expect(formatTemperature(36.5, "c", "en")).toBe("36.5");
    expect(formatTemperature(36.55, "c", "es")).toBe("36,55");
    expect(formatTemperature(36.55, "c", "en", 1)).toMatch(/^36\.[56]$/);
    expect(formatTemperature(37, "f", "en")).toBe(String(toFahrenheit(37)));
  });

  it("starts in Fahrenheit only where the first language with a region uses it", () => {
    expect(defaultTemperatureUnit(["en-US", "es"])).toBe("f");
    expect(defaultTemperatureUnit(["en", "en-US"])).toBe("f");
    expect(defaultTemperatureUnit(["es-ES", "en-US"])).toBe("c");
    expect(defaultTemperatureUnit(["en-GB"])).toBe("c");
    expect(defaultTemperatureUnit(["ca-ES-valencia"])).toBe("c");
    expect(defaultTemperatureUnit(["en"])).toBe("c");
    expect(defaultTemperatureUnit([])).toBe("c");
  });

  it("reads the saved unit, falling back for anything else", () => {
    expect(parseTemperatureUnit("f", "c")).toBe("f");
    expect(parseTemperatureUnit("c", "f")).toBe("c");
    expect(parseTemperatureUnit(null, "f")).toBe("f");
    expect(parseTemperatureUnit("kelvin", "c")).toBe("c");
  });
});
