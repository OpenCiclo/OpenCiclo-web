// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { parseDiary, type CustomSymptomDefinition, type SymptomMap } from "@/lib/diary";
import {
  PREGNANCY_CATEGORY_ORDER,
  PREGNANCY_LEAD_IDS,
  isPregnancyEntry,
  pickerCatalog,
  resolveSymptomCatalog,
  visibleSymptomCatalog,
} from "@/lib/symptoms/catalog";
import {
  pregnancyQuickCatalog,
  quickSymptomCatalog,
  quickSymptomCatalogFromIds,
  removeCustomSymptom,
  toggleFavoriteSymptom,
  toggleLoggedSymptom,
} from "@/lib/symptoms/selection";

const catalog = resolveSymptomCatalog();

describe("symptom selection", () => {
  it("keeps one value in single-choice groups", () => {
    const high = toggleLoggedSymptom({}, "highLibido", catalog);
    const low = toggleLoggedSymptom(high, "lowLibido", catalog);
    expect(low).toEqual({ lowLibido: "present" });

    const positive = toggleLoggedSymptom({}, "pregnancyTestPositive", catalog);
    const negative = toggleLoggedSymptom(positive, "pregnancyTestNegative", catalog);
    expect(negative).toEqual({ pregnancyTestNegative: "present" });
  });

  it("clears contradictory none options while preserving multiple positive options", () => {
    let selected: SymptomMap = {};
    selected = toggleLoggedSymptom(selected, "protectedSex", catalog);
    selected = toggleLoggedSymptom(selected, "orgasm", catalog);
    expect(selected).toEqual({ protectedSex: "present", orgasm: "present" });

    selected = toggleLoggedSymptom(selected, "didntHaveSex", catalog);
    expect(selected).toEqual({ didntHaveSex: "present" });

    selected = toggleLoggedSymptom(selected, "unprotectedSex", catalog);
    expect(selected).toEqual({ unprotectedSex: "present" });
  });

  it("makes everything-fine exclusive with general symptoms", () => {
    const cramps = toggleLoggedSymptom({}, "cramps", catalog);
    const fine = toggleLoggedSymptom(cramps, "everythingFine", catalog);
    expect(fine).toEqual({ everythingFine: "present" });
    expect(toggleLoggedSymptom(fine, "headache", catalog)).toEqual({
      headache: "present",
    });
  });

  it("shows favorites and selected custom tags in the quick list", () => {
    const custom: CustomSymptomDefinition = {
      id: "custom-migraine1",
      label: "Migraine",
      emoji: "🌩️",
      category: "custom",
    };
    const withCustom = resolveSymptomCatalog([custom]);
    const favorites = toggleFavoriteSymptom([], "cramps", withCustom);
    const quick = quickSymptomCatalog(
      withCustom,
      favorites,
      { "custom-migraine1": "present" },
    );
    expect(quick.map((item) => item.id)).toEqual(["cramps", "custom-migraine1"]);
  });

  it("keeps active non-favorite filters in the quick catalog", () => {
    const custom: CustomSymptomDefinition = {
      id: "custom-migraine1",
      label: "Migraine",
      emoji: "🌩️",
      category: "custom",
    };
    const withCustom = resolveSymptomCatalog([custom]);
    const favorites = toggleFavoriteSymptom(["cramps"], "headache", withCustom);
    const quick = quickSymptomCatalogFromIds(withCustom, favorites, [
      "custom-migraine1",
      "headache",
    ]);
    expect(quick.map((item) => item.id)).toEqual([
      "cramps",
      "headache",
      "custom-migraine1",
    ]);
  });

  it("removes a custom symptom from the catalog, favorites, and the current day", () => {
    const custom: CustomSymptomDefinition = {
      id: "custom-migraine1",
      label: "Migraine",
      emoji: "🌩️",
      category: "custom",
    };
    const next = removeCustomSymptom("custom-migraine1", {
      customSymptoms: [custom],
      favoriteSymptomIds: ["cramps", "custom-migraine1"],
      symptoms: { cramps: "present", "custom-migraine1": "present" },
    });
    expect(next.customSymptoms).toEqual([]);
    expect(next.favoriteSymptomIds).toEqual(["cramps"]);
    expect(next.symptoms).toEqual({ cramps: "present" });
  });

  it("drops logs of a deleted custom symptom when the diary is saved", () => {
    const diary = parseDiary({
      schemaVersion: 6,
      locale: "en",
      periodStarts: [],
      customSymptoms: [
        { id: "custom-migraine1", label: "Migraine", emoji: "🌩️", category: "custom" },
      ],
      favoriteSymptomIds: ["custom-migraine1"],
      days: {
        "2026-08-10": { symptoms: { "custom-migraine1": "present", cramps: "present" } },
      },
    });
    const next = removeCustomSymptom("custom-migraine1", {
      customSymptoms: diary.customSymptoms,
      favoriteSymptomIds: diary.favoriteSymptomIds,
      symptoms: diary.days["2026-08-10"]?.symptoms ?? {},
    });
    const saved = parseDiary({
      ...diary,
      customSymptoms: next.customSymptoms,
      favoriteSymptomIds: next.favoriteSymptomIds,
    });
    expect(saved.customSymptoms).toEqual([]);
    expect(saved.days["2026-08-10"]?.symptoms).toEqual({ cramps: "present" });
  });
});

describe("pregnancy symptoms in the pickers", () => {
  const visible = visibleSymptomCatalog();
  const ids = (items: readonly { id: string }[]) => items.map((item) => item.id);

  it("has twelve entries in its own group, none in a none-group", () => {
    const group = catalog.filter((item) => item.category === "pregnancy");
    expect(group).toHaveLength(12);
    expect(group.every((item) => isPregnancyEntry(item.id) && !item.noneGroup && !item.exclusiveGroup)).toBe(true);
    // "Everything fine" does not clear them.
    let selected: SymptomMap = toggleLoggedSymptom({}, "heartburn", catalog);
    selected = toggleLoggedSymptom(selected, "everythingFine", catalog);
    expect(selected).toEqual({ heartburn: "present", everythingFine: "present" });
  });

  it("leads with the short set of 8 in its order, baby movement only from 16 weeks", () => {
    expect(PREGNANCY_LEAD_IDS).toHaveLength(8);
    const early = pregnancyQuickCatalog(catalog, ["cramps"], {}, { movement: false });
    expect(ids(early.lead)).toEqual(PREGNANCY_LEAD_IDS.slice(1));
    const later = pregnancyQuickCatalog(catalog, ["cramps"], {}, { movement: true });
    expect(ids(later.lead)).toEqual([...PREGNANCY_LEAD_IDS]);
  });

  it("then her favourites, then what is logged, never twice", () => {
    const { lead, rest } = pregnancyQuickCatalog(
      catalog,
      ["fatigue", "headache", "cramps"],
      { nausea: "present", dizziness: "present", travel: "present", cramps: "present" },
      { movement: true },
    );
    expect(ids(rest)).toEqual(["cramps", "headache", "travel", "dizziness"]);
    expect(ids(lead).filter((id) => ids(rest).includes(id))).toEqual([]);
  });

  it("offers the group only on days inside a pregnancy, and anything logged always", () => {
    const outside = pickerCatalog(visible, {}, { pregnancy: false, movement: false, hideCycleOnly: false });
    expect(outside.some((item) => item.category === "pregnancy")).toBe(false);
    expect(ids(outside)).toContain("ovulationTestPositive");
    const logged = pickerCatalog(visible, { heartburn: "present" }, { pregnancy: false, movement: false, hideCycleOnly: false });
    expect(ids(logged.filter((item) => item.category === "pregnancy"))).toEqual(["heartburn"]);
  });

  it("inside a pregnancy, leaves out ovulation tests and the pill unless logged that day", () => {
    const early = pickerCatalog(visible, {}, { pregnancy: true, movement: false, hideCycleOnly: true });
    expect(ids(early)).not.toContain("babyMovement");
    expect(ids(early)).toContain("heartburn");
    expect(early.some((item) => item.category === "ovulationTest" || item.category === "oralContraceptives")).toBe(false);
    expect(ids(early)).toContain("pregnancyTestPositive");
    const logged = pickerCatalog(visible, { ocTakenOnTime: "present" }, { pregnancy: true, movement: true, hideCycleOnly: true });
    expect(ids(logged)).toContain("ocTakenOnTime");
    expect(ids(logged)).not.toContain("ocYesterdaysPill");
    expect(ids(logged)).toContain("babyMovement");
    expect(PREGNANCY_CATEGORY_ORDER[0]).toBe("pregnancy");
  });

  it("keeps favourites a filtered catalog does not list", () => {
    const filtered = pickerCatalog(visible, {}, { pregnancy: true, movement: true, hideCycleOnly: true });
    const favorites = toggleFavoriteSymptom(["ovulationTestPositive", "cramps"], "headache", filtered);
    expect(favorites).toEqual(["cramps", "headache", "ovulationTestPositive"]);
    expect(toggleFavoriteSymptom(favorites, "cramps", filtered)).toEqual(["headache", "ovulationTestPositive"]);
  });
});
