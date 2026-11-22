// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useLayoutEffect, useRef } from "react";

import { useCiclo } from "@/lib/client/ciclo-context";
import {
  ENTRANCE_EASING,
  ENTRANCE_MS,
  ENTRANCE_SHIFT_PX,
  takeTabEntrance,
} from "@/lib/client/tab-entrance";
import { cn } from "@/lib/utils";

/**
 * How wide a screen gets in the desktop layout: a form (narrow), text to read
 * (reading), or a dashboard of cards (wide, the landing's width). Phones use
 * the full width of their one column whatever the size.
 */
export type ShellSize = "narrow" | "reading" | "wide";

const DESKTOP_WIDTH: Record<ShellSize, string> = {
  narrow: "desktop:max-w-md",
  reading: "desktop:max-w-3xl",
  wide: "desktop:max-w-6xl",
};

/**
 * Plays a screen's entrance animations (fade-up and friends) to the end: it
 * arrives whole. Animations under `data-entrance="keep"` are left to play:
 * small ones inside a card that is already in place (the rings filling on the
 * Friends screen), which hold nothing back.
 */
function skipEntrance(screen: HTMLElement): void {
  for (const animation of screen.getAnimations({ subtree: true })) {
    const target = animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
    if (target?.closest('[data-entrance="keep"]')) continue;
    if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) animation.finish();
  }
}

export function AppShell({ children, size = "narrow" }: { children: React.ReactNode; size?: ShellSize }) {
  const { t, wallet } = useCiclo();
  const contentRef = useRef<HTMLDivElement>(null);

  // A screen opened from the tab bar replaces the last one at once, in the
  // same frame, and arrives as one short slide and fade from the side of the
  // tab tapped (as quick for the next tab as for one three away). Its own
  // entrance animations (fade-up and friends, half a second with delays)
  // would hold it back: they are played to the end. Other arrivals (Back,
  // links) keep them. Before the browser paints, so nothing flashes.
  useLayoutEffect(() => {
    const content = contentRef.current;
    const entrance = takeTabEntrance();
    if (!content || !entrance) return;
    skipEntrance(content);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = entrance === "next" ? ENTRANCE_SHIFT_PX : -ENTRANCE_SHIFT_PX;
    // Transform and opacity only, on the content: the screen around it clips
    // the shift, and no fill is kept, so fixed sheets inside are not affected.
    content.animate([{ opacity: 0, transform: `translateX(${from}px)` }, { opacity: 1, transform: "none" }], {
      duration: ENTRANCE_MS,
      easing: ENTRANCE_EASING,
    });
  }, []);

  // Clips content that sticks out sideways (and the entrance shift): the
  // phone would widen the layout viewport, and the fixed tab bar with it.
  // On the desktop the screen spans the window under DesktopHeader (4rem),
  // with a faint rose glow at the top, like the landing's hero.
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-clip bg-background pt-(--safe-top) desktop:relative desktop:min-h-[calc(100dvh-4rem)] desktop:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-80 bg-gradient-to-b from-primary/[0.07] to-transparent desktop:block"
      />
      <div ref={contentRef} className="flex flex-1 flex-col">
        <main
          id="main-content"
          className={cn(
            "flex-1 px-5 pt-6 pb-8 desktop:relative desktop:mx-auto desktop:w-full desktop:px-8 desktop:pt-10 desktop:pb-16",
            DESKTOP_WIDTH[size],
          )}
        >
          {children}
        </main>
        <p
          className={cn(
            "mt-auto border-t border-border px-4 pt-3 text-center text-xs text-muted-foreground desktop:py-6",
            wallet ? "pb-28" : "pb-6",
          )}
        >
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
}
