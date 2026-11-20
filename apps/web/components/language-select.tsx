// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { ChevronDown } from "lucide-react";

import { useCiclo } from "@/lib/client/ciclo-context";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, isLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Languages by their own names, in alphabetical order.
const OPTIONS = [...LOCALES].sort((a, b) => LOCALE_NAMES[a].localeCompare(LOCALE_NAMES[b], "en"));

/**
 * The language menu: the phone's own picker, listing each language in itself.
 * `compact` shows two letters in a pill (welcome screen, headers); the full
 * one is a field with the language's name (Settings). `onSelect` replaces the
 * plain `setLocale` call (Settings, which reports a save that failed).
 */
export function LanguageSelect({
  compact = false,
  className,
  onSelect,
}: {
  compact?: boolean;
  className?: string;
  onSelect?: (locale: Locale) => void;
}) {
  const { t, locale, setLocale } = useCiclo();
  const select = (
    <select
      aria-label={t.language}
      value={locale}
      onChange={(event) => {
        if (isLocale(event.target.value)) (onSelect ?? setLocale)(event.target.value);
      }}
      className={
        compact
          ? "absolute inset-0 cursor-pointer appearance-none opacity-0"
          : "flex min-h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-base md:text-sm"
      }
    >
      {OPTIONS.map((code) => (
        <option key={code} value={code} lang={code}>
          {LOCALE_NAMES[code]}
        </option>
      ))}
    </select>
  );
  if (!compact) return <div className={className}>{select}</div>;
  // The pill is what shows; the native select lies on top of it, invisible, so a
  // tap opens the system picker.
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors focus-within:ring-2 focus-within:ring-ring hover:text-foreground",
        className,
      )}
    >
      <span aria-hidden>{LOCALE_SHORT[locale]}</span>
      <ChevronDown className="size-3" aria-hidden />
      {select}
    </span>
  );
}
