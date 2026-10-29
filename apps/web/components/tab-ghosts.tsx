// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { lazy, Suspense, useEffect, useState } from "react";

import { GhostContext } from "@/lib/client/ghost";
import { showGhost } from "@/lib/client/tab-screen";

// The tab screens, in tab bar order, loaded only once a ghost needs them.
const SCREENS = [
  lazy(() => import("@/components/home-view").then((module) => ({ default: module.HomeView }))),
  lazy(() => import("@/app/patterns/page")),
  lazy(() => import("@/components/learn/learn-ghost")),
  lazy(() => import("@/app/settings/page")),
];

/** Waits for the browser to be idle, or `ms` at most. */
function whenIdle(callback: () => void, ms: number): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: ms });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, ms);
  return () => window.clearTimeout(id);
}

/**
 * Copies of the tab screens other than `current`, drawn out of sight, so a
 * drag of the tab bar slides already drawn screens instead of drawing one
 * mid-drag, like a carousel of pictures. They are fixed over the page, hidden
 * (not painted) until the tab bar shows one, inert, and never part of view
 * transitions. Each is drawn when the browser is idle, the next tabs first,
 * one at a time, so opening the app costs no more than before. The tab just
 * left is drawn again fresh: a ghost shows a screen as a fresh visit would.
 */
export function TabGhosts({ current, count }: { current: number; count: number }) {
  const [drawn, setDrawn] = useState<number[]>([]);
  const [shownFor, setShownFor] = useState(current);
  if (shownFor !== current) {
    // The current tab is the real page now: no ghost of it. The one just
    // left waits for the next idle moment, so it is not drawn mid-navigation.
    setShownFor(current);
    setDrawn((tabs) => tabs.filter((tab) => tab !== current && tab !== shownFor));
  }

  useEffect(() => {
    if (current < 0) return;
    const byDistance = Array.from({ length: count }, (_, tab) => tab)
      .filter((tab) => tab !== current && !drawn.includes(tab))
      .sort((a, b) => Math.abs(a - current) - Math.abs(b - current));
    const next = byDistance[0];
    if (next === undefined) return;
    return whenIdle(() => setDrawn((tabs) => (tabs.includes(next) ? tabs : [...tabs, next])), 1500);
  }, [current, count, drawn]);

  return (
    <div aria-hidden inert>
      {drawn
        .filter((tab) => tab !== current)
        .map((tab) => {
          const Screen = SCREENS[tab];
          return (
            <div key={tab} className="tab-ghost" ref={(ghost) => (ghost ? showGhost(tab, ghost) : undefined)}>
              <GhostContext value>
                <Suspense fallback={null}>
                  <Screen />
                </Suspense>
              </GhostContext>
            </div>
          );
        })}
    </div>
  );
}
