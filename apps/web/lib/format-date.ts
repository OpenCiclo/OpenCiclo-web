// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { Locale } from "@/lib/i18n";

// One formatter per language and options, made on first use: the calendar
// formats a label for every day cell, and building an Intl.DateTimeFormat
// costs far more than using one.
const formatters = new Map<string, Intl.DateTimeFormat>();

export function formatIsoUtc(
  iso: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
): string {
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      ...options,
      timeZone: "UTC",
    });
    formatters.set(key, formatter);
  }
  return formatter.format(new Date(`${iso}T00:00:00Z`));
}

/** A forecast day on the forecast card, such as "Sat, Dec 5". */
export function formatForecastDate(iso: string, locale: Locale): string {
  return formatIsoUtc(iso, locale, { weekday: "short", day: "numeric", month: "short" });
}
