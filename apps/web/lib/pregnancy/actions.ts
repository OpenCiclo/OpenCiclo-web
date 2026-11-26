// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Every change pregnancy mode makes to the diary, pure. Each returns the next
// diary with its period starts worked out again (`withPregnancies`).

import { addDaysIso, isEmptyDayLog, withPregnancies, type DayLog, type Diary, type SymptomId } from "@/lib/diary";
import { dueDateFrom, pregnancyStart, type PregnancyDating } from "@/lib/pregnancy/dating";
import {
  activePregnancy,
  newPregnancyId,
  sanitizePregnancy,
  type BleedAnswer,
  type FriendsPrivateMode,
  type PregnancyOutcome,
  type PregnancyRecord,
} from "@/lib/pregnancy/record";
import { isPregnancyEntry } from "@/lib/symptoms/catalog";

function edit(diary: Diary, id: string, change: (record: PregnancyRecord) => PregnancyRecord | null): Diary {
  const next: PregnancyRecord[] = [];
  for (const record of diary.pregnancies ?? []) {
    if (record.id !== id) {
      next.push(record);
      continue;
    }
    const changed = change(record);
    if (changed) next.push(changed);
  }
  return withPregnancies(diary, next);
}

/** Turns pregnancy mode on. Refused (the diary comes back unchanged) while another one goes on. */
export function startPregnancy(
  diary: Diary,
  dating: PregnancyDating,
  friendsMode: FriendsPrivateMode = "noNews",
  id: string = newPregnancyId(),
): Diary {
  if (activePregnancy(diary.pregnancies ?? [])) return diary;
  const record: PregnancyRecord = {
    id,
    dating,
    dueDate: dueDateFrom(dating),
    end: null,
    hidden: false,
    friendsMode,
    bleedAnswers: {},
  };
  // A dating the diary would not keep (`sanitizePregnancy`) starts nothing.
  if (!sanitizePregnancy(record)) return diary;
  return withPregnancies(diary, [...(diary.pregnancies ?? []), record]);
}

/**
 * A pregnancy that is already over, added afterwards with its end: it never
 * goes on, so nothing asks about it and friends see no change. A dating or an
 * end the diary would not keep adds nothing.
 */
export function addPastPregnancy(
  diary: Diary,
  dating: PregnancyDating,
  outcome: PregnancyOutcome,
  date: string,
  id: string = newPregnancyId(),
): Diary {
  const record: PregnancyRecord = {
    id,
    dating,
    dueDate: dueDateFrom(dating),
    end: { date, outcome },
    hidden: false,
    friendsMode: "noNews",
    bleedAnswers: {},
  };
  if (!sanitizePregnancy(record)?.end) return diary;
  return withPregnancies(diary, [...(diary.pregnancies ?? []), record]);
}

/**
 * New dating ("change"): a later ultrasound replaces what came before (ACOG CO 700).
 * A dating the diary would not keep changes nothing: the save would otherwise
 * drop the whole pregnancy.
 */
export function changeDating(diary: Diary, id: string, dating: PregnancyDating): Diary {
  return edit(diary, id, (record) => {
    const changed = { ...record, dating, dueDate: dueDateFrom(dating) };
    return sanitizePregnancy(changed) ? changed : record;
  });
}

/**
 * "Nació mi bebé" or "El embarazo terminó", on `date`. No reason, nothing about
 * the baby. Said again for a pregnancy that had already ended (a wrong date or
 * a wrong tap), it corrects the end and keeps her answers about later bleeds.
 */
export function endPregnancy(diary: Diary, id: string, outcome: PregnancyOutcome, date: string): Diary {
  return edit(diary, id, (record) => ({
    ...record,
    end: { date, outcome },
    bleedAnswers: record.end ? record.bleedAnswers : {},
  }));
}

/**
 * "It has not ended": an end logged by mistake is taken back and the pregnancy
 * goes on. Refused (the diary comes back unchanged) while another one goes on.
 */
export function reopenPregnancy(diary: Diary, id: string): Diary {
  const active = activePregnancy(diary.pregnancies ?? []);
  if (active && active.id !== id) return diary;
  return edit(diary, id, (record) => ({ ...record, end: null, hidden: false, bleedAnswers: {} }));
}

/** Whether `iso` falls between a pregnancy's 0+0 and its end (no end: onwards). */
function coversDay(record: PregnancyRecord, iso: string): boolean {
  return iso >= pregnancyStart(record.dueDate) && (!record.end || iso <= record.end.date);
}

/**
 * "Lo activé por error" and "Borrar del todo": as if it had never been in the
 * diary. The "Pregnancy" group's entries go from its days too (a "Felt the baby
 * move" left behind would say otherwise), unless another pregnancy kept in the
 * diary covers that day. Everything else logged on those days stays.
 */
export function deletePregnancy(diary: Diary, id: string): Diary {
  const deleted = (diary.pregnancies ?? []).find((record) => record.id === id);
  if (!deleted) return diary;
  const others = (diary.pregnancies ?? []).filter((record) => record.id !== id);
  const days: Record<string, DayLog> = {};
  let changed = false;
  for (const [iso, log] of Object.entries(diary.days)) {
    const strip =
      coversDay(deleted, iso) &&
      !others.some((record) => coversDay(record, iso)) &&
      Object.keys(log.symptoms).some((key) => isPregnancyEntry(key as SymptomId));
    if (!strip) {
      days[iso] = log;
      continue;
    }
    changed = true;
    const symptoms = Object.fromEntries(
      Object.entries(log.symptoms).filter(([key]) => !isPregnancyEntry(key as SymptomId)),
    ) as DayLog["symptoms"];
    const next = { ...log, symptoms };
    if (!isEmptyDayLog(next)) days[iso] = next;
  }
  return edit(changed ? { ...diary, days } : diary, id, () => null);
}

/** An ended pregnancy kept in the diary but not drawn on the calendar (or drawn again). */
export function setPregnancyHidden(diary: Diary, id: string, hidden: boolean): Diary {
  return edit(diary, id, (record) => (record.end ? { ...record, hidden } : record));
}

export function setFriendsMode(diary: Diary, id: string, friendsMode: FriendsPrivateMode): Diary {
  return edit(diary, id, (record) => ({ ...record, friendsMode }));
}

/** Her answer to "has your period come back?" for the bleed that starts on `runStart`. */
export function answerBleed(diary: Diary, id: string, runStart: string, answer: BleedAnswer): Diary {
  return edit(diary, id, (record) =>
    record.end ? { ...record, bleedAnswers: { ...record.bleedAnswers, [runStart]: answer } } : record,
  );
}

/** The first day of the run of logged bleeding that `iso` belongs to (or would start). */
export function bleedRunStart(diary: Diary, iso: string): string {
  let start = iso;
  while (diary.days[addDaysIso(start, -1)]?.flow) start = addDaysIso(start, -1);
  return start;
}
