// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Regression for the owner's report of 2026-11-26: in pregnancy mode Patterns
// showed the empty state ("No bleeding days yet…", "Log at least one period
// start to see patterns.") although a period was logged. That was production
// before #75; this renders today's PatternsContent for that diary and checks
// the pregnancy view comes instead. The repo has no DOM, so it renders on the
// server with react-dom/static, which waits for the lazy pregnancy view.

import { createElement } from "react";
import { prerenderToNodeStream } from "react-dom/static";
import { describe, expect, it, vi } from "vitest";

import { addDaysIso, emptyDiary, upsertDay, type Diary } from "@/lib/diary";
import { messages } from "@/lib/i18n";
import { startPregnancy } from "@/lib/pregnancy/actions";
import { PREGNANCY_GUIDE } from "@/lib/pregnancy/guide";

const TODAY = "2026-11-26";
const LAST_PERIOD = "2026-08-01";

function oneStartAndPregnancy(): Diary {
  let diary = emptyDiary("en");
  for (let day = 0; day < 4; day += 1) diary = upsertDay(diary, addDaysIso(LAST_PERIOD, day), { flow: "medium", symptoms: {} });
  return startPregnancy(diary, { method: "lmp", lmp: LAST_PERIOD, cycleLength: null }, "noNews", "0123456789abcdef0123456789abcdef");
}

const state = vi.hoisted(() => ({ diary: null as Diary | null }));

vi.mock("@/lib/client/ciclo-context", async () => {
  const { messages: all } = await import("@/lib/i18n");
  return {
    useCiclo: () => ({ t: all.en, diary: state.diary, locale: "en" }),
    useTodayIso: () => TODAY,
  };
});

async function render(diary: Diary): Promise<string> {
  state.diary = diary;
  const { PatternsContent } = await import("@/components/patterns/patterns-content");
  const { prelude } = await prerenderToNodeStream(createElement(PatternsContent));
  let html = "";
  for await (const chunk of prelude) html += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
  return html;
}

describe("Patterns for a diary with one period start and a pregnancy going on", () => {
  it("shows the pregnancy view, never the empty state", async () => {
    const diary = oneStartAndPregnancy();
    expect(diary.periodStarts).toEqual([LAST_PERIOD]);
    expect(diary.pregnancies).toHaveLength(1);
    const html = await render(diary);
    expect(html).not.toContain(messages.en.noDates);
    expect(html).not.toContain(messages.en.noPatternsYet);
    // The pregnancy view's own card: "what usually comes next".
    expect(html).toContain(PREGNANCY_GUIDE.en.nextLabel);
  });

  it("still shows the empty state for a diary with nothing logged (the check can fail)", async () => {
    const html = await render(emptyDiary("en"));
    expect(html).toContain(messages.en.noPatternsYet);
  });
});
