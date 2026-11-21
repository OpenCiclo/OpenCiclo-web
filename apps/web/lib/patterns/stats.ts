// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { SYMPTOM_IDS, type Diary, type SymptomId } from "@/lib/diary";
import { daysBetween } from "@/lib/forecast/math";
import { cycleOverview, periodRuns, type CycleOverview } from "@/lib/cycle/phases";
import { isSexEntry } from "@/lib/symptoms/catalog";

export type CompletedCycle = {
  start: string;
  end: string;
  length: number;
};

export type RecurringSymptom = {
  id: SymptomId;
  dayCount: number;
  cycleCount: number;
  cycleTotal: number;
  ratio: number;
};

export type PatternStats = CycleOverview & {
  completedCycles: CompletedCycle[];
  /** What recurs, without "Sex and sex drive": sex is not a symptom. */
  recurringSymptoms: RecurringSymptom[];
  /** The "Sex and sex drive" entries that recur, ranked the same way. */
  recurringSex: RecurringSymptom[];
  cycleLengthRange: { min: number; max: number } | null;
};

export function completedCycles(diary: Diary): CompletedCycle[] {
  const starts = [...diary.periodStarts].sort();
  const cycles: CompletedCycle[] = [];
  for (let i = 0; i < starts.length - 1; i += 1) {
    cycles.push({
      start: starts[i],
      end: starts[i + 1],
      length: daysBetween(starts[i], starts[i + 1]),
    });
  }
  return cycles;
}

/** Everything logged with the symptom picker, sex entries included (`patternStats` splits them). */
export function recurringSymptoms(diary: Diary, lookback = 6): RecurringSymptom[] {
  const symptomIds: SymptomId[] = [
    ...SYMPTOM_IDS,
    ...diary.customSymptoms.map((item) => item.id),
  ];
  const cycles = completedCycles(diary).slice(-lookback);
  const lastStart = diary.periodStarts[diary.periodStarts.length - 1];
  const windows = [...cycles];
  if (lastStart && (windows.length === 0 || windows[windows.length - 1]?.start !== lastStart)) {
    windows.push({ start: lastStart, end: "9999-12-31", length: 0 });
  }
  const cycleTotal = windows.length;
  const counts = Object.fromEntries(symptomIds.map((id) => [id, { dayCount: 0, cycleCount: 0 }])) as Record<
    SymptomId,
    { dayCount: number; cycleCount: number }
  >;

  for (const cycle of windows) {
    const seen = new Set<SymptomId>();
    for (const [iso, log] of Object.entries(diary.days)) {
      if (iso < cycle.start || iso >= cycle.end) continue;
      for (const id of symptomIds) {
        if (!log.symptoms[id]) continue;
        counts[id].dayCount += 1;
        seen.add(id);
      }
    }
    for (const id of seen) counts[id].cycleCount += 1;
  }

  const maxDays = Math.max(1, ...symptomIds.map((id) => counts[id].dayCount));
  return symptomIds.map((id) => ({
    id,
    dayCount: counts[id].dayCount,
    cycleCount: counts[id].cycleCount,
    cycleTotal,
    ratio: counts[id].dayCount / maxDays,
  }))
    .filter((item) => item.dayCount > 0)
    .sort((a, b) => b.cycleCount - a.cycleCount || b.dayCount - a.dayCount);
}

/** `today` is the person's calendar date (`useTodayIso()`), never a UTC default. */
export function patternStats(diary: Diary, today: string): PatternStats {
  const overview = cycleOverview(diary, today);
  const cycles = completedCycles(diary);
  const lengths = cycles.map((cycle) => cycle.length);
  const recurring = recurringSymptoms(diary);
  return {
    ...overview,
    completedCycles: cycles,
    recurringSymptoms: recurring.filter((item) => !isSexEntry(item.id)),
    recurringSex: recurring.filter((item) => isSexEntry(item.id)),
    cycleLengthRange:
      lengths.length >= 2
        ? { min: Math.min(...lengths), max: Math.max(...lengths) }
        : lengths.length === 1
          ? { min: lengths[0], max: lengths[0] }
          : null,
  };
}

export { periodRuns };
