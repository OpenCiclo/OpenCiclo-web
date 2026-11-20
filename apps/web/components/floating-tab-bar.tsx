// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, LineChart, Settings } from "lucide-react";

import { hidesAppChrome } from "@/lib/client/app-chrome";
import { useCiclo } from "@/lib/client/ciclo-context";
import { entranceBetween, setTabEntrance } from "@/lib/client/tab-entrance";
import { SelectionMotion, labelScale } from "@/lib/client/tab-motion";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app", icon: CalendarDays },
  { href: "/patterns", icon: LineChart },
  { href: "/learn", icon: BookOpen },
  { href: "/settings", icon: Settings },
] as const;

/**
 * The code of each tab screen, in tab order. Next prefetches a tab's data but
 * loads its JavaScript only when it opens, so the first tap on each tab would
 * wait for it (about 100 ms more on a phone). The bar
 * loads it ahead, while the app is idle, without drawing anything.
 */
const SCREEN_CODE = [
  () => import("@/components/home-view"),
  () => import("@/app/patterns/page"),
  () => import("@/components/learn/learn-index"),
  () => import("@/app/settings/page"),
];

let screenCodeRequested = false;

/** Waits for the browser to be idle, or `ms` at most. */
function whenIdle(callback: () => void, ms: number) {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(callback, { timeout: ms });
  else window.setTimeout(callback, ms);
}

/** Loads the tab screens' code one at a time, each in an idle moment. Once per app session. */
function loadScreenCodeWhenIdle() {
  if (screenCodeRequested) return;
  screenCodeRequested = true;
  let next = 0;
  const loadNext = () => {
    const load = SCREEN_CODE[next++];
    // A chunk that fails to load (offline) loads again when its tab opens.
    if (load) void load().then(step, step);
  };
  const step = () => whenIdle(loadNext, 2000);
  step();
}

function tabIndex(pathname: string) {
  return TABS.findIndex(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The label under the selection stretches with it as it flies, like gum, and
 * leans after it so it stays inside. Both fade out halfway to the next tab,
 * where the next label takes over, so neither jumps.
 */
function paintLabels(
  labels: (HTMLSpanElement | null)[],
  position: number,
  scale: { x: number; y: number },
  tabWidth: number,
) {
  const under = Math.round(position);
  const away = position - under;
  const weight = 1 - 2 * Math.abs(away);
  const gum = labelScale({ x: 1 + weight * (scale.x - 1), y: 1 + weight * (scale.y - 1) });
  const lean = away * weight * tabWidth;
  const moved = Math.abs(gum.x - 1) > 0.0005 || Math.abs(gum.y - 1) > 0.0005 || Math.abs(lean) > 0.05;
  labels.forEach((label, index) => {
    if (!label) return;
    label.style.transform =
      moved && index === under
        ? `translateX(${lean.toFixed(2)}px) scale(${gum.x.toFixed(4)}, ${gum.y.toFixed(4)})`
        : "";
  });
}

/**
 * The phone's tab bar. Each tab is a plain link: one tap goes there (a real
 * `router.push`, so Android Back walks the history), and the new screen
 * replaces the last one at once (see AppShell for how it arrives). There is no
 * drag or swipe: the bar never holds on to the finger, so nothing can turn a
 * tap into something else. Each tab takes taps well beyond its pill, down to
 * the screen's edge (`.tab-link` in globals.css).
 */
export function FloatingTabBar() {
  const { t, wallet } = useCiclo();
  const pathname = usePathname();
  const activeIndex = tabIndex(pathname);
  const hidden = !wallet || hidesAppChrome(pathname);

  // The tab just tapped, lit (and the selection on its way to it) from the
  // tap, before the route gets there. Any route change ends it: coming back
  // to this route later must not light an old tap.
  const [tapped, setTapped] = useState<{ index: number; pathname: string } | null>(null);
  if (tapped && tapped.pathname !== pathname) setTapped(null);
  const litIndex = tapped ? tapped.index : activeIndex;
  const bubbleIndex = Math.max(0, litIndex);

  const bubbleRef = useRef<HTMLSpanElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const motionRef = useRef<SelectionMotion | null>(null);
  const placedRef = useRef(false);

  function motion() {
    motionRef.current ??= new SelectionMotion(
      TABS.length,
      (position, scale) => {
        const bubble = bubbleRef.current;
        if (!bubble) return;
        // Read before writing anything, so it does not force a layout.
        const tabWidth = bubble.offsetWidth;
        // Fixed decimals: tiny values would otherwise print as 1e-7.
        bubble.style.transform = `translateX(${(position * 100).toFixed(3)}%) scale(${scale.x.toFixed(4)}, ${scale.y.toFixed(4)})`;
        paintLabels(labelRefs.current, position, scale, tabWidth);
      },
      prefersReducedMotion,
    );
    return motionRef.current;
  }

  /** A tap on tab `index` is on its way: light it now, and tell the screen opening which side it comes from. */
  function tapTab(index: number) {
    if (index === litIndex) return;
    setTabEntrance(entranceBetween(activeIndex, index));
    // Back to the tab on display before the route left it: nothing is pending.
    setTapped(index === activeIndex ? null : { index, pathname });
  }

  useEffect(() => {
    if (!hidden) loadScreenCodeWhenIdle();
  }, [hidden]);

  useEffect(() => () => motionRef.current?.stop(), []);

  useLayoutEffect(() => {
    if (hidden) {
      motionRef.current?.stop();
      placedRef.current = false;
      return;
    }
    if (placedRef.current) {
      motion().settle(bubbleIndex);
    } else {
      motion().place(bubbleIndex);
      placedRef.current = true;
    }
  }, [hidden, bubbleIndex]);

  if (hidden) return null;

  const labels = [t.calendar, t.patterns, t.learn, t.settings];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-4 mb-4 rounded-full border border-border bg-card/90 p-1.5 shadow-lg backdrop-blur-md">
        <div className="relative grid touch-manipulation grid-cols-4 select-none [-webkit-touch-callout:none]">
          <span
            ref={bubbleRef}
            aria-hidden
            className="tab-bubble pointer-events-none absolute inset-y-0 left-0 w-1/4 rounded-full bg-primary shadow-sm"
            style={{ "--tab-index": bubbleIndex } as CSSProperties}
          />
          {TABS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                draggable={false}
                aria-current={index === activeIndex ? "page" : undefined}
                onNavigate={() => {
                  tapTab(index);
                }}
                className={cn(
                  "tab-link relative z-10 flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-2 text-[11px] font-semibold transition-colors duration-200",
                  index === litIndex ? "text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span
                  ref={(label) => {
                    labelRefs.current[index] = label;
                  }}
                  className="inline-block"
                >
                  {labels[index]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
