// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, CalendarDays, LineChart, Settings } from "lucide-react";

import { useCiclo } from "@/lib/client/ciclo-context";
import {
  SelectionMotion,
  dragFrame,
  labelScale,
  screenPull,
  stoppedOnTab,
} from "@/lib/client/tab-drag";
import { shownScreen, watchScreens } from "@/lib/client/tab-screen";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app", icon: CalendarDays },
  { href: "/patterns", icon: LineChart },
  { href: "/learn", icon: BookOpen },
  { href: "/settings", icon: Settings },
] as const;

/** Pixels a press may move before it counts as a drag instead of a tap. */
const DRAG_SLOP = 8;
/** How long after a drag a click still belongs to it. */
const CLICK_AFTER_DRAG_MS = 500;

function tabIndex(pathname: string) {
  return TABS.findIndex(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
}

function hidesTabBar(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/dev-") ||
    pathname.startsWith("/help") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/console")
  );
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Tells the screen carousel (the `tab-slide` view transition on AppShell, see
 * globals.css) which way to slide, or to swap screens in place when the route
 * did not move from one tab to another. Runs in the commit that swaps the
 * screens, before the browser starts animating them.
 *
 * Back and Forward get no view transition (React renders a popstate
 * synchronously), so the attribute does nothing there.
 */
function setSlideDirection(from: number, to: number) {
  const root = document.documentElement;
  if (from >= 0 && to >= 0 && from !== to) root.dataset.tabSlide = to > from ? "next" : "prev";
  else delete root.dataset.tabSlide;
}

/**
 * A drag changes screens while the finger is still down, with both screens
 * already moved: the old one pulled aside by `pulled`, the new one waiting
 * `waiting` short of its place (shares of the screen width, positive in the
 * direction of the slide). The carousel starts from there, with a spring.
 * Without a drag (a tap) it starts from the edges, as before.
 */
function setSlideStart(drag: { pulled: number; waiting: number } | null) {
  const root = document.documentElement;
  if (drag) {
    root.dataset.tabDrag = "";
    root.style.setProperty("--tab-slide-out", `${(drag.pulled * 100).toFixed(2)}%`);
    root.style.setProperty("--tab-slide-in", `${((drag.pulled + drag.waiting) * 100).toFixed(2)}%`);
  } else {
    delete root.dataset.tabDrag;
    root.style.removeProperty("--tab-slide-out");
    root.style.removeProperty("--tab-slide-in");
  }
}

/**
 * The label under the selection stretches and wobbles with it, like gum, and
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

/** Moves the content of the screen on display by `offset`, a share of its width. */
function paintScreen(offset: number) {
  const screen = shownScreen();
  if (screen) screen.style.transform = Math.abs(offset) > 0.0005 ? `translateX(${(offset * 100).toFixed(3)}%)` : "";
}

/** Gives the screen its own layer while it may move (see `.tab-screen` in globals.css). */
function layerScreen(on: boolean) {
  const root = document.documentElement;
  if (on) root.dataset.tabFollow = "";
  else delete root.dataset.tabFollow;
}

/** React starts the next screen only once the running slide ends: hurry it along. */
function hurrySlides() {
  for (const animation of document.getAnimations()) {
    if (animation instanceof CSSAnimation && animation.animationName.startsWith("tab-slide")) animation.playbackRate = 4;
  }
}

type Press = {
  pointerId: number;
  x: number;
  y: number;
  /** Tab the finger picked the selection up from. */
  start: number;
  /** Tab the selection snaps to right now. */
  held: number;
  tabWidth: number;
  dragging: boolean;
  /** Where the finger is, in tabs, its speed in tabs per second, and when it last moved. */
  finger: number;
  speed: number;
  movedAt: number;
  /** Animation frames drawn since the last move, and when that move was handled. */
  stillFrames: number;
  handledAt: number;
};

export function FloatingTabBar() {
  const { t, wallet } = useCiclo();
  const pathname = usePathname();
  const router = useRouter();
  const activeIndex = tabIndex(pathname);
  const bubbleIndex = Math.max(0, activeIndex);
  const hidden = !wallet || hidesTabBar(pathname);

  const bubbleRef = useRef<HTMLSpanElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const motionRef = useRef<SelectionMotion | null>(null);
  const placedRef = useRef(false);
  const pressRef = useRef<Press | null>(null);
  const swallowClicksUntilRef = useRef(0);
  const lastTabRef = useRef(activeIndex);
  // The tab whose screen is on display, and whether that screen moves with
  // the selection: from the start of a drag until a tap or Back changes screens.
  const screenTabRef = useRef(activeIndex);
  const followRef = useRef(false);
  // The tab the route is on or on its way to, and whether a drag sent it there.
  const routeTabRef = useRef(activeIndex);
  const dragNavigationRef = useRef(false);
  // Frame watch for a finger that sweeps past tabs (see `followRoute`).
  const sweepFrameRef = useRef(0);
  // The tab a drag has picked, shown as selected until the route catches up.
  const [held, setHeld] = useState<{ index: number; pathname: string } | null>(null);
  // Once the route moves, forget it: coming back to this route later must not
  // light the tab the old drag picked.
  if (held && held.pathname !== pathname) setHeld(null);
  const litIndex = held?.pathname === pathname ? held.index : activeIndex;

  function motion() {
    motionRef.current ??= new SelectionMotion(
      TABS.length,
      (position, scale, screen) => {
        const bubble = bubbleRef.current;
        if (!bubble) return;
        // Read before writing anything, so it does not force a layout.
        const tabWidth = bubble.offsetWidth;
        // Fixed decimals: tiny values would otherwise print as 1e-7.
        bubble.style.transform = `translateX(${(position * 100).toFixed(3)}%) scale(${scale.x.toFixed(4)}, ${scale.y.toFixed(4)})`;
        paintLabels(labelRefs.current, position, scale, tabWidth);
        paintScreen(followRef.current && screenTabRef.current >= 0 ? screen : 0);
        // At rest the springs land exactly on a tab.
        if (!pressRef.current && Number.isInteger(position)) layerScreen(false);
      },
      prefersReducedMotion,
    );
    return motionRef.current;
  }

  useEffect(() => {
    const unwatch = watchScreens(() => motionRef.current?.redraw());
    return () => {
      unwatch();
      cancelAnimationFrame(sweepFrameRef.current);
      motionRef.current?.stop();
      layerScreen(false);
    };
  }, []);

  useLayoutEffect(() => {
    const from = lastTabRef.current;
    const to = tabIndex(pathname);
    setSlideDirection(from, to);
    screenTabRef.current = to;
    const motion = motionRef.current;
    if (dragNavigationRef.current && from >= 0 && to >= 0 && from !== to) {
      // Runs after the browser took its picture of the old screen, as it was
      // pulled. The new one starts right next to it, where the finger says.
      const direction = to > from ? 1 : -1;
      const press = pressRef.current;
      const waiting = press?.dragging && followRef.current ? screenPull(press.finger, to) : 0;
      setSlideStart({ pulled: -direction * (motion?.screenOffset ?? 0), waiting: direction * waiting });
      motion?.rebaseScreen(waiting);
      // A sweep may pass through here on its way to another tab.
      if (to === routeTabRef.current) dragNavigationRef.current = false;
    } else {
      setSlideStart(null);
      followRef.current = false;
      dragNavigationRef.current = false;
      routeTabRef.current = to;
      motion?.rebaseScreen(0);
      if (!pressRef.current) layerScreen(false);
    }
    lastTabRef.current = to;
  }, [pathname]);

  useLayoutEffect(() => {
    if (hidden) {
      motionRef.current?.stop();
      placedRef.current = false;
      return;
    }
    if (pressRef.current?.dragging) return;
    if (placedRef.current) {
      motion().settle(bubbleIndex);
    } else {
      motion().place(bubbleIndex);
      placedRef.current = true;
    }
  }, [hidden, bubbleIndex]);

  if (hidden) return null;

  const labels = [t.calendar, t.patterns, t.learn, t.settings];

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    swallowClicksUntilRef.current = 0;
    if (!event.isPrimary || event.button !== 0 || activeIndex < 0) return;
    const tab = (event.target as Element).closest<HTMLElement>("[data-tab]");
    const pressed = Number(tab?.dataset.tab ?? -1);
    // Only the selection can be picked up. Any other tab is a plain link.
    if (pressed !== motion().nearest) return;
    pressRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: pressed,
      held: pressed,
      tabWidth: event.currentTarget.getBoundingClientRect().width / TABS.length,
      dragging: false,
      finger: pressed,
      speed: 0,
      movedAt: event.timeStamp,
      stillFrames: 0,
      handledAt: performance.now(),
    };
    // Now, before the finger moves, so the layer is ready when the screen does.
    if (!prefersReducedMotion()) layerScreen(true);
  }

  function stopSweepWatch() {
    cancelAnimationFrame(sweepFrameRef.current);
    sweepFrameRef.current = 0;
  }

  /** Sends the route to tab `index`, unless it is already there or on its way. */
  function navigateTo(index: number) {
    stopSweepWatch();
    if (index === routeTabRef.current) return;
    routeTabRef.current = index;
    dragNavigationRef.current = true;
    hurrySlides();
    router.push(TABS[index].href);
  }

  // Each tab the selection snaps to is a real navigation, made with the
  // finger still down, so the next screen comes in right away. A finger that
  // sweeps past several tabs navigates once, where it stops.
  function followRoute(press: Press) {
    if (press.held === routeTabRef.current) {
      stopSweepWatch();
      return;
    }
    if (stoppedOnTab(press.speed, press.stillFrames, performance.now() - press.handledAt)) {
      navigateTo(press.held);
      return;
    }
    // A finger that stops sends no more events: count the frames without one.
    if (!sweepFrameRef.current) {
      sweepFrameRef.current = requestAnimationFrame(() => {
        sweepFrameRef.current = 0;
        if (pressRef.current !== press) return;
        press.stillFrames += 1;
        followRoute(press);
      });
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const press = pressRef.current;
    if (!press || event.pointerId !== press.pointerId) return;
    const dx = event.clientX - press.x;
    if (!press.dragging) {
      const dy = event.clientY - press.y;
      if (Math.abs(dy) > DRAG_SLOP && Math.abs(dy) > Math.abs(dx)) {
        // Vertical: the page scrolls (touch-action: pan-y), the bar stays put.
        pressRef.current = null;
        layerScreen(false);
        return;
      }
      if (Math.abs(dx) <= DRAG_SLOP) return;
      press.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      followRef.current = !prefersReducedMotion();
    }
    const finger = press.start + dx / press.tabWidth;
    const seconds = (event.timeStamp - press.movedAt) / 1000;
    if (seconds > 0.001) press.speed = 0.6 * press.speed + (0.4 * (finger - press.finger)) / seconds;
    press.finger = finger;
    press.movedAt = event.timeStamp;
    press.stillFrames = 0;
    press.handledAt = performance.now();
    const frame = dragFrame(press.start, finger - press.start, press.held, TABS.length);
    if (frame.held !== press.held) {
      press.held = frame.held;
      setHeld({ index: frame.held, pathname });
    }
    followRoute(press);
    const screenTab = screenTabRef.current;
    motion().follow(frame, followRef.current && screenTab >= 0 ? screenPull(finger, screenTab) : 0);
  }

  // Lifting the finger (or the system taking the gesture) lands on the tab the
  // selection snapped to, and lets the selection and the screen spring into place.
  function endPress(event: PointerEvent<HTMLDivElement>) {
    const press = pressRef.current;
    if (!press || event.pointerId !== press.pointerId) return;
    pressRef.current = null;
    if (!press.dragging) {
      layerScreen(false);
      return;
    }
    swallowClicksUntilRef.current = event.timeStamp + CLICK_AFTER_DRAG_MS;
    navigateTo(press.held);
    motion().settle(press.held);
    if (press.held === activeIndex) setHeld(null);
  }

  // A drag can end in a click on the link it started on; that is not a tap.
  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (event.timeStamp > swallowClicksUntilRef.current) return;
    swallowClicksUntilRef.current = 0;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <nav className="tab-bar fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-4 mb-4 rounded-full border border-border bg-card/90 p-1.5 shadow-lg backdrop-blur-md">
        <div
          className="relative grid touch-pan-y grid-cols-4 select-none [-webkit-touch-callout:none]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPress}
          onPointerCancel={endPress}
          onClickCapture={onClickCapture}
          onContextMenu={(event) => {
            if (pressRef.current) event.preventDefault();
          }}
        >
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
                data-tab={index}
                draggable={false}
                aria-current={index === activeIndex ? "page" : undefined}
                className={cn(
                  "relative z-10 flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-2 text-[11px] font-semibold transition-colors duration-200",
                  index === litIndex ? "text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span
                  ref={(label) => {
                    labelRefs.current[index] = label;
                  }}
                  className="tab-label inline-block"
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
