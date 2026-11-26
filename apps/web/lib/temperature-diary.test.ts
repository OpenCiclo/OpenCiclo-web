// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { isDraftChanged } from "@/lib/client/day-draft";
import { emptyDiary, parseDiary, upsertDay, type DayLog, type Diary } from "@/lib/diary";
import { diaryToCsv, diaryToJson, mergeDiaries, parseImportedFile } from "@/lib/diary-io";
import { mergeDiaryEdits } from "@/lib/diary-merge";
import { buildStatus, type SharerProfile } from "@/lib/friends/payload";
import { LOCALES, messages, type Messages } from "@/lib/i18n";
import { loadLocale } from "@/lib/locales/registry";

// A day's temperature (`DayLog.bbt`, diary v9) through everything that reads,
// writes, merges or shares a diary.

function log(partial: Partial<DayLog>): DayLog {
  return { symptoms: {}, ...partial };
}

const base: Diary = parseDiary({
  ...emptyDiary("en"),
  days: {
    "2026-09-01": log({ flow: "medium", bbt: 36.4 }),
    "2026-09-02": log({ flow: "light" }),
    "2026-09-10": log({ note: "base note" }),
  },
});

describe("a day's temperature in the diary", () => {
  it("is kept when the diary is read, and a day with only a temperature is a day", () => {
    expect(base.days["2026-09-01"]?.bbt).toBe(36.4);
    const only = upsertDay(base, "2026-09-05", log({ bbt: 36.55 }));
    expect(only.days["2026-09-05"]).toEqual({ symptoms: {}, bbt: 36.55 });
    // A temperature is not bleeding: it starts no period.
    expect(only.periodStarts).toEqual(base.periodStarts);
  });

  it("drops a value that is not a temperature in range, without dropping the day", () => {
    for (const bad of [20, 50, "36.5", null, Number.NaN]) {
      const diary = parseDiary({ ...emptyDiary("en"), days: { "2026-09-01": { flow: "light", symptoms: {}, bbt: bad } } });
      expect(diary.days["2026-09-01"]).toEqual({ flow: "light", symptoms: {} });
    }
    const gone = parseDiary({ ...emptyDiary("en"), days: { "2026-09-01": { symptoms: {}, bbt: 99 } }, periodStarts: [] });
    expect(gone.days).toEqual({});
  });

  it("clears with the rest of the day", () => {
    const cleared = upsertDay(base, "2026-09-01", log({}));
    expect(cleared.days["2026-09-01"]).toBeUndefined();
  });
});

describe("a day's temperature across two devices", () => {
  it("merges with another field edited on the same day elsewhere", () => {
    const phone = upsertDay(base, "2026-09-02", log({ flow: "light", bbt: 36.6 }));
    const laptop = upsertDay(base, "2026-09-02", log({ flow: "light", note: "tired" }));
    const merged = mergeDiaryEdits(base, laptop, phone);
    expect(merged.days["2026-09-02"]).toEqual({ flow: "light", symptoms: {}, note: "tired", bbt: 36.6 });
  });

  it("lets the local edit win, and keeps a deletion", () => {
    const phone = upsertDay(base, "2026-09-01", log({ flow: "medium", bbt: 36.7 }));
    const laptop = upsertDay(base, "2026-09-01", log({ flow: "medium", bbt: 36.5 }));
    expect(mergeDiaryEdits(base, laptop, phone).days["2026-09-01"]?.bbt).toBe(36.5);
    const erased = upsertDay(base, "2026-09-01", log({ flow: "medium" }));
    const elsewhere = upsertDay(base, "2026-09-01", log({ flow: "medium", bbt: 36.4, note: "x" }));
    expect(mergeDiaryEdits(base, erased, elsewhere).days["2026-09-01"]).toEqual({ flow: "medium", symptoms: {}, note: "x" });
  });

  it("survives an import and the move from the device to the host (the union merge)", () => {
    const incoming = parseDiary({ ...emptyDiary("en"), days: { "2026-09-02": log({ bbt: 36.6 }), "2026-09-20": log({ bbt: 36.9 }) } });
    const merged = mergeDiaries(base, incoming, "en");
    expect(merged.days["2026-09-01"]?.bbt).toBe(36.4);
    expect(merged.days["2026-09-02"]).toEqual({ flow: "light", symptoms: {}, bbt: 36.6 });
    expect(merged.days["2026-09-20"]?.bbt).toBe(36.9);
    // Onto an empty hosted diary, as the Android move does.
    expect(mergeDiaries(emptyDiary("en"), base, "en").days["2026-09-01"]?.bbt).toBe(36.4);
  });
});

describe("a day's temperature in exports", () => {
  it("round-trips through CSV in degrees Celsius, schemaVersion still the last column", () => {
    const diary = upsertDay(base, "2026-09-05", log({ bbt: 36.572 }));
    const csv = diaryToCsv(diary);
    const [header, first] = csv.split("\n");
    expect(header.endsWith(",bbtCelsius,schemaVersion")).toBe(true);
    expect(first.split(",").slice(-2)[0]).toBe("36.4");
    const back = parseImportedFile(csv);
    expect(back.days["2026-09-01"]?.bbt).toBe(36.4);
    expect(back.days["2026-09-05"]).toEqual({ symptoms: {}, bbt: 36.572 });
    expect(back.days["2026-09-02"]?.bbt).toBeUndefined();
  });

  it("drops a CSV cell that is not a number in range, and still reads files from before the column", () => {
    const csv = "date,flow,bbtCelsius\n2026-09-01,light,36,5\n2026-09-02,light,warm\n2026-09-03,light,45\n2026-09-04,,36.5\n";
    const back = parseImportedFile(csv);
    expect(back.days["2026-09-02"]?.bbt).toBeUndefined();
    expect(back.days["2026-09-03"]?.bbt).toBeUndefined();
    expect(back.days["2026-09-04"]?.bbt).toBe(36.5);
    expect(parseImportedFile("date,flow\n2026-09-01,light\n").days["2026-09-01"]).toEqual({ flow: "light", symptoms: {} });
  });

  it("round-trips through JSON", () => {
    expect(parseImportedFile(diaryToJson(base)).days["2026-09-01"]?.bbt).toBe(36.4);
  });
});

describe("the day sheet's draft", () => {
  it("counts a typed, changed or cleared temperature as an edit, and nothing else", () => {
    const saved = log({ flow: "light", bbt: 36.572 });
    expect(isDraftChanged({ ...saved }, saved)).toBe(false);
    expect(isDraftChanged({ ...saved, bbt: 36.57 }, saved)).toBe(true);
    expect(isDraftChanged(log({ flow: "light" }), saved)).toBe(true);
    expect(isDraftChanged(log({ bbt: 36.5 }), undefined)).toBe(true);
    expect(isDraftChanged(log({}), undefined)).toBe(false);
  });
});

describe("friends never get a temperature", () => {
  const profile: SharerProfile = {
    selfId: "0123456789abcdef0123456789abcdef",
    name: "Emma",
    show: { day: true, expected: true },
    note: { text: "hola", date: "2026-05-10" },
    paused: false,
  };
  const starts = ["2026-01-05", "2026-02-02", "2026-03-02", "2026-03-30"];
  const plain = parseDiary({
    schemaVersion: 6,
    locale: "en",
    periodStarts: starts,
    days: Object.fromEntries(starts.map((iso) => [iso, { flow: "medium", symptoms: {} }])),
  });

  it("the status is byte for byte the one of the same diary without the readings", () => {
    let withReadings = plain;
    for (const [iso, bbt] of [["2026-03-30", 36.4], ["2026-04-10", 36.8], ["2026-04-12", 36.9]] as const) {
      withReadings = upsertDay(withReadings, iso, { ...(withReadings.days[iso] ?? log({})), bbt });
    }
    for (const today of ["2026-03-30", "2026-04-12", "2026-04-27", "2026-05-20"]) {
      const text = JSON.stringify(buildStatus(withReadings, today, profile));
      expect(text, today).toBe(JSON.stringify(buildStatus(plain, today, profile)));
      expect(text).not.toMatch(/36\.[489]|bbt|temperatur/i);
    }
  });
});

describe("temperature wording", () => {
  // The card draws; it never reads the chart. No language may promise more
  // (agents.txt: never "safe days", "infertile days", or a chance of pregnancy).
  const BANNED = [
    /safe days?/i, /infertile/i, /chance of pregnancy/i, /días seguros/i, /infértil/i, /dias seguros/i,
    /jours sûrs/i, /sichere tage/i, /unfruchtbar/i, /giorni sicuri/i, /veilige dagen/i, /dni bezpieczne/i, /dies segurs/i,
    /egun seguru/i, /confirmed ovulation/i, /ovulación confirmada/i,
  ];

  it("in every language says what the card does not do, and nothing it must not", async () => {
    for (const locale of LOCALES) {
      const t: Messages =
        locale === "es" || locale === "en" ? messages[locale] : ((await loadLocale(locale)).messages as Messages);
      const keys = (Object.keys(t) as (keyof Messages)[]).filter((key) => key.startsWith("temperature"));
      expect(keys.length, locale).toBeGreaterThanOrEqual(27);
      for (const key of keys) {
        const text = String(t[key]);
        for (const pattern of BANNED) expect(text, `${locale}.${key}`).not.toMatch(pattern);
      }
      // The note names Ciclo twice: what it does, and that it is not a medical device.
      expect(String(t.temperatureNote).match(/Ciclo/g)?.length ?? 0, locale).toBeGreaterThanOrEqual(2);
    }
  });
});
