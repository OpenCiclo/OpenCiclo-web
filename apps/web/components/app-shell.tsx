// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useLayoutEffect, useRef, ViewTransition } from "react";

import { useCiclo } from "@/lib/client/ciclo-context";
import { showScreen } from "@/lib/client/tab-screen";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, wallet } = useCiclo();
  const screenRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // The tab bar moves this screen's content while its selection is dragged.
  useLayoutEffect(() => (contentRef.current ? showScreen(contentRef.current) : undefined), []);

  // A screen that slides in arrives whole: its own entrance animations
  // (fade-up and friends) would play on top of the slide. Skip them to the end.
  function onEnter() {
    if (!document.documentElement.dataset.tabSlide) return;
    for (const animation of screenRef.current?.getAnimations({ subtree: true }) ?? []) {
      if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) animation.finish();
    }
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

  // Screens enter and leave as a carousel when the route moves between tabs.
  // The tab bar picks the direction; see `tab-slide` in globals.css.
  return (
    <ViewTransition enter="tab-slide" exit="tab-slide" default="none" onEnter={onEnter} onExit={onExit}>
      {/* Clips the moved content: it must not stick out of the page, or the
          phone widens the layout viewport and the fixed tab bar with it. */}
      <div ref={screenRef} className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-clip bg-background">
        <div ref={contentRef} className="flex flex-1 flex-col">
          <main id="main-content" className="flex-1 px-5 pt-6 pb-8">
            {children}
          </main>
          <p
            className={cn(
              "mt-auto border-t border-border px-4 pt-3 text-center text-xs text-muted-foreground",
              wallet ? "pb-28" : "pb-6",
            )}
          >
            {t.disclaimer}
          </p>
        </div>
      </div>
    </ViewTransition>
  );
}
