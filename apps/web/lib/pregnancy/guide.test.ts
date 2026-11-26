// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { LOCALES, messages } from "@/lib/i18n";
import { loadLocale } from "@/lib/locales/registry";
import { PREGNANCY_CALL_COPY } from "@/lib/pregnancy/call-copy";
import { GUIDE_SOURCES, PREGNANCY_GUIDE, fetalSize, sizeSeries, weekGuide } from "@/lib/pregnancy/guide";
import { CROWN_RUMP_MM, WEEK_TEXTS, WEIGHT_GRAMS } from "@/lib/pregnancy/guide-weeks";
import { MILESTONES } from "@/lib/pregnancy/patterns";

const LANGS = ["es", "en"] as const;
const WEEKS = Array.from({ length: 38 }, (_, index) => index + 4); // 4 to 41

describe("the week-by-week texts", () => {
  it("has every week from 4 to 41, and the first weeks, in both languages", () => {
    for (const lang of LANGS) {
      expect(Object.keys(WEEK_TEXTS[lang]).map(Number).sort((a, b) => a - b)).toEqual([0, ...WEEKS]);
    }
  });

  it("says the same number of things in Spanish and English, and never an empty one", () => {
    for (const week of [0, ...WEEKS]) {
      const es = WEEK_TEXTS.es[week];
      const en = WEEK_TEXTS.en[week];
      expect(es.baby.length, `week ${week}`).toBe(en.baby.length);
      expect(es.body.length, `week ${week}`).toBe(en.body.length);
      for (const text of [es, en]) {
        expect(text.baby.length).toBeGreaterThanOrEqual(2);
        expect(text.body.length).toBeGreaterThanOrEqual(1);
        for (const line of [...text.baby, ...text.body]) expect(line.trim().length).toBeGreaterThan(10);
        // A week with no size to give needs a headline of its own.
        if (!fetalSize(week)) expect(text.babyTitle.trim(), `week ${week}`).not.toBe("");
      }
    }
  });

  it("reads the nearest earlier week where a week has no text of its own", () => {
    expect(weekGuide("en", 2)).toBe(WEEK_TEXTS.en[0]);
    expect(weekGuide("en", 14)).toBe(WEEK_TEXTS.en[14]);
    expect(weekGuide("es", 43)).toBe(WEEK_TEXTS.es[41]);
  });

  it("never compares the baby with fruit, and never celebrates", () => {
    const all = LANGS.flatMap((lang) => Object.values(WEEK_TEXTS[lang]).flatMap((text) => [text.babyTitle, ...text.baby, ...text.body]))
      .join(" ")
      .toLowerCase();
    expect(all).not.toMatch(/\b(lemon|kiwi|grape|avocado|melon|limón|uva|aguacate|melón|sandía|watermelon)\b/);
    expect(all).not.toMatch(/congratulations|enhorabuena|felicidades|!/);
  });
});

describe("the day sheet's safety line", () => {
  it("opens the same 'when to call' text as Patterns, from its own small file", () => {
    for (const lang of LANGS) {
      expect(PREGNANCY_GUIDE[lang].callLabel).toBe(PREGNANCY_CALL_COPY[lang].callLabel);
      expect(PREGNANCY_GUIDE[lang].callBody).toBe(PREGNANCY_CALL_COPY[lang].callBody);
      expect(PREGNANCY_GUIDE[lang].callEmergency).toBe(PREGNANCY_CALL_COPY[lang].callEmergency);
    }
  });

  it("says logging alerts no one, and to call straight away at any hour when the baby moves less, in every language", () => {
    expect(messages.en.pregnancySafetyLine).toMatch(/does not alert anyone.*moves less than usual.*straight away, at any hour/);
    expect(messages.es.pregnancySafetyLine).toMatch(/no avisa a nadie.*se mueve menos de lo habitual.*enseguida.*a cualquier hora/);
    expect(PREGNANCY_GUIDE.en.movementNote).toMatch(/does not count or watch.*straight away/);
    expect(PREGNANCY_GUIDE.es.movementNote).toMatch(/no cuenta los movimientos.*enseguida/);
  });

  it("never says to wait", async () => {
    for (const tag of LOCALES) {
      const { messages: t } = await loadLocale(tag);
      expect(t.pregnancySafetyLine, tag).not.toMatch(/the same day|ese mismo día|until tomorrow|a mañana|tomorrow|mañana/i);
    }
    for (const lang of LANGS) expect(PREGNANCY_GUIDE[lang].movementNote).not.toMatch(/the same day|ese mismo día|tomorrow|mañana/i);
  });
});

describe("what needs a call", () => {
  const everything = LANGS.map((lang) =>
    [
      ...Object.values(WEEK_TEXTS[lang]).flatMap((text) => [...text.baby, ...text.body]),
      PREGNANCY_GUIDE[lang].callLabel,
      PREGNANCY_GUIDE[lang].callBody,
      PREGNANCY_GUIDE[lang].callEmergency,
    ].join(" "),
  );

  it("never says to wait: the sources say straight away, at any hour, not the same day", () => {
    for (const text of everything) expect(text).not.toMatch(/the same day|ese mismo día|until tomorrow|a mañana/i);
    // Fewer movements (NHS, RCOG, NICE NG201) and the signs of pre-eclampsia (NHS).
    expect(WEEK_TEXTS.en[24].body[0]).toMatch(/straight away, at any hour/);
    expect(WEEK_TEXTS.es[24].body[0]).toMatch(/enseguida .* a cualquier hora/);
    expect(WEEK_TEXTS.en[32].body[0]).toMatch(/straight away, day or night/);
    expect(WEEK_TEXTS.en[25].body[0]).toMatch(/straight away/);
    expect(WEEK_TEXTS.en[35].body[0]).toMatch(/straight away/);
    expect(PREGNANCY_GUIDE.en.callLabel).toMatch(/straight away/);
    expect(PREGNANCY_GUIDE.es.callLabel).toMatch(/enseguida/);
  });

  it("sends heavy bleeding, severe pain, fits and thoughts of harm to the emergency number", () => {
    expect(PREGNANCY_GUIDE.en.callEmergency).toMatch(/bleeding is heavy.*pain is severe.*fit.*yourself or your baby/);
    expect(PREGNANCY_GUIDE.es.callEmergency).toMatch(/sangrado es abundante.*dolor es muy fuerte.*convulsiones.*a ti o al bebé/);
    for (const lang of LANGS) {
      const body = PREGNANCY_GUIDE[lang].callBody;
      // The urgent maternal warning signs (CDC) and the NHS list, in one place.
      expect(body.split(";").length).toBeGreaterThanOrEqual(10);
    }
    expect(PREGNANCY_GUIDE.en.callBody).toMatch(/moves less than usual/);
    expect(PREGNANCY_GUIDE.en.callBody).toMatch(/tightenings before week 37/);
    expect(PREGNANCY_GUIDE.en.callBody).toMatch(/below the ribs/);
  });
});

describe("the size tables", () => {
  it("gives a length for weeks 6 to 13 and a weight for weeks 14 to 40, always growing", () => {
    expect(Object.keys(CROWN_RUMP_MM).map(Number)).toEqual([6, 7, 8, 9, 10, 11, 12, 13]);
    expect(Object.keys(WEIGHT_GRAMS).map(Number)).toEqual(Array.from({ length: 27 }, (_, index) => index + 14));
    for (let week = 7; week <= 13; week += 1) expect(CROWN_RUMP_MM[week]).toBeGreaterThan(CROWN_RUMP_MM[week - 1]);
    for (let week = 15; week <= 40; week += 1) expect(WEIGHT_GRAMS[week]).toBeGreaterThan(WEIGHT_GRAMS[week - 1]);
    expect(fetalSize(5)).toBeNull();
    expect(fetalSize(9)).toEqual({ kind: "length", mm: 26 });
    // The WHO fetal growth charts' medians (Kiserud 2017, Table 11).
    expect(fetalSize(14)).toEqual({ kind: "weight", grams: 90 });
    expect(fetalSize(28)).toEqual({ kind: "weight", grams: 1189 });
    expect(fetalSize(40)).toEqual({ kind: "weight", grams: 3617 });
    expect(fetalSize(41)).toBeNull();
  });

  it("draws the weeks around the chosen one in one measure only", () => {
    for (let week = 0; week <= 42; week += 1) {
      const series = sizeSeries(week);
      if (!fetalSize(week)) {
        expect(series).toEqual([]);
        continue;
      }
      expect(series.some((item) => item.week === week)).toBe(true);
      expect(new Set(series.map((item) => item.size.kind)).size).toBe(1);
      expect(series.length).toBeLessThanOrEqual(9);
    }
    expect(sizeSeries(13).map((item) => item.week)).toEqual([6, 7, 8, 9, 10, 11, 12, 13]);
    expect(sizeSeries(14).map((item) => item.week)).toEqual([14, 15, 16, 17, 18, 19, 20, 21, 22]);
    expect(sizeSeries(30).map((item) => item.week)).toEqual([26, 27, 28, 29, 30, 31, 32, 33, 34]);
    expect(sizeSeries(40).map((item) => item.week)).toEqual([32, 33, 34, 35, 36, 37, 38, 39, 40]);
  });
});

describe("the rest of the guide", () => {
  it("names every milestone in both languages", () => {
    for (const lang of LANGS) {
      for (const milestone of MILESTONES) {
        const copy = PREGNANCY_GUIDE[lang].milestones[milestone.id];
        expect(copy.title.trim(), milestone.id).not.toBe("");
        expect(copy.detail.trim(), milestone.id).not.toBe("");
      }
    }
  });

  it("has the same keys in both languages, none empty", () => {
    const keys = (value: object) => Object.keys(value).sort();
    expect(keys(PREGNANCY_GUIDE.es)).toEqual(keys(PREGNANCY_GUIDE.en));
    for (const lang of LANGS) {
      for (const [key, value] of Object.entries(PREGNANCY_GUIDE[lang])) {
        if (typeof value === "string") expect(value.trim(), key).not.toBe("");
      }
    }
  });

  it("cites its sources: https links, each once", () => {
    expect(GUIDE_SOURCES.length).toBeGreaterThan(10);
    const links = GUIDE_SOURCES.map((source) => source.href);
    expect(new Set(links).size).toBe(links.length);
    for (const source of GUIDE_SOURCES) {
      expect(source.href.startsWith("https://")).toBe(true);
      expect(source.label.trim()).not.toBe("");
    }
  });
});
