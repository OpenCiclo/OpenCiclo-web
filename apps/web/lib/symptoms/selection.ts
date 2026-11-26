// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { CustomSymptomDefinition, SymptomId, SymptomMap } from "@/lib/diary";
import { BABY_MOVEMENT_ID, PREGNANCY_LEAD_IDS, type SymptomMeta } from "@/lib/symptoms/catalog";

export function toggleLoggedSymptom(
  current: SymptomMap,
  id: SymptomId,
  catalog: readonly SymptomMeta[],
): SymptomMap {
  const next = { ...current };
  if (next[id]) {
    delete next[id];
    return next;
  }

  const selected = catalog.find((item) => item.id === id);
  if (selected?.exclusiveGroup) {
    for (const item of catalog) {
      if (item.exclusiveGroup === selected.exclusiveGroup) delete next[item.id];
    }
  }
  if (selected?.noneGroup) {
    for (const item of catalog) {
      if (item.noneGroup !== selected.noneGroup) continue;
      if (selected.noneRole || item.noneRole) delete next[item.id];
    }
  }
  next[id] = "present";
  return next;
}

export function toggleFavoriteSymptom(
  current: readonly SymptomId[],
  id: SymptomId,
  catalog: readonly SymptomMeta[],
): SymptomId[] {
  if (current.includes(id)) return current.filter((item) => item !== id);
  const selected = new Set([...current, id]);
  const known = new Set(catalog.map((item) => item.id));
  // A picker may hand a filtered catalog (a day inside a pregnancy leaves some
  // groups out): favourites it does not list are kept, never dropped.
  return [
    ...catalog.filter((item) => selected.has(item.id)).map((item) => item.id),
    ...current.filter((item) => !known.has(item)),
  ];
}

export function removeCustomSymptom(
  id: SymptomId,
  current: {
    customSymptoms: CustomSymptomDefinition[];
    favoriteSymptomIds: readonly SymptomId[];
    symptoms: SymptomMap;
  },
): {
  customSymptoms: CustomSymptomDefinition[];
  favoriteSymptomIds: SymptomId[];
  symptoms: SymptomMap;
} {
  const customSymptoms = current.customSymptoms.filter((item) => item.id !== id);
  const favoriteSymptomIds = current.favoriteSymptomIds.filter((item) => item !== id);
  const symptoms = { ...current.symptoms };
  delete symptoms[id];
  return { customSymptoms, favoriteSymptomIds, symptoms };
}

export function idsToSymptomMap(ids: readonly SymptomId[]): SymptomMap {
  const selected: SymptomMap = {};
  for (const id of ids) selected[id] = "present";
  return selected;
}

export function quickSymptomCatalog(
  catalog: readonly SymptomMeta[],
  favorites: readonly SymptomId[],
  selected: SymptomMap,
): SymptomMeta[] {
  const visible = new Set<SymptomId>([
    ...favorites,
    ...(Object.keys(selected) as SymptomId[]),
  ]);
  return catalog.filter((item) => visible.has(item.id));
}

/**
 * The quick chips on a day inside a pregnancy: `lead` is the short pregnancy
 * set (PREGNANCY_LEAD_IDS, in that order; baby movement only with `movement`),
 * `rest` her favourites and then whatever else is logged that day, each in
 * catalog order, without the ones already in `lead`.
 */
export function pregnancyQuickCatalog(
  catalog: readonly SymptomMeta[],
  favorites: readonly SymptomId[],
  selected: SymptomMap,
  { movement }: { movement: boolean },
): { lead: SymptomMeta[]; rest: SymptomMeta[] } {
  const byId = new Map(catalog.map((item) => [item.id, item]));
  const lead = PREGNANCY_LEAD_IDS.filter((id) => id !== BABY_MOVEMENT_ID || movement)
    .map((id) => byId.get(id))
    .filter((item): item is SymptomMeta => Boolean(item));
  const inLead = new Set(lead.map((item) => item.id));
  const favorite = new Set(favorites);
  const rest = [
    ...catalog.filter((item) => !inLead.has(item.id) && favorite.has(item.id)),
    ...catalog.filter((item) => !inLead.has(item.id) && !favorite.has(item.id) && Boolean(selected[item.id])),
  ];
  return { lead, rest };
}

export function quickSymptomCatalogFromIds(
  catalog: readonly SymptomMeta[],
  favorites: readonly SymptomId[],
  selectedIds: readonly SymptomId[],
): SymptomMeta[] {
  return quickSymptomCatalog(catalog, favorites, idsToSymptomMap(selectedIds));
}
