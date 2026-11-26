// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { DIARY_SCHEMA_VERSION, NewerDiaryError, emptyDiary, type Diary } from "@/lib/diary";
import { diaryToCsv, diaryToJson, parseImportedFile } from "@/lib/diary-io";

const diary: Diary = {
  ...emptyDiary("en"),
  customSymptoms: [{ id: "custom-0a1b2c3d", label: "Jaw pain", emoji: "", category: "custom" }],
  days: {
    "2026-03-01": { flow: "medium", symptoms: { cramps: "mild", "custom-0a1b2c3d": "present" }, note: "first line\nsecond line, with a comma" },
    "2026-03-02": { flow: "light", symptoms: {}, note: 'she said "rest"' },
    "2026-03-20": { cervicalMucus: "eggwhite", symptoms: { headache: "severe" } },
  },
  periodStarts: ["2026-03-01"],
};

describe("CSV backups", () => {
  it("round-trip notes with line breaks, quotes and commas, and custom symptoms", () => {
    const back = parseImportedFile(diaryToCsv(diary));
    expect(back.days).toEqual(diary.days);
    expect(back.customSymptoms).toEqual(diary.customSymptoms);
    expect(back.periodStarts).toEqual(["2026-03-01"]);
  });

  it("say which format version wrote them", () => {
    const simple: Diary = { ...emptyDiary("en"), days: { "2026-03-02": { flow: "light", symptoms: {} } } };
    const [header, firstRow] = diaryToCsv(simple).split("\n");
    expect(header.endsWith(",schemaVersion")).toBe(true);
    expect(firstRow.endsWith(`,${DIARY_SCHEMA_VERSION}`)).toBe(true);
    expect(diaryToCsv(emptyDiary("en")).split("\n")[1].endsWith(`,${DIARY_SCHEMA_VERSION}`)).toBe(true);
  });

  it("are refused when a newer build wrote them, like JSON", () => {
    const newer = diaryToCsv(diary).replace(`,${DIARY_SCHEMA_VERSION}\n`, `,${DIARY_SCHEMA_VERSION + 1}\n`);
    expect(() => parseImportedFile(newer)).toThrow(NewerDiaryError);
    const newerJson = diaryToJson({ ...diary, schemaVersion: DIARY_SCHEMA_VERSION + 1 });
    expect(() => parseImportedFile(newerJson)).toThrow(NewerDiaryError);
  });

  it("still read files exported before the version column existed", () => {
    const old = [
      "date,flow,cervicalMucus,symptoms,cramps,headache,note,periodStart,customSymptoms,favoriteSymptomIds",
      "2026-03-01,medium,,cramps:mild,mild,,,1,[],cramps",
      "2026-03-02,light,,,,,,,,",
      "",
    ].join("\n");
    const back = parseImportedFile(old);
    expect(Object.keys(back.days)).toEqual(["2026-03-01", "2026-03-02"]);
    expect(back.periodStarts).toEqual(["2026-03-01"]);
  });

  it("keep reading after a stray quote in an unquoted cell from another app", () => {
    const other = [
      "date,flow,note",
      '2026-03-01,medium,5" tall today',
      "2026-03-02,light,",
      "2026-03-03,light,ok",
      "",
    ].join("\n");
    const back = parseImportedFile(other);
    expect(Object.keys(back.days)).toEqual(["2026-03-01", "2026-03-02", "2026-03-03"]);
    expect(back.days["2026-03-01"].note).toBe('5" tall today');
  });

  it("round-trip a lone carriage return in a note without losing the rows after it", () => {
    const withCr: Diary = {
      ...diary,
      days: { ...diary.days, "2026-03-01": { ...diary.days["2026-03-01"], note: "a\rb" } },
    };
    const back = parseImportedFile(diaryToCsv(withCr));
    expect(back.days["2026-03-01"].note).toBe("a\rb");
    expect(back.customSymptoms).toEqual(diary.customSymptoms);
    const newer = diaryToCsv(withCr).replace(`,${DIARY_SCHEMA_VERSION}\n`, `,${DIARY_SCHEMA_VERSION + 1}\n`);
    expect(() => parseImportedFile(newer)).toThrow(NewerDiaryError);
  });

  it("accept Windows line endings", () => {
    const back = parseImportedFile(diaryToCsv(diary).replaceAll("\n", "\r\n"));
    expect(Object.keys(back.days).sort()).toEqual(Object.keys(diary.days).sort());
  });
});

describe("Pregnancy entries in backups", () => {
  it("round-trip through CSV and JSON", () => {
    const withPregnancy: Diary = {
      ...emptyDiary("en"),
      days: {
        "2026-08-01": { symptoms: { babyMovement: "present", heartburn: "mild", smellSensitivity: "present" } },
      },
    };
    expect(parseImportedFile(diaryToCsv(withPregnancy)).days).toEqual(withPregnancy.days);
    expect(parseImportedFile(diaryToJson(withPregnancy)).days).toEqual(withPregnancy.days);
  });
});
