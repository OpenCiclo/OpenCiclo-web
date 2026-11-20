// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { NEXT_PHASE, PHASE_INK, PhaseAura, PhaseRing } from "@/components/calendar/phase-visuals";
import type { FriendCard } from "@/lib/client/friends-sync";
import { phaseLabel, type CyclePhase } from "@/lib/cycle/phases";
import { cycleTimeline } from "@/lib/cycle/phase-timeline";
import { readStatus, visibleNote, type FriendView } from "@/lib/friends/payload";
import type { Messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function timing(days: number | null, t: Messages): string | null {
  if (days === null) return null;
  if (days <= 0) return t.dueTitleToday;
  if (days === 1) return t.periodTomorrowShort;
  return t.periodInShort.replace("{days}", String(days));
}

function describe(view: FriendView | null, waiting: string, t: Messages): { title: string; meta: string | null; phase: CyclePhase | null } {
  if (!view) return { title: waiting, meta: null, phase: null };
  switch (view.kind) {
    case "phase": {
      const parts = [
        view.source === "estimated" ? t.phaseEstimated : null,
        view.cycleDay !== null ? t.cycleDayShort.replace("{day}", String(view.cycleDay)) : null,
        timing(view.daysToNext, t),
      ].filter(Boolean);
      return { title: phaseLabel(view.phase, t), meta: parts.length ? parts.join(" · ") : null, phase: view.phase };
    }
    case "due":
      return { title: t.friendsDue, meta: null, phase: "menstrual" };
    case "paused":
      return { title: t.friendsPausedThem, meta: null, phase: null };
    case "ended":
      return { title: t.friendsEnded, meta: null, phase: null };
    case "noEstimate":
      return { title: t.friendsNoEstimate, meta: null, phase: null };
    case "stale":
      return { title: t.friendsStale, meta: null, phase: null };
  }
}

/**
 * One friend, drawn like the phase card above the calendar but smaller and
 * not interactive: their name, the ring and phase, what they chose to show,
 * and their note. The ring is drawn only when they show their cycle day.
 */
export function FriendPhaseCard({
  card,
  today,
  t,
  youPaused,
  children,
}: {
  card: FriendCard;
  today: string;
  t: Messages;
  youPaused: boolean;
  children?: React.ReactNode;
}) {
  const { friend, status } = card;
  const view = status ? readStatus(status, today) : null;
  const waiting = t.friendsWaiting.replace("{name}", friend.name);
  const { title, meta, phase } = describe(view, waiting, t);
  const note = status ? visibleNote(status, today) : null;
  const ringTimeline =
    view?.kind === "phase" && view.cycleDay !== null && status?.cycle
      ? cycleTimeline(status.cycle.start, status.cycle.next, status.cycle.bleed)
      : null;

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-border/70 bg-card px-4 py-3.5 text-card-foreground shadow-sm">
      <PhaseAura phase={phase ?? "luteal"} next={phase ? NEXT_PHASE[phase] : "menstrual"} animate={false} />
      <div className="relative z-[1] flex items-center gap-3">
        {phase ? (
          <PhaseRing
            timeline={ringTimeline}
            day={view?.kind === "phase" ? (view.cycleDay ?? 1) : 1}
            phase={phase}
            due={view?.kind === "due"}
            animate={false}
          />
        ) : (
          <span
            aria-hidden
            className="flex size-[66px] shrink-0 items-center justify-center rounded-full border border-border bg-muted font-serif text-2xl text-muted-foreground"
          >
            {Array.from(friend.name)[0]?.toUpperCase() ?? "?"}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-[3px]">
          <p
            className="truncate text-[10px] font-extrabold tracking-[0.07em] uppercase"
            style={phase ? { color: PHASE_INK[phase] } : undefined}
          >
            {friend.name}
          </p>
          <p className={cn("font-serif leading-[1.15] text-balance", phase ? "text-[21px]" : "text-[17px] text-muted-foreground")}>
            {title}
          </p>
          {meta ? <p className="text-xs font-bold text-card-foreground/85">{meta}</p> : null}
        </div>
      </div>
      {note ? (
        <p className="relative z-[1] mt-2.5 rounded-2xl bg-[var(--glass)] px-3 py-2 text-[13px] leading-snug text-pretty">
          “{note.text}”
        </p>
      ) : null}
      {youPaused ? (
        <p className="relative z-[1] mt-2 text-xs text-muted-foreground">{t.friendsYouPaused.replace("{name}", friend.name)}</p>
      ) : null}
      {children ? <div className="relative z-[1] mt-2.5 flex flex-wrap gap-2">{children}</div> : null}
    </section>
  );
}
