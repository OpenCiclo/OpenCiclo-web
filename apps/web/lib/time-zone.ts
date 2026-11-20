// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Diary dates are plain YYYY-MM-DD strings, and date math stays in UTC so a day
// is always 24 hours. Only "today" depends on where the person is: it must be
// the calendar date on their clock, not in UTC (UTC-6 used to flip to tomorrow
// at 18:00).

export const TIME_ZONE_AUTO = "auto";

/** "auto" follows the device. Anything else is an IANA name such as "America/Mexico_City". */
export type TimeZoneSetting = string;

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function parseTimeZoneSetting(value: string | null): TimeZoneSetting {
  if (!value || value === TIME_ZONE_AUTO) return TIME_ZONE_AUTO;
  return isValidTimeZone(value) ? value : TIME_ZONE_AUTO;
}

/** IANA zone for Intl, or undefined to use the runtime's own zone. */
export function resolveTimeZone(setting: TimeZoneSetting): string | undefined {
  return setting === TIME_ZONE_AUTO ? undefined : setting;
}

export function deviceTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

// Formatters per named zone, made once: building an Intl.DateTimeFormat costs
// far more than using one. The device zone (undefined) is never cached, so
// "today" follows the device when it changes zone.
const dayFormatters = new Map<string, Intl.DateTimeFormat>();
const offsetFormatters = new Map<string, Intl.DateTimeFormat>();

function dayFormatter(timeZone: string | undefined): Intl.DateTimeFormat {
  const make = () =>
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  if (timeZone === undefined) return make();
  let formatter = dayFormatters.get(timeZone);
  if (!formatter) {
    formatter = make();
    dayFormatters.set(timeZone, formatter);
  }
  return formatter;
}

/** The calendar date at `now` on a clock in `timeZone` (device zone when undefined). */
export function todayIsoIn(timeZone?: string, now = new Date()): string {
  const parts = dayFormatter(timeZone).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

// Used only when the browser cannot list its zones (Intl.supportedValuesOf).
const FALLBACK_TIME_ZONES = [
  "UTC",
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "America/Caracas",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Atlantic/Canary",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function listTimeZones(): string[] {
  const supportedValuesOf = (Intl as { supportedValuesOf?: (key: "timeZone") => string[] })
    .supportedValuesOf;
  try {
    const zones = supportedValuesOf?.("timeZone");
    if (zones?.length) return [...zones];
  } catch {
    // fall through
  }
  return [...FALLBACK_TIME_ZONES];
}

/** A zone's name for people: "America/Mexico_City" reads "America/Mexico City". */
export function zoneLabel(zone: string): string {
  return zone.replaceAll("_", " ");
}

/**
 * The time zone picker's options besides "automatic", with offsets at `now`.
 * Every zone once the person reaches for the picker (`full`); before that only
 * the zone in use, so the select can show it without building ~420 labels.
 */
export function timeZoneOptions(
  current: TimeZoneSetting,
  full: boolean,
  now = new Date(),
): { value: string; label: string }[] {
  const zones = full ? listTimeZones() : [];
  if (current !== TIME_ZONE_AUTO && !zones.includes(current)) zones.push(current);
  return zones.map((zone) => {
    const offset = timeZoneOffsetLabel(zone, now);
    return { value: zone, label: offset ? `${zoneLabel(zone)} (${offset})` : zoneLabel(zone) };
  });
}

/** "GMT-06:00"-style offset for a picker label, or "" if the runtime cannot say. */
export function timeZoneOffsetLabel(timeZone: string, now = new Date()): string {
  try {
    let formatter = offsetFormatters.get(timeZone);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "longOffset",
      });
      offsetFormatters.set(timeZone, formatter);
    }
    const parts = formatter.formatToParts(now);
    return parts.find((item) => item.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}
