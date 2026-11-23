// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState } from "react";

import { useConfirmDialog } from "@/components/confirm-dialog";
import { weekTitle } from "@/components/pregnancy/pregnancy-card";
import { usePregnancyFlows } from "@/components/pregnancy/pregnancy-flows";
import { Button } from "@/components/ui/button";
import { useCiclo, useTodayIso } from "@/lib/client/ciclo-context";
import { saveErrorMessage } from "@/lib/client/save-error";
import { PREGNANCY_AVAILABLE } from "@/lib/features";
import { formatIsoUtc } from "@/lib/format-date";
import { deletePregnancy, setFriendsMode, setPregnancyHidden } from "@/lib/pregnancy/actions";
import { pregnancyStart } from "@/lib/pregnancy/dating";
import { activePregnancy, type FriendsPrivateMode } from "@/lib/pregnancy/record";
import { pregnancyCardData } from "@/lib/pregnancy/view";

/**
 * Settings → Pregnancy: turn it on (PREGNANCY_AVAILABLE), and for one that goes
 * on its dates, what friends see, its end and "turned it on by mistake"; for
 * ended ones, hide from the calendar, correct the end or delete completely. Shown while the
 * diary holds a pregnancy even with the flag off, so it can always be ended.
 */
export function PregnancySettings() {
  const { diary, persistDiary, readOnly, locale, t } = useCiclo();
  const today = useTodayIso();
  const flows = usePregnancyFlows();
  const [confirm, confirmDialog] = useConfirmDialog();
  const [error, setError] = useState<string | null>(null);
  const pregnancies = diary.pregnancies ?? [];
  const active = activePregnancy(pregnancies);
  const ended = pregnancies.filter((record) => record.end);
  if (!PREGNANCY_AVAILABLE && pregnancies.length === 0) return null;

  // A save that fails says so here: nothing changed, and she must not think it did.
  const save = (next: typeof diary) => {
    if (readOnly) return;
    persistDiary(next).then(
      () => setError(null),
      (cause: unknown) => setError(saveErrorMessage(cause, t)),
    );
  };
  const date = (iso: string) => formatIsoUtc(iso, locale, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-muted/60 p-3">
      <p className="text-sm font-semibold text-card-foreground">{t.pregnancyCardLabel}</p>
      {!active && PREGNANCY_AVAILABLE ? (
        <>
          <p className="text-xs leading-relaxed text-muted-foreground">{t.settingsPregnancyStartHint}</p>
          <Button type="button" variant="outline" disabled={readOnly} onClick={flows.openStart}>
            {t.pregnancyOfferFromTest}
          </Button>
        </>
      ) : null}
      {active ? (
        <>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {weekTitle(pregnancyCardData(active, today), t)} ·{" "}
            {t.pregnancyDueDateLabel}: {date(active.dueDate)}
          </p>
          <Button type="button" variant="outline" disabled={readOnly} onClick={() => flows.openChange(active.id)}>
            {t.pregnancyChangeTitle}
          </Button>
          <label htmlFor="pregnancy-friends-mode" className="mt-1 text-xs font-semibold text-card-foreground">
            {t.pregnancyFriendsTitle}
          </label>
          <select
            id="pregnancy-friends-mode"
            value={active.friendsMode}
            disabled={readOnly}
            onChange={(event) => save(setFriendsMode(diary, active.id, event.target.value as FriendsPrivateMode))}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="noNews">{t.pregnancyFriendsNoNews}</option>
            <option value="simulated">{t.pregnancyFriendsSimulated}</option>
          </select>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {active.friendsMode === "simulated" ? t.pregnancyFriendsSimulatedHint : t.pregnancyFriendsNoNewsHint}
          </p>
          <Button type="button" variant="outline" disabled={readOnly} onClick={() => flows.openEnd(active.id)}>
            {t.pregnancyEndAction}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            disabled={readOnly}
            onClick={async () => {
              const confirmed = await confirm({
                message: t.pregnancyMistakeHint,
                confirmLabel: t.pregnancyMistake,
                cancelLabel: t.cancel,
                destructive: true,
              });
              if (confirmed) save(deletePregnancy(diary, active.id));
            }}
          >
            {t.pregnancyMistake}
          </Button>
        </>
      ) : null}
      {ended.length > 0 ? (
        <div className="mt-1 flex flex-col gap-2">
          <p className="text-xs font-semibold text-card-foreground">{t.settingsPregnancyPast}</p>
          {ended.map((record) => (
            <div key={record.id} className="flex flex-col gap-1.5 rounded-xl border border-border p-2.5">
              <p className="text-xs text-muted-foreground">
                {t.pastPregnancyRange
                  .replace("{start}", date(pregnancyStart(record.dueDate)))
                  .replace("{end}", date(record.end?.date ?? record.dueDate))}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={readOnly}
                  onClick={() => save(setPregnancyHidden(diary, record.id, !record.hidden))}
                >
                  {record.hidden ? t.settingsPregnancyShow : t.settingsPregnancyHide}
                </Button>
                <Button type="button" variant="outline" disabled={readOnly} onClick={() => flows.openEnd(record.id)}>
                  {t.settingsPregnancyEditEnd}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  disabled={readOnly}
                  onClick={async () => {
                    const confirmed = await confirm({
                      message: t.settingsPregnancyDeleteConfirm,
                      confirmLabel: t.pregnancyEndDelete,
                      cancelLabel: t.cancel,
                      destructive: true,
                    });
                    if (confirmed) save(deletePregnancy(diary, record.id));
                  }}
                >
                  {t.pregnancyEndDelete}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      {confirmDialog}
    </div>
  );
}
