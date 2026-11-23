// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { useFriends } from "@/components/friends/friends-provider";
import { PregnancyEndSheet, PregnancyStartSheet } from "@/components/pregnancy/pregnancy-sheets";
import { useCiclo, useTodayIso } from "@/lib/client/ciclo-context";
import { saveErrorMessage } from "@/lib/client/save-error";
import { meanRounded } from "@/lib/cycle/phases";
import { validCycleLengths } from "@/lib/cycle/segments";
import { FRIENDS_AVAILABLE } from "@/lib/features";
import {
  addPastPregnancy,
  changeDating,
  deletePregnancy,
  endPregnancy,
  reopenPregnancy,
  setFriendsMode,
  startPregnancy,
} from "@/lib/pregnancy/actions";
import { dueDateFrom, type PregnancyDating } from "@/lib/pregnancy/dating";
import {
  activePregnancy,
  lastEndedPregnancy,
  type PregnancyOutcome,
  type PregnancyRecord,
} from "@/lib/pregnancy/record";

type Sheet =
  | { kind: "start" }
  | { kind: "change"; id: string }
  /** The end of a pregnancy: to log it, or to correct one already logged. */
  | { kind: "end"; id: string }
  /** A pregnancy that is already over, being added with its end (nothing is saved until the end is). */
  | { kind: "past"; dating: PregnancyDating }
  | null;

type PregnancyFlows = {
  /** Turn pregnancy mode on (never automatic: she asked). */
  openStart: () => void;
  openChange: (id: string) => void;
  /** "The pregnancy has ended", one tap away from the card; for one that has ended, corrects its end. */
  openEnd: (id: string) => void;
};

const FlowsContext = createContext<PregnancyFlows | null>(null);

/**
 * Holds the pregnancy sheets once for the whole app (the card, Settings, the
 * late-period card and the day sheet open them) and saves what they change. A
 * save that fails says so in the sheet, which stays open: nothing changed.
 */
export function PregnancyFlowsProvider({ children }: { children: ReactNode }) {
  const { diary, persistDiary, readOnly, locale, t } = useCiclo();
  const friends = useFriends();
  const today = useTodayIso();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [shown, setShown] = useState<Exclude<Sheet, null>>({ kind: "start" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const show = useCallback((next: Exclude<Sheet, null>) => {
    setError(null);
    setShown(next);
    setSheet(next);
  }, []);
  const close = useCallback(() => {
    setError(null);
    setSheet(null);
  }, []);

  const flows = useMemo<PregnancyFlows>(
    () => ({
      openStart: () => show({ kind: "start" }),
      openChange: (id) => show({ kind: "change", id }),
      openEnd: (id) => show({ kind: "end", id }),
    }),
    [show],
  );

  const pregnancies = diary.pregnancies ?? [];
  const recordFor = (id: string): PregnancyRecord | null => pregnancies.find((item) => item.id === id) ?? null;
  const starts = [...diary.periodStarts].sort();
  // Her last period, offered as the date to count from. Not after a pregnancy
  // with no period since: that start is from before it.
  const lastEnd = lastEndedPregnancy(pregnancies)?.end?.date ?? null;
  const latestStart = starts.length > 0 ? starts[starts.length - 1] : null;
  const lastStart = latestStart !== null && (lastEnd === null || latestStart > lastEnd) ? latestStart : null;
  const usualCycle = meanRounded(validCycleLengths(starts, pregnancies));
  const hasFriends = FRIENDS_AVAILABLE && (friends.book?.friends.length ?? 0) > 0;
  const active = activePregnancy(pregnancies);

  /** Whether the save landed. A failure leaves its message for the open sheet. */
  async function save(next: typeof diary): Promise<boolean> {
    if (readOnly) return false;
    setBusy(true);
    setError(null);
    try {
      await persistDiary(next);
      return true;
    } catch (cause) {
      setError(saveErrorMessage(cause, t));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const changeRecord = shown.kind === "change" ? recordFor(shown.id) : null;
  const endRecord = shown.kind === "end" ? recordFor(shown.id) : null;
  const pastDating = shown.kind === "past" ? shown.dating : null;

  return (
    <FlowsContext.Provider value={flows}>
      {children}
      <PregnancyStartSheet
        open={sheet?.kind === "start" || sheet?.kind === "change"}
        record={changeRecord}
        lastStart={lastStart}
        usualCycle={usualCycle}
        showFriends={hasFriends}
        today={today}
        locale={locale}
        t={t}
        busy={busy || readOnly}
        error={error}
        onClose={close}
        onSave={async (dating: PregnancyDating, friendsMode) => {
          let saved: boolean;
          if (changeRecord) {
            saved = await save(changeDating(diary, changeRecord.id, dating));
          } else if (!active) {
            saved = await save(startPregnancy(diary, dating, friendsMode));
          } else {
            saved = await save(setFriendsMode(diary, active.id, friendsMode));
          }
          if (saved) close();
        }}
        onPast={(dating) => show({ kind: "past", dating })}
      />
      <PregnancyEndSheet
        open={sheet?.kind === "end" || sheet?.kind === "past"}
        dueDate={pastDating ? dueDateFrom(pastDating) : (endRecord?.dueDate ?? null)}
        ended={endRecord?.end ?? null}
        past={pastDating !== null}
        canReopen={!active || active.id === endRecord?.id}
        today={today}
        t={t}
        busy={busy || readOnly}
        error={error}
        onClose={close}
        onEnd={async (outcome: PregnancyOutcome, date: string) => {
          if (pastDating) return save(addPastPregnancy(diary, pastDating, outcome, date));
          return endRecord ? save(endPregnancy(diary, endRecord.id, outcome, date)) : false;
        }}
        onReopen={async () => (endRecord ? save(reopenPregnancy(diary, endRecord.id)) : false)}
        onDelete={async () => (endRecord ? save(deletePregnancy(diary, endRecord.id)) : false)}
      />
    </FlowsContext.Provider>
  );
}

export function usePregnancyFlows(): PregnancyFlows {
  const value = useContext(FlowsContext);
  if (!value) throw new Error("usePregnancyFlows outside PregnancyFlowsProvider");
  return value;
}
