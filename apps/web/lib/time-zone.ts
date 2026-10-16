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

/** The calendar date at `now` on a clock in `timeZone` (device zone when undefined). */
export function todayIsoIn(timeZone?: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
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

/** "GMT-06:00"-style offset for a picker label, or "" if the runtime cannot say. */
export function timeZoneOffsetLabel(timeZone: string, now = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    }).formatToParts(now);
    return parts.find((item) => item.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}
