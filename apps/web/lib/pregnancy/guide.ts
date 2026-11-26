// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The texts of Patterns while a pregnancy goes on: general information, week
// by week, about the baby's development and what the body commonly does, plus
// the names of what usually comes when (lib/pregnancy/patterns.ts has the
// windows). Spanish and English only, like Learn: other languages read one of
// them (`contentLocale`). Loaded with the pregnancy view only (it is lazy).
//
// Weeks are completed weeks counted from zero, like the card: "week 14" is
// 14+0 to 14+6, which other sources call "the 15th week". Sizes come from
// growth standards, never from comparisons with fruit. Nothing here is advice
// for one person, and nothing celebrates. The week texts show only with
// PREGNANCY_WEEKS_AVAILABLE (lib/features.ts). Sources: GUIDE_SOURCES, below.

import type { BaseLocale } from "@/lib/i18n";
import { PREGNANCY_CALL_COPY } from "@/lib/pregnancy/call-copy";
import type { MilestoneId } from "@/lib/pregnancy/patterns";
import { CROWN_RUMP_MM, WEEK_TEXTS, WEIGHT_GRAMS, type WeekText } from "@/lib/pregnancy/guide-weeks";

export type FetalSize = { kind: "length"; mm: number } | { kind: "weight"; grams: number };

/** The typical size in week `week`, or null where the standards give none (before week 6, after week 40). */
export function fetalSize(week: number): FetalSize | null {
  const mm = CROWN_RUMP_MM[week];
  if (mm !== undefined) return { kind: "length", mm };
  const grams = WEIGHT_GRAMS[week];
  return grams !== undefined ? { kind: "weight", grams } : null;
}

/** Bars drawn either side of the chosen week. */
const SERIES_SPAN = 4;

/**
 * The weeks around `week` that share its measure (length or weight: the two
 * are never drawn on one axis), at most nine, for the small chart.
 */
export function sizeSeries(week: number): { week: number; size: FetalSize }[] {
  const chosen = fetalSize(week);
  if (!chosen) return [];
  const all: { week: number; size: FetalSize }[] = [];
  for (let value = 0; value <= 42; value += 1) {
    const size = fetalSize(value);
    if (size && size.kind === chosen.kind) all.push({ week: value, size });
  }
  const at = all.findIndex((item) => item.week === week);
  const from = Math.max(0, Math.min(at - SERIES_SPAN, all.length - (SERIES_SPAN * 2 + 1)));
  return all.slice(from, from + SERIES_SPAN * 2 + 1);
}

export type PregnancyGuideCopy = {
  babyLabel: string;
  sizeLength: string;
  sizeWeight: string;
  sizeChart: string;
  lengthNote: string;
  weightNote: string;
  bodyLabel: string;
  earlierWeek: string;
  laterWeek: string;
  backToNow: string;
  logLabel: string;
  logTitle: string;
  logDays: string;
  weekAxis: string;
  /** 1–2 days, 3–4 days, 5–7 days. */
  logLegend: [string, string, string];
  /** "Felt the baby move": the first day she marked it, and its week. */
  movementFirst: string;
  /** Days marked in one week, for screen readers. */
  movementWeek: string;
  movementNote: string;
  nextLabel: string;
  nextAll: string;
  nextLess: string;
  nextNote: string;
  now: string;
  done: string;
  tomorrow: string;
  inDays: string;
  milestones: Record<MilestoneId, { title: string; detail: string }>;
  callLabel: string;
  callBody: string;
  callEmergency: string;
  earlierLabel: string;
  earlierOne: string;
  earlierCount: string;
  earlierAverage: string;
  sourcesLabel: string;
};

export const PREGNANCY_GUIDE: Record<BaseLocale, PregnancyGuideCopy> = {
  es: {
    babyLabel: "El bebé · semana {week}",
    sizeLength: "Mide unos {size} de la cabeza a las nalgas.",
    sizeWeight: "Pesa alrededor de {size}.",
    sizeChart: "Tamaño habitual de la semana {from} a la {to}",
    lengthNote:
      "Longitud habitual de la cabeza a las nalgas según mediciones de referencia por ecografía. Cada bebé crece a su ritmo: lo que cuenta son tus ecografías.",
    weightNote:
      "Peso habitual según las tablas de crecimiento fetal de la OMS. Los bebés sanos varían bastante alrededor de esa cifra: lo que cuenta son tus ecografías.",
    bodyLabel: "Tu cuerpo",
    earlierWeek: "Semana anterior",
    laterWeek: "Semana siguiente",
    backToNow: "Volver a esta semana",
    logLabel: "De tu diario",
    logTitle: "Lo que has apuntado, semana a semana",
    logDays: "{days} días",
    weekAxis: "Semana",
    logLegend: ["1–2 días", "3–4 días", "5–7 días por semana"],
    movementFirst: "Lo marcaste por primera vez el {date}, en la semana {week}.",
    movementWeek: "Semana {week}: {days} días",
    movementNote:
      "Solo muestra los días que lo marcaste: Ciclo no cuenta los movimientos ni los vigila. Si el bebé se mueve menos de lo habitual, o sus movimientos cambian o se detienen, llama de inmediato a tu matrona o a urgencias de maternidad, a cualquier hora.",
    nextLabel: "Lo que viene",
    nextAll: "Ver todo el embarazo",
    nextLess: "Ver menos",
    nextNote: "Qué se ofrece, y cuándo, depende de tu país y de tu centro. Las fechas se cuentan desde tu fecha probable de parto.",
    now: "Ahora",
    done: "Ya pasó",
    tomorrow: "Empieza mañana",
    inDays: "Dentro de {days} días",
    milestones: {
      firstScan: { title: "Ecografía del primer trimestre", detail: "En muchos países, entre las semanas 11 y 14, a menudo junto con el cribado combinado." },
      secondTrimester: { title: "Empieza el segundo trimestre", detail: "Semana 14." },
      movements: { title: "Primeros movimientos", detail: "Suelen notarse entre las semanas 16 y 24; más tarde en un primer embarazo." },
      anatomyScan: { title: "Ecografía morfológica", detail: "La ecografía de la mitad del embarazo, hacia las semanas 18 a 22." },
      glucose: {
        title: "Prueba de glucosa",
        detail: "El cribado de la diabetes gestacional, entre las semanas 24 y 28. En países como España o Estados Unidos se ofrece a todas; en otros, solo si hay factores de riesgo.",
      },
      whoopingCough: {
        title: "Vacuna de la tosferina",
        detail: "Se recomienda en cada embarazo. En España, desde la semana 27 (mejor en la 27 o la 28); en Estados Unidos, entre la 27 y la 36; en el Reino Unido, desde la 16.",
      },
      thirdTrimester: { title: "Empieza el tercer trimestre", detail: "Semana 28." },
      antiD: { title: "Si eres Rh negativo", detail: "Hacia la semana 28 suele ofrecerse una inyección de anti-D." },
      rsvVaccine: {
        title: "Protección frente al VRS",
        detail: "En algunos países se vacuna a la embarazada (en el Reino Unido desde la semana 28; en Estados Unidos entre la 32 y la 36, en temporada). En otros, como España, se protege al bebé al nacer.",
      },
      growthScan: {
        title: "Ecografía del tercer trimestre",
        detail: "En España se hace de rutina entre las semanas 34 y 36. En otros países, solo si hace falta.",
      },
      groupBStrep: {
        title: "Cultivo de estreptococo B",
        detail: "En países como España o Estados Unidos se toma una muestra vaginal y rectal al final del embarazo (en Estados Unidos, hacia las semanas 36 a 37). En otros, como el Reino Unido, no es de rutina.",
      },
      term: { title: "Embarazo a término", detail: "Desde la semana 37 (a término temprano)." },
      fullTerm: { title: "A término completo", detail: "Desde la semana 39." },
      dueDate: { title: "Fecha probable de parto", detail: "Semana 40. Solo alrededor de 1 de cada 20 bebés nace justo ese día." },
      pastDue: { title: "Pasada la fecha", detail: "Durante la semana 41 suelen ofrecerse más controles y la inducción del parto." },
    },
    ...PREGNANCY_CALL_COPY.es,
    earlierLabel: "Tus ciclos antes del embarazo",
    earlierOne: "1 ciclo",
    earlierCount: "{count} ciclos",
    earlierAverage: "{days} días de media",
    sourcesLabel: "Fuentes",
  },
  en: {
    babyLabel: "The baby · week {week}",
    sizeLength: "About {size} from head to bottom.",
    sizeWeight: "Weighs about {size}.",
    sizeChart: "Typical size from week {from} to week {to}",
    lengthNote:
      "Typical length from head to bottom in ultrasound reference measurements. Babies grow at their own pace: your scans are what count.",
    weightNote:
      "Typical weight in the WHO fetal growth charts. Healthy babies vary quite a lot around it: your scans are what count.",
    bodyLabel: "Your body",
    earlierWeek: "Earlier week",
    laterWeek: "Later week",
    backToNow: "Back to this week",
    logLabel: "From your diary",
    logTitle: "What you logged, week by week",
    logDays: "{days} days",
    weekAxis: "Week",
    logLegend: ["1–2 days", "3–4 days", "5–7 days a week"],
    movementFirst: "You first marked it on {date}, in week {week}.",
    movementWeek: "Week {week}: {days} days",
    movementNote:
      "This shows only the days you marked it: Ciclo does not count or watch movements. If the baby moves less than usual, or the movements change or stop, call your midwife or maternity unit straight away, at any hour.",
    nextLabel: "Coming up",
    nextAll: "Show the whole pregnancy",
    nextLess: "Show less",
    nextNote: "What is offered, and when, depends on your country and your clinic. Dates are counted from your due date.",
    now: "Now",
    done: "Past",
    tomorrow: "Starts tomorrow",
    inDays: "In {days} days",
    milestones: {
      firstScan: { title: "First-trimester scan", detail: "In many countries, between weeks 11 and 14, often with the combined screening test." },
      secondTrimester: { title: "Second trimester begins", detail: "Week 14." },
      movements: { title: "First movements", detail: "Often felt between weeks 16 and 24; later in a first pregnancy." },
      anatomyScan: { title: "Mid-pregnancy scan", detail: "The detailed anatomy scan, around weeks 18 to 22." },
      glucose: {
        title: "Glucose test",
        detail: "Screening for gestational diabetes, between weeks 24 and 28. In countries such as the US and Spain everyone is offered it; in others only with risk factors.",
      },
      whoopingCough: {
        title: "Whooping cough vaccine",
        detail: "Recommended in every pregnancy. In Spain from week 27 (ideally week 27 or 28); in the US between weeks 27 and 36; in the UK from week 16.",
      },
      thirdTrimester: { title: "Third trimester begins", detail: "Week 28." },
      antiD: { title: "If you are Rh negative", detail: "An anti-D injection is usually offered around week 28." },
      rsvVaccine: {
        title: "Protection against RSV",
        detail: "In some countries the vaccine is given in pregnancy (in the UK from week 28; in the US at weeks 32 to 36, in season). In others, such as Spain, the baby is protected after birth.",
      },
      growthScan: {
        title: "Third-trimester scan",
        detail: "Routine in Spain between weeks 34 and 36. In other countries only when it is needed.",
      },
      groupBStrep: {
        title: "Group B strep test",
        detail: "In countries such as the US and Spain a vaginal and rectal swab is taken late in pregnancy (in the US, around weeks 36 to 37). In others, such as the UK, it is not routine.",
      },
      term: { title: "Term begins", detail: "From week 37 (early term)." },
      fullTerm: { title: "Full term", detail: "From week 39." },
      dueDate: { title: "Due date", detail: "Week 40. Only about 1 in 20 babies are born on the day itself." },
      pastDue: { title: "Past the due date", detail: "During week 41 extra checks and inducing labour are usually offered." },
    },
    ...PREGNANCY_CALL_COPY.en,
    earlierLabel: "Your cycles before the pregnancy",
    earlierOne: "1 cycle",
    earlierCount: "{count} cycles",
    earlierAverage: "{days} days on average",
    sourcesLabel: "Sources",
  },
};

/** The text for week `week` (counted from zero): its own, or the nearest earlier one that has any. */
export function weekGuide(lang: BaseLocale, week: number): WeekText {
  const texts = WEEK_TEXTS[lang];
  for (let value = Math.max(0, Math.floor(week)); value >= 0; value -= 1) {
    const text = texts[value];
    if (text) return text;
  }
  return texts[0];
}

export { GUIDE_SOURCES } from "@/lib/pregnancy/guide-weeks";
export type { WeekText };
