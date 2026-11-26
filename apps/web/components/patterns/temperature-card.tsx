// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useMemo, useState, type PointerEvent } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useCiclo, useTodayIso } from "@/lib/client/ciclo-context";
import { addDaysIso, type Diary } from "@/lib/diary";
import { formatIsoUtc } from "@/lib/format-date";
import { daysUnit, type Locale, type Messages } from "@/lib/i18n";
import {
  readingsOutsideCycles,
  temperatureAxis,
  temperatureCycles,
  type TemperatureCycle,
} from "@/lib/patterns/temperature";
import { formatTemperature, inUnit, unitSymbol, type TemperatureUnit } from "@/lib/temperature";

const CARD = "animate-fade-up flex flex-col gap-3 rounded-3xl border border-border bg-card p-[18px] text-card-foreground";
/** The Learn article that explains temperature charting and its limits. */
const LEARN_ARTICLE = "fertility-awareness";

function shortDate(iso: string, locale: Locale): string {
  return formatIsoUtc(iso, locale, { day: "numeric", month: "short" });
}

/** Where a cycle day sits across the plot, in percent: the middle of its slot. */
function dayX(day: number, length: number): number {
  return ((day - 0.5) / length) * 100;
}

/** Day numbers under the plot: weekly, further apart on a long cycle so they never crowd. */
function dayTicks(length: number): number[] {
  const step = length <= 42 ? 7 : length <= 84 ? 14 : 28;
  const ticks = [1];
  for (let day = step; day <= length; day += step) ticks.push(day);
  return ticks;
}

/**
 * One cycle's readings as dots on a line, by cycle day. The line joins
 * consecutive days only, so a gap in the log stays a gap. Bleeding days are
 * marked on the baseline. Nothing here reads the chart: no rise, no cover
 * line, no shading (agents.txt, "Temperature").
 */
function Chart({
  cycle,
  unit,
  locale,
  t,
}: {
  cycle: TemperatureCycle;
  unit: TemperatureUnit;
  locale: Locale;
  t: Messages;
}) {
  const [active, setActive] = useState<number | null>(null);
  const axis = useMemo(() => temperatureAxis(cycle, unit), [cycle, unit]);
  const span = axis.max - axis.min;
  const y = (celsius: number) => ((axis.max - inUnit(celsius, unit)) / span) * 100;
  const symbol = unitSymbol(unit);
  const shown = active !== null ? cycle.readings[active] : null;

  // The pointer only has to be nearest to a reading, never on its dot.
  function track(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width <= 0) return;
    const day = ((event.clientX - box.left) / box.width) * cycle.length + 0.5;
    let nearest = 0;
    for (let index = 1; index < cycle.readings.length; index += 1) {
      if (Math.abs(cycle.readings[index].day - day) < Math.abs(cycle.readings[nearest].day - day)) nearest = index;
    }
    setActive(nearest);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="min-h-5 text-[13px] text-muted-foreground" aria-hidden>
        {shown ? (
          <>
            <span className="font-extrabold text-card-foreground">
              {formatTemperature(shown.celsius, unit, locale)} {symbol}
            </span>
            {" · "}
            {t.temperatureReadout.replace("{day}", String(shown.day)).replace("{date}", shortDate(shown.iso, locale))}
          </>
        ) : (
          t.temperatureReadoutHint
        )}
      </p>
      <div
        role="img"
        aria-label={t.temperatureChartLabel
          .replace("{count}", String(cycle.stats.count))
          .replace("{min}", formatTemperature(cycle.stats.min, unit, locale))
          .replace("{max}", formatTemperature(cycle.stats.max, unit, locale))
          .replace("{unit}", symbol)}
        className="flex gap-2"
      >
        {/* Degrees, down the left. */}
        <div className="relative h-40 w-9 shrink-0 text-[11px] font-bold text-muted-foreground tabular-nums" aria-hidden>
          {axis.ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${((axis.max - tick) / span) * 100}%` }}
            >
              {new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(tick)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1" aria-hidden>
          <div
            className="relative h-40 touch-pan-y"
            onPointerDown={track}
            onPointerMove={track}
            onPointerLeave={(event) => {
              // A finger lifting keeps its reading on screen; a mouse leaving clears it.
              if (event.pointerType === "mouse") setActive(null);
            }}
          >
            {axis.ticks.map((tick) => (
              <span
                key={tick}
                className="absolute inset-x-0 h-px bg-border"
                style={{ top: `${((axis.max - tick) / span) * 100}%` }}
              />
            ))}
            {shown ? (
              <span
                className="absolute inset-y-0 w-px bg-muted-foreground/60"
                style={{ left: `${dayX(shown.day, cycle.length)}%` }}
              />
            ) : null}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
              {cycle.runs
                .filter((run) => run.length > 1)
                .map((run) => (
                  <polyline
                    key={run[0].iso}
                    points={run.map((reading) => `${dayX(reading.day, cycle.length)},${y(reading.celsius)}`).join(" ")}
                    fill="none"
                    stroke="var(--foreground)"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
            </svg>
            {cycle.readings.map((reading, index) => (
              <span
                key={reading.iso}
                className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-card transition-transform"
                style={{
                  left: `${dayX(reading.day, cycle.length)}%`,
                  top: `${y(reading.celsius)}%`,
                  scale: index === active ? "1.5" : undefined,
                }}
              />
            ))}
          </div>
          {/* The baseline: bleeding days, then the day numbers. */}
          <div className="relative mt-1.5 h-1 rounded-full bg-border/60">
            {cycle.bleedDays.map((day) => (
              <span
                key={day}
                className="absolute inset-y-0 rounded-full"
                style={{
                  left: `calc(${((day - 1) / cycle.length) * 100}% + 1px)`,
                  width: `calc(${100 / cycle.length}% - 2px)`,
                  minWidth: 2,
                  background: "var(--phase-menstrual-ink)",
                }}
              />
            ))}
          </div>
          <div className="relative mt-1 h-4 text-[11px] font-bold text-muted-foreground tabular-nums">
            {dayTicks(cycle.length).map((day) => (
              <span key={day} className="absolute -translate-x-1/2" style={{ left: `${dayX(day, cycle.length)}%` }}>
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-11 text-xs text-muted-foreground">
        <span>{t.temperatureAxisDay}</span>
        {cycle.bleedDays.length > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-1 w-3 rounded-full" style={{ background: "var(--phase-menstrual-ink)" }} />
            {t.temperatureBleedingKey}
          </span>
        ) : null}
      </p>
    </div>
  );
}

/**
 * Patterns' temperature card: what she logged, one cycle at a time, with plain
 * numbers. Shown once the diary holds a reading, never while a pregnancy goes
 * on. It draws and counts; it does not interpret (the note under it says so).
 */
export function TemperatureCard() {
  const { t, diary, locale, temperatureUnit } = useCiclo();
  const today = useTodayIso();
  return <TemperatureCardView diary={diary} today={today} locale={locale} t={t} temperatureUnit={temperatureUnit} />;
}

/** The card for a given diary and day (`TemperatureCard` hands it the open one; /dev-temperature, fixed ones). */
export function TemperatureCardView({
  diary,
  today,
  locale,
  t,
  temperatureUnit,
}: {
  diary: Diary;
  today: string;
  locale: Locale;
  t: Messages;
  temperatureUnit: TemperatureUnit;
}) {
  const cycles = useMemo(() => temperatureCycles(diary, today), [diary, today]);
  const outside = useMemo(() => readingsOutsideCycles(diary, today), [diary, today]);
  // Which cycle shows, counted back from the newest so a new cycle becomes the one shown.
  const [back, setBack] = useState(0);
  if (cycles.length === 0 && outside === 0) return null;

  const index = Math.max(0, cycles.length - 1 - Math.min(back, Math.max(0, cycles.length - 1)));
  const cycle = cycles[index] as TemperatureCycle | undefined;
  const symbol = unitSymbol(temperatureUnit);
  const value = (celsius: number) => formatTemperature(celsius, temperatureUnit, locale);

  const title = cycle
    ? cycle.open
      ? t.temperatureCycleOpen.replace("{date}", shortDate(cycle.start, locale))
      : `${shortDate(cycle.start, locale)} – ${shortDate(addDaysIso(cycle.end ?? cycle.start, -1), locale)} · ${cycle.length} ${daysUnit(t, locale, cycle.length)}`
    : null;
  const stats = cycle
    ? [
        { label: t.temperatureStatCount, value: String(cycle.stats.count), unit: null },
        { label: t.temperatureStatLowest, value: value(cycle.stats.min), unit: symbol },
        { label: t.temperatureStatHighest, value: value(cycle.stats.max), unit: symbol },
        { label: t.temperatureStatAverage, value: value(cycle.stats.mean), unit: symbol },
      ]
    : [];

  return (
    <section className={CARD}>
      <p className="text-xs font-extrabold tracking-[0.07em] text-muted-foreground uppercase">{t.temperatureSection}</p>
      <h2 className="font-serif text-xl leading-[1.3] text-pretty">{t.temperatureCardTitle}</h2>
      {cycle && title ? (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setBack(cycles.length - index)}
              aria-label={t.temperaturePrevCycle}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-card-foreground disabled:opacity-35"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <p className="min-w-0 flex-1 text-center text-sm font-bold text-pretty" aria-live="polite">
              {title}
            </p>
            <button
              type="button"
              disabled={index === cycles.length - 1}
              onClick={() => setBack(cycles.length - 2 - index)}
              aria-label={t.temperatureNextCycle}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-card-foreground disabled:opacity-35"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
          {/* A new cycle starts with no point picked out. */}
          <Chart key={cycle.start} cycle={cycle} unit={temperatureUnit} locale={locale} t={t} />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 desktop:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-bold text-muted-foreground">{item.label}</dt>
                <dd className="text-lg leading-tight font-extrabold">
                  {item.value}
                  {item.unit ? <span className="ml-1 text-xs font-bold text-muted-foreground">{item.unit}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
          <details className="text-sm">
            <summary className="cursor-pointer font-bold text-muted-foreground underline-offset-4 hover:underline">
              {t.temperatureTableShow}
            </summary>
            <table className="mt-2 w-full text-left text-[13px] tabular-nums">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th scope="col" className="py-1 pr-3 font-bold">
                    {t.temperatureAxisDay}
                  </th>
                  <th scope="col" className="py-1 pr-3 font-bold">
                    {t.temperatureTableDate}
                  </th>
                  <th scope="col" className="py-1 text-right font-bold">
                    {t.temperatureSection} ({symbol})
                  </th>
                </tr>
              </thead>
              <tbody>
                {cycle.readings.map((reading) => (
                  <tr key={reading.iso} className="border-t border-border">
                    <td className="py-1 pr-3">{reading.day}</td>
                    <td className="py-1 pr-3">{shortDate(reading.iso, locale)}</td>
                    <td className="py-1 text-right font-bold">{value(reading.celsius)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      ) : null}
      {outside > 0 ? (
        <p className="text-[13px] leading-[1.45] text-muted-foreground">
          {outside === 1 ? t.temperatureOutsideOne : t.temperatureOutside.replace("{count}", String(outside))}
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        <p className="text-[13px] leading-[1.45] text-muted-foreground text-pretty">{t.temperatureNote}</p>
        <Link
          href={`/learn/${LEARN_ARTICLE}`}
          className="inline-flex min-h-9 items-center gap-1 self-start text-[13px] font-bold text-primary underline-offset-4 hover:underline"
        >
          {t.temperatureLearnLink}
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
