// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { Droplet, Leaf, Sparkles, Sprout, type LucideIcon } from "lucide-react";

import type { CyclePhase } from "@/lib/cycle/phases";
import { phaseProgress, type CycleTimeline } from "@/lib/cycle/phase-timeline";
import { cn } from "@/lib/utils";

/** Each phase's colour for text and arcs (theme tokens in globals.css). */
export const PHASE_INK: Record<CyclePhase, string> = {
  menstrual: "var(--phase-menstrual-ink)",
  follicular: "var(--phase-follicular-ink)",
  ovulation: "var(--phase-ovulation-ink)",
  luteal: "var(--phase-luteal-ink)",
};

/** Each phase's colour for the blurred light behind the ring. */
export const PHASE_AURA: Record<CyclePhase, string> = {
  menstrual: "var(--phase-menstrual-aura)",
  follicular: "var(--phase-follicular-aura)",
  ovulation: "var(--phase-ovulation-aura)",
  luteal: "var(--phase-luteal-aura)",
};

export const NEXT_PHASE: Record<CyclePhase, CyclePhase> = {
  menstrual: "follicular",
  follicular: "ovulation",
  ovulation: "luteal",
  luteal: "menstrual",
};

const PHASE_ICON: Record<CyclePhase, LucideIcon> = {
  menstrual: Droplet,
  follicular: Sprout,
  ovulation: Sparkles,
  luteal: Leaf,
};

/** The endless motions of the card (globals.css). Entrances are left alone. */
const LOOPS = new Set(["phase-spin", "phase-glow", "phase-float", "phase-beat", "phase-halo"]);

/**
 * Puts every endless motion under `root` on the page's clock, so two copies of
 * the card (the one above the calendar and its expanded view) move as one:
 * opening or closing swaps them with nothing jumping.
 */
function useSharedClock(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const element = root.current;
    if (!element || typeof element.getAnimations !== "function") return;
    for (const animation of element.getAnimations({ subtree: true })) {
      if (animation instanceof CSSAnimation && LOOPS.has(animation.animationName)) animation.startTime = 0;
    }
  }, [root]);
}

/** A phase's tint over the card: `amount` percent of its ink. */
export function phaseTint(phase: CyclePhase, amount: number): string {
  return `color-mix(in oklch, ${PHASE_INK[phase]} ${amount}%, transparent)`;
}

export function PhaseGlyph({ phase, className }: { phase: CyclePhase; className?: string }) {
  const Icon = PHASE_ICON[phase];
  return <Icon className={className} aria-hidden />;
}

const SIZE = 66;
const RADIUS = 27;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Room between two phases on the ring, in degrees (less on very short phases). */
const GAP_DEGREES = 30;
/** When the ring fills on first show: one phase after another, the current one slower. */
const FILL_START_MS = 300;
const FILL_PAST_MS = 320;
const FILL_NOW_MS = 900;

/**
 * The cycle as a ring of chapters, one arc per phase, filled up to `day`.
 * `due`: the whole cycle has gone by and the next period is expected (every
 * arc full, a beating dot where the next cycle starts). Without a timeline
 * (no forecast) it is a plain ring in the phase's colour.
 */
export function PhaseRing({
  timeline,
  day,
  phase,
  due = false,
  animate,
}: {
  timeline: CycleTimeline | null;
  day: number;
  phase: CyclePhase;
  due?: boolean;
  animate: boolean;
}) {
  const progress = timeline ? (due ? timeline.spans.map(() => 1) : phaseProgress(timeline, day)) : [];
  const current = timeline ? timeline.spans.findIndex((span) => span.phase === phase) : -1;
  const arcs = timeline
    ? timeline.spans.map((span, index) => {
        const from = ((span.startDay - 1) / timeline.length) * 360;
        const to = (span.endDay / timeline.length) * 360;
        const gap = Math.min(GAP_DEGREES, (to - from) * 0.5);
        const length = (((to - from - gap) / 360) * CIRCUMFERENCE).toFixed(2);
        const filled = ((((to - from - gap) / 360) * CIRCUMFERENCE) * progress[index]).toFixed(2);
        return {
          key: span.phase,
          color: PHASE_INK[span.phase],
          track: `${length} ${CIRCUMFERENCE.toFixed(2)}`,
          filled: `${filled} ${CIRCUMFERENCE.toFixed(2)}`,
          offset: (-((from + gap / 2) / 360) * CIRCUMFERENCE).toFixed(2),
          shown: progress[index] > 0,
          delay: FILL_START_MS + index * FILL_PAST_MS,
          duration: index === current ? FILL_NOW_MS : FILL_PAST_MS,
        };
      })
    : [];
  const glyphDelay = FILL_START_MS + Math.max(0, current) * FILL_PAST_MS + FILL_NOW_MS - 200;
  const rootRef = useRef<HTMLDivElement>(null);
  useSharedClock(rootRef);

  return (
    <div ref={rootRef} className="relative shrink-0" style={{ width: SIZE, height: SIZE }} aria-hidden>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 overflow-visible">
        <g className={animate ? "phase-ring-in" : undefined}>
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {timeline ? (
              arcs.map((arc) => (
                <g key={arc.key}>
                  <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={arc.color}
                    strokeOpacity={due ? 0.85 : 0.22}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={arc.track}
                    strokeDashoffset={arc.offset}
                  />
                  {!due && arc.shown ? (
                    <circle
                      cx={SIZE / 2}
                      cy={SIZE / 2}
                      r={RADIUS}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeDasharray={arc.filled}
                      strokeDashoffset={arc.offset}
                      className={animate ? "phase-arc-fill" : undefined}
                      style={animate ? { animationDelay: `${arc.delay}ms`, animationDuration: `${arc.duration}ms` } : undefined}
                    />
                  ) : null}
                </g>
              ))
            ) : (
              <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={PHASE_INK[phase]} strokeOpacity={0.3} strokeWidth={6} />
            )}
          </g>
        </g>
        {due ? (
          <>
            <circle className="phase-halo" cx={SIZE / 2} cy={SIZE / 2 - RADIUS} r={4.5} fill={PHASE_INK.menstrual} />
            <circle cx={SIZE / 2} cy={SIZE / 2 - RADIUS} r={4.5} fill={PHASE_INK.menstrual} stroke="var(--card)" strokeWidth={2} />
          </>
        ) : null}
      </svg>
      <div
        className={cn("absolute inset-0 flex items-center justify-center", animate && "phase-glyph-in")}
        style={{ color: PHASE_INK[due ? "menstrual" : phase], animationDelay: animate ? `${due ? 600 : glyphDelay}ms` : undefined }}
      >
        <span className={cn("flex", due ? "phase-beat" : "phase-float")}>
          <PhaseGlyph phase={due ? "menstrual" : phase} className="size-5" />
        </span>
      </div>
    </div>
  );
}

/**
 * The blurred light behind the ring: a glow in the phase's colour and two
 * lights orbiting it (the next phase's and the brand rose). Laid out for a
 * card with the ring 18 px from the left and 16 px from the top.
 */
export function PhaseAura({
  phase,
  next,
  animate,
  wide = false,
}: {
  phase: CyclePhase;
  next: CyclePhase;
  animate: boolean;
  /** Bigger light, for the expanded card. */
  wide?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  useSharedClock(rootRef);
  return (
    <div ref={rootRef} aria-hidden className={cn("pointer-events-none absolute inset-0 z-0", animate && "phase-aura-in")}>
      {/* Grows with the card as it opens and is back to size when it has closed (same length as the close). */}
      <div
        className="absolute will-change-transform"
        style={{
          left: -13,
          top: -15,
          width: 128,
          height: 128,
          transform: wide ? "scale(1.7)" : "scale(1)",
          transition: wide
            ? "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)"
            : "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className="phase-glow size-full rounded-full blur-[30px]"
          style={{ background: PHASE_AURA[phase], opacity: "var(--aura-glow)" }}
        />
      </div>
      <div className="phase-spin absolute will-change-transform" style={{ left: 51, top: 49, width: 0, height: 0 }}>
        <div
          className="absolute size-[76px] rounded-full blur-[26px]"
          style={{ left: 24, top: -40, background: PHASE_AURA[next], opacity: "var(--aura-blob)" }}
        />
        <div
          className="absolute size-[70px] rounded-full bg-primary blur-[26px]"
          style={{ left: -96, top: 6, opacity: "var(--aura-blob-soft)" }}
        />
      </div>
    </div>
  );
}
