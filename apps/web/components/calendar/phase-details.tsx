// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState, type CSSProperties } from "react";
import { CalendarDays, Plus } from "lucide-react";

import { coverageInterval, ForecastChart } from "@/components/forecast-chart";
import { NEXT_PHASE, PHASE_INK, PhaseGlyph, phaseTint } from "@/components/calendar/phase-visuals";
import { initialProbabilityLabel } from "@/lib/cycle/period-timing";
import { phaseLabel, phaseSeason, type CycleOverview, type CyclePhase, type CycleSeason } from "@/lib/cycle/phases";
import { dayPosition, ovulationPosition, phaseProgress, type CycleTimeline } from "@/lib/cycle/phase-timeline";
import { formatIsoUtc } from "@/lib/format-date";
import type { Locale, Messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type PhaseCopyKeys = {
  summary: keyof Messages;
  inside: keyof Messages;
  feel: [keyof Messages, keyof Messages, keyof Messages];
  tip: keyof Messages;
};

const COPY: Record<CyclePhase, PhaseCopyKeys> = {
  menstrual: {
    summary: "phaseMenstrualSummary",
    inside: "phaseMenstrualInside",
    feel: ["phaseMenstrualFeel1", "phaseMenstrualFeel2", "phaseMenstrualFeel3"],
    tip: "phaseMenstrualTip",
  },
  follicular: {
    summary: "phaseFollicularSummary",
    inside: "phaseFollicularInside",
    feel: ["phaseFollicularFeel1", "phaseFollicularFeel2", "phaseFollicularFeel3"],
    tip: "phaseFollicularTip",
  },
  ovulation: {
    summary: "phaseOvulationSummary",
    inside: "phaseOvulationInside",
    feel: ["phaseOvulationFeel1", "phaseOvulationFeel2", "phaseOvulationFeel3"],
    tip: "phaseOvulationTip",
  },
  luteal: {
    summary: "phaseLutealSummary",
    inside: "phaseLutealInside",
    feel: ["phaseLutealFeel1", "phaseLutealFeel2", "phaseLutealFeel3"],
    tip: "phaseLutealTip",
  },
};

const SEASON_LABELS: Record<CycleSeason, keyof Messages> = {
  winter: "seasonWinter",
  spring: "seasonSpring",
  summer: "seasonSummer",
  fall: "seasonFall",
};

/** Staggered entrance inside the expanded card (see `.phase-reveal` in globals.css). */
function reveal(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}

function dayRange(start: string, end: string, locale: Locale): string {
  const formatter = new Intl.DateTimeFormat(locale === "es" ? "es" : "en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return formatter.formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`));
}

/** The cycle as one bar per phase, today marked, and its two hormonal halves. */
function CycleBars({
  timeline,
  day,
  t,
  revealIndex,
}: {
  timeline: CycleTimeline;
  day: number;
  t: Messages;
  revealIndex: number;
}) {
  const progress = phaseProgress(timeline, day);
  const today = dayPosition(timeline, day) * 100;
  const split = ovulationPosition(timeline);
  return (
    <section className="phase-reveal mt-4" style={reveal(revealIndex)}>
      <h3 className="text-[10px] font-extrabold tracking-[0.1em] text-muted-foreground uppercase">
        {t.cycleTimelineTitle.replace("{days}", String(timeline.length))}
      </h3>
      <div className="relative mt-6">
        <div
          className="absolute -top-5 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `clamp(14px, ${today}%, calc(100% - 14px))` }}
          aria-hidden
        >
          <span className="rounded-full bg-foreground px-[7px] py-px text-[9px] font-extrabold tracking-[0.06em] text-background uppercase">
            {t.today}
          </span>
          <span className="h-1.5 w-0.5 bg-foreground" />
        </div>
        <div className="flex gap-[3px]">
          {timeline.spans.map((span, index) => (
            <div
              key={span.phase}
              className="h-2 min-w-0 overflow-hidden rounded-full"
              style={{ flex: `${span.endDay - span.startDay + 1} 1 0`, background: phaseTint(span.phase, 20) }}
            >
              <div
                className="phase-bar-grow h-full rounded-full"
                style={{
                  width: `${progress[index] * 100}%`,
                  background: PHASE_INK[span.phase],
                  animationDelay: `${300 + index * 140}ms`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="relative mt-1 h-4 text-[10px] font-bold text-muted-foreground" aria-hidden>
          {timeline.spans.map((span) => (
            <span key={span.phase} className="absolute" style={{ left: `${((span.startDay - 1) / timeline.length) * 100}%` }}>
              {span.startDay}
            </span>
          ))}
          <span className="absolute right-0">{timeline.length}</span>
        </div>
        {split !== null ? (
          <div className="mt-1.5">
            <div className="flex h-0.5 gap-[3px]" aria-hidden>
              <span className="rounded-full" style={{ flex: `${split} 1 0`, background: PHASE_INK.follicular }} />
              <span className="rounded-full" style={{ flex: `${1 - split} 1 0`, background: PHASE_INK.luteal }} />
            </div>
            <p className="mt-1 flex flex-wrap justify-between gap-x-3 text-[10px] font-extrabold">
              <span style={{ color: PHASE_INK.follicular }}>{t.cycleHalfFirst}</span>
              <span style={{ color: PHASE_INK.luteal }}>{t.cycleHalfSecond}</span>
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function HowEstimated({ t, onClick, phase }: { t: Messages; onClick: () => void; phase: CyclePhase }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 text-[11.5px] font-extrabold whitespace-nowrap underline-offset-4 hover:underline"
      style={{ color: PHASE_INK[phase] }}
    >
      {t.howEstimated}
    </button>
  );
}

/**
 * The expanded phase card: the cycle at a glance, each phase with its dates
 * (the current one open: what happens inside, how you may feel, what may
 * help), the next period, and how it is all estimated.
 */
export function PhaseDetails({
  overview,
  timeline,
  phase,
  day,
  locale,
  t,
  onHowEstimated,
}: {
  overview: CycleOverview;
  timeline: CycleTimeline | null;
  phase: CyclePhase;
  day: number;
  locale: Locale;
  t: Messages;
  onHowEstimated: () => void;
}) {
  const [active, setActive] = useState<CyclePhase>(phase);
  const spans = timeline?.spans ?? [];
  const phases: CyclePhase[] = spans.length > 0 ? spans.map((span) => span.phase) : [phase];
  const nextPhase = NEXT_PHASE[phase];
  const days = overview.nextPeriodInDays;
  const nextDate = overview.nextPeriodDate;
  const when =
    days === null ? null : days <= 0 ? t.todayLower : days === 1 ? t.inOneDay : t.inDays.replace("{days}", String(days));

  return (
    <div className="flex flex-col">
      {timeline ? <CycleBars timeline={timeline} day={day} t={t} revealIndex={0} /> : null}
      <ul className="mt-3 flex flex-col gap-1.5">
        {phases.map((item, index) => {
          const span = spans.find((entry) => entry.phase === item);
          const open = item === active;
          const copy = COPY[item];
          const season = String(t[SEASON_LABELS[phaseSeason(item)]]);
          return (
            <li key={item} className="phase-reveal" style={reveal(index + 1)}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setActive(item)}
                className="flex w-full gap-2.5 rounded-[18px] border px-3 py-2.5 text-left transition-colors"
                style={{
                  background: open ? phaseTint(item, 14) : "transparent",
                  borderColor: open ? phaseTint(item, 30) : "transparent",
                }}
              >
                <span
                  className="flex size-[30px] shrink-0 items-center justify-center rounded-full"
                  style={{ background: phaseTint(item, 18), color: PHASE_INK[item] }}
                >
                  <PhaseGlyph phase={item} className="size-[15px]" />
                </span>
                <span className="block min-w-0 flex-1">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold">{phaseLabel(item, t)}</span>
                    <span className="text-[11px] font-bold text-muted-foreground">{season}</span>
                    {item === phase ? (
                      <span
                        className="self-center rounded-full px-1.5 py-px text-[8.5px] font-extrabold tracking-[0.08em] text-card uppercase"
                        style={{ background: PHASE_INK[item] }}
                      >
                        {t.phaseNow}
                      </span>
                    ) : item === nextPhase ? (
                      <span className="self-center rounded-full border border-border px-1.5 py-px text-[8.5px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
                        {t.phaseNext}
                      </span>
                    ) : null}
                    <span className="flex-1" />
                    {span ? (
                      <span className="text-[11px] font-bold whitespace-nowrap text-muted-foreground">
                        {open
                          ? t.phaseDays.replace("{start}", String(span.startDay)).replace("{end}", String(span.endDay))
                          : dayRange(span.start, span.end, locale)}
                      </span>
                    ) : null}
                  </span>
                  {open ? (
                    <span className="block">
                      <span className="mt-2 block text-[9.5px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
                        {t.phaseInsideLabel}
                      </span>
                      <span className="mt-0.5 block text-xs leading-[1.45] text-card-foreground/85">{String(t[copy.inside])}</span>
                      <span className="mt-2 block text-[9.5px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
                        {t.phaseFeelLabel}
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-[5px]">
                        {copy.feel.map((key) => (
                          <span
                            key={key}
                            className="rounded-full border border-[var(--glass-edge)] bg-[var(--glass)] px-[9px] py-[3px] text-[11.5px] font-bold"
                          >
                            {String(t[key])}
                          </span>
                        ))}
                      </span>
                      <span className="mt-2 block text-xs leading-[1.45] text-card-foreground/85">
                        <span className="font-extrabold text-card-foreground">{t.phaseTipLabel} </span>
                        {String(t[copy.tip])}
                      </span>
                      {item === "ovulation" ? (
                        <span className="mt-1.5 block text-[11px] leading-[1.4] text-muted-foreground">{t.phaseOvulationNote}</span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-xs leading-[1.4] text-muted-foreground">{String(t[copy.summary])}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {nextDate && when ? (
        <div
          className="phase-reveal mt-2 flex items-center gap-2.5 rounded-[18px] border border-border px-3 py-2.5"
          style={reveal(phases.length + 1)}
        >
          <span
            className="flex size-[30px] shrink-0 items-center justify-center rounded-full"
            style={{ background: phaseTint("menstrual", 18), color: PHASE_INK.menstrual }}
          >
            <CalendarDays className="size-[15px]" aria-hidden />
          </span>
          <span className="block min-w-0 flex-1">
            <span className="block text-sm font-extrabold">{t.nextPeriodLabel}</span>
            <span className="mt-px block text-xs font-semibold text-muted-foreground first-letter:uppercase">
              {t.nextPeriodDetail
                .replace("{date}", formatIsoUtc(nextDate, locale, { weekday: "short", day: "numeric", month: "short" }))
                .replace("{when}", when)}
            </span>
          </span>
          <HowEstimated t={t} onClick={onHowEstimated} phase={phase} />
        </div>
      ) : null}
      <p
        className="phase-reveal mt-2 text-center text-[10.5px] leading-[1.45] text-muted-foreground"
        style={reveal(phases.length + 2)}
      >
        {t.phaseDetailsNotice}
      </p>
    </div>
  );
}

/**
 * The expanded card when the period is due or late: the daily probability of
 * it starting, the cycle that has gone by, and what to do when it starts.
 */
export function DueDetails({
  overview,
  timeline,
  day,
  today,
  locale,
  t,
  onHowEstimated,
}: {
  overview: CycleOverview;
  timeline: CycleTimeline | null;
  day: number;
  today: string;
  locale: Locale;
  t: Messages;
  onHowEstimated: () => void;
}) {
  const forecast = overview.forecast;
  const interval = forecast ? coverageInterval(forecast.dailyProbabilities, 0.8) : null;
  const shortDate = (iso: string) =>
    iso === today ? t.todayLower : formatIsoUtc(iso, locale, { day: "numeric", month: "short" });
  const likely = forecast
    ? [
        t.dueMostLikely.replace("{date}", shortDate(forecast.mostLikelyDate)),
        interval ? t.dueLikelyBy.replace("{date}", shortDate(interval.upper)) : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <div className="flex flex-col">
      {forecast ? (
        <section className="phase-reveal mt-4" style={reveal(1)}>
          <h3 className="text-[10px] font-extrabold tracking-[0.1em] text-muted-foreground uppercase">{t.dueChartTitle}</h3>
          <div className="mt-2">
            <ForecastChart
              daily={forecast.dailyProbabilities}
              mostLikelyDate={forecast.mostLikelyDate}
              interval={interval}
              referenceDate={today}
              locale={locale}
              t={t}
              compact
            />
          </div>
          {likely ? <p className="mt-1 text-xs font-bold text-card-foreground/85">{likely}</p> : null}
          {overview.initialStartProbability !== null ? (
            <p className="mt-1 text-[11px] leading-[1.4] text-muted-foreground">
              {initialProbabilityLabel(overview.initialStartProbability, t)}
            </p>
          ) : null}
        </section>
      ) : null}
      {timeline ? <CycleBars timeline={timeline} day={day} t={t} revealIndex={2} /> : null}
      <div
        className="phase-reveal mt-3 flex items-start gap-2.5 rounded-[18px] px-3 py-2.5"
        style={{ ...reveal(3), background: phaseTint("menstrual", 14) }}
      >
        <span
          className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-card"
          style={{ color: PHASE_INK.menstrual }}
        >
          <Plus className="size-[15px]" aria-hidden />
        </span>
        <p className="text-[12.5px] leading-[1.45] text-card-foreground/85">
          <span className="font-extrabold text-card-foreground">{t.dueTipStrong}</span> {t.dueTipRest}
        </p>
      </div>
      <div className={cn("phase-reveal mt-2.5 flex items-center justify-between gap-2.5")} style={reveal(4)}>
        <p className="text-[11px] leading-[1.4] text-muted-foreground">{t.dueNotice}</p>
        <HowEstimated t={t} onClick={onHowEstimated} phase="menstrual" />
      </div>
    </div>
  );
}
