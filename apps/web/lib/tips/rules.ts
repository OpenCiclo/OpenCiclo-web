// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { SymptomId } from "@/lib/diary";
import { findSymptomMeta, isSexEntry, symptomLabel } from "@/lib/symptoms/catalog";
import type { Messages } from "@/lib/i18n";
import type { TipCard, TipContext, TipRule } from "@/lib/tips/types";

const SYMPTOM_ADVICE: Partial<Record<SymptomId, keyof Messages>> = {
  cramps: "tipAdviceCramps",
  headache: "tipAdviceHeadache",
  bloating: "tipAdviceBloating",
  moodSwings: "tipAdviceMoodSwings",
  fatigue: "tipAdviceFatigue",
  tenderBreasts: "tipAdviceTenderBreasts",
  cravings: "tipAdviceCravings",
  highLibido: "tipAdviceHighLibido",
  sexualActivity: "tipAdviceSexualActivity",
};

/** The advice line for an entry logged `dayCount` times, when there is one. */
export function symptomAdvice(id: SymptomId, dayCount: number, t: Messages): string | null {
  const key = SYMPTOM_ADVICE[id];
  return key ? String(t[key]).replace("{count}", String(dayCount)) : null;
}

export const TIP_RULES: TipRule[] = [
  {
    id: "period-soon",
    category: "phase",
    priority: 10,
    tone: "primary",
    when: (context) =>
      context.nextPeriodInDays !== null && context.nextPeriodInDays >= 0 && context.nextPeriodInDays <= 3,
    message: (context, t) => ({
      title: t.tipPeriodSoonTitle,
      body: t.tipPeriodSoonBody
        .replace("{days}", String(context.nextPeriodInDays))
        .replace("{length}", String(context.avgCycleLength ?? "—")),
    }),
  },
  {
    id: "fertile-window",
    category: "phase",
    priority: 20,
    tone: "fertile",
    when: (context) => context.currentPhase === "ovulation",
    message: (_context, t) => ({
      title: t.tipFertileTitle,
      body: t.tipFertileBody,
    }),
  },
  {
    id: "top-symptom",
    category: "symptom",
    priority: 30,
    tone: "accent",
    // Its title says "symptom": never for a sex entry (Patterns shows that advice in its own card).
    when: (context) =>
      Boolean(context.topSymptom && !isSexEntry(context.topSymptom.id) && SYMPTOM_ADVICE[context.topSymptom.id]),
    message: (context, t) => {
      const top = context.topSymptom!;
      const meta = findSymptomMeta(top.id);
      const label = meta ? symptomLabel(meta, t) : top.id;
      return {
        title: t.tipTopSymptomTitle.replace("{symptom}", label),
        body: symptomAdvice(top.id, top.dayCount, t) ?? "",
      };
    },
  },
  {
    id: "regular",
    category: "regularity",
    priority: 40,
    tone: "fertile",
    when: (context) =>
      context.completedCycleCount >= 3 &&
      context.cycleLengthRange !== null &&
      context.cycleLengthRange.max - context.cycleLengthRange.min <= 3,
    message: (context, t) => ({
      title: t.tipRegularTitle,
      body: t.tipRegularBody
        .replace("{min}", String(context.cycleLengthRange?.min))
        .replace("{max}", String(context.cycleLengthRange?.max)),
    }),
  },
  {
    id: "variable",
    category: "regularity",
    priority: 50,
    tone: "accent",
    when: (context) =>
      context.completedCycleCount >= 3 &&
      context.cycleLengthRange !== null &&
      context.cycleLengthRange.max - context.cycleLengthRange.min > 3,
    message: (context, t) => ({
      title: t.tipVariableTitle,
      body: t.tipVariableBody
        .replace("{min}", String(context.cycleLengthRange?.min))
        .replace("{max}", String(context.cycleLengthRange?.max)),
    }),
  },
];

export function selectTips(context: TipContext, t: Messages, limit = 3): TipCard[] {
  const selected: TipCard[] = [];
  const usedCategories = new Set<string>();
  const ranked = [...TIP_RULES].sort((a, b) => a.priority - b.priority);
  for (const rule of ranked) {
    if (selected.length >= limit) break;
    if (usedCategories.has(rule.category)) continue;
    if (!rule.when(context)) continue;
    const message = rule.message(context, t);
    selected.push({
      id: rule.id,
      title: message.title,
      body: message.body,
      tone: rule.tone,
      category: rule.category,
    });
    usedCategories.add(rule.category);
  }
  return selected;
}
