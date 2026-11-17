// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { emptyDiary, parseDiary } from "@/lib/diary";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, contentLocale, isLocale } from "@/lib/i18n";
import { articleCopy, articleCopyLocale, articleLang, hasArticleCopy, type LearnArticle } from "@/lib/learn/articles";
import { loadLocale, marketingCopy, messagesFor } from "@/lib/locales/registry";

function article(withSpanish: boolean): LearnArticle {
  const copy = (title: string) => ({ title, summary: "s", sections: [], notice: "n" });
  return {
    slug: "x",
    category: "cycle",
    reviewedAt: "2026-01-01",
    sources: [],
    en: copy("English"),
    ...(withSpanish ? { es: copy("Español") } : {}),
  } as LearnArticle;
}

describe("UI languages", () => {
  it("names every language and gives it a short label", () => {
    for (const locale of LOCALES) {
      expect(LOCALE_NAMES[locale]).toBeTruthy();
      expect(LOCALE_SHORT[locale]).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("recognises only the listed tags", () => {
    expect(isLocale("pt-BR")).toBe(true);
    expect(isLocale("ca-valencia")).toBe(true);
    expect(isLocale("pt")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it("falls back to Spanish for the languages of Spain, English otherwise", () => {
    expect(contentLocale("es")).toBe("es");
    expect(contentLocale("en")).toBe("en");
    for (const locale of ["ca", "ca-valencia", "eu", "gl"] as const) expect(contentLocale(locale)).toBe("es");
    for (const locale of ["pt-BR", "fr", "de", "it", "nl", "pl"] as const) expect(contentLocale(locale)).toBe("en");
  });

  it("keeps any saved diary language and reads an unknown one as Spanish", () => {
    expect(parseDiary({ ...emptyDiary("es"), locale: "pt-BR" }).locale).toBe("pt-BR");
    expect(parseDiary({ ...emptyDiary("es"), locale: "xx" }).locale).toBe("es");
  });
});

describe("Learn articles in other languages", () => {
  it("shows Spanish to Catalan readers when it exists, English otherwise", () => {
    expect(articleCopyLocale(article(true), "ca")).toBe("es");
    expect(articleCopyLocale(article(false), "ca")).toBe("en");
    expect(articleCopyLocale(article(true), "fr")).toBe("en");
    expect(articleCopy(article(true), "gl").title).toBe("Español");
  });

  it("marks the article language only when it differs from the UI", () => {
    expect(hasArticleCopy(article(true), "es")).toBe(true);
    expect(articleLang(article(true), "es")).toBeUndefined();
    expect(articleLang(article(false), "es")).toBe("en");
    expect(articleLang(article(true), "eu")).toBe("es");
    expect(articleLang(article(true), "de")).toBe("en");
  });
});

describe("locale registry", () => {
  it("serves Spanish or English until another language loads, then that language", async () => {
    // Before loading, French reads English and Galician reads Spanish.
    expect(messagesFor("en").settings).toBe("Settings");
    expect(marketingCopy("es").hero.titlePrefix).toBe("Tu ciclo,");
    const french = await loadLocale("fr");
    expect(messagesFor("fr")).toBe(french.messages);
    expect(marketingCopy("fr")).toBe(french.marketing);
  });
});
