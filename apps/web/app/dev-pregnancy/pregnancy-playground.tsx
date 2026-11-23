// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState } from "react";

import { PregnancyCard } from "@/components/pregnancy/pregnancy-card";
import { PregnancyEndSheet, PregnancyStartSheet } from "@/components/pregnancy/pregnancy-sheets";
import { ResumingCard } from "@/components/pregnancy/resuming-card";
import { Button } from "@/components/ui/button";
import { addDaysIso } from "@/lib/diary";
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

export function PregnancyPlayground() {
  const [locale, setLocale] = useState<BaseLocale>("es");
  const [sheet, setSheet] = useState<"start" | "change" | "end" | null>(null);
  const [log, setLog] = useState<string>("");
  const t = messages[locale];
  const changing = sheet === "change" ? CARDS[1][1] : null;

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
            <Button type="button" variant="outline" onClick={() => setSheet("start")}>
              Start sheet
            </Button>
            <Button type="button" variant="outline" onClick={() => setSheet("change")}>
              Change dates
            </Button>
            <Button type="button" variant="outline" onClick={() => setSheet("end")}>
              End sheet
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
                onChangeDates={() => setSheet("change")}
                onEnd={() => setSheet("end")}
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
        onClose={() => setSheet(null)}
        onSave={(dating, friendsMode) => {
          setLog(JSON.stringify({ dating, friendsMode }));
          setSheet(null);
        }}
      />
      <PregnancyEndSheet
        open={sheet === "end"}
        record={CARDS[1][1]}
        today={TODAY}
        t={t}
        busy={false}
        onClose={() => setSheet(null)}
        onEnd={async (outcome, date) => setLog(JSON.stringify({ outcome, date }))}
        onDelete={async () => setLog("deleted")}
      />
    </div>
  );
}
