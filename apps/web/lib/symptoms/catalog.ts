// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import {
  Activity,
  Apple,
  Baby,
  CircleDot,
  Dumbbell,
  HeartHandshake,
  HeartPulse,
  Pill,
  Smile,
  Sparkles,
  Tags,
  Waves,
  type LucideIcon,
} from "lucide-react";

import type { Messages } from "@/lib/i18n";
import {
  BUILT_IN_SYMPTOM_IDS,
  SYMPTOM_CATEGORIES,
  type BuiltInSymptomId,
  type CustomSymptomDefinition,
  type SymptomCategory,
  type SymptomId,
} from "@/lib/symptoms/definitions";

export type SymptomMeta = {
  id: SymptomId;
  category: SymptomCategory | "custom";
  icon: LucideIcon;
  labelKey?: keyof Messages;
  label?: string;
  emoji?: string;
  color: string;
  exclusiveGroup?: string;
  noneGroup?: string;
  noneRole?: boolean;
  hiddenFromPicker?: boolean;
};

const CATEGORY_STYLE: Record<
  SymptomCategory | "custom",
  { icon: LucideIcon; color: string; labelKey: keyof Messages }
> = {
  sexAndSexDrive: { icon: HeartHandshake, color: "oklch(0.58 0.17 350)", labelKey: "symptomCategorySex" },
  mood: { icon: Smile, color: "oklch(0.6 0.14 145)", labelKey: "symptomCategoryMood" },
  symptoms: { icon: Activity, color: "oklch(0.62 0.18 25)", labelKey: "symptomCategorySymptoms" },
  vaginalDischarge: { icon: Waves, color: "oklch(0.62 0.12 200)", labelKey: "symptomCategoryDischarge" },
  digestionAndStool: { icon: Apple, color: "oklch(0.64 0.14 85)", labelKey: "symptomCategoryDigestion" },
  pregnancy: { icon: HeartPulse, color: "oklch(0.55 0.11 285)", labelKey: "symptomCategoryPregnancy" },
  pregnancyTest: { icon: Baby, color: "oklch(0.65 0.15 15)", labelKey: "symptomCategoryPregnancyTest" },
  ovulationTest: { icon: CircleDot, color: "oklch(0.68 0.16 45)", labelKey: "symptomCategoryOvulationTest" },
  other: { icon: Sparkles, color: "oklch(0.55 0.14 280)", labelKey: "symptomCategoryOther" },
  physicalActivity: { icon: Dumbbell, color: "oklch(0.58 0.14 155)", labelKey: "symptomCategoryPhysicalActivity" },
  oralContraceptives: { icon: Pill, color: "oklch(0.55 0.13 310)", labelKey: "symptomCategoryOralContraceptives" },
  otherPills: { icon: Pill, color: "oklch(0.6 0.1 245)", labelKey: "symptomCategoryOtherPills" },
  custom: { icon: Tags, color: "oklch(0.62 0.11 290)", labelKey: "symptomCategoryCustom" },
};

function builtIn(
  id: BuiltInSymptomId,
  category: SymptomCategory,
  labelKey: keyof Messages,
  rules: Pick<SymptomMeta, "exclusiveGroup" | "noneGroup" | "noneRole" | "hiddenFromPicker"> = {},
): SymptomMeta {
  return { ...CATEGORY_STYLE[category], id, category, labelKey, ...rules };
}

export const SYMPTOM_CATALOG: SymptomMeta[] = [
  builtIn("didntHaveSex", "sexAndSexDrive", "symptomDidntHaveSex", { noneGroup: "sexualActivity", noneRole: true }),
  builtIn("sexualActivity", "sexAndSexDrive", "symptomSexualActivity", { noneGroup: "sexualActivity" }),
  builtIn("protectedSex", "sexAndSexDrive", "symptomProtectedSex", { noneGroup: "sexualActivity" }),
  builtIn("unprotectedSex", "sexAndSexDrive", "symptomUnprotectedSex", { noneGroup: "sexualActivity" }),
  builtIn("oralSex", "sexAndSexDrive", "symptomOralSex", { noneGroup: "sexualActivity" }),
  builtIn("analSex", "sexAndSexDrive", "symptomAnalSex", { noneGroup: "sexualActivity" }),
  builtIn("masturbation", "sexAndSexDrive", "symptomMasturbation", { noneGroup: "sexualActivity" }),
  builtIn("sensualTouch", "sexAndSexDrive", "symptomSensualTouch", { noneGroup: "sexualActivity" }),
  builtIn("sexToys", "sexAndSexDrive", "symptomSexToys", { noneGroup: "sexualActivity" }),
  builtIn("orgasm", "sexAndSexDrive", "symptomOrgasm", {
    exclusiveGroup: "orgasm",
    noneGroup: "sexualActivity",
  }),
  builtIn("noOrgasm", "sexAndSexDrive", "symptomNoOrgasm", {
    exclusiveGroup: "orgasm",
    noneGroup: "sexualActivity",
  }),
  builtIn("highLibido", "sexAndSexDrive", "symptomHighLibido", { exclusiveGroup: "libido" }),
  builtIn("neutralLibido", "sexAndSexDrive", "symptomNeutralLibido", { exclusiveGroup: "libido" }),
  builtIn("lowLibido", "sexAndSexDrive", "symptomLowLibido", { exclusiveGroup: "libido" }),

  builtIn("calm", "mood", "symptomCalm"),
  builtIn("happy", "mood", "symptomHappy"),
  builtIn("energetic", "mood", "symptomEnergetic"),
  builtIn("frisky", "mood", "symptomFrisky"),
  builtIn("moodSwings", "mood", "symptomMoodSwings"),
  builtIn("irritated", "mood", "symptomIrritated"),
  builtIn("sad", "mood", "symptomSad"),
  builtIn("anxious", "mood", "symptomAnxious"),
  builtIn("depressed", "mood", "symptomDepressed"),
  builtIn("feelingGuilty", "mood", "symptomFeelingGuilty"),
  builtIn("obsessiveThoughts", "mood", "symptomObsessiveThoughts"),
  builtIn("lowEnergy", "mood", "symptomLowEnergy"),
  builtIn("apathetic", "mood", "symptomApathetic"),
  builtIn("confused", "mood", "symptomConfused"),
  builtIn("verySelfCritical", "mood", "symptomVerySelfCritical"),

  builtIn("everythingFine", "symptoms", "symptomEverythingFine", { noneGroup: "generalSymptoms", noneRole: true }),
  builtIn("cramps", "symptoms", "symptomCramps", { noneGroup: "generalSymptoms" }),
  builtIn("tenderBreasts", "symptoms", "symptomTenderBreasts", { noneGroup: "generalSymptoms" }),
  builtIn("headache", "symptoms", "symptomHeadache", { noneGroup: "generalSymptoms" }),
  builtIn("acne", "symptoms", "symptomAcne", { noneGroup: "generalSymptoms" }),
  builtIn("backache", "symptoms", "symptomBackache", { noneGroup: "generalSymptoms" }),
  builtIn("fatigue", "symptoms", "symptomFatigue", { noneGroup: "generalSymptoms" }),
  builtIn("cravings", "symptoms", "symptomCravings", { noneGroup: "generalSymptoms" }),
  builtIn("insomnia", "symptoms", "symptomInsomnia", { noneGroup: "generalSymptoms" }),
  builtIn("abdominalPain", "symptoms", "symptomAbdominalPain", { noneGroup: "generalSymptoms" }),
  builtIn("vaginalItching", "symptoms", "symptomVaginalItching", { noneGroup: "generalSymptoms" }),
  builtIn("vaginalDryness", "symptoms", "symptomVaginalDryness", { noneGroup: "generalSymptoms" }),
  builtIn("uti", "symptoms", "symptomUti", { noneGroup: "generalSymptoms" }),
  builtIn("hotFlashes", "symptoms", "symptomHotFlashes", { noneGroup: "generalSymptoms" }),
  builtIn("nightSweats", "symptoms", "symptomNightSweats", { noneGroup: "generalSymptoms" }),
  builtIn("jointPain", "symptoms", "symptomJointPain", { noneGroup: "generalSymptoms" }),
  builtIn("brainFog", "symptoms", "symptomBrainFog", { noneGroup: "generalSymptoms" }),
  builtIn("drySkin", "symptoms", "symptomDrySkin", { noneGroup: "generalSymptoms" }),
  builtIn("dryEyes", "symptoms", "symptomDryEyes", { noneGroup: "generalSymptoms" }),
  builtIn("intermenstrualBleeding", "symptoms", "symptomIntermenstrualBleeding", {
    noneGroup: "generalSymptoms",
  }),

  builtIn("noDischarge", "vaginalDischarge", "symptomNoDischarge", { noneGroup: "discharge", noneRole: true }),
  builtIn("dischargeCreamy", "vaginalDischarge", "symptomDischargeCreamy", { noneGroup: "discharge" }),
  builtIn("dischargeWatery", "vaginalDischarge", "symptomDischargeWatery", { noneGroup: "discharge" }),
  builtIn("dischargeSticky", "vaginalDischarge", "symptomDischargeSticky", { noneGroup: "discharge" }),
  builtIn("dischargeEggWhite", "vaginalDischarge", "symptomDischargeEggWhite", { noneGroup: "discharge" }),
  builtIn("dischargeSpotting", "vaginalDischarge", "symptomDischargeSpotting", { noneGroup: "discharge" }),
  builtIn("dischargeUnusual", "vaginalDischarge", "symptomDischargeUnusual", { noneGroup: "discharge" }),
  builtIn("dischargeClumpyWhite", "vaginalDischarge", "symptomDischargeClumpyWhite", { noneGroup: "discharge" }),
  builtIn("dischargeGray", "vaginalDischarge", "symptomDischargeGray", { noneGroup: "discharge" }),

  builtIn("nausea", "digestionAndStool", "symptomNausea"),
  builtIn("bloating", "digestionAndStool", "symptomBloating"),
  builtIn("constipation", "digestionAndStool", "symptomConstipation"),
  builtIn("diarrhea", "digestionAndStool", "symptomDiarrhea"),

  builtIn("pregnancyTestNotTaken", "pregnancyTest", "symptomPregnancyTestNotTaken", { exclusiveGroup: "pregnancyTest" }),
  builtIn("pregnancyTestPositive", "pregnancyTest", "symptomPregnancyTestPositive", { exclusiveGroup: "pregnancyTest" }),
  builtIn("pregnancyTestNegative", "pregnancyTest", "symptomPregnancyTestNegative", { exclusiveGroup: "pregnancyTest" }),
  builtIn("pregnancyTestFaintLine", "pregnancyTest", "symptomPregnancyTestFaintLine", { exclusiveGroup: "pregnancyTest" }),

  builtIn("ovulationTestNotTaken", "ovulationTest", "symptomOvulationTestNotTaken", { exclusiveGroup: "ovulationTest" }),
  builtIn("ovulationTestPositive", "ovulationTest", "symptomOvulationTestPositive", { exclusiveGroup: "ovulationTest" }),
  builtIn("ovulationTestNegative", "ovulationTest", "symptomOvulationTestNegative", { exclusiveGroup: "ovulationTest" }),
  builtIn("ovulationMyMethod", "ovulationTest", "symptomOvulationMyMethod", { exclusiveGroup: "ovulationTest" }),

  builtIn("travel", "other", "symptomTravel"),
  builtIn("stress", "other", "symptomStress"),
  builtIn("meditation", "other", "symptomMeditation"),
  builtIn("journaling", "other", "symptomJournaling"),
  builtIn("kegelExercises", "other", "symptomKegelExercises"),
  builtIn("breathingExercises", "other", "symptomBreathingExercises"),
  builtIn("diseaseOrInjury", "other", "symptomDiseaseOrInjury"),
  builtIn("alcohol", "other", "symptomAlcohol"),

  builtIn("didntExercise", "physicalActivity", "symptomDidntExercise", { noneGroup: "exercise", noneRole: true }),
  builtIn("yoga", "physicalActivity", "symptomYoga", { noneGroup: "exercise" }),
  builtIn("gym", "physicalActivity", "symptomGym", { noneGroup: "exercise" }),
  builtIn("aerobicsDancing", "physicalActivity", "symptomAerobicsDancing", { noneGroup: "exercise" }),
  builtIn("swimming", "physicalActivity", "symptomSwimming", { noneGroup: "exercise" }),
  builtIn("teamSports", "physicalActivity", "symptomTeamSports", { noneGroup: "exercise" }),
  builtIn("running", "physicalActivity", "symptomRunning", { noneGroup: "exercise" }),
  builtIn("cycling", "physicalActivity", "symptomCycling", { noneGroup: "exercise" }),
  builtIn("walking", "physicalActivity", "symptomWalking", { noneGroup: "exercise" }),

  builtIn("ocTakenOnTime", "oralContraceptives", "symptomOcTakenOnTime", { exclusiveGroup: "oralContraceptives" }),
  builtIn("ocYesterdaysPill", "oralContraceptives", "symptomOcYesterdaysPill", { exclusiveGroup: "oralContraceptives" }),

  // Offered only on days inside a pregnancy (`pickerCatalog`). No none-group:
  // "Everything fine" belongs to "Symptoms" and must not clear these.
  builtIn("babyMovement", "pregnancy", "symptomBabyMovement"),
  builtIn("heartburn", "pregnancy", "symptomHeartburn"),
  builtIn("vomiting", "pregnancy", "symptomVomiting"),
  builtIn("frequentUrination", "pregnancy", "symptomFrequentUrination"),
  builtIn("swelling", "pregnancy", "symptomSwelling"),
  builtIn("braxtonHicks", "pregnancy", "symptomBraxtonHicks"),
  builtIn("pelvicPain", "pregnancy", "symptomPelvicPain"),
  builtIn("legCramps", "pregnancy", "symptomLegCramps"),
  builtIn("shortOfBreath", "pregnancy", "symptomShortOfBreath"),
  builtIn("dizziness", "pregnancy", "symptomDizziness"),
  builtIn("foodAversions", "pregnancy", "symptomFoodAversions"),
  builtIn("smellSensitivity", "pregnancy", "symptomSmellSensitivity"),
];

if (SYMPTOM_CATALOG.length !== BUILT_IN_SYMPTOM_IDS.length) {
  throw new Error("The symptom catalog and built-in IDs are out of sync");
}

const SEX_ENTRY_IDS: ReadonlySet<SymptomId> = new Set(
  SYMPTOM_CATALOG.filter((item) => item.category === "sexAndSexDrive").map((item) => item.id),
);

/**
 * Whether `id` is in "Sex and sex drive". Those are logged like symptoms, but
 * sex is not a symptom: Patterns lists them apart and no text calls them one.
 */
export function isSexEntry(id: SymptomId): boolean {
  return SEX_ENTRY_IDS.has(id);
}

const PREGNANCY_ENTRY_IDS: ReadonlySet<SymptomId> = new Set(
  SYMPTOM_CATALOG.filter((item) => item.category === "pregnancy").map((item) => item.id),
);

/**
 * Whether `id` is in the "Pregnancy" group. Offered only on days inside a
 * pregnancy, never ranked among a cycle's recurring symptoms, and removed from
 * its days when that pregnancy is deleted.
 */
export function isPregnancyEntry(id: SymptomId): boolean {
  return PREGNANCY_ENTRY_IDS.has(id);
}

/** "Felt the baby move": a plain daily mark, not counted and not ranked as a symptom. */
export const BABY_MOVEMENT_ID = "babyMovement" as const satisfies BuiltInSymptomId;

/**
 * The short set the day sheet leads with on a day inside a pregnancy, in this
 * order (most often reported in pregnancy: Foxcroft et al. 2013). Baby movement
 * only when `pregnancyDay(...).movement` says so.
 */
export const PREGNANCY_LEAD_IDS = [
  BABY_MOVEMENT_ID,
  "nausea",
  "fatigue",
  "heartburn",
  "backache",
  "insomnia",
  "frequentUrination",
  "swelling",
] as const satisfies readonly BuiltInSymptomId[];

/** Groups that are about a cycle, left out of "More symptoms" during a pregnancy unless logged that day. */
const CYCLE_ONLY_CATEGORIES: ReadonlySet<SymptomCategory | "custom"> = new Set(["ovulationTest", "oralContraceptives"]);

export const SYMPTOM_CATEGORY_ORDER = [
  "custom",
  ...SYMPTOM_CATEGORIES,
] as const satisfies readonly (SymptomCategory | "custom")[];

/** "More symptoms" on a day inside a pregnancy: the Pregnancy group first. */
export const PREGNANCY_CATEGORY_ORDER = [
  "pregnancy",
  ...SYMPTOM_CATEGORY_ORDER.filter((category) => category !== "pregnancy"),
] as const satisfies readonly (SymptomCategory | "custom")[];

export type PickerOptions = {
  /** The day is inside a pregnancy (`pregnancyDay` is not null): the Pregnancy group is offered. */
  pregnancy: boolean;
  /** "Felt the baby move" is offered (from 16 weeks, while the pregnancy goes on). */
  movement: boolean;
  /** Leave out ovulation tests and oral contraceptives (a day inside a pregnancy). */
  hideCycleOnly: boolean;
};

/**
 * What a symptom picker offers on one day: the Pregnancy group only on days
 * inside a pregnancy, and the cycle-only groups only outside one. Whatever is
 * logged that day (`selected`) always shows, whatever the day.
 */
export function pickerCatalog(
  catalog: readonly SymptomMeta[],
  selected: Partial<Record<SymptomId, unknown>>,
  options: PickerOptions,
): SymptomMeta[] {
  return catalog.filter((item) => {
    if (selected[item.id]) return true;
    if (item.category === "pregnancy") {
      return options.pregnancy && (item.id !== BABY_MOVEMENT_ID || options.movement);
    }
    if (options.hideCycleOnly && CYCLE_ONLY_CATEGORIES.has(item.category)) return false;
    return true;
  });
}

export function resolveSymptomCatalog(customSymptoms: readonly CustomSymptomDefinition[] = []): SymptomMeta[] {
  return [
    ...SYMPTOM_CATALOG,
    ...customSymptoms.map((item): SymptomMeta => {
      const category = item.category;
      return {
        id: item.id,
        category,
        icon: CATEGORY_STYLE[category].icon,
        color: colorForCustomId(item.id),
        label: item.label,
        emoji: item.emoji,
      };
    }),
  ];
}

export function visibleSymptomCatalog(
  customSymptoms: readonly CustomSymptomDefinition[] = [],
): SymptomMeta[] {
  return resolveSymptomCatalog(customSymptoms).filter((item) => !item.hiddenFromPicker);
}

export function symptomLabel(item: SymptomMeta, t: Messages): string {
  if (item.labelKey) return String(t[item.labelKey]);
  return item.label ?? item.id;
}

export function symptomCategoryLabel(
  category: SymptomCategory | "custom",
  t: Messages,
): string {
  return String(t[CATEGORY_STYLE[category].labelKey]);
}

export function symptomMeta(
  id: SymptomId,
  customSymptoms: readonly CustomSymptomDefinition[] = [],
): SymptomMeta {
  const found = resolveSymptomCatalog(customSymptoms).find((item) => item.id === id);
  if (!found) throw new Error(`Unknown symptom ${id}`);
  return found;
}

export function findSymptomMeta(
  id: SymptomId,
  customSymptoms: readonly CustomSymptomDefinition[] = [],
): SymptomMeta | undefined {
  return resolveSymptomCatalog(customSymptoms).find((item) => item.id === id);
}

export function symptomColor(
  id: SymptomId,
  customSymptoms: readonly CustomSymptomDefinition[] = [],
): string {
  return symptomMeta(id, customSymptoms).color;
}

function colorForCustomId(id: string): string {
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  const hues = [25, 85, 145, 200, 250, 300, 350];
  return `oklch(0.62 0.13 ${hues[hash % hues.length]})`;
}

export { BUILT_IN_SYMPTOM_IDS as SYMPTOM_IDS };
