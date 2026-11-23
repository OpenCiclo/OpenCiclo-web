// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useMemo, useState } from "react";

import { PregnancyPatterns } from "@/components/patterns/pregnancy-patterns";
import { PregnancyCard } from "@/components/pregnancy/pregnancy-card";
import { PregnancyEndSheet, PregnancyStartSheet } from "@/components/pregnancy/pregnancy-sheets";
import { ResumingCard } from "@/components/pregnancy/resuming-card";
import { Button } from "@/components/ui/button";
import { addDaysIso, emptyDiary, upsertDay, type Diary, type SymptomMap } from "@/lib/diary";
import { messages, type BaseLocale } from "@/lib/i18n";
import type { PregnancyRecord } from "@/lib/pregnancy/record";

const TODAY = "2026-07-01";

/** A pregnancy that is `weeks`+`days` along on TODAY. */
function along(weeks: number, days: number): PregnancyRecord {
  const lmp = addDaysIso(TODAY, -(weeks * 7 + days));
  return {
    id: `${weeks}`.padStart(2, "0").repeat(16),
    dating: { method: "lmp", lmp, cycleLength: null },
    dueDate: addDaysIso(lmp, 280),
    end: null,
    hidden: false,
    friendsMode: "noNews",
    bleedAnswers: {},
  };
}

const CARDS: [string, PregnancyRecord][] = [
  ["6+2 · first trimester", along(6, 2)],
  ["20+0 · second trimester", along(20, 0)],
  ["39+4 · third trimester", along(39, 4)],
  ["42+3 · asks if it goes on", along(42, 3)],
];

/** Patterns at three points of a pregnancy. */
const PATTERNS: [string, PregnancyRecord][] = [
  ["9+4", along(9, 4)],
  ["20+0", along(20, 0)],
  ["36+2", along(36, 2)],
];

/** A diary with symptoms logged through the pregnancy: `days[week]` days in a row in each week. */
function loggedDiary(record: PregnancyRecord, locale: BaseLocale): Diary {
  const start = addDaysIso(record.dueDate, -280);
  const rows: [SymptomMap, number[]][] = [
    [{ nausea: "moderate" }, [0, 0, 0, 0, 0, 1, 4, 6, 7, 6, 5, 4, 3, 1, 0, 0, 0, 0, 0, 0, 0]],
    [{ fatigue: "mild" }, [0, 0, 0, 0, 0, 0, 3, 5, 6, 6, 5, 5, 4, 4, 2, 1, 0, 2, 1, 0, 1]],
    [{ tenderBreasts: "mild" }, [0, 0, 0, 0, 2, 3, 5, 4, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    [{ headache: "present" }, [0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1, 0, 1, 2, 1, 0, 0, 1, 0, 2, 1]],
    [{ backache: "mild" }, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 2]],
  ];
  let diary = emptyDiary(locale);
  for (const [symptoms, weeks] of rows) {
    weeks.forEach((count, week) => {
      for (let day = 0; day < count; day += 1) {
        const iso = addDaysIso(start, week * 7 + day);
        if (iso > TODAY) continue;
        diary = upsertDay(diary, iso, { symptoms: { ...(diary.days[iso]?.symptoms ?? {}), ...symptoms } });
      }
    });
  }
  return diary;
}

export function PregnancyPlayground() {
  const [locale, setLocale] = useState<BaseLocale>("es");
  const [sheet, setSheet] = useState<"start" | "change" | "end" | "correct" | "past" | "failing" | null>(null);
  const [log, setLog] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const open = (next: NonNullable<typeof sheet>) => {
    setError(null);
    setSheet(next);
  };
  const t = messages[locale];
  const changing = sheet === "change" ? CARDS[1][1] : null;
  const diaries = useMemo(() => PATTERNS.map(([, record]) => loggedDiary(record, locale)), [locale]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Playground</p>
          <h1 className="font-serif text-3xl">Pregnancy mode</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Cards and sheets with fixed data (today = {TODAY}). Nothing here saves to the diary.
          </p>
          <div className="flex flex-wrap gap-2">
            {(["es", "en"] as const).map((value) => (
              <Button key={value} type="button" variant={locale === value ? "default" : "outline"} onClick={() => setLocale(value)}>
                {value.toUpperCase()}
              </Button>
            ))}
            <Button type="button" variant="outline" onClick={() => open("start")}>
              Start sheet
            </Button>
            <Button type="button" variant="outline" onClick={() => open("change")}>
              Change dates
            </Button>
            <Button type="button" variant="outline" onClick={() => open("end")}>
              End sheet
            </Button>
            <Button type="button" variant="outline" onClick={() => open("correct")}>
              Correct an end
            </Button>
            <Button type="button" variant="outline" onClick={() => open("past")}>
              End of a past pregnancy
            </Button>
            <Button type="button" variant="outline" onClick={() => open("failing")}>
              End sheet, save fails
            </Button>
          </div>
          {log ? <p className="font-mono text-xs text-muted-foreground">{log}</p> : null}
        </header>
        <section className="grid gap-5 desktop:grid-cols-2">
          {CARDS.map(([label, record]) => (
            <div key={label} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
              <PregnancyCard
                record={record}
                today={TODAY}
                locale={locale}
                t={t}
                onChangeDates={() => open("change")}
                onEnd={() => open("end")}
              />
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground">After it ended, before the period</p>
            <ResumingCard outcome="ended" t={t} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground">After a birth, before the period</p>
            <ResumingCard outcome="birth" t={t} />
          </div>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-2xl">Patterns while a pregnancy goes on</h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            The pregnancy view of Patterns at a phone&apos;s width, with a made-up diary. The row at the foot opens Patterns&apos; usual cards (a
            stand-in here).
          </p>
          <div className="grid gap-8 desktop:grid-cols-3">
            {PATTERNS.map(([label, record], index) => (
              <div key={label} className="mx-auto flex w-full max-w-[390px] flex-col gap-[22px]">
                <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                <PregnancyPatterns
                  record={record}
                  diary={diaries[index]}
                  today={TODAY}
                  locale={locale}
                  t={t}
                  earlier={{ count: 6, average: 27 }}
                >
                  <p className="rounded-3xl border border-dashed border-border p-[18px] text-sm text-muted-foreground">
                    Patterns&apos; usual cards: the cycles one under another, lengths, recurring symptoms, notes.
                  </p>
                </PregnancyPatterns>
              </div>
            ))}
          </div>
        </section>
      </div>
      <PregnancyStartSheet
        open={sheet === "start" || sheet === "change"}
        record={changing}
        lastStart="2026-05-20"
        usualCycle={31}
        showFriends
        today={TODAY}
        locale={locale}
        t={t}
        busy={false}
        error={null}
        onClose={() => setSheet(null)}
        onSave={(dating, friendsMode) => {
          setLog(JSON.stringify({ dating, friendsMode }));
          setSheet(null);
        }}
        onPast={(dating) => {
          setLog(JSON.stringify({ past: dating }));
          open("past");
        }}
      />
      <PregnancyEndSheet
        open={sheet === "end" || sheet === "correct" || sheet === "past" || sheet === "failing"}
        dueDate={sheet === "past" ? "2025-03-10" : CARDS[1][1].dueDate}
        ended={sheet === "correct" ? { date: "2026-06-02", outcome: "ended" } : null}
        past={sheet === "past"}
        canReopen
        today={TODAY}
        t={t}
        busy={false}
        error={error}
        onClose={() => setSheet(null)}
        onEnd={async (outcome, date) => {
          if (sheet === "failing") {
            setError(t.errorGeneric);
            return false;
          }
          setLog(JSON.stringify({ outcome, date }));
          return true;
        }}
        onReopen={async () => {
          setLog("reopened");
          return true;
        }}
        onDelete={async () => {
          setLog("deleted");
          return true;
        }}
      />
    </div>
  );
}
