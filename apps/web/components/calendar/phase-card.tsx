// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { PhaseCardOverlay, type CardRect } from "@/components/calendar/phase-card-overlay";
import { NEXT_PHASE, PHASE_INK, PhaseAura, PhaseRing } from "@/components/calendar/phase-visuals";
import { useIsDesktop } from "@/lib/client/desktop";
import { useIsGhost } from "@/lib/client/ghost";
import { phaseBody, phaseLabel, type CycleOverview, type CyclePhase } from "@/lib/cycle/phases";
import { cycleTimeline, type CycleTimeline } from "@/lib/cycle/phase-timeline";
import type { Messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Same fallback as cycleOverview's menstrual length when there is no history. */
const DEFAULT_PERIOD_LENGTH = 5;

export type PhaseCardModel = {
  kind: "phase" | "due";
  /** The colour and icon of the card. */
  phase: CyclePhase;
  /** The light that orbits the ring. */
  next: CyclePhase;
  label: string | null;
  title: string;
  meta: string;
  body: string;
  day: number;
  timeline: CycleTimeline | null;
  openLabel: string;
  dialogTitle: string;
};

function periodLength(overview: CycleOverview): number {
  return overview.expectedPeriodLength ?? DEFAULT_PERIOD_LENGTH;
}

function timingShort(days: number | null, t: Messages): string | null {
  if (days === null) return null;
  if (days < 0) return days === -1 ? t.dueTitleLateOne : t.dueTitleLateMany.replace("{days}", String(-days));
  if (days === 0) return t.dueTitleToday;
  if (days === 1) return t.periodTomorrowShort;
  return t.periodInShort.replace("{days}", String(days));
}

/** The card for a cycle with a current phase, or null when there is none. */
export function phaseCardModel(overview: CycleOverview, t: Messages): PhaseCardModel | null {
  const current = overview.currentPhase;
  if (!current) return null;
  const timeline =
    current.nextStart > current.cycleStart ? cycleTimeline(current.cycleStart, current.nextStart, periodLength(overview)) : null;
  const index = timeline ? timeline.spans.findIndex((span) => span.phase === current.phase) : -1;
  const chapter =
    index >= 0
      ? t.phaseCardChapter.replace("{n}", String(index + 1)).replace("{total}", String(timeline?.spans.length ?? 4))
      : null;
  const estimated = current.source === "estimated";
  const label = chapter ? (estimated ? `${chapter} · ${t.phaseEstimated}` : chapter) : estimated ? t.phaseEstimated : null;
  // A logged bleed on or after the expected day needs no countdown.
  const days = overview.nextPeriodInDays;
  const timing = overview.forecastingEnabled && !(current.source === "observed" && days !== null && days <= 0) ? timingShort(days, t) : null;
  const day = t.cycleDayShort.replace("{day}", String(current.cycleDay));
  return {
    kind: "phase",
    phase: current.phase,
    next: NEXT_PHASE[current.phase],
    label,
    title: phaseLabel(current.phase, t),
    meta: timing ? `${day} · ${timing}` : day,
    body: phaseBody(current.phase, t),
    day: current.cycleDay,
    timeline,
    openLabel: t.phaseCardOpen,
    dialogTitle: t.phaseDetailsTitle,
  };
}

/** The card for a period that is due or late (no phase while the cycle runs past its forecast). */
export function dueCardModel(overview: CycleOverview, t: Messages): PhaseCardModel | null {
  const forecast = overview.forecast;
  if (!forecast) return null;
  const days = overview.nextPeriodInDays ?? 0;
  const late = Math.max(0, -days);
  const level =
    forecast.uncertainty === "low" ? t.uncertaintyLow : forecast.uncertainty === "medium" ? t.uncertaintyMedium : t.uncertaintyHigh;
  const day = overview.currentCycleDay ?? 1;
  const timeline = overview.nextPeriodDate
    ? cycleTimeline(forecast.lastPeriodStart, overview.nextPeriodDate, periodLength(overview))
    : null;
  return {
    kind: "due",
    phase: "menstrual",
    next: "luteal",
    label: t.dueCardLabel,
    title: late === 0 ? t.dueTitleToday : late === 1 ? t.dueTitleLateOne : t.dueTitleLateMany.replace("{days}", String(late)),
    meta: `${t.cycleDayShort.replace("{day}", String(day))} · ${t.periodDueUncertainty.replace("{level}", level)}`,
    body: late === 0 ? t.dueShortToday : t.dueShortLate,
    day,
    timeline,
    openLabel: t.dueCardOpen,
    dialogTitle: t.dueDetailsTitle,
  };
}

/** The ring, the phase (or the expected period) and today's line; shared by the card and its expanded view. */
export function PhaseHeader({ model, animate }: { model: PhaseCardModel; animate: boolean }) {
  return (
    <div className="relative z-[1]">
      <div className="flex items-center gap-3">
        <PhaseRing
          timeline={model.timeline}
          day={model.day}
          phase={model.phase}
          due={model.kind === "due"}
          animate={animate}
        />
        <div
          className={cn("flex min-w-0 flex-col gap-[3px] pr-7", animate && "animate-fade-up")}
          style={animate ? { animationDelay: "300ms" } : undefined}
        >
          {model.label ? (
            <p className="text-[10px] font-extrabold tracking-[0.07em] uppercase" style={{ color: PHASE_INK[model.phase] }}>
              {model.label}
            </p>
          ) : null}
          <p className="font-serif text-[23px] leading-[1.1] text-balance">{model.title}</p>
          <p className="text-xs font-bold text-card-foreground/85">{model.meta}</p>
        </div>
      </div>
      <p
        className={cn("mt-2.5 text-[13px] leading-[1.45] text-pretty text-card-foreground/85", animate && "animate-fade-up")}
        style={animate ? { animationDelay: "450ms" } : undefined}
      >
        {model.body}
      </p>
    </div>
  );
}

/**
 * The card above the calendar. Tapping it expands it (see PhaseCardOverlay)
 * into `details`. Ghosts of the calendar (TabGhosts) show it but never open it.
 */
export function PhaseCard({
  model,
  details,
  t,
}: {
  model: PhaseCardModel;
  details: (howEstimated: () => void) => ReactNode;
  t: Messages;
}) {
  const ghost = useIsGhost();
  const isDesktop = useIsDesktop();
  const cardRef = useRef<HTMLElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState<CardRect | null>(null);
  const open = origin !== null;
  // Back to the card once it shows again (it is hidden while expanded).
  const restoreFocusRef = useRef(false);
  useEffect(() => {
    if (open || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    openRef.current?.focus();
  }, [open]);

  function expand() {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect || ghost) return;
    setOrigin({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  }

  return (
    <>
      <section
        ref={cardRef}
        className={cn(
          "animate-fade-up relative isolate overflow-hidden rounded-3xl border border-border/70 bg-card px-[18px] py-4 text-card-foreground shadow-sm",
          open && !isDesktop && "invisible",
        )}
        style={{ animationDelay: "60ms" }}
      >
        <PhaseAura phase={model.phase} next={model.next} animate />
        <PhaseHeader model={model} animate />
        <button
          ref={openRef}
          type="button"
          onClick={expand}
          disabled={ghost}
          aria-label={model.openLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <span
            aria-hidden
            className="absolute top-3.5 right-3.5 flex size-[26px] items-center justify-center rounded-full border border-[var(--glass-edge)] bg-[var(--glass)] text-card-foreground"
          >
            <ChevronDown className="phase-nudge size-3.5" />
          </span>
        </button>
      </section>
      {origin ? (
        <PhaseCardOverlay
          origin={origin}
          desktop={isDesktop}
          phase={model.phase}
          next={model.next}
          title={model.dialogTitle}
          header={<PhaseHeader model={model} animate={false} />}
          details={details}
          t={t}
          onClosed={() => {
            restoreFocusRef.current = true;
            setOrigin(null);
          }}
        />
      ) : null}
    </>
  );
}

/** Only the cycle day: no phase to show (forecasting off and no bleeding today). */
export function CycleDayCard({ day, t }: { day: number; t: Messages }) {
  return (
    <section
      className="animate-fade-up relative isolate overflow-hidden rounded-3xl border border-border/70 bg-card px-[18px] py-4 text-card-foreground shadow-sm"
      style={{ animationDelay: "60ms" }}
    >
      <PhaseAura phase="luteal" next="menstrual" animate />
      <p className="relative z-[1] font-serif text-[23px] leading-[1.1]">{t.cycleDay.replace("{day}", String(day))}</p>
    </section>
  );
}
