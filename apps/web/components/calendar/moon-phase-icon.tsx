// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LunarDayInfo, MoonPhaseId } from "@/lib/lunar/phases";
import type { Messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const MOON_PHASE_LABEL_KEYS: Record<MoonPhaseId, keyof Messages> = {
  newMoon: "moonPhaseNewMoon",
  waxingCrescent: "moonPhaseWaxingCrescent",
  firstQuarter: "moonPhaseFirstQuarter",
  waxingGibbous: "moonPhaseWaxingGibbous",
  fullMoon: "moonPhaseFullMoon",
  waningGibbous: "moonPhaseWaningGibbous",
  lastQuarter: "moonPhaseLastQuarter",
  waningCrescent: "moonPhaseWaningCrescent",
};

/** The phase's name alone ("Full moon"). */
export function moonPhaseName(info: LunarDayInfo, t: Messages): string {
  return String(t[MOON_PHASE_LABEL_KEYS[info.phaseId]]);
}

export function moonPhaseText(info: LunarDayInfo, t: Messages): string {
  return t.moonPhaseLabel.replace("{phase}", moonPhaseName(info, t)).replace("{percent}", String(info.percent));
}

const CENTER = 10;
const RADIUS = 9;

/**
 * The lit part of the disk as one path: the lit limb (a half circle on the
 * right while waxing, on the left while waning) closed by the terminator, an
 * ellipse arc that bulges towards the lit side for a crescent and away from
 * it for a gibbous moon.
 */
function litPath(fraction: number, waxing: boolean): string {
  const top = `${CENTER} ${CENTER - RADIUS}`;
  const bottom = `${CENTER} ${CENTER + RADIUS}`;
  const terminator = (Math.abs(1 - 2 * fraction) * RADIUS).toFixed(2);
  const limb = waxing ? 1 : 0;
  const crescent = fraction < 0.5;
  const back = crescent ? (waxing ? 0 : 1) : waxing ? 1 : 0;
  return `M${top} A${RADIUS} ${RADIUS} 0 0 ${limb} ${bottom} A${terminator} ${RADIUS} 0 0 ${back} ${top} Z`;
}

/**
 * The moon as seen from the northern hemisphere: a dark disk with its lit
 * part in a warm ivory (`--moon-lit`, `--moon-shade` in globals.css, one pair
 * per theme). `highlight` adds a soft halo and a lit rim, for the day a main
 * phase falls on and for the moon shown large. The halo is drawn outside the
 * icon's box, so it never changes the layout.
 */
export function MoonPhaseIcon({
  info,
  label,
  highlight = false,
  className,
}: {
  info: LunarDayInfo;
  label: string;
  highlight?: boolean;
  className?: string;
}) {
  const { fraction, waxing } = info;
  const nearlyNew = fraction <= 0.02;
  const nearlyFull = fraction >= 0.98;

  return (
    <svg viewBox="0 0 20 20" className={cn("size-4 shrink-0 overflow-visible", className)} aria-hidden>
      <title>{label}</title>
      {highlight ? <circle cx={CENTER} cy={CENTER} r={12.5} fill="var(--moon-lit)" fillOpacity={0.18} /> : null}
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="var(--moon-shade)" />
      {nearlyFull ? (
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="var(--moon-lit)" />
      ) : nearlyNew ? null : (
        <path d={litPath(fraction, waxing)} fill="var(--moon-lit)" />
      )}
      {/* The rim keeps the disk readable on the card: lit for a highlighted moon, faint otherwise. */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke={highlight ? "var(--moon-lit)" : "var(--moon-rim)"}
        strokeOpacity={highlight ? 0.75 : 1}
        strokeWidth={highlight ? 1.2 : 0.8}
      />
    </svg>
  );
}
