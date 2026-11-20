// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";

import { LOCALES } from "@/lib/i18n";
import {
  FALLBACK_LOCALE,
  PICK_LOCALE_ES5,
  initialLocale,
  localeBootScript,
  matchLocale,
} from "@/lib/client/initial-locale";
import { LOCALE_KEY } from "@/lib/client/storage-migrate";

const CASES: Array<[string[], string]> = [
  [["es-ES"], "es"],
  [["es-MX", "en-US"], "es"],
  [["en-US", "es-ES"], "en"],
  [["en-GB"], "en"],
  [["pt-BR"], "pt-BR"],
  [["pt-PT"], "pt-BR"],
  [["pt"], "pt-BR"],
  [["PT_br"], "pt-BR"],
  [["fr-CA"], "fr"],
  [["de-AT"], "de"],
  [["de-CH", "fr"], "de"],
  [["it-IT"], "it"],
  [["nl-BE"], "nl"],
  [["pl-PL"], "pl"],
  [["ca-ES"], "ca"],
  [["ca"], "ca"],
  [["ca-valencia"], "ca-valencia"],
  [["ca-ES-valencia"], "ca-valencia"],
  [["ca-ES-VALENCIA"], "ca-valencia"],
  [["eu-ES"], "eu"],
  [["gl-ES"], "gl"],
  // The first language Ciclo speaks wins, not the first in the list.
  [["ja-JP", "zh-CN", "fr-FR", "en"], "fr"],
  [["ja-JP", "zh-CN"], FALLBACK_LOCALE],
  [[], FALLBACK_LOCALE],
  [["", "  "], FALLBACK_LOCALE],
  // "valencia" alone is not a language.
  [["valencia"], FALLBACK_LOCALE],
];

function es5Pick(preferred: string[]): string {
  const pick = new Function(`return (${PICK_LOCALE_ES5});`)() as (
    preferred: string[],
    supported: readonly string[],
    fallback: string,
  ) => string;
  return pick(preferred, LOCALES, FALLBACK_LOCALE);
}

describe("matchLocale", () => {
  it.each(CASES)("%j → %s", (preferred, expected) => {
    expect(matchLocale(preferred)).toBe(expected);
  });

  it("returns every supported tag for itself", () => {
    for (const locale of LOCALES) expect(matchLocale([locale])).toBe(locale);
  });
});

describe("PICK_LOCALE_ES5", () => {
  it.each(CASES)("agrees with matchLocale for %j", (preferred) => {
    expect(es5Pick(preferred)).toBe(matchLocale(preferred));
  });

  it("is ES5: no arrows, let/const, template literals, or ??", () => {
    expect(PICK_LOCALE_ES5).not.toMatch(/=>|\blet\b|\bconst\b|`|\?\?|\?\./);
  });
});

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

describe("initialLocale", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the language saved on this device", () => {
    vi.stubGlobal("localStorage", memoryStorage({ [LOCALE_KEY]: "de" }));
    vi.stubGlobal("navigator", { languages: ["fr-FR"], language: "fr-FR" });
    expect(initialLocale()).toBe("de");
  });

  it("follows the device when nothing is saved", () => {
    vi.stubGlobal("localStorage", memoryStorage());
    vi.stubGlobal("navigator", { languages: ["pt-PT", "en"], language: "pt-PT" });
    expect(initialLocale()).toBe("pt-BR");
  });

  it("ignores a saved value that is not a language", () => {
    vi.stubGlobal("localStorage", memoryStorage({ [LOCALE_KEY]: "klingon" }));
    vi.stubGlobal("navigator", { languages: [], language: "it-IT" });
    expect(initialLocale()).toBe("it");
  });
});

describe("localeBootScript", () => {
  function run(stored: string | null, languages: string[]): string {
    const root = { lang: "es" };
    const script = localeBootScript();
    new Function("localStorage", "navigator", "document", script)(
      memoryStorage(stored === null ? {} : { [LOCALE_KEY]: stored }),
      { languages, language: languages[0] },
      { documentElement: root },
    );
    return root.lang;
  }

  it("sets <html lang> like initialLocale", () => {
    expect(run(null, ["ca-ES-valencia"])).toBe("ca-valencia");
    expect(run(null, ["ja"])).toBe(FALLBACK_LOCALE);
    expect(run("gl", ["en-US"])).toBe("gl");
    expect(run("nope", ["nl-NL"])).toBe("nl");
  });
});
