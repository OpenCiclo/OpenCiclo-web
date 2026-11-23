// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// What a friend's status is built from when the diary holds a pregnancy (PLAN
// 4.8). A pregnancy is private unless she chose to share it (`sharedPregnancy`,
// below). While it is private, friends see:
// - "noNews" (the default): the status of the same diary without its
//   pregnancies, byte for byte. The friend sees what she would see if the
//   sharer had stopped logging. Turning pregnancy mode on publishes nothing,
//   because the status does not change (publishing waits for a change).
// - "simulated": while the pregnancy goes on, and until her period comes back
//   after it, estimated phases as if her usual cycles went on from her last real
//   period. Never "logged today".
// Nothing about a private pregnancy is ever in a status.
//
// Shared (her choice, kept in the friend book as that pregnancy's id): the
// status carries its due date and nothing else about it, so a friend's device
// can show the week on its own date. Only while it goes on: once it has an end,
// or after 42 weeks with none, the status is the private one again.

import { forecastExcludedStarts, pregnancyStatus } from "@/lib/cycle/segments";
import { withPregnancies, type Diary } from "@/lib/diary";
import { addDays, daysBetween } from "@/lib/forecast/math";
import { predict, releasedConfig, releasedPrior } from "@/lib/forecast/predict";
import { STILL_GOING_ASK_DAYS, conceptionDate, gestationalDays } from "@/lib/pregnancy/dating";
import { activePregnancy, type FriendsPrivateMode, type PregnancyRecord } from "@/lib/pregnancy/record";

/**
 * The pregnancy she could share today: the one that goes on, while her own
 * card still counts its weeks (past 42 weeks with no end logged it asks whether
 * it goes on, and nothing is shared).
 */
export function shareablePregnancy(diary: Diary, today: string): PregnancyRecord | null {
  const active = activePregnancy(diary.pregnancies ?? []);
  if (!active) return null;
  const age = gestationalDays(active.dueDate, today);
  return age >= 0 && age < STILL_GOING_ASK_DAYS ? active : null;
}

/** The due date friends get: the pregnancy with this id (the one she chose to share) when it can be shared today, else null. */
export function sharedPregnancy(diary: Diary, id: string | null | undefined, today: string): { due: string } | null {
  if (!id) return null;
  const record = shareablePregnancy(diary, today);
  return record && record.id === id ? { due: record.dueDate } : null;
}

/** What she picks for her friends in the pregnancy sheets: one of the two private modes, or sharing the week. */
export type FriendsChoice = FriendsPrivateMode | "shared";

export type SimulatedCycle = { start: string; next: string };

export type FriendsSource =
  | { kind: "diary"; diary: Diary }
  | { kind: "simulated"; cycle: SimulatedCycle };

/** Her usual cycle from her last real period on, rolled forward to the one `today` falls in. */
export function simulatedCycle(lastStart: string, length: number, today: string): SimulatedCycle {
  const elapsed = Math.max(0, daysBetween(lastStart, today));
  const start = addDays(lastStart, Math.floor(elapsed / length) * length);
  return { start, next: addDays(start, length) };
}

export function friendsSource(diary: Diary, today: string): FriendsSource {
  const pregnancies = diary.pregnancies ?? [];
  if (pregnancies.length === 0) return { kind: "diary", diary };
  const status = pregnancyStatus(diary.periodStarts, pregnancies);
  const without = withPregnancies(diary, []);
  if ((status.kind !== "active" && status.kind !== "resuming") || status.record.friendsMode !== "simulated") {
    return { kind: "diary", diary: without };
  }
  const conception = conceptionDate(status.record.dueDate);
  const before = [...diary.periodStarts].sort().filter((iso) => iso < conception);
  if (before.length === 0 || diary.forecastingEnabled === false) return { kind: "diary", diary: without };
  const last = before[before.length - 1];
  const usual = predict(
    before,
    last,
    releasedPrior(),
    releasedConfig(),
    forecastExcludedStarts(before, pregnancies),
  ).mostLikelyCycleLength;
  return { kind: "simulated", cycle: simulatedCycle(last, Math.max(1, usual), today) };
}
