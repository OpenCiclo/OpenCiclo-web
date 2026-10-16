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

export function mergeDiaryEdits(base: Diary, local: Diary, remote: Diary): Diary {
  if (same(local, base)) return remote;
  if (same(remote, base)) return local;

  const days: Record<string, DayLog> = {};
  const isos = new Set([...Object.keys(base.days), ...Object.keys(local.days), ...Object.keys(remote.days)]);
  for (const iso of isos) {
    const day = mergeDay(base.days[iso], local.days[iso], remote.days[iso]);
    if (day) days[iso] = day;
  }

  return parseDiary({
    schemaVersion: DIARY_SCHEMA_VERSION,
    days,
    // Period starts follow the logged flow, so derive them from the merged
    // days instead of merging the lists (that could bring back a deleted start).
    periodStarts: derivePeriodStarts(days),
    locale: pick(base.locale, local.locale, remote.locale),
    poolOptIn: pick(base.poolOptIn, local.poolOptIn, remote.poolOptIn),
    poolContributorKey: pick(base.poolContributorKey, local.poolContributorKey, remote.poolContributorKey),
    poolLastSyncedAt: pick(base.poolLastSyncedAt, local.poolLastSyncedAt, remote.poolLastSyncedAt),
    recoveryEmailSet: pick(base.recoveryEmailSet, local.recoveryEmailSet, remote.recoveryEmailSet),
    favoriteSymptomIds: pick(base.favoriteSymptomIds, local.favoriteSymptomIds, remote.favoriteSymptomIds),
    customSymptoms: mergeCustomSymptoms(base.customSymptoms, local.customSymptoms, remote.customSymptoms),
    forecastingEnabled: pick(base.forecastingEnabled, local.forecastingEnabled, remote.forecastingEnabled),
  });
}
