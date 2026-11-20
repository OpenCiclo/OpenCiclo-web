// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useRef, ViewTransition } from "react";

import { useCiclo } from "@/lib/client/ciclo-context";
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

/** Plays a screen's entrance animations (fade-up and friends) to the end: it arrives whole. */
function skipEntrance(screen: HTMLElement | null): void {
  for (const animation of screen?.getAnimations({ subtree: true }) ?? []) {
    if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) animation.finish();
  }
}

export function AppShell({ children, size = "narrow" }: { children: React.ReactNode; size?: ShellSize }) {
  const { t, wallet } = useCiclo();
  const screenRef = useRef<HTMLDivElement>(null);

  // A screen that slides in arrives whole: its own entrance animations
  // (fade-up and friends) would play on top of the slide. Skip them to the end.
  function onEnter() {
    if (document.documentElement.dataset.tabSlide) skipEntrance(screenRef.current);
  }

  // Next.js sometimes swaps screens in two commits: the old screen leaves in
  // one view transition and the new one arrives in the next, which waits for
  // the first to end. Hurry a lone exit so the gap stays short.
  function onExit() {
    const slides = document.getAnimations().filter((animation) => animation instanceof CSSAnimation);
    if (slides.some((animation) => animation.animationName.startsWith("tab-slide-in"))) return;
    for (const animation of slides) {
      if (animation.animationName.startsWith("tab-slide-out")) animation.playbackRate = 3;
    }
  }

  // Clips content that sticks out sideways: the phone would widen the layout
  // viewport, and the fixed tab bar with it.
  // On the desktop the screen spans the window under DesktopHeader (4rem),
  // with a faint rose glow at the top, like the landing's hero.
  const screen = (
    <div
      ref={screenRef}
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-clip bg-background desktop:relative desktop:min-h-[calc(100dvh-4rem)] desktop:max-w-none"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-80 bg-gradient-to-b from-primary/[0.07] to-transparent desktop:block"
      />
      <div className="flex flex-1 flex-col">
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
  // Screens enter and leave as a carousel when the route moves between tabs.
  // The tab bar picks the direction; see `tab-slide` in globals.css.
  return (
    <ViewTransition enter="tab-slide" exit="tab-slide" default="none" onEnter={onEnter} onExit={onExit}>
      {screen}
    </ViewTransition>
  );
}
