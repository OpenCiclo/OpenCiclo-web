// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dayRange, weekTitle } from "@/components/pregnancy/pregnancy-card";
import { IS_ANDROID_APP } from "@/lib/app-target";
import { useLatest } from "@/lib/client/hooks";
import { formatIsoUtc } from "@/lib/format-date";
import type { Locale, Messages } from "@/lib/i18n";
import { isIsoDate } from "@/lib/iso-date";
import {
  DATING_METHODS,
  MAX_SCAN_AGE_DAYS,
  alreadyOver,
  cycleCorrection,
  dueDateFrom,
  gestationalAge,
  irregularForLmpDating,
  likelyWindow,
  plausibleDueDate,
  pregnancyStart,
  type DatingMethod,
  type EmbryoAge,
  type PregnancyDating,
} from "@/lib/pregnancy/dating";
import type { FriendsChoice } from "@/lib/pregnancy/friends";
import type { PregnancyEnd, PregnancyOutcome, PregnancyRecord } from "@/lib/pregnancy/record";
import { cn } from "@/lib/utils";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A sheet from the bottom (a dialog on the desktop). Escape closes it. Android
 * Back arrives as Escape too (lib/client/android-back.ts): there it first goes
 * back one step (`onBack` answers true), then closes. The sheet takes the key
 * before anything under it (the day sheet it may have been opened from), so one
 * Back never closes two things.
 */
function SheetFrame({
  open,
  title,
  t,
  error,
  onBack,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  t: Messages;
  /** Why the last save did not land; the sheet stays open. */
  error?: string | null;
  /** Android Back inside the sheet: true when it went back a step instead of closing. */
  onBack?: () => boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  if (present && !open && prefersReducedMotion()) setPresent(false);
  const closing = present && !open;

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setPresent(false), 450);
    return () => window.clearTimeout(timer);
  }, [closing]);

  const onBackRef = useLatest(onBack);
  const onCloseRef = useLatest(onClose);
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // The app's own confirmation dialog sits on top of everything and answers first.
      if (document.querySelector('[role="alertdialog"]')) return;
      event.stopImmediatePropagation();
      event.preventDefault();
      if (IS_ANDROID_APP && onBackRef.current?.()) return;
      onCloseRef.current();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onBackRef, onCloseRef]);

  if (!present) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center desktop:items-center desktop:p-6">
      <button
        type="button"
        aria-label={t.close}
        onClick={onClose}
        className={cn("absolute inset-0 bg-foreground/30 backdrop-blur-[2px]", closing ? "animate-overlay-out" : "animate-overlay-in")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && closing) setPresent(false);
        }}
        className={cn(
          "sheet-dialog relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-4xl bg-card shadow-2xl desktop:max-w-lg desktop:rounded-4xl",
          closing ? "animate-sheet-down" : "animate-sheet-up",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-6 pt-7 pb-3">
          <p id={titleId} className="font-serif text-xl leading-tight text-card-foreground">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform active:scale-90"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Choice({
  name,
  checked,
  label,
  hint,
  onChange,
}: {
  name: string;
  checked: boolean;
  label: string;
  hint?: string;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors",
        checked ? "border-[var(--pregnancy-ink)] bg-muted/60" : "border-border",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-1 accent-[var(--pregnancy-ink)]" />
      <span className="block">
        <span className="block text-sm font-semibold text-card-foreground">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  );
}

const METHOD_OPTION: Record<DatingMethod, keyof Messages> = {
  lmp: "pregnancyOptionLmp",
  dueDate: "pregnancyOptionDue",
  ultrasound: "pregnancyOptionUltrasound",
  conception: "pregnancyOptionConception",
  transfer: "pregnancyOptionTransfer",
};

type DatingDraft = {
  method: DatingMethod;
  lmp: string;
  correct: boolean;
  dueDate: string;
  scanDate: string;
  weeks: string;
  days: string;
  conception: string;
  transfer: string;
  embryoAge: EmbryoAge;
};

function draftFrom(record: PregnancyRecord | null, lastStart: string | null, today: string): DatingDraft {
  const draft: DatingDraft = {
    method: "lmp",
    lmp: lastStart ?? "",
    correct: true,
    dueDate: "",
    scanDate: today,
    weeks: "",
    days: "0",
    conception: "",
    transfer: "",
    embryoAge: 5,
  };
  const dating = record?.dating;
  if (!dating) return draft;
  switch (dating.method) {
    case "lmp":
      return { ...draft, method: "lmp", lmp: dating.lmp, correct: dating.cycleLength !== null };
    case "dueDate":
      return { ...draft, method: "dueDate", dueDate: dating.dueDate };
    case "ultrasound":
      return { ...draft, method: "ultrasound", scanDate: dating.scanDate, weeks: String(dating.weeks), days: String(dating.days) };
    case "conception":
      return { ...draft, method: "conception", conception: dating.conception };
    case "transfer":
      return { ...draft, method: "transfer", transfer: dating.transfer, embryoAge: dating.embryoAge };
  }
}

function datingFrom(draft: DatingDraft, usualCycle: number | null): PregnancyDating | null {
  const valid = (iso: string) => isIsoDate(iso);
  switch (draft.method) {
    case "lmp":
      return valid(draft.lmp) ? { method: "lmp", lmp: draft.lmp, cycleLength: draft.correct ? usualCycle : null } : null;
    case "dueDate":
      return valid(draft.dueDate) ? { method: "dueDate", dueDate: draft.dueDate } : null;
    case "ultrasound": {
      const weeks = Number(draft.weeks);
      const days = Number(draft.days);
      if (!valid(draft.scanDate) || !Number.isInteger(weeks) || !Number.isInteger(days)) return null;
      if (weeks < 0 || days < 0 || days > 6 || draft.weeks === "") return null;
      // The same limit as the diary keeps (`sanitizePregnancy`): 42 weeks and 0 days.
      if (weeks * 7 + days > MAX_SCAN_AGE_DAYS) return null;
      return { method: "ultrasound", scanDate: draft.scanDate, weeks, days };
    }
    case "conception":
      return valid(draft.conception) ? { method: "conception", conception: draft.conception } : null;
    case "transfer":
      return valid(draft.transfer) ? { method: "transfer", transfer: draft.transfer, embryoAge: draft.embryoAge } : null;
  }
}

/**
 * Turns pregnancy mode on, or changes how it is dated: how to date it, the
 * date it gives (checked as she types), and, when she shares with friends,
 * what they will see. Never automatic: she opens it.
 */
export function PregnancyStartSheet({
  open,
  record,
  lastStart,
  usualCycle,
  showFriends,
  today,
  locale,
  t,
  busy,
  error,
  onClose,
  onSave,
  onPast,
}: {
  open: boolean;
  /** The pregnancy whose dates change; null to turn the mode on. */
  record: PregnancyRecord | null;
  lastStart: string | null;
  usualCycle: number | null;
  showFriends: boolean;
  today: string;
  locale: Locale;
  t: Messages;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  /** `friends` is "shared" when she chose to share the week (kept in the friend book, not in the diary). */
  onSave: (dating: PregnancyDating, friends: FriendsChoice) => void;
  /** Dates of a pregnancy that would already be over: it goes on to ask how and when it ended. */
  onPast: (dating: PregnancyDating) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(() => draftFrom(record, lastStart, today));
  const [friendsMode, setFriendsMode] = useState<FriendsChoice>(record?.friendsMode ?? "noNews");
  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setStep(0);
    setDraft(draftFrom(record, lastStart, today));
    setFriendsMode(record?.friendsMode ?? "noNews");
  }
  if (!open && wasOpen) setWasOpen(false);

  const changing = record !== null;
  const dating = datingFrom(draft, usualCycle);
  const dueDate = dating ? dueDateFrom(dating) : null;
  const plausible = dueDate !== null && plausibleDueDate(dueDate, today);
  // Dates of a pregnancy that is over by now: not an error, a past pregnancy to add with its end.
  const past = !changing && dueDate !== null && alreadyOver(dueDate, today);
  const steps = changing || !showFriends || past ? 2 : 3;
  // An age at the scan the diary would not keep: say so instead of a dead button.
  const scanAgeTooLong =
    draft.method === "ultrasound" && draft.weeks !== "" && Number(draft.weeks) * 7 + Number(draft.days) > MAX_SCAN_AGE_DAYS;
  const age = dueDate ? gestationalAge(dueDate, today) : null;
  const window = dueDate ? likelyWindow(dueDate) : null;
  const correction = cycleCorrection(usualCycle);
  const set = (change: Partial<DatingDraft>) => setDraft((value) => ({ ...value, ...change }));

  const title = changing ? t.pregnancyChangeTitle : t.pregnancyStartTitle;
  const last = step === steps - 1;

  return (
    <SheetFrame
      open={open}
      title={title}
      t={t}
      error={error}
      onBack={() => {
        if (step === 0) return false;
        setStep(step - 1);
        return true;
      }}
      onClose={onClose}
    >
      {step === 0 ? (
        <>
          {changing ? null : <p className="text-sm leading-6 text-muted-foreground">{t.pregnancyStartIntro}</p>}
          <p className="text-sm font-bold text-card-foreground">{t.pregnancyHowDate}</p>
          {DATING_METHODS.map((method) => (
            <Choice
              key={method}
              name="pregnancy-method"
              checked={draft.method === method}
              label={String(t[METHOD_OPTION[method]])}
              onChange={() => set({ method })}
            />
          ))}
        </>
      ) : null}

      {step === 1 ? (
        <>
          {draft.method === "lmp" ? (
            <>
              <Label htmlFor="pregnancy-lmp">{t.pregnancyLmpLabel}</Label>
              <Input id="pregnancy-lmp" type="date" max={today} value={draft.lmp} onChange={(event) => set({ lmp: event.target.value })} />
              {usualCycle !== null && correction !== 0 ? (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-card-foreground">
                  <input type="checkbox" checked={draft.correct} onChange={(event) => set({ correct: event.target.checked })} />
                  {t.pregnancyCycleCorrection.replace("{days}", String(usualCycle))}
                </label>
              ) : null}
              {irregularForLmpDating(usualCycle) ? <p className="text-xs leading-5 text-muted-foreground">{t.pregnancyIrregularHint}</p> : null}
            </>
          ) : null}
          {draft.method === "dueDate" ? (
            <>
              <Label htmlFor="pregnancy-due">{t.pregnancyDueDateLabel}</Label>
              <Input id="pregnancy-due" type="date" value={draft.dueDate} onChange={(event) => set({ dueDate: event.target.value })} />
            </>
          ) : null}
          {draft.method === "ultrasound" ? (
            <>
              <Label htmlFor="pregnancy-scan">{t.pregnancyScanDateLabel}</Label>
              <Input id="pregnancy-scan" type="date" max={today} value={draft.scanDate} onChange={(event) => set({ scanDate: event.target.value })} />
              <p className="text-sm font-semibold text-card-foreground">{t.pregnancyScanAgeLabel}</p>
              <div className="flex items-center gap-2">
                <Input
                  aria-label={t.pregnancyWeeksShort}
                  inputMode="numeric"
                  className="w-20"
                  value={draft.weeks}
                  onChange={(event) => set({ weeks: event.target.value.replace(/\D/g, "").slice(0, 2) })}
                />
                <span className="text-sm text-muted-foreground">{t.pregnancyWeeksShort}</span>
                <Input
                  aria-label={t.pregnancyDaysShort}
                  inputMode="numeric"
                  className="w-16"
                  value={draft.days}
                  onChange={(event) => set({ days: event.target.value.replace(/\D/g, "").slice(0, 1) })}
                />
                <span className="text-sm text-muted-foreground">{t.pregnancyDaysShort}</span>
              </div>
            </>
          ) : null}
          {draft.method === "conception" ? (
            <>
              <Label htmlFor="pregnancy-conception">{t.pregnancyConceptionLabel}</Label>
              <Input
                id="pregnancy-conception"
                type="date"
                max={today}
                value={draft.conception}
                onChange={(event) => set({ conception: event.target.value })}
              />
            </>
          ) : null}
          {draft.method === "transfer" ? (
            <>
              <Label htmlFor="pregnancy-transfer">{t.pregnancyTransferLabel}</Label>
              <Input id="pregnancy-transfer" type="date" max={today} value={draft.transfer} onChange={(event) => set({ transfer: event.target.value })} />
              <p className="text-sm font-semibold text-card-foreground">{t.pregnancyEmbryoAgeLabel}</p>
              <div className="flex gap-2">
                {([3, 5] as const).map((age) => (
                  <Choice
                    key={age}
                    name="pregnancy-embryo"
                    checked={draft.embryoAge === age}
                    label={age === 3 ? t.pregnancyEmbryoDay3 : t.pregnancyEmbryoDay5}
                    onChange={() => set({ embryoAge: age })}
                  />
                ))}
              </div>
            </>
          ) : null}
          {dueDate && age && window ? (
            plausible ? (
              <p className="rounded-2xl bg-muted/60 p-3 text-sm leading-6 text-card-foreground">
                <span className="block font-bold">{weekTitle({ age }, t)}</span>
                {t.pregnancyConfirmDue
                  .replace("{date}", formatIsoUtc(dueDate, locale, { day: "numeric", month: "long", year: "numeric" }))
                  .replace("{range}", dayRange(window.start, window.end, locale))}
              </p>
            ) : past ? (
              <p className="rounded-2xl bg-muted/60 p-3 text-sm leading-6 text-card-foreground">{t.pregnancyPastNotice}</p>
            ) : (
              <p className="rounded-2xl bg-muted/60 p-3 text-sm leading-6 text-destructive">{t.pregnancyImplausible}</p>
            )
          ) : scanAgeTooLong ? (
            <p className="rounded-2xl bg-muted/60 p-3 text-sm leading-6 text-destructive">{t.pregnancyImplausible}</p>
          ) : null}
        </>
      ) : null}

      {step === 2 ? (
        <>
          <p className="text-sm font-bold text-card-foreground">{t.pregnancyFriendsTitle}</p>
          <Choice
            name="pregnancy-friends"
            checked={friendsMode === "noNews"}
            label={t.pregnancyFriendsNoNews}
            hint={t.pregnancyFriendsNoNewsHint}
            onChange={() => setFriendsMode("noNews")}
          />
          <Choice
            name="pregnancy-friends"
            checked={friendsMode === "simulated"}
            label={t.pregnancyFriendsSimulated}
            hint={t.pregnancyFriendsSimulatedHint}
            onChange={() => setFriendsMode("simulated")}
          />
          <Choice
            name="pregnancy-friends"
            checked={friendsMode === "shared"}
            label={t.friendsSharePregnancyChoice}
            hint={t.friendsSharePregnancyHint}
            onChange={() => setFriendsMode("shared")}
          />
          {friendsMode === "shared" ? null : <p className="text-xs leading-5 text-muted-foreground">{t.pregnancyFriendsNote}</p>}
        </>
      ) : null}

      <div className="mt-2 flex gap-2">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>
            {t.back}
          </Button>
        ) : null}
        <Button
          type="button"
          className="flex-1"
          disabled={busy || (step === 1 && !(dating && (plausible || past)))}
          onClick={() => {
            if (!last) {
              setStep(step + 1);
              return;
            }
            if (dating && past) onPast(dating);
            else if (dating && plausible) onSave(dating, friendsMode);
          }}
        >
          {last && !past ? (changing ? t.save : t.pregnancyStartButton) : t.next}
        </Button>
      </div>
    </SheetFrame>
  );
}

/**
 * "The pregnancy has ended": what happened (no reason asked), when, and a
 * closing line. Everything pregnancy-related goes the moment it is saved. She
 * keeps it in the diary (the default) or deletes it completely.
 *
 * The same two questions correct an end already logged (`ended`: a wrong date
 * or a wrong tap, which "it has not ended" takes back) and add a pregnancy that
 * was over before she entered it (`past`: nothing is saved until the end is).
 */
export function PregnancyEndSheet({
  open,
  dueDate,
  ended,
  past,
  canReopen,
  today,
  t,
  busy,
  error,
  onClose,
  onEnd,
  onReopen,
  onDelete,
}: {
  open: boolean;
  /** The due date of the pregnancy the sheet is about: the end cannot come before its first day. */
  dueDate: string | null;
  /** The end already logged, when the sheet corrects it. */
  ended: PregnancyEnd | null;
  past: boolean;
  /** Whether "it has not ended" is offered: not while another pregnancy goes on. */
  canReopen: boolean;
  today: string;
  t: Messages;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  /** Each answers whether the save landed. */
  onEnd: (outcome: PregnancyOutcome, date: string) => Promise<boolean>;
  onReopen: () => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const [step, setStep] = useState(0);
  const [outcome, setOutcome] = useState<PregnancyOutcome | null>(null);
  const [date, setDate] = useState(today);
  // What the sheet was opened for: `ended` turns non-null once a new end is saved.
  const [correcting, setCorrecting] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setStep(0);
    setOutcome(ended?.outcome ?? null);
    // A pregnancy added afterwards most likely ended around its due date, not today.
    setDate(ended?.date ?? (past && dueDate !== null && dueDate < today ? dueDate : today));
    setCorrecting(ended !== null);
  }
  if (!open && wasOpen) setWasOpen(false);

  const earliest = dueDate ? pregnancyStart(dueDate) : today;
  const validDate = isIsoDate(date) && date <= today && date >= earliest;

  return (
    <SheetFrame
      open={open}
      title={t.pregnancyEndAction}
      t={t}
      error={error}
      onBack={() => {
        if (step !== 1) return false;
        setStep(0);
        return true;
      }}
      onClose={onClose}
    >
      {step === 0 ? (
        <>
          <p className="text-sm font-bold text-card-foreground">{t.pregnancyEndWhat}</p>
          {(["birth", "ended"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant="outline"
              className="h-auto justify-start py-3 text-left"
              onClick={() => {
                setOutcome(value);
                setStep(1);
              }}
            >
              {value === "birth" ? t.pregnancyEndBirth : t.pregnancyEndEnded}
            </Button>
          ))}
          {correcting && canReopen ? (
            <Button
              type="button"
              variant="ghost"
              className="h-auto justify-start py-3 text-left text-muted-foreground"
              disabled={busy}
              onClick={async () => {
                if (await onReopen()) onClose();
              }}
            >
              {t.pregnancyEndUndo}
            </Button>
          ) : null}
        </>
      ) : null}
      {step === 1 ? (
        <>
          <Label htmlFor="pregnancy-end-date">{t.pregnancyEndWhen}</Label>
          <Input id="pregnancy-end-date" type="date" min={earliest} max={today} value={date} onChange={(event) => setDate(event.target.value)} />
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(0)}>
              {t.back}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={busy || !validDate || !outcome}
              onClick={async () => {
                if (!outcome || !validDate) return;
                if (!(await onEnd(outcome, date))) return;
                // A corrected end and a past pregnancy have nothing more to ask.
                if (correcting || past) onClose();
                else setStep(2);
              }}
            >
              {t.save}
            </Button>
          </div>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <p className="text-sm leading-6 text-card-foreground">{t.pregnancyEndDone}</p>
          <Button type="button" className="mt-2" onClick={onClose}>
            {t.pregnancyEndKeep}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            disabled={busy}
            onClick={async () => {
              if (await onDelete()) onClose();
            }}
          >
            {t.pregnancyEndDelete}
          </Button>
        </>
      ) : null}
    </SheetFrame>
  );
}
