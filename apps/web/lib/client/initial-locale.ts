// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { LOCALES, isLocale, type Locale } from "@/lib/i18n";
import { LOCALE_KEY } from "@/lib/client/storage-migrate";

// The language of the first screen: the one saved on this device, or else the
// first of the device's preferred languages (navigator.languages) that Ciclo
// speaks. A diary that opens later brings its own language.

/** For a device whose languages Ciclo does not speak at all. */
export const FALLBACK_LOCALE: Locale = "en";

/**
 * The same matching as `matchLocale`, as plain ES5 source for pages that run
 * before (or without) the app's bundle: the Android layout's boot script and
 * the WebView error page, which must work on a WebView too old for the bundle.
 * `initial-locale.test.ts` checks that both agree.
 *
 * (preferred: string[], supported: string[], fallback: string) => string
 */
export const PICK_LOCALE_ES5 = `function (preferred, supported, fallback) {
  var lower = [];
  for (var s = 0; s < supported.length; s++) lower.push(String(supported[s]).toLowerCase());
  function find(tag) {
    var index = lower.indexOf(tag);
    return index < 0 ? null : supported[index];
  }
  for (var i = 0; i < preferred.length; i++) {
    if (typeof preferred[i] !== "string") continue;
    var tag = preferred[i].replace(/^\\s+|\\s+$/g, "").replace(/_/g, "-").toLowerCase();
    if (!tag) continue;
    var exact = find(tag);
    if (exact) return exact;
    var parts = tag.split("-");
    if (parts[0] === "ca" && parts.indexOf("valencia") > 0 && find("ca-valencia")) return find("ca-valencia");
    var language = find(parts[0]);
    if (language) return language;
    for (var j = 0; j < lower.length; j++) {
      if (lower[j].split("-")[0] === parts[0]) return supported[j];
    }
  }
  return fallback;
}`;

/**
 * The first of `preferred` (BCP 47 tags, most wanted first) that Ciclo speaks.
 * An exact tag wins (`pt-BR`, `ca-valencia`); then Catalan's Valencian variant
 * (`ca-ES-valencia`); then the language alone, whatever the region (`pt-PT` →
 * `pt-BR`, `es-MX` → `es`, `fr-CA` → `fr`). `FALLBACK_LOCALE` when none matches.
 */
export function matchLocale(preferred: readonly string[]): Locale {
  const lower = LOCALES.map((tag) => tag.toLowerCase());
  const find = (tag: string): Locale | null => {
    const index = lower.indexOf(tag);
    return index < 0 ? null : LOCALES[index];
  };
  for (const raw of preferred) {
    if (typeof raw !== "string") continue;
    const tag = raw.trim().replace(/_/g, "-").toLowerCase();
    if (!tag) continue;
    const exact = find(tag);
    if (exact) return exact;
    const parts = tag.split("-");
    if (parts[0] === "ca" && parts.indexOf("valencia") > 0) return "ca-valencia";
    const language = find(parts[0]) ?? LOCALES.find((locale) => locale.toLowerCase().split("-")[0] === parts[0]);
    if (language) return language;
  }
  return FALLBACK_LOCALE;
}

/** The device's preferred languages, most wanted first. Empty when the browser says nothing. */
export function deviceLanguages(): readonly string[] {
  if (typeof navigator === "undefined") return [];
  if (navigator.languages?.length) return navigator.languages;
  return navigator.language ? [navigator.language] : [];
}

/** The language saved on this device, or the device's own when none is saved yet. */
export function initialLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY);
  return isLocale(stored) ? stored : matchLocale(deviceLanguages());
}

/**
 * Inline script for the Android root layout: sets `<html lang>` before the
 * bundle runs, the same way `initialLocale` picks it (the context keeps it in
 * step afterwards).
 */
export function localeBootScript(): string {
  return `(function(){try{var stored=localStorage.getItem(${JSON.stringify(LOCALE_KEY)});var supported=${JSON.stringify(LOCALES)};var pick=${PICK_LOCALE_ES5};var langs=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];document.documentElement.lang=supported.indexOf(stored)>=0?stored:pick(langs,supported,${JSON.stringify(FALLBACK_LOCALE)});}catch(e){}})();`;
}
