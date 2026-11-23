// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { useFriends } from "@/components/friends/friends-provider";
import { PregnancyEndSheet, PregnancyStartSheet } from "@/components/pregnancy/pregnancy-sheets";
import { useCiclo, useTodayIso } from "@/lib/client/ciclo-context";
import { meanRounded } from "@/lib/cycle/phases";
import { validCycleLengths } from "@/lib/cycle/segments";
import { FRIENDS_AVAILABLE } from "@/lib/features";
import { changeDating, deletePregnancy, endPregnancy, setFriendsMode, startPregnancy } from "@/lib/pregnancy/actions";
import type { PregnancyDating } from "@/lib/pregnancy/dating";
import { activePregnancy, type PregnancyOutcome, type PregnancyRecord } from "@/lib/pregnancy/record";

type Sheet = { kind: "start" } | { kind: "change"; id: string } | { kind: "end"; id: string } | null;

type PregnancyFlows = {
  /** Turn pregnancy mode on (never automatic: she asked). */
  openStart: () => void;
  openChange: (id: string) => void;
  /** "The pregnancy has ended", one tap away from the card. */
  openEnd: (id: string) => void;
};

const FlowsContext = createContext<PregnancyFlows | null>(null);

/**
 * Holds the pregnancy sheets once for the whole app (the card, Settings, the
 * late-period card and the day sheet open them) and saves what they change.
 */
export function PregnancyFlowsProvider({ children }: { children: ReactNode }) {
  const { diary, persistDiary, readOnly, locale, t } = useCiclo();
  const friends = useFriends();
  const today = useTodayIso();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [shown, setShown] = useState<Exclude<Sheet, null>>({ kind: "start" });
  const [busy, setBusy] = useState(false);

  const show = useCallback((next: Exclude<Sheet, null>) => {
    setShown(next);
    setSheet(next);
  }, []);
  const close = useCallback(() => setSheet(null), []);

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
  const lastStart = starts.length > 0 ? starts[starts.length - 1] : null;
  const usualCycle = meanRounded(validCycleLengths(starts, pregnancies));
  const hasFriends = FRIENDS_AVAILABLE && (friends.book?.friends.length ?? 0) > 0;

  async function save(next: typeof diary) {
    if (readOnly) return;
    setBusy(true);
    try {
      await persistDiary(next);
    } finally {
      setBusy(false);
    }
  }

  const changeRecord = shown.kind === "change" ? recordFor(shown.id) : null;
  const endRecord = shown.kind === "end" ? recordFor(shown.id) : null;

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
        onClose={close}
        onSave={async (dating: PregnancyDating, friendsMode) => {
          if (changeRecord) {
            await save(changeDating(diary, changeRecord.id, dating));
          } else if (!activePregnancy(pregnancies)) {
            await save(startPregnancy(diary, dating, friendsMode));
          } else {
            const active = activePregnancy(pregnancies);
            if (active) await save(setFriendsMode(diary, active.id, friendsMode));
          }
          close();
        }}
      />
      <PregnancyEndSheet
        open={sheet?.kind === "end"}
        record={endRecord}
        today={today}
        t={t}
        busy={busy || readOnly}
        onClose={close}
        onEnd={async (outcome: PregnancyOutcome, date: string) => {
          if (endRecord) await save(endPregnancy(diary, endRecord.id, outcome, date));
        }}
        onDelete={async () => {
          if (endRecord) await save(deletePregnancy(diary, endRecord.id));
        }}
      />
    </FlowsContext.Provider>
  );
}

export function usePregnancyFlows(): PregnancyFlows {
  const value = useContext(FlowsContext);
  if (!value) throw new Error("usePregnancyFlows outside PregnancyFlowsProvider");
  return value;
}
