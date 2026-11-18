// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { isIsoDate, monthCells, parseDiary, weekdayLabels } from "@/lib/diary";
import { diaryToCsv, mergeDiaries, parseImportedFile } from "@/lib/diary-io";
import { formatForecastDate, formatIsoUtc } from "@/lib/format-date";

// These run in the zone vitest.config.mts pins (America/New_York by default),
// where a UTC midnight is still the evening before.

describe("isIsoDate", () => {
  it("accepts real calendar days", () => {
    for (const iso of ["2026-01-01", "2026-12-31", "2024-02-29", "2000-02-29", "2026-04-30"]) {
      expect(isIsoDate(iso), iso).toBe(true);
    }
  });

  it("rejects days that do not exist", () => {
    for (const iso of [
      "2026-02-29",
      "2026-02-30",
      "1900-02-29",
      "2026-04-31",
      "2026-13-01",
      "2026-00-10",
      "2026-01-00",
      "2026-01-32",
    ]) {
      expect(isIsoDate(iso), iso).toBe(false);
    }
  });

  it("rejects other shapes and years outside the diary range", () => {
    for (const iso of ["2026-1-01", "2026-01-01T00:00:00Z", " 2026-01-01", "0050-01-01", "1899-12-31", "3000-01-01", "9999-12-31", ""]) {
      expect(isIsoDate(iso), iso).toBe(false);
    }
  });
});

describe("parseDiary with impossible dates", () => {
  const stored = {
    schemaVersion: 6,
    locale: "en",
    periodStarts: ["2026-01-05", "2026-02-30", "2026-13-01"],
    days: {
      "2026-01-05": { flow: "medium", symptoms: {} },
      "2026-02-30": { flow: "heavy", symptoms: {} },
      "2026-13-01": { symptoms: { cramps: "mild" }, note: "unreachable" },
      "2026-02-10": { symptoms: {}, note: "kept" },
    },
    poolOptIn: true,
    poolContributorKey: null,
    poolLastSyncedAt: "2026-02-31",
  };

  it("drops day keys and period starts that are not real days", () => {
    const diary = parseDiary(stored);
    expect(Object.keys(diary.days).sort()).toEqual(["2026-01-05", "2026-02-10"]);
    // 2026-02-30 used to roll into a phantom start on 2 March.
    expect(diary.periodStarts).toEqual(["2026-01-05"]);
    expect(diary.poolLastSyncedAt).toBeNull();
  });

  it("leaves nothing that crashes the date formatting", () => {
    const diary = parseDiary(stored);
    for (const iso of [...Object.keys(diary.days), ...diary.periodStarts]) {
      expect(() => formatIsoUtc(iso, "en", { month: "short", day: "numeric", year: "numeric" })).not.toThrow();
    }
  });

  it("drops them from imported JSON and CSV files too", () => {
    const fromJson = parseImportedFile(JSON.stringify(stored));
    expect(Object.keys(fromJson.days).sort()).toEqual(["2026-01-05", "2026-02-10"]);

    const csv = [
      "date,flow,cervicalMucus,symptoms,cramps,headache,note,periodStart",
      "2026-01-05,medium,,,,,,1",
      "2026-02-30,heavy,,,,,,1",
      "2026-13-01,,,,mild,,unreachable,",
    ].join("\n");
    const fromCsv = parseImportedFile(csv);
    expect(Object.keys(fromCsv.days)).toEqual(["2026-01-05"]);
    expect(fromCsv.periodStarts).toEqual(["2026-01-05"]);

    const dateOnly = parseImportedFile("date\n2026-01-05\n2026-02-30\n");
    expect(dateOnly.periodStarts).toEqual(["2026-01-05"]);
  });

  it("still reads a headerless list of dates whose first line is impossible", () => {
    // The first line decides the format. An impossible day there must not turn
    // the list into a CSV with no date column, which would import nothing.
    expect(parseImportedFile("2026-02-30\n2026-03-28\n2026-04-25\n").periodStarts).toEqual([
      "2026-03-28",
      "2026-04-25",
    ]);
    expect(parseImportedFile("2026-01-31\n2026-02-30\n2026-03-28\n").periodStarts).toEqual([
      "2026-01-31",
      "2026-03-28",
    ]);
  });

  it("does not bring them back through a merge or an export", () => {
    const current = parseDiary(stored);
    const merged = mergeDiaries(current, parseImportedFile(JSON.stringify(stored)), "en");
    expect(Object.keys(merged.days).sort()).toEqual(["2026-01-05", "2026-02-10"]);
    expect(diaryToCsv(merged)).not.toContain("2026-02-30");
  });
});

describe("calendar labels west of UTC", () => {
  it("starts a Monday-first header on Monday", () => {
    expect(weekdayLabels("en", 1)).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
    expect(weekdayLabels("es", 1)).toEqual(["L", "M", "X", "J", "V", "S", "D"]);
  });

  it("starts a Sunday-first header on Sunday", () => {
    expect(weekdayLabels("en", 0)).toEqual(["S", "M", "T", "W", "T", "F", "S"]);
  });

  it("puts each day under its own weekday", () => {
    // 1 December 2026 is a Tuesday: the second column of a Monday-first grid.
    const cells = monthCells(2026, 12, 1);
    expect(cells.indexOf("2026-12-01")).toBe(1);
    expect(weekdayLabels("en", 1)[1]).toBe("T");
    expect(formatIsoUtc("2026-12-01", "en", { weekday: "short" })).toBe("Tue");
  });

  it("shows forecast card dates on their own day", () => {
    // forecast-card.tsx formats every date with formatForecastDate.
    expect(formatForecastDate("2026-12-05", "en")).toBe("Sat, Dec 5");
    expect(formatForecastDate("2026-03-08", "es")).toBe("dom, 8 mar");
    // Around the US daylight saving change, and on New Year's Eve.
    expect(formatForecastDate("2026-11-01", "en")).toBe("Sun, Nov 1");
    expect(formatForecastDate("2026-12-31", "en")).toBe("Thu, Dec 31");
  });
});
