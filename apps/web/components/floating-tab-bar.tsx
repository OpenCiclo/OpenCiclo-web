// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, CalendarDays, LineChart, Settings } from "lucide-react";

import { useCiclo } from "@/lib/client/ciclo-context";
import { SelectionMotion, dragFrame, labelScale, screenPull } from "@/lib/client/tab-drag";
import { shownScreen } from "@/lib/client/tab-screen";
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

/** The label under the selection stretches and wobbles with it, like gum. */
function paintLabels(labels: (HTMLSpanElement | null)[], position: number, scale: { x: number; y: number }) {
  const under = Math.round(position);
  const gum = labelScale(scale);
  const stretched = Math.abs(gum.x - 1) > 0.0005 || Math.abs(gum.y - 1) > 0.0005;
  labels.forEach((label, index) => {
    if (!label) return;
    label.style.transform = stretched && index === under ? `scale(${gum.x.toFixed(4)}, ${gum.y.toFixed(4)})` : "";
  });
}

/** Moves the screen on display by `offset`, a share of its width. */
function paintScreen(offset: number) {
  const moved = Math.abs(offset) > 0.0005;
  const root = document.documentElement;
  // Nothing may scroll sideways into the gap the screen leaves.
  if (moved) root.dataset.tabPull = "";
  else delete root.dataset.tabPull;
  const screen = shownScreen();
  if (screen) screen.style.transform = moved ? `translateX(${(offset * 100).toFixed(3)}%)` : "";
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
  // How far the screen was moved last frame, as a share of its width.
  const screenOffsetRef = useRef(0);
  // Set while a route change a drag asked for is on its way.
  const dragNavigationRef = useRef(false);
  // The tab a drag has picked, shown as selected until the route catches up.
  const [held, setHeld] = useState<{ index: number; pathname: string } | null>(null);
  // Once the route moves, forget it: coming back to this route later must not
  // light the tab the old drag picked.
  if (held && held.pathname !== pathname) setHeld(null);
  const litIndex = held?.pathname === pathname ? held.index : activeIndex;

  function motion() {
    motionRef.current ??= new SelectionMotion(
      TABS.length,
      (position, scale) => {
        const bubble = bubbleRef.current;
        if (!bubble) return;
        // Fixed decimals: tiny values would otherwise print as 1e-7.
        bubble.style.transform = `translateX(${(position * 100).toFixed(3)}%) scale(${scale.x.toFixed(4)}, ${scale.y.toFixed(4)})`;
        paintLabels(labelRefs.current, position, scale);
        const screenTab = screenTabRef.current;
        screenOffsetRef.current = followRef.current && screenTab >= 0 ? screenPull(position, screenTab) : 0;
        paintScreen(screenOffsetRef.current);
      },
      prefersReducedMotion,
    );
    return motionRef.current;
  }

  useEffect(() => () => motionRef.current?.stop(), []);

  useLayoutEffect(() => {
    const from = lastTabRef.current;
    const to = tabIndex(pathname);
    setSlideDirection(from, to);
    if (dragNavigationRef.current && from >= 0 && to >= 0 && from !== to) {
      // Runs after the browser took its picture of the old screen, as it was pulled.
      const direction = to > from ? 1 : -1;
      setSlideStart({
        pulled: -direction * screenOffsetRef.current,
        waiting: direction * screenPull(motionRef.current?.current ?? to, to),
      });
    } else {
      setSlideStart(null);
      followRef.current = false;
    }
    dragNavigationRef.current = false;
    lastTabRef.current = to;
    screenTabRef.current = to;
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
    };
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
        return;
      }
      if (Math.abs(dx) <= DRAG_SLOP) return;
      press.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      followRef.current = !prefersReducedMotion();
    }
    const frame = dragFrame(press.start, dx / press.tabWidth, press.held, TABS.length);
    if (frame.held !== press.held) {
      press.held = frame.held;
      setHeld({ index: frame.held, pathname });
      // Each tab the selection snaps to is a real navigation, made right
      // away: the next screen comes in while the finger is still down.
      dragNavigationRef.current = true;
      router.push(TABS[frame.held].href);
    }
    motion().follow(frame);
  }

  // Lifting the finger (or the system taking the gesture) lets the selection
  // and the screen spring into place. The route already followed the drag.
  function endPress(event: PointerEvent<HTMLDivElement>) {
    const press = pressRef.current;
    if (!press || event.pointerId !== press.pointerId) return;
    pressRef.current = null;
    if (!press.dragging) return;
    swallowClicksUntilRef.current = event.timeStamp + CLICK_AFTER_DRAG_MS;
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
