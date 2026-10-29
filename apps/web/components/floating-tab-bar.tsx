// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, CalendarDays, LineChart, Settings } from "lucide-react";

import { useCiclo } from "@/lib/client/ciclo-context";
import { SlideMotion } from "@/lib/client/screen-carousel";
import { SelectionMotion, dragFrame, labelScale } from "@/lib/client/tab-drag";
import { endSwapTransition, ghostOf, setSwapping, shownScreen, skipEntrance } from "@/lib/client/tab-screen";
import { cn } from "@/lib/utils";
import { TabGhosts } from "@/components/tab-ghosts";

const TABS = [
  { href: "/app", icon: CalendarDays },
  { href: "/patterns", icon: LineChart },
  { href: "/learn", icon: BookOpen },
  { href: "/settings", icon: Settings },
] as const;

/** Pixels a press may move sideways before it counts as a drag instead of a tap. */
const DRAG_SLOP = 5;
/**
 * A press lets go of the bar only once it is clearly vertical: this far, and
 * more down than across. A thumb moves in an arc, so a drag often starts
 * slanted.
 */
const VERTICAL_SLOP = 10;
const VERTICAL_RATIO = 1.5;
/** How long after a drag a click still belongs to it. */
const CLICK_AFTER_DRAG_MS = 500;
/**
 * The screens move the way the finger does: dragging toward the next tab
 * pushes the screen on display aside, and the next tab comes in from the side
 * the finger leaves. -1 would be a carousel, against the finger.
 */
const SCREEN_FLOW = 1;
/** Fastest the screens carry on after the finger lifts, in screens per second. */
const MAX_LAND_SPEED = 8;

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
  /** How far, in tabs, the finger had moved when the drag took hold. */
  slop: number;
  /** This drag moves a strip of already drawn screens (see `openStrip`). */
  strip: boolean;
  /** The press started on a tab's link, not in the margin around the tabs. */
  onLink: boolean;
  /** The press caught the strip while it was still landing from the last drag. */
  regrab: boolean;
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
  // The tab whose screen is on display, and the tab the route is on or on its way to.
  const screenTabRef = useRef(activeIndex);
  const routeTabRef = useRef(activeIndex);
  // The strip a drag moves (see TabGhosts): the real screen and the ghosts
  // beside it, `low` to `high`, drawn already, so nothing is drawn mid-drag
  // and the route only changes when the finger lifts. `width` is a screen's,
  // in pixels; `landing` is the tab it is landing on, once the finger lifted.
  const stripRef = useRef<{ low: number; high: number; width: number; landing: number | null } | null>(null);
  const stripMotionRef = useRef<SlideMotion | null>(null);
  // The tab a strip landed on while the route follows under its ghost, and
  // where to go on from there if the finger let go past the strip.
  const swapRef = useRef<{ to: number; then: number } | null>(null);
  // The tab the selection holds during a drag, lit whatever the route is.
  // After the finger lifts it stays lit until the route gets there, or moves
  // anywhere else: coming back to this route later must not light the tab an
  // old drag picked.
  const [held, setHeld] = useState<{ index: number; down: boolean; pathname: string } | null>(null);
  if (held && !held.down && (held.index === activeIndex || held.pathname !== pathname)) setHeld(null);
  const litIndex = held ? held.index : activeIndex;

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
        // At rest the springs land exactly on a tab.
        if (!pressRef.current && !stripRef.current && Number.isInteger(position)) layerScreen(false);
      },
      prefersReducedMotion,
    );
    return motionRef.current;
  }

  function stripMotion() {
    stripMotionRef.current ??= new SlideMotion((position) => paintStrip(position), TABS.length - 1);
    return stripMotionRef.current;
  }

  /**
   * Opens a strip around the current tab, as far as ghosts go on each side,
   * with the screens beside it painted just out of sight, ready. False when
   * there are no ghosts yet (the app just opened): then the drag moves only
   * the selection, and the screens slide when the finger lifts, as for a tap.
   */
  function openStrip(): boolean {
    const real = screenTabRef.current;
    if (real < 0) return false;
    let low = real;
    let high = real;
    while (low > 0 && ghostOf(low - 1)) low -= 1;
    while (high < TABS.length - 1 && ghostOf(high + 1)) high += 1;
    if (low === high) return false;
    stripRef.current = { low, high, width: shownScreen()?.offsetWidth ?? window.innerWidth, landing: null };
    stripMotion().place(real);
    return true;
  }

  /** Lays the strip out with the finger over `position` (in tabs): each screen a screen's width from the next. */
  function paintStrip(position: number) {
    const strip = stripRef.current;
    if (!strip) return;
    const real = screenTabRef.current;
    paintScreen(-SCREEN_FLOW * (real - position));
    for (let tab = strip.low; tab <= strip.high; tab++) {
      const ghost = tab === real ? undefined : ghostOf(tab);
      if (!ghost) continue;
      const at = -SCREEN_FLOW * (tab - position);
      const shown = Math.abs(at) < 1.001;
      ghost.style.visibility = shown ? "visible" : "";
      ghost.style.willChange = shown ? "transform" : "";
      ghost.style.transform = shown ? `translateX(${(at * strip.width).toFixed(1)}px)` : "";
    }
  }

  /** Puts every ghost back out of sight and the real screen in place. */
  function closeStrip() {
    stripMotionRef.current?.stop();
    stripRef.current = null;
    paintScreen(0);
    for (let tab = 0; tab < TABS.length; tab++) {
      const ghost = ghostOf(tab);
      if (!ghost) continue;
      ghost.style.visibility = "";
      ghost.style.willChange = "";
      ghost.style.transform = "";
    }
  }

  /**
   * The finger let go on tab `target` moving at `speed` (tabs per second):
   * the strip carries on to it and stops. On another tab, its ghost now fills
   * the screen; the route goes there under it, with no slide (see the swap in
   * the route effect). Back on the same tab, nothing navigates at all.
   */
  function landStrip(target: number, speed: number) {
    const strip = stripRef.current;
    if (!strip) return;
    const stop = Math.min(strip.high, Math.max(strip.low, target));
    strip.landing = target;
    const velocity = Math.max(-MAX_LAND_SPEED, Math.min(MAX_LAND_SPEED, speed));
    stripMotion().land(stop, velocity, () => {
      if (stop === screenTabRef.current) {
        closeStrip();
        if (target !== stop) navigateTo(target);
        else layerScreen(false);
        return;
      }
      swapRef.current = { to: stop, then: target };
      setSwapping(true);
      navigateTo(stop);
    });
  }

  // The real screen is in place under the ghost that showed it, at the top
  // and with its entrance played, as the ghost had it: swap them.
  const onSwapLanded = useEffectEvent((swap: { to: number; then: number }) => {
    window.scrollTo(0, 0);
    skipEntrance(shownScreen());
    closeStrip();
    setSwapping(false);
    if (!pressRef.current) layerScreen(false);
    if (swap.then !== swap.to) navigateTo(swap.then);
  });
  const onRouteMoved = useEffectEvent(() => {
    if (stripRef.current) closeStrip();
    // A swap overtaken by another screen change (Back before it landed) is over.
    if (swapRef.current) {
      swapRef.current = null;
      setSwapping(false);
      if (!pressRef.current) layerScreen(false);
    }
  });

  useEffect(
    () => () => {
      motionRef.current?.stop();
      stripMotionRef.current?.stop();
      setSwapping(false);
      layerScreen(false);
    },
    [],
  );

  useLayoutEffect(() => {
    const from = lastTabRef.current;
    const to = tabIndex(pathname);
    setSlideDirection(from, to);
    screenTabRef.current = to;
    routeTabRef.current = to;
    const swap = swapRef.current;
    if (swap && to === swap.to) {
      swapRef.current = null;
      onSwapLanded(swap);
    } else {
      // Any screen change but a swap animates its view transition as usual.
      endSwapTransition();
      onRouteMoved();
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
    // The route is on its way to the screen the last drag landed on: wait for it.
    if (swapRef.current) return;
    const bar = event.currentTarget.getBoundingClientRect();
    const tabWidth = bar.width / TABS.length;
    const link = (event.target as Element).closest<HTMLElement>("[data-tab]");
    // Any tab can start a drag: the selection jumps to the finger and follows
    // it. A press that does not turn into a drag stays a tap on the link. In
    // the margin around the tabs (see the bar's ::before: just past the top of
    // the pill, where it covers page content, more at the sides and below) the
    // tab is the one the finger is over along the bar.
    const pressed = link
      ? Number(link.dataset.tab)
      : Math.min(TABS.length - 1, Math.max(0, Math.floor((event.clientX - bar.left) / tabWidth)));
    // Caught while the screens were still landing from the last drag: they
    // stop where they are, and this drag goes on from there.
    const regrab = stripRef.current !== null;
    if (regrab) stripMotion().follow(stripMotion().progress);
    pressRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: pressed,
      held: pressed,
      tabWidth,
      dragging: false,
      finger: pressed,
      speed: 0,
      movedAt: event.timeStamp,
      slop: 0,
      strip: regrab,
      onLink: Boolean(link),
      regrab,
    };
    // Now, before the finger moves, so the layer and the screens beside are
    // ready when it does.
    if (!regrab && !prefersReducedMotion() && openStrip()) {
      pressRef.current.strip = true;
      layerScreen(true);
    }
  }

  /** Sends the route to tab `index`, unless it is already there or on its way. */
  function navigateTo(index: number) {
    if (index === routeTabRef.current) return;
    routeTabRef.current = index;
    hurrySlides();
    router.push(TABS[index].href);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const press = pressRef.current;
    if (!press || event.pointerId !== press.pointerId) return;
    const dx = event.clientX - press.x;
    if (!press.dragging) {
      const dy = event.clientY - press.y;
      if (Math.abs(dy) > VERTICAL_SLOP && Math.abs(dy) > VERTICAL_RATIO * Math.abs(dx)) {
        // Vertical: not a drag of the bar. The bar keeps the gesture to itself
        // (touch-action: none), so the browser cannot take a slanted drag for
        // a scroll; a vertical swipe on the bar does not scroll the page.
        pressRef.current = null;
        if (press.regrab) landStrip(stripRef.current?.landing ?? screenTabRef.current, 0);
        else if (press.strip) closeStrip();
        layerScreen(false);
        return;
      }
      if (Math.abs(dx) <= DRAG_SLOP) return;
      press.dragging = true;
      press.slop = dx / press.tabWidth;
      event.currentTarget.setPointerCapture(event.pointerId);
      setHeld({ index: press.held, down: true, pathname });
    }
    const finger = press.start + dx / press.tabWidth;
    const seconds = (event.timeStamp - press.movedAt) / 1000;
    if (seconds > 0.001) press.speed = 0.6 * press.speed + (0.4 * (finger - press.finger)) / seconds;
    press.finger = finger;
    press.movedAt = event.timeStamp;
    const frame = dragFrame(press.start, finger - press.start, press.held, TABS.length);
    if (frame.held !== press.held) {
      press.held = frame.held;
      setHeld({ index: frame.held, down: true, pathname });
    }
    // Measured from where the drag took hold, past the slop, so the screens do
    // not jump when it starts. They trail the finger by those few pixels.
    const strip = stripRef.current;
    if (press.strip && strip) stripMotion().follow(Math.min(strip.high, Math.max(strip.low, finger - press.slop)));
    motion().follow(frame);
  }

  // Lifting the finger (or the system taking the gesture) lands on the tab the
  // selection snapped to: the strip carries on to it, or without a strip the
  // screens slide when the route gets there, as for a tap.
  function endPress(event: PointerEvent<HTMLDivElement>) {
    const press = pressRef.current;
    if (!press || event.pointerId !== press.pointerId) return;
    pressRef.current = null;
    if (!press.dragging) {
      if (press.regrab) {
        // A tap while the screens were landing: they land on the tab tapped
        // instead, and its link must not navigate as well.
        swallowClicksUntilRef.current = event.timeStamp + CLICK_AFTER_DRAG_MS;
        landStrip(press.start, 0);
        motion().settle(press.start);
        setHeld({ index: press.start, down: false, pathname });
        return;
      }
      if (press.strip) closeStrip();
      layerScreen(false);
      // A tap in the margin around the tabs, off any link: to the tab under the finger.
      if (!press.onLink && press.start !== activeIndex) navigateTo(press.start);
      return;
    }
    swallowClicksUntilRef.current = event.timeStamp + CLICK_AFTER_DRAG_MS;
    if (press.strip && !stripRef.current) {
      // The route moved during the drag (Back, say) and closed the strip:
      // nothing to land, and the selection goes back to the route.
      motion().settle(bubbleIndex);
      setHeld(null);
      return;
    }
    const target = press.held;
    if (press.strip) landStrip(target, press.speed);
    else navigateTo(target);
    motion().settle(target);
    setHeld({ index: target, down: false, pathname });
  }

  // A drag can end in a click on the link it started on; that is not a tap.
  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (event.timeStamp > swallowClicksUntilRef.current) return;
    swallowClicksUntilRef.current = 0;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <>
      <nav className="tab-bar fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md pb-[env(safe-area-inset-bottom)]">
        <div className="mx-4 mb-4 rounded-full border border-border bg-card/90 p-1.5 shadow-lg backdrop-blur-md">
          <div
            className="relative grid touch-none grid-cols-4 select-none [-webkit-touch-callout:none] before:absolute before:-inset-x-3 before:-top-3 before:-bottom-6 before:content-['']"
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
      <TabGhosts current={activeIndex} count={TABS.length} />
    </>
  );
}
