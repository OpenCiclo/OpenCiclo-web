// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// A day's temperature (`DayLog.bbt`): units, typing and showing. The diary
// always holds degrees Celsius; the unit is how this device shows them. Ciclo
// only logs and draws these readings: nothing here, and nothing that calls it,
// reads a rise, a cover line or an ovulation day out of them (agents.txt,
// "Temperature").

import { sanitizeBbt } from "@/lib/diary";
import type { Locale } from "@/lib/i18n";

export const TEMPERATURE_UNITS = ["c", "f"] as const;
export type TemperatureUnit = (typeof TEMPERATURE_UNITS)[number];

export function parseTemperatureUnit(raw: string | null | undefined, fallback: TemperatureUnit): TemperatureUnit {
  return raw === "c" || raw === "f" ? raw : fallback;
}

/** Regions that read body temperature in Fahrenheit. */
const FAHRENHEIT_REGIONS = new Set(["US", "BS", "BZ", "KY", "LR", "PW", "FM", "MH"]);

/** The unit to start with, from the browser's languages: the first one that names a region decides. */
export function defaultTemperatureUnit(languages: readonly string[]): TemperatureUnit {
  for (const tag of languages) {
    const region = /[-_]([A-Za-z]{2})(?:[-_]|$)/.exec(tag)?.[1];
    if (region) return FAHRENHEIT_REGIONS.has(region.toUpperCase()) ? "f" : "c";
  }
  return "c";
}

export function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function toCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

/** A stored reading in `unit`, to two decimals: what a thermometer shows. */
export function inUnit(celsius: number, unit: TemperatureUnit): number {
  const value = unit === "f" ? toFahrenheit(celsius) : celsius;
  return Math.round(value * 100) / 100;
}

export type TemperatureInput = { kind: "empty" } | { kind: "ok"; celsius: number } | { kind: "invalid" };

/**
 * What she typed, as degrees Celsius: a comma or a dot, up to two decimals,
 * inside the range the diary keeps (34 to 42 °C). Anything else is `invalid`,
 * never a guess.
 */
export function parseTemperatureInput(text: string, unit: TemperatureUnit): TemperatureInput {
  const trimmed = text.trim();
  if (!trimmed) return { kind: "empty" };
  if (!/^\d{2,3}(?:[.,]\d{0,2})?$/.test(trimmed)) return { kind: "invalid" };
  const typed = Number(trimmed.replace(",", "."));
  const celsius = sanitizeBbt(unit === "f" ? toCelsius(typed) : typed);
  return celsius === undefined ? { kind: "invalid" } : { kind: "ok", celsius };
}

/** The text of the field for a stored reading: a dot, no trailing zeros. */
export function temperatureInputText(celsius: number | undefined, unit: TemperatureUnit): string {
  return celsius === undefined ? "" : String(inUnit(celsius, unit));
}

/** "36.55" / "36,55" in the language's own decimals; one decimal at least. */
export function formatTemperature(celsius: number, unit: TemperatureUnit, locale: Locale, decimals: 1 | 2 = 2): string {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: decimals }).format(
    inUnit(celsius, unit),
  );
}

export function unitSymbol(unit: TemperatureUnit): string {
  return unit === "f" ? "°F" : "°C";
}
