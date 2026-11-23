// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import {
  DIARY_SCHEMA_VERSION,
  derivePeriodStarts,
  parseDiary,
  type CustomSymptomDefinition,
  type DayLog,
  type Diary,
} from "@/lib/diary";
import type { PregnancyRecord } from "@/lib/pregnancy/record";

// Three-way merge for one diary edited in two places (two devices, or two saves
// in flight on one device).
//   base   — the version both sides started from
//   local  — base plus the edits made here
//   remote — base plus the edits made elsewhere (what the server has now)
// For every day field, symptom, custom symptom, and setting: keep the local
// value if it changed since base, otherwise take the remote one. Deletions
// count as changes, so nothing deleted on one side comes back. When both
// sides changed the same thing, local wins: it is the edit just made here.

// Key order must not matter: two devices can store the same symptoms in a different order.
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}

function same(left: unknown, right: unknown): boolean {
  return stable(left) === stable(right);
}

function pick<T>(base: T, local: T, remote: T): T {
  return same(local, base) ? remote : local;
}

function mergeDay(base?: DayLog, local?: DayLog, remote?: DayLog): DayLog | undefined {
  if (same(local, base)) return remote;
  if (same(remote, base)) return local;
  const symptomIds = new Set([
    ...Object.keys(base?.symptoms ?? {}),
    ...Object.keys(local?.symptoms ?? {}),
    ...Object.keys(remote?.symptoms ?? {}),
  ]);
  const symptoms: Record<string, unknown> = {};
  for (const id of symptomIds) {
    const key = id as keyof DayLog["symptoms"];
    const value = pick(base?.symptoms[key], local?.symptoms[key], remote?.symptoms[key]);
    if (value !== undefined) symptoms[id] = value;
  }
  const flow = pick(base?.flow, local?.flow, remote?.flow);
  const cervicalMucus = pick(base?.cervicalMucus, local?.cervicalMucus, remote?.cervicalMucus);
  const note = pick(base?.note, local?.note, remote?.note);
  return {
    ...(flow ? { flow } : {}),
    ...(cervicalMucus ? { cervicalMucus } : {}),
    symptoms: symptoms as DayLog["symptoms"],
    ...(note ? { note } : {}),
  };
}

function mergeCustomSymptoms(
  base: CustomSymptomDefinition[],
  local: CustomSymptomDefinition[],
  remote: CustomSymptomDefinition[],
): CustomSymptomDefinition[] {
  const byId = (list: CustomSymptomDefinition[]) => new Map(list.map((item) => [item.id, item]));
  const baseById = byId(base);
  const localById = byId(local);
  const remoteById = byId(remote);
  const order = [...remote.map((item) => item.id), ...local.map((item) => item.id)];
  const merged: CustomSymptomDefinition[] = [];
  for (const id of new Set(order)) {
    const item = pick(baseById.get(id), localById.get(id), remoteById.get(id));
    if (item) merged.push(item);
  }
  return merged;
}

/**
 * Pregnancies merge by id, field by field (`pick`), bleed answers by day. A
 * pregnancy deleted on either side stays deleted: "turned it on by mistake" and
 * "delete it completely" must not come back because the other device edited it.
 */
function mergePregnancies(
  base: readonly PregnancyRecord[],
  local: readonly PregnancyRecord[],
  remote: readonly PregnancyRecord[],
): PregnancyRecord[] {
  const byId = (list: readonly PregnancyRecord[]) => new Map(list.map((item) => [item.id, item]));
  const baseById = byId(base);
  const localById = byId(local);
  const remoteById = byId(remote);
  const merged: PregnancyRecord[] = [];
  for (const id of new Set([...remoteById.keys(), ...localById.keys()])) {
    const before = baseById.get(id);
    const mine = localById.get(id);
    const theirs = remoteById.get(id);
    if (before && (!mine || !theirs)) continue;
    if (!mine || !theirs) {
      merged.push((mine ?? theirs) as PregnancyRecord);
      continue;
    }
    if (!before) {
      merged.push(mine);
      continue;
    }
    const days = new Set([
      ...Object.keys(before.bleedAnswers),
      ...Object.keys(mine.bleedAnswers),
      ...Object.keys(theirs.bleedAnswers),
    ]);
    const bleedAnswers: PregnancyRecord["bleedAnswers"] = {};
    for (const day of days) {
      const answer = pick(before.bleedAnswers[day], mine.bleedAnswers[day], theirs.bleedAnswers[day]);
      if (answer) bleedAnswers[day] = answer;
    }
    merged.push({
      id,
      dating: pick(before.dating, mine.dating, theirs.dating),
      dueDate: pick(before.dueDate, mine.dueDate, theirs.dueDate),
      end: pick(before.end, mine.end, theirs.end),
      hidden: pick(before.hidden, mine.hidden, theirs.hidden),
      friendsMode: pick(before.friendsMode, mine.friendsMode, theirs.friendsMode),
      bleedAnswers,
    });
  }
  return onePregnancyGoingOn(merged, localById);
}

/**
 * Only one pregnancy goes on at a time. Each device refuses a second one
 * (`startPregnancy`), but two devices can each turn the mode on before they
 * sync: the same pregnancy, entered twice. The one from this device stays (the
 * edit just made here, as everywhere in this merge); with none from here, the
 * one due last, which is the one the card shows (`activePregnancy`). Otherwise
 * ending or deleting the one on screen would bring the other one up.
 */
function onePregnancyGoingOn(
  merged: PregnancyRecord[],
  localById: ReadonlyMap<string, PregnancyRecord>,
): PregnancyRecord[] {
  const goingOn = merged.filter((item) => !item.end);
  if (goingOn.length < 2) return merged;
  const mine = goingOn.filter((item) => localById.get(item.id)?.end === null);
  const candidates = mine.length > 0 ? mine : goingOn;
  const keep = candidates.reduce((best, item) =>
    item.dueDate > best.dueDate || (item.dueDate === best.dueDate && item.id > best.id) ? item : best,
  );
  return merged.filter((item) => item.end || item.id === keep.id);
}

export function mergeDiaryEdits(base: Diary, local: Diary, remote: Diary): Diary {
  if (same(local, base)) return remote;
  if (same(remote, base)) return local;

  const days: Record<string, DayLog> = {};
  const isos = new Set([...Object.keys(base.days), ...Object.keys(local.days), ...Object.keys(remote.days)]);
  for (const iso of isos) {
    const day = mergeDay(base.days[iso], local.days[iso], remote.days[iso]);
    if (day) days[iso] = day;
  }
  const pregnancies = mergePregnancies(base.pregnancies ?? [], local.pregnancies ?? [], remote.pregnancies ?? []);

  return parseDiary({
    schemaVersion: DIARY_SCHEMA_VERSION,
    days,
    // Period starts follow the logged flow (and the pregnancies), so derive
    // them from the merged days instead of merging the lists (that could bring
    // back a deleted start).
    periodStarts: derivePeriodStarts(days, pregnancies),
    locale: pick(base.locale, local.locale, remote.locale),
    poolOptIn: pick(base.poolOptIn, local.poolOptIn, remote.poolOptIn),
    poolContributorKey: pick(base.poolContributorKey, local.poolContributorKey, remote.poolContributorKey),
    poolLastSyncedAt: pick(base.poolLastSyncedAt, local.poolLastSyncedAt, remote.poolLastSyncedAt),
    recoveryEmailSet: pick(base.recoveryEmailSet, local.recoveryEmailSet, remote.recoveryEmailSet),
    favoriteSymptomIds: pick(base.favoriteSymptomIds, local.favoriteSymptomIds, remote.favoriteSymptomIds),
    customSymptoms: mergeCustomSymptoms(base.customSymptoms, local.customSymptoms, remote.customSymptoms),
    forecastingEnabled: pick(base.forecastingEnabled, local.forecastingEnabled, remote.forecastingEnabled),
    pregnancies,
  });
}
