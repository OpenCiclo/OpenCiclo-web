// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { PhaseCardOverlay, type CardRect } from "@/components/calendar/phase-card-overlay";
import { CARD, NEXT_PHASE, PHASE_INK, PhaseAura, PhaseRing } from "@/components/calendar/phase-visuals";
import { useIsDesktop } from "@/lib/client/desktop";
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
      <div className={CARD.row}>
        <PhaseRing
          timeline={model.timeline}
          day={model.day}
          phase={model.phase}
          due={model.kind === "due"}
          animate={animate}
          sizeClass={CARD.ring}
          glyphClass={CARD.ringGlyph}
        />
        <div className={cn(CARD.column, animate && "animate-fade-up")} style={animate ? { animationDelay: "300ms" } : undefined}>
          {model.label ? (
            <p className={CARD.label} style={{ color: PHASE_INK[model.phase] }}>
              {model.label}
            </p>
          ) : null}
          <p className={CARD.title}>{model.title}</p>
          <p className={CARD.meta}>{model.meta}</p>
        </div>
      </div>
      <p
        className={cn(CARD.body, animate && "animate-fade-up")}
        style={animate ? { animationDelay: "450ms" } : undefined}
      >
        {model.body}
      </p>
    </div>
  );
}

/**
 * The card above the calendar. Tapping it expands it (see PhaseCardOverlay)
 * into `details`.
 */
export function PhaseCard({
  model,
  details,
  wideDetails,
  t,
}: {
  model: PhaseCardModel;
  details: (howEstimated: () => void) => ReactNode;
  /** The desktop dialog's own layout (see PhaseCardOverlay). */
  wideDetails?: (howEstimated: () => void, header: ReactNode) => ReactNode;
  t: Messages;
}) {
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
    if (!rect) return;
    setOrigin({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  }

  return (
    <>
      <section
        ref={cardRef}
        className={cn(
          "animate-fade-up relative isolate overflow-hidden rounded-3xl border border-border/70 bg-card text-card-foreground shadow-sm",
          CARD.pad,
          CARD.aura,
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
          aria-label={model.openLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <span aria-hidden className={cn(CARD.corner, "desktop:top-4 desktop:right-4")}>
            <ChevronDown className={cn("phase-nudge", CARD.cornerIcon)} />
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
          wideDetails={wideDetails}
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
      className={cn(
        "animate-fade-up relative isolate overflow-hidden rounded-3xl border border-border/70 bg-card text-card-foreground shadow-sm",
        CARD.pad,
      )}
      style={{ animationDelay: "60ms" }}
    >
      <PhaseAura phase="luteal" next="menstrual" animate />
      <p className={cn("relative z-[1]", CARD.title)}>{t.cycleDay.replace("{day}", String(day))}</p>
    </section>
  );
}
