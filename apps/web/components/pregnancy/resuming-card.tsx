// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

import { PhaseAura } from "@/components/calendar/phase-visuals";
import { PREGNANCY_AURA } from "@/components/pregnancy/pregnancy-card";
import type { Messages } from "@/lib/i18n";
import type { PregnancyOutcome } from "@/lib/pregnancy/record";
import { cn } from "@/lib/utils";

const FACTS: Record<PregnancyOutcome, (keyof Messages)[]> = {
  ended: ["resumingBleeding", "resumingPeriod", "resumingOvulation", "resumingWhenToAsk"],
  birth: ["resumingBirthPeriod", "resumingBirthOvulation", "resumingBirthAsk"],
};

/** The Learn article about what comes after a pregnancy that ended (not after a birth). */
export const AFTER_END_ARTICLE = "after-pregnancy-ends";

/**
 * After a pregnancy ends and until her period comes back (ESTUDIO 4.1): no
 * ring, no counter, no days, never "late". Open, it says what may happen now,
 * and after an end that was not a birth it links to the Learn article about
 * it. The link's own words stay neutral: the interface never names how a
 * pregnancy ended. Nothing about a baby, so it also fits after a perinatal death.
 */
export function ResumingCard({ outcome, t }: { outcome: PregnancyOutcome; t: Messages }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  return (
    <section
      className="animate-fade-up relative isolate overflow-hidden rounded-3xl border border-border/70 bg-card px-[18px] py-4 text-card-foreground shadow-sm"
      style={{ animationDelay: "60ms" }}
    >
      <PhaseAura phase="luteal" next="menstrual" animate colors={PREGNANCY_AURA} />
      <div className="relative z-[1]">
        <p className="font-serif text-[21px] leading-[1.2] text-balance">{t.resumingTitle}</p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={listId}
          className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-bold underline-offset-4 hover:underline"
          style={{ color: "var(--pregnancy-ink)" }}
        >
          {t.resumingOpen}
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
        {open ? (
          <div id={listId}>
            <ul className="mt-2 flex flex-col gap-1.5 text-[13px] leading-[1.45] text-card-foreground/85">
              {FACTS[outcome].map((key) => (
                <li key={key} className="flex gap-2">
                  <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-card-foreground/50" />
                  <span>{String(t[key])}</span>
                </li>
              ))}
            </ul>
            {outcome === "ended" ? (
              <Link
                href={`/learn/${AFTER_END_ARTICLE}`}
                className="-mb-2 inline-flex min-h-11 items-center gap-1 text-[12.5px] font-bold underline-offset-4 hover:underline"
                style={{ color: "var(--pregnancy-ink)" }}
              >
                {t.resumingLearnLink}
                <ChevronRight className="size-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
