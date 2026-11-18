// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { Locale } from "@/lib/i18n";

export function formatIsoUtc(
  iso: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** A forecast day on the forecast card, such as "Sat, Dec 5". */
export function formatForecastDate(iso: string, locale: Locale): string {
  return formatIsoUtc(iso, locale, { weekday: "short", day: "numeric", month: "short" });
}
