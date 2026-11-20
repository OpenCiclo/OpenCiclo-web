// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { emptyDayLog, type DayLog } from "@/lib/diary";

/**
 * Whether the day sheet's draft differs from the day as saved (`saved` is
 * undefined for a day with nothing logged). Closing the sheet then asks before
 * the changes are lost. An empty note counts as no note.
 */
export function isDraftChanged(draft: DayLog, saved: DayLog | undefined): boolean {
  const base = saved ?? emptyDayLog();
  if ((draft.flow ?? null) !== (base.flow ?? null)) return true;
  if ((draft.cervicalMucus ?? null) !== (base.cervicalMucus ?? null)) return true;
  if ((draft.note || "") !== (base.note || "")) return true;
  const ids = new Set([...Object.keys(draft.symptoms), ...Object.keys(base.symptoms)]) as Set<keyof DayLog["symptoms"]>;
  for (const id of ids) {
    if ((draft.symptoms[id] ?? null) !== (base.symptoms[id] ?? null)) return true;
  }
  return false;
}
