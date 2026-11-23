// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  DIARY_SCHEMA_VERSION,
  FLOW_LEVELS,
  MAX_DAILY_NOTE_LENGTH,
  MUCUS_LEVELS,
  NewerDiaryError,
  SYMPTOM_VALUES,
  emptyDayLog,
  emptyDiary,
  parseDiary,
  parseNewerDiaryForDisplay,
} from "@/lib/diary";
import { LOCALES } from "@/lib/i18n";
import { BUILT_IN_SYMPTOM_IDS, CUSTOM_SYMPTOM_CATEGORIES, isCustomSymptomId } from "@/lib/symptoms/definitions";
import { DATING_METHODS, EMBRYO_AGES } from "@/lib/pregnancy/dating";
import {
  BLEED_ANSWERS,
  FRIENDS_PRIVATE_MODES,
  PREGNANCY_OUTCOMES,
  sanitizePregnancy,
} from "@/lib/pregnancy/record";

// What each diary format version can hold. An app build from Google Play only
// knows the version it shipped with: anything added later would be dropped the
// next time that build saved the diary. So adding a field or a value to any of
// these lists needs a new DIARY_SCHEMA_VERSION, which older builds open
// read-only. `parser` is a hash of the code between "diary-format:begin" and
// "diary-format:end" in lib/diary.ts, lib/symptoms/definitions.ts and
// lib/pregnancy/record.ts (comments
// and spacing ignored), which decides what a stored diary keeps: a new day
// field, a longer note, a new setting, a looser custom id all change it. If this test fails after you changed something:
//   1. if a diary written by your build would lose anything when read by the
//      previous build, bump DIARY_SCHEMA_VERSION in lib/diary.ts (and add a
//      migration in parseDiary if old diaries need one), copy the latest entry
//      below to the new version and update it;
//   2. if nothing an older build reads changes (a refactor), update `parser`
//      in the latest entry only, and say so in the commit message.
// Never edit an entry that has shipped, except `parser` under rule 2.
const FORMATS: Record<number, unknown> = {
  6: {
    parser: "8689462883389266",
    maxNoteLength: 200,
    customSymptomIds: {
      "custom-0a1b2c3d": true,
      "custom-0a1b-2c3d-AB": true,
      "custom-12345678": true,
      "custom-1234567": false,
      "custom-short": false,
      "custom-0a1b_2c3d": false,
      "custom-0a1b.2c3d": false,
      "pill-0a1b2c3d": false,
      "custom-3f2504e0-4f89-41d3-9a0c-0305e82c3301": true,
    },
    diaryKeys: [
      "customSymptoms",
      "days",
      "favoriteSymptomIds",
      "forecastingEnabled",
      "locale",
      "periodStarts",
      "poolContributorKey",
      "poolLastSyncedAt",
      "poolOptIn",
      "recoveryEmailSet",
      "schemaVersion",
    ],
    dayKeys: ["cervicalMucus", "flow", "note", "symptoms"],
    flow: ["spotting", "light", "medium", "heavy"],
    mucus: ["dry", "sticky", "creamy", "watery", "eggwhite"],
    symptomValues: ["present", "mild", "moderate", "severe"],
    customSymptomCategories: ["custom", "otherPills"],
    locales: ["es", "en", "pt-BR", "fr", "de", "it", "nl", "pl", "ca", "ca-valencia", "eu", "gl"],
    builtInSymptoms: [
      "didntHaveSex", "protectedSex", "unprotectedSex", "oralSex", "analSex", "masturbation",
      "sensualTouch", "sexToys", "orgasm", "noOrgasm", "highLibido", "neutralLibido", "lowLibido",
      "calm", "happy", "energetic", "frisky", "moodSwings", "irritated", "sad", "anxious",
      "depressed", "feelingGuilty", "obsessiveThoughts", "lowEnergy", "apathetic", "confused",
      "verySelfCritical", "everythingFine", "cramps", "tenderBreasts", "headache", "acne",
      "backache", "fatigue", "cravings", "insomnia", "abdominalPain", "vaginalItching",
      "vaginalDryness", "uti", "hotFlashes", "nightSweats", "jointPain", "brainFog", "drySkin",
      "dryEyes", "intermenstrualBleeding", "noDischarge", "dischargeCreamy", "dischargeWatery",
      "dischargeSticky", "dischargeEggWhite", "dischargeSpotting", "dischargeUnusual",
      "dischargeClumpyWhite", "dischargeGray", "nausea", "bloating", "constipation", "diarrhea",
      "pregnancyTestNotTaken", "pregnancyTestPositive", "pregnancyTestNegative",
      "pregnancyTestFaintLine", "ovulationTestNotTaken", "ovulationTestPositive",
      "ovulationTestNegative", "ovulationMyMethod", "travel", "stress", "meditation", "journaling",
      "kegelExercises", "breathingExercises", "diseaseOrInjury", "alcohol", "didntExercise", "yoga",
      "gym", "aerobicsDancing", "swimming", "teamSports", "running", "cycling", "walking",
      "ocTakenOnTime", "ocYesterdaysPill", "sexualActivity",
    ],
  },
  7: {
    parser: "e51e72051ce6931b",
    maxNoteLength: 200,
    customSymptomIds: {
      "custom-0a1b2c3d": true,
      "custom-0a1b-2c3d-AB": true,
      "custom-12345678": true,
      "custom-1234567": false,
      "custom-short": false,
      "custom-0a1b_2c3d": false,
      "custom-0a1b.2c3d": false,
      "pill-0a1b2c3d": false,
      "custom-3f2504e0-4f89-41d3-9a0c-0305e82c3301": true,
    },
    diaryKeys: [
      "customSymptoms",
      "days",
      "favoriteSymptomIds",
      "forecastingEnabled",
      "locale",
      "periodStarts",
      "poolContributorKey",
      "poolLastSyncedAt",
      "poolOptIn",
      "pregnancies",
      "recoveryEmailSet",
      "schemaVersion",
    ],
    dayKeys: ["cervicalMucus", "flow", "note", "symptoms"],
    flow: ["spotting", "light", "medium", "heavy"],
    mucus: ["dry", "sticky", "creamy", "watery", "eggwhite"],
    symptomValues: ["present", "mild", "moderate", "severe"],
    customSymptomCategories: ["custom", "otherPills"],
    pregnancyKeys: ["bleedAnswers", "dating", "dueDate", "end", "friendsMode", "hidden", "id"],
    pregnancyDatingMethods: ["lmp", "dueDate", "ultrasound", "conception", "transfer"],
    pregnancyOutcomes: ["birth", "ended"],
    pregnancyFriendsModes: ["noNews", "simulated"],
    pregnancyBleedAnswers: ["period", "notPeriod"],
    embryoAges: [3, 5],
    locales: ["es", "en", "pt-BR", "fr", "de", "it", "nl", "pl", "ca", "ca-valencia", "eu", "gl"],
    builtInSymptoms: [
      "didntHaveSex", "protectedSex", "unprotectedSex", "oralSex", "analSex", "masturbation",
      "sensualTouch", "sexToys", "orgasm", "noOrgasm", "highLibido", "neutralLibido", "lowLibido",
      "calm", "happy", "energetic", "frisky", "moodSwings", "irritated", "sad", "anxious",
      "depressed", "feelingGuilty", "obsessiveThoughts", "lowEnergy", "apathetic", "confused",
      "verySelfCritical", "everythingFine", "cramps", "tenderBreasts", "headache", "acne",
      "backache", "fatigue", "cravings", "insomnia", "abdominalPain", "vaginalItching",
      "vaginalDryness", "uti", "hotFlashes", "nightSweats", "jointPain", "brainFog", "drySkin",
      "dryEyes", "intermenstrualBleeding", "noDischarge", "dischargeCreamy", "dischargeWatery",
      "dischargeSticky", "dischargeEggWhite", "dischargeSpotting", "dischargeUnusual",
      "dischargeClumpyWhite", "dischargeGray", "nausea", "bloating", "constipation", "diarrhea",
      "pregnancyTestNotTaken", "pregnancyTestPositive", "pregnancyTestNegative",
      "pregnancyTestFaintLine", "ovulationTestNotTaken", "ovulationTestPositive",
      "ovulationTestNegative", "ovulationMyMethod", "travel", "stress", "meditation", "journaling",
      "kegelExercises", "breathingExercises", "diseaseOrInjury", "alcohol", "didntExercise", "yoga",
      "gym", "aerobicsDancing", "swimming", "teamSports", "running", "cycling", "walking",
      "ocTakenOnTime", "ocYesterdaysPill", "sexualActivity",
    ],
  },
};

// The format code between the diary-format markers in these files, without
// comments and with spacing collapsed, so a reworded comment or a line-ending
// change does not count.
const FORMAT_FILES = ["./diary.ts", "./symptoms/definitions.ts", "./pregnancy/record.ts"];

function parserHash(): string {
  const hash = createHash("sha256");
  for (const file of FORMAT_FILES) {
    const source = readFileSync(fileURLToPath(new URL(file, import.meta.url)), "utf8");
    const begin = source.indexOf("// diary-format:begin");
    const end = source.indexOf("// diary-format:end");
    if (begin < 0 || end < begin) throw new Error(`diary-format markers missing in lib/${file.slice(2)}`);
    const code = source
      .slice(begin, end)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|\s)\/\/[^\n]*/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    hash.update(`${file}\n${code}\n`);
  }
  return hash.digest("hex").slice(0, 16);
}

const SAMPLE_CUSTOM_IDS = [
  "custom-0a1b2c3d",
  "custom-0a1b-2c3d-AB",
  "custom-12345678",
  "custom-1234567",
  "custom-short",
  "custom-0a1b_2c3d",
  "custom-0a1b.2c3d",
  "pill-0a1b2c3d",
  "custom-3f2504e0-4f89-41d3-9a0c-0305e82c3301",
];

function currentFormat(version: number) {
  const fullDay = { ...emptyDayLog(), flow: "light", cervicalMucus: "dry", note: "x" };
  const fullPregnancy = sanitizePregnancy({
    id: "0123456789abcdef",
    dating: { method: "lmp", lmp: "2026-01-10", cycleLength: 29 },
    dueDate: "2026-10-17",
    end: { date: "2026-03-01", outcome: "ended" },
    hidden: true,
    friendsMode: "simulated",
    bleedAnswers: { "2026-04-01": "period" },
  });
  const pregnancy =
    version >= 7
      ? {
          pregnancyKeys: Object.keys(fullPregnancy ?? {}).sort(),
          pregnancyDatingMethods: [...DATING_METHODS],
          pregnancyOutcomes: [...PREGNANCY_OUTCOMES],
          pregnancyFriendsModes: [...FRIENDS_PRIVATE_MODES],
          pregnancyBleedAnswers: [...BLEED_ANSWERS],
          embryoAges: [...EMBRYO_AGES],
        }
      : {};
  const customSymptomIds = Object.fromEntries(SAMPLE_CUSTOM_IDS.map((id) => [id, isCustomSymptomId(id)]));
  return {
    parser: parserHash(),
    maxNoteLength: MAX_DAILY_NOTE_LENGTH,
    customSymptomIds,
    diaryKeys: Object.keys(emptyDiary("en")).sort(),
    dayKeys: Object.keys(fullDay).sort(),
    flow: [...FLOW_LEVELS],
    mucus: [...MUCUS_LEVELS],
    symptomValues: [...SYMPTOM_VALUES],
    customSymptomCategories: [...CUSTOM_SYMPTOM_CATEGORIES],
    ...pregnancy,
    locales: [...LOCALES],
    builtInSymptoms: [...BUILT_IN_SYMPTOM_IDS],
  };
}

describe("diary format version", () => {
  it("matches what this version of the format can hold (bump DIARY_SCHEMA_VERSION when it grows)", () => {
    expect(FORMATS[DIARY_SCHEMA_VERSION], `no entry for DIARY_SCHEMA_VERSION ${DIARY_SCHEMA_VERSION}`).toBeDefined();
    expect(currentFormat(DIARY_SCHEMA_VERSION)).toEqual(FORMATS[DIARY_SCHEMA_VERSION]);
  });

  it("refuses a diary written by a newer build, so it is never saved back without what this build drops", () => {
    const newer = {
      ...emptyDiary("en"),
      schemaVersion: DIARY_SCHEMA_VERSION + 1,
      days: { "2026-03-02": { flow: "light", symptoms: { cramps: "mild", newThing: "present" }, mood: 3 } },
      someNewSetting: true,
    };
    expect(() => parseDiary(newer)).toThrow(NewerDiaryError);
    expect(() => parseDiary(JSON.stringify(newer))).toThrow(NewerDiaryError);
    try {
      parseDiary(newer);
    } catch (error) {
      expect((error as NewerDiaryError).version).toBe(DIARY_SCHEMA_VERSION + 1);
    }
  });

  it("still reads the current and older versions, and diaries that never said one", () => {
    for (const schemaVersion of [undefined, 1, 5, DIARY_SCHEMA_VERSION]) {
      const diary = parseDiary({ ...emptyDiary("en"), schemaVersion, periodStarts: ["2026-03-02"] });
      expect(diary.schemaVersion).toBe(DIARY_SCHEMA_VERSION);
      expect(diary.periodStarts).toEqual(["2026-03-02"]);
    }
  });

  it("shows a newer diary as far as it can, labelled with this build's version so a save is refused", () => {
    const shown = parseNewerDiaryForDisplay({
      ...emptyDiary("en"),
      schemaVersion: DIARY_SCHEMA_VERSION + 3,
      days: { "2026-03-02": { flow: "light", symptoms: { cramps: "mild" } } },
    });
    expect(shown.schemaVersion).toBe(DIARY_SCHEMA_VERSION);
    expect(shown.days["2026-03-02"]).toEqual({ flow: "light", symptoms: { cramps: "mild" } });
    expect(shown.periodStarts).toEqual(["2026-03-02"]);
  });
});
