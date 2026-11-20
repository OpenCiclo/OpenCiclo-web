// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Ellipsis, Pause, Play, UserMinus, X } from "lucide-react";

import { PHASE_INK, PhaseRing } from "@/components/calendar/phase-visuals";
import { SpeechBubble } from "@/components/friends/speech-bubble";
import type { FriendCard } from "@/lib/client/friends-sync";
import { phaseLabel, type CyclePhase } from "@/lib/cycle/phases";
import { cycleTimeline } from "@/lib/cycle/phase-timeline";
import { readStatus, visibleNote, type FriendView } from "@/lib/friends/payload";
import type { Locale, Messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function timing(days: number | null, t: Messages): string | null {
  if (days === null) return null;
  if (days <= 0) return t.dueTitleToday;
  if (days === 1) return t.periodTomorrowShort;
  return t.periodInShort.replace("{days}", String(days));
}

/** A phrase that starts a line elsewhere, placed after "·": lower-case first letter, except in German (its nouns keep the capital). */
function midLine(text: string, locale: Locale): string {
  return locale === "de" ? text : text.charAt(0).toLowerCase() + text.slice(1);
}

function describe(
  view: FriendView | null,
  waiting: string,
  t: Messages,
  locale: Locale,
): { title: string; meta: string | null; phase: CyclePhase | null } {
  if (!view) return { title: waiting, meta: null, phase: null };
  switch (view.kind) {
    case "phase": {
      // Bleeding logged today says so; an estimate says when the period is expected
      // (the line under the cards says phases are estimates).
      const parts = [
        view.cycleDay !== null ? t.cycleDayShort.replace("{day}", String(view.cycleDay)) : null,
        view.source === "observed" ? t.friendsLoggedToday : timing(view.daysToNext, t),
      ].filter((part): part is string => Boolean(part));
      const meta = parts.map((part, index) => (index === 0 ? part : midLine(part, locale))).join(" · ");
      return { title: phaseLabel(view.phase, t), meta: meta || null, phase: view.phase };
    }
    case "due":
      return { title: t.friendsDue, meta: null, phase: "menstrual" };
    case "paused":
      return { title: t.friendsPausedThem, meta: null, phase: null };
    case "ended":
      return { title: t.friendsEnded, meta: null, phase: null };
    case "noEstimate":
      return { title: t.friendsNoEstimate, meta: null, phase: null };
    case "stale":
      return { title: t.friendsStale, meta: null, phase: null };
  }
}

export type FriendCardActions = {
  disabled: boolean;
  onTogglePause: () => void;
  onRemove: () => void;
};

/**
 * One friend: the ring of their cycle with the phase's icon in the middle,
 * their name, the phase, what they chose to show, and their note as a chat
 * bubble. The card is tinted from the left in the phase's colour. The ring's
 * arcs are drawn only when they show their cycle day. The button in the corner
 * lays a dimmed, blurred layer over the card with pause and remove.
 */
export function FriendPhaseCard({
  card,
  today,
  t,
  locale,
  youPaused,
  actions,
}: {
  card: FriendCard;
  today: string;
  t: Messages;
  locale: Locale;
  youPaused: boolean;
  actions?: FriendCardActions;
}) {
  const { friend, status } = card;
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsId = useId();
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  // Escape (and so Android Back, which sends Escape to an aria-modal layer) closes the options.
  useEffect(() => {
    if (!optionsOpen) return;
    firstActionRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOptionsOpen(false);
        openerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [optionsOpen]);

  // Without a status: still waiting for the handshake, ended (kept in the
  // book), or an active friend whose box is gone (no recent update).
  const view: FriendView | null =
    friend.state === "ended"
      ? { kind: "ended" }
      : status
        ? readStatus(status, today)
        : friend.state === "active"
          ? { kind: "stale" }
          : null;
  const waiting = t.friendsWaiting.replace("{name}", friend.name);
  const { title, meta, phase } = describe(view, waiting, t, locale);
  const note = status ? visibleNote(status, today) : null;
  const ringTimeline =
    view?.kind === "phase" && view.cycleDay !== null && status?.cycle
      ? cycleTimeline(status.cycle.start, status.cycle.next, status.cycle.bleed)
      : null;

  return (
    <section
      className="relative isolate overflow-hidden rounded-3xl border border-border bg-card px-4 py-3.5 text-card-foreground"
      style={phase ? { backgroundImage: `linear-gradient(100deg, color-mix(in oklch, ${PHASE_INK[phase]} 26%, var(--card)) 0%, var(--card) 62%)` } : undefined}
    >
      <div className={cn("relative z-[1] flex items-center gap-3.5", actions && "pr-9")}>
        {phase ? (
          <PhaseRing
            timeline={ringTimeline}
            day={view?.kind === "phase" ? (view.cycleDay ?? 1) : 1}
            phase={phase}
            due={view?.kind === "due"}
            animate={false}
          />
        ) : (
          <span
            aria-hidden
            className="flex size-[66px] shrink-0 items-center justify-center rounded-full border border-border bg-muted font-serif text-2xl text-muted-foreground"
          >
            {Array.from(friend.name)[0]?.toUpperCase() ?? "?"}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-[3px]">
          <p
            className="truncate text-xs font-extrabold tracking-[0.07em] uppercase"
            style={phase ? { color: PHASE_INK[phase] } : undefined}
          >
            {friend.name}
          </p>
          <p className={cn("font-serif leading-[1.15] text-balance", phase ? "text-[22px]" : "text-[17px] text-muted-foreground")}>
            {title}
          </p>
          {meta ? <p className="text-[13px] font-bold text-card-foreground">{meta}</p> : null}
        </div>
      </div>
      {note ? (
        <SpeechBubble size="small" className="relative z-[1] mt-3">
          {note.text}
        </SpeechBubble>
      ) : null}
      {youPaused ? (
        <p className="relative z-[1] mt-2 text-xs text-muted-foreground">{t.friendsYouPaused.replace("{name}", friend.name)}</p>
      ) : null}

      {actions ? (
        <button
          ref={openerRef}
          type="button"
          aria-label={t.friendsOptionsFor.replace("{name}", friend.name)}
          aria-haspopup="dialog"
          aria-expanded={optionsOpen}
          aria-controls={optionsOpen ? optionsId : undefined}
          onClick={() => setOptionsOpen(true)}
          className="absolute top-2 right-2 z-[2] flex size-11 items-center justify-center rounded-full text-card-foreground transition-transform active:scale-90"
        >
          <Ellipsis className="size-5" aria-hidden />
        </button>
      ) : null}

      {actions && optionsOpen ? (
        <div
          id={optionsId}
          role="dialog"
          aria-modal="true"
          aria-label={t.friendsOptionsFor.replace("{name}", friend.name)}
          className="animate-overlay-in absolute inset-0 z-[3] flex items-center justify-center gap-2 rounded-[inherit] bg-black/55 px-4 py-3 backdrop-blur-[6px]"
        >
          <button
            type="button"
            aria-label={t.close}
            onClick={() => {
              setOptionsOpen(false);
              openerRef.current?.focus();
            }}
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-white/15 text-white transition-transform active:scale-90"
          >
            <X className="size-4" aria-hidden />
          </button>
          {/* Two columns side by side (one when the friend ended it: only remove). */}
          <div className="grid w-full grid-cols-2 gap-2 pr-10">
            {friend.state !== "ended" ? (
              <button
                ref={firstActionRef}
                type="button"
                disabled={actions.disabled}
                onClick={() => {
                  setOptionsOpen(false);
                  actions.onTogglePause();
                }}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-white/90 px-3 py-2 text-center text-[13px] leading-tight font-semibold text-neutral-900 transition-transform active:scale-95 disabled:opacity-50"
              >
                {friend.paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
                {(friend.paused ? t.friendsResumeOne : t.friendsPauseOne).replace("{name}", friend.name)}
              </button>
            ) : null}
            <button
              ref={friend.state === "ended" ? firstActionRef : undefined}
              type="button"
              disabled={actions.disabled}
              onClick={() => {
                setOptionsOpen(false);
                actions.onRemove();
              }}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-white/15 px-3 py-2 text-center text-[13px] leading-tight font-semibold text-white ring-1 ring-white/30 transition-transform active:scale-95 disabled:opacity-50",
                friend.state === "ended" && "col-span-2",
              )}
            >
              <UserMinus className="size-4" aria-hidden />
              {t.friendsRemove.replace("{name}", friend.name)}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
