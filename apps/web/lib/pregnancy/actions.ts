// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Every change pregnancy mode makes to the diary, pure. Each returns the next
// diary with its period starts worked out again (`withPregnancies`).

import { addDaysIso, withPregnancies, type Diary } from "@/lib/diary";
import { dueDateFrom, type PregnancyDating } from "@/lib/pregnancy/dating";
import {
  activePregnancy,
  newPregnancyId,
  type BleedAnswer,
  type FriendsPrivateMode,
  type PregnancyOutcome,
  type PregnancyRecord,
} from "@/lib/pregnancy/record";

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
  return withPregnancies(diary, [...(diary.pregnancies ?? []), record]);
}

/** New dating ("change"): a later ultrasound replaces what came before (ACOG CO 700). */
export function changeDating(diary: Diary, id: string, dating: PregnancyDating): Diary {
  return edit(diary, id, (record) => ({ ...record, dating, dueDate: dueDateFrom(dating) }));
}

/** "Nació mi bebé" or "El embarazo terminó", on `date`. No reason, nothing about the baby. */
export function endPregnancy(diary: Diary, id: string, outcome: PregnancyOutcome, date: string): Diary {
  return edit(diary, id, (record) => ({ ...record, end: { date, outcome }, bleedAnswers: {} }));
}

/** "Lo activé por error" and "Borrar del todo": as if it had never been in the diary. */
export function deletePregnancy(diary: Diary, id: string): Diary {
  return edit(diary, id, () => null);
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
