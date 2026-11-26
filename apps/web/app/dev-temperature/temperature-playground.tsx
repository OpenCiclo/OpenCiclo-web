// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState } from "react";

import { DaySheet, type DayPregnancyInfo } from "@/components/calendar/day-sheet";
import { TemperatureCardView } from "@/components/patterns/temperature-card";
import { Button } from "@/components/ui/button";
import { addDaysIso, parseDiary, type DayLog, type Diary } from "@/lib/diary";
import { messages } from "@/lib/i18n";
import { DEFAULT_FAVORITE_SYMPTOM_IDS } from "@/lib/symptoms/definitions";
import { TEMPERATURE_UNITS, unitSymbol, type TemperatureUnit } from "@/lib/temperature";

const TODAY = "2026-07-01";

/** A diary whose cycles start on `starts`, with `readings` keyed by date. */
function diaryOf(starts: string[], readings: Record<string, number>): Diary {
  const days: Record<string, DayLog> = {};
  for (const start of starts) {
    for (let offset = 0; offset < 4; offset += 1) days[addDaysIso(start, offset)] = { flow: offset < 2 ? "medium" : "light", symptoms: {} };
  }
  for (const [iso, bbt] of Object.entries(readings)) days[iso] = { ...(days[iso] ?? { symptoms: {} }), bbt };
  return parseDiary({ schemaVersion: 9, locale: "en", periodStarts: starts, days });
}

/** A reading on each of `count` days from `from`, low then higher: an ordinary-looking chart, nothing more. */
function run(from: string, count: number, skip: number[] = []): Record<string, number> {
  const readings: Record<string, number> = {};
  for (let index = 0; index < count; index += 1) {
    if (skip.includes(index)) continue;
    const wobble = [0, 0.05, -0.04, 0.08, -0.02, 0.03, -0.06][index % 7];
    readings[addDaysIso(from, index)] = Math.round((36.4 + (index > 14 ? 0.3 : 0) + wobble) * 100) / 100;
  }
  return readings;
}

const STATES: [string, Diary][] = [
  ["No readings (the card does not show)", diaryOf(["2026-06-08"], {})],
  ["One reading, open cycle", diaryOf(["2026-06-08"], { "2026-06-12": 36.55 })],
  ["Open cycle with gaps", diaryOf(["2026-06-08"], run("2026-06-08", 22, [3, 4, 9, 15, 16, 17]))],
  ["A full cycle, then the open one", diaryOf(["2026-05-11", "2026-06-08"], { ...run("2026-05-11", 28), ...run("2026-06-08", 10) })],
  [
    "Several cycles (use the arrows)",
    diaryOf(["2026-03-16", "2026-04-13", "2026-05-11", "2026-06-08"], {
      ...run("2026-03-16", 28, [5, 6]),
      ...run("2026-04-13", 28),
      ...run("2026-05-11", 28, [20]),
      ...run("2026-06-08", 20),
    }),
  ],
  ["A flat cycle (the axis must not stretch it)", diaryOf(["2026-06-08"], { "2026-06-09": 36.5, "2026-06-10": 36.52, "2026-06-11": 36.48, "2026-06-12": 36.5 })],
  ["A long open cycle", diaryOf(["2026-03-01"], { ...run("2026-03-01", 30), ...run("2026-06-10", 12) })],
  ["Readings before any period start", diaryOf([], { "2026-06-10": 36.5, "2026-06-11": 36.6 })],
  ["Some readings outside a cycle", diaryOf(["2026-06-08"], { "2026-05-30": 36.5, ...run("2026-06-08", 12) })],
];

/** The day sheet's own states: [label, the saved day, read-only, a pregnancy day]. */
const DAYS: [string, DayLog | undefined, boolean, boolean][] = [
  ["Empty day", undefined, false, false],
  ["Saved 36.57 °C (flip the unit, then close: no discard question)", { symptoms: {}, bbt: 36.57 }, false, false],
  ["Read-only, with a value", { symptoms: {}, bbt: 36.6 }, true, false],
  ["A pregnancy day with a value (row stays)", { symptoms: {}, bbt: 36.9 }, false, true],
  ["A pregnancy day without one (no row)", undefined, false, true],
];

const PREGNANCY_DAY: DayPregnancyInfo = {
  bleed: { kind: "none" },
  test: "none",
  past: null,
  day: {
    record: {
      id: "0123456789abcdef0123456789abcdef",
      dating: { method: "lmp", lmp: "2026-05-01", cycleLength: null },
      dueDate: "2027-02-05",
      end: null,
      hidden: false,
      friendsMode: "noNews",
      bleedAnswers: {},
    },
    goingOn: true,
    movement: false,
  },
  onAnswerBleed: () => undefined,
  onStartPregnancy: null,
};

export function TemperaturePlayground() {
  const [locale, setLocale] = useState<"es" | "en">("en");
  const [unit, setUnit] = useState<TemperatureUnit>("c");
  const [day, setDay] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const t = messages[locale];
  const state = day === null ? null : DAYS[day];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Playground</p>
          <h1 className="font-serif text-3xl">Temperature</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            The day sheet&apos;s row and Patterns&apos; card with fixed data (today = {TODAY}). Nothing here saves to the diary.
          </p>
          <div className="flex flex-wrap gap-2">
            {(["es", "en"] as const).map((value) => (
              <Button key={value} type="button" variant={locale === value ? "default" : "outline"} onClick={() => setLocale(value)}>
                {value.toUpperCase()}
              </Button>
            ))}
            {TEMPERATURE_UNITS.map((value) => (
              <Button key={value} type="button" variant={unit === value ? "default" : "outline"} onClick={() => setUnit(value)}>
                {unitSymbol(value)}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(([label], index) => (
              <Button
                key={label}
                type="button"
                variant="outline"
                onClick={() => {
                  setDay(index);
                  setOpen(true);
                }}
              >
                Day sheet: {label}
              </Button>
            ))}
          </div>
          {saved ? <p className="font-mono text-xs text-muted-foreground">saved: {saved}</p> : null}
        </header>
        <section className="grid gap-6 desktop:grid-cols-2">
          {STATES.map(([label, diary]) => (
            <div key={label} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
              <TemperatureCardView diary={diary} today={TODAY} locale={locale} t={t} temperatureUnit={unit} />
            </div>
          ))}
        </section>
      </div>
      <DaySheet
        open={open}
        iso={state ? TODAY : null}
        log={state?.[1]}
        locale={locale}
        t={t}
        favoriteSymptomIds={[...DEFAULT_FAVORITE_SYMPTOM_IDS]}
        customSymptoms={[]}
        saving={false}
        error={null}
        lunarPhasesEnabled={false}
        readOnly={state?.[2] ?? false}
        onClose={() => setOpen(false)}
        onExited={() => setDay(null)}
        onSave={(log) => {
          setSaved(JSON.stringify(log));
          setOpen(false);
        }}
        onUpdateSymptomPreferences={() => undefined}
        pregnancy={state?.[3] ? PREGNANCY_DAY : null}
        temperatureUnit={unit}
        onTemperatureUnit={setUnit}
      />
    </div>
  );
}
