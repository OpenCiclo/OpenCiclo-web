// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, CalendarDays, LineChart, Settings } from "lucide-react";

import { useCiclo } from "@/lib/client/ciclo-context";
import {
  SlideMotion,
  finishSlides,
  rewindSlides,
  setSlides,
  slideProgress,
  takeSlides,
} from "@/lib/client/screen-carousel";
import { SWEEP_SPEED, SelectionMotion, dragFrame, labelScale, stoppedOnTab } from "@/lib/client/tab-drag";
import { endSwapTransition, ghostOf, setSwapping, shownScreen, watchSlides } from "@/lib/client/tab-screen";
import { cn } from "@/lib/utils";
import { TabGhosts } from "@/components/tab-ghosts";

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
/**
 * How far the old screen follows the finger, as a share of its width, while
 * the next one is still being drawn: a little, so no gap opens beside it.
 * Once the next one is there, both catch up with the finger.
 */
const WAIT_LIMIT = 0.06;
/** A finger this far (in tabs) back past where the drag started turns it around. */
const TURN_BACK = 0.08;
/** How far (in tabs) the finger leaves a screen before the next one is brought in. */
const LEAVE_AT = 0.05;
/** Fastest the screens carry on after the finger lifts, in screens per second. */
const MAX_LAND_SPEED = 8;
/** How long going back to the first screen may take before the slides are put away anyway. */
const REVERT_WAIT_MS = 600;

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
 * A drag swaps screens with slides the finger moves (see screen-carousel.ts).
 * `pulled` is how far the old screen had already followed the finger, as a
 * share of its width, when the browser took its picture. Null for any other
 * screen change, which slides on its own, as a tap does.
 */
function setSlideStart(pulled: number | null) {
  const root = document.documentElement;
  if (pulled === null) {
    delete root.dataset.tabDrag;
    root.style.removeProperty("--tab-slide-out");
  } else {
    root.dataset.tabDrag = "";
    root.style.setProperty("--tab-slide-out", `${(pulled * 100).toFixed(2)}%`);
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

/** Plays a screen's entrance animations (fade-up and friends) to the end: it arrives whole. */
function skipEntrance(screen: HTMLElement | null) {
  for (const animation of screen?.getAnimations({ subtree: true }) ?? []) {
    if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) animation.finish();
  }
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
  /** Screens this drag has already slid all the way through. */
  slidThrough: number;
  /** How far, in tabs, the finger had moved when the drag took hold. */
  slop: number;
  /** This drag moves a strip of already drawn screens (see `openStrip`). */
  strip: boolean;
};

/**
 * Two screens the finger is between. The route is already on `to` (or on its
 * way there), so both can show, and the slides that swap them follow the finger.
 */
type Pair = {
  from: number;
  to: number;
  /** +1 when `to` is the next tab, -1 when it is the previous one. */
  direction: number;
  /** The paused slides, once the view transition has started. */
  slides: Animation[] | null;
  /** 0 with `from` in place, 1 with `to` in place. */
  progress: number;
  /** Where the finger let go, if it did before the slides started. */
  landing: number | null;
  /** The route is going back to `from`; then `afterRevert` runs. */
  reverting: boolean;
  afterRevert: (() => void) | null;
  revertTimer: number;
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
  // The tab whose screen is on display, and the tab the route is on or on its
  // way to, and whether a drag sent it there.
  const screenTabRef = useRef(activeIndex);
  const routeTabRef = useRef(activeIndex);
  const dragNavigationRef = useRef(false);
  // Whether this drag moves the screens (not with reduced motion), the screens
  // it is between, and how far the screen on display is moved by hand.
  const followRef = useRef(false);
  const pairRef = useRef<Pair | null>(null);
  const slideMotionRef = useRef<SlideMotion | null>(null);
  const offsetRef = useRef(0);
  // Frame watch for a finger that sweeps past tabs (see `followRoute`).
  const sweepFrameRef = useRef(0);
  // The strip a drag moves once the other tabs have ghosts (see TabGhosts):
  // the real screen and the ghosts beside it, `low` to `high`, drawn
  // already, so nothing is drawn mid-drag and the route only changes when
  // the finger lifts. `width` is a screen's, in pixels.
  const stripRef = useRef<{ low: number; high: number; width: number } | null>(null);
  const stripMotionRef = useRef<SlideMotion | null>(null);
  // The tab a strip landed on while the route follows under its ghost, and
  // where to go on from there if the finger let go past the strip.
  const swapRef = useRef<{ to: number; then: number } | null>(null);
  // The tab the selection holds during a drag, lit whatever the route is (the
  // route runs ahead, to the screen the finger heads for). After the finger
  // lifts it stays lit until the route gets there, or moves anywhere else:
  // coming back to this route later must not light the tab an old drag picked.
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
        if (!pressRef.current && !pairRef.current && !stripRef.current && Number.isInteger(position)) {
          layerScreen(false);
        }
      },
      prefersReducedMotion,
    );
    return motionRef.current;
  }

  // The screens, on a spring that follows the finger (see SlideMotion): the
  // slides once they are there, and until then the screen on display.
  function slideMotion() {
    slideMotionRef.current ??= new SlideMotion((progress) => {
      const pair = pairRef.current;
      if (!pair || pair.reverting) return;
      if (!pair.slides) {
        moveScreen(-pair.direction * progress);
        return;
      }
      setSlides(pair.slides, progress);
      const press = pressRef.current;
      if (press && progress >= 1 && pair.progress >= 1) slidThrough(press, pair);
    });
    return slideMotionRef.current;
  }

  function stripMotion() {
    stripMotionRef.current ??= new SlideMotion((position) => paintStrip(position), TABS.length - 1);
    return stripMotionRef.current;
  }

  /**
   * Opens a strip around the current tab, as far as ghosts go on each side,
   * with the screens beside it painted just out of sight, ready. False when
   * there are no ghosts yet (the app just opened): the drag then brings each
   * screen in by navigating to it.
   */
  function openStrip(): boolean {
    const real = screenTabRef.current;
    if (real < 0) return false;
    let low = real;
    let high = real;
    while (low > 0 && ghostOf(low - 1)) low -= 1;
    while (high < TABS.length - 1 && ghostOf(high + 1)) high += 1;
    if (low === high) return false;
    stripRef.current = { low, high, width: shownScreen()?.offsetWidth ?? window.innerWidth };
    stripMotion().place(real);
    return true;
  }

  /** Lays the strip out with the finger over `position` (in tabs): each screen a screen's width from the next. */
  function paintStrip(position: number) {
    const strip = stripRef.current;
    if (!strip) return;
    const real = screenTabRef.current;
    moveScreen(real - position);
    for (let tab = strip.low; tab <= strip.high; tab++) {
      const ghost = tab === real ? undefined : ghostOf(tab);
      if (!ghost) continue;
      const at = tab - position;
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
    moveScreen(0);
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

  /** Moves the screen on display by hand: only while the next one is still being drawn. */
  function moveScreen(offset: number) {
    offsetRef.current = offset;
    paintScreen(offset);
  }

  const onSlidesStarted = useEffectEvent(() => adoptSlides());
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
  });

  useEffect(() => {
    const unwatch = watchSlides(() => onSlidesStarted());
    return () => {
      unwatch();
      cancelAnimationFrame(sweepFrameRef.current);
      motionRef.current?.stop();
      slideMotionRef.current?.stop();
      stripMotionRef.current?.stop();
      setSwapping(false);
      const pair = pairRef.current;
      if (pair?.slides) finishSlides(pair.slides);
      pairRef.current = null;
      layerScreen(false);
    };
  }, []);

  useLayoutEffect(() => {
    const from = lastTabRef.current;
    const to = tabIndex(pathname);
    setSlideDirection(from, to);
    screenTabRef.current = to;
    const pair = pairRef.current;
    const swap = swapRef.current;
    if (swap && to === swap.to) {
      swapRef.current = null;
      dragNavigationRef.current = false;
      setSlideStart(null);
      onSwapLanded(swap);
    } else if (pair?.reverting && to === pair.from) {
      // Back on the screen the drag started from: it is the real one again.
      endRevert(pair);
    } else if (pair && to === pair.to && dragNavigationRef.current) {
      // Runs after the browser took its picture of the old screen, as far as
      // it had followed the finger. The new screen starts in its place: the
      // slides move both from here.
      dragNavigationRef.current = false;
      setSlideStart(Math.abs(offsetRef.current));
      moveScreen(0);
      if (pair.reverting) window.history.back();
      else if (typeof document.startViewTransition !== "function") completePair(pair);
    } else if (dragNavigationRef.current && to === routeTabRef.current) {
      // A drag landed here without slides of its own (a sweep): slide in as a tap does.
      dragNavigationRef.current = false;
      setSlideStart(null);
    } else {
      dragNavigationRef.current = false;
      setSlideStart(null);
      routeTabRef.current = to;
      if (pair) dropPair(pair);
      onRouteMoved();
    }
    // Any screen change but a swap animates its view transition as usual.
    if (!(swap && to === swap.to)) endSwapTransition();
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
    // The screens are still landing from the last drag.
    if (pairRef.current || stripRef.current || swapRef.current) return;
    const tab = (event.target as Element).closest<HTMLElement>("[data-tab]");
    const pressed = Number(tab?.dataset.tab ?? -1);
    // Any tab can start a drag: the selection jumps to the finger and follows
    // it. A press that does not turn into a drag stays a tap on the link.
    if (pressed < 0) return;
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
      slidThrough: 0,
      slop: 0,
      strip: false,
    };
    // Now, before the finger moves, so the layer and the screens beside are
    // ready when it does.
    if (!prefersReducedMotion()) {
      layerScreen(true);
      pressRef.current.strip = openStrip();
    }
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

  // With reduced motion, and for a finger sweeping past several tabs: the
  // route follows the selection once the finger stops on a tab.
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

  // The screens follow the finger like a carousel: halfway between two tabs,
  // half of each screen shows. The route goes to the tab the finger heads
  // for as soon as it heads there, a real navigation, so that screen exists.
  function slideScreens(press: Press) {
    // Measured from where the drag took hold, past the slop, so the screens do
    // not jump when it starts. They trail the finger by those few pixels.
    const finger = press.finger - press.slop;
    const pair = pairRef.current;
    if (pair) {
      if (pair.reverting) return;
      if ((finger - pair.from) * pair.direction < -TURN_BACK) {
        // Turned around past where it started: back to that screen first,
        // then on to the other side.
        revertPair(pair, null);
        return;
      }
      pair.progress = slideProgress(finger, pair.from, pair.direction);
      slideMotion().follow(pair.slides ? pair.progress : Math.min(pair.progress, WAIT_LIMIT));
      return;
    }
    const from = screenTabRef.current;
    // A screen change is still on its way: wait for it.
    if (from < 0 || routeTabRef.current !== from) return;
    const away = finger - from;
    const direction = Math.sign(away);
    const to = from + direction;
    // Sweeping on past the tab it just slid to, or already past the next tab:
    // one screen change, where it stops, not every screen on the way.
    if (Math.abs(away) > 1 || (press.slidThrough > 0 && Math.abs(press.speed) >= SWEEP_SPEED)) {
      followRoute(press);
      return;
    }
    // Nothing that way: the screen stays put.
    if (direction === 0 || to < 0 || to >= TABS.length) {
      moveScreen(0);
      return;
    }
    // Close to this screen's tab: it follows the finger, the next one is not needed yet.
    if (Math.abs(away) < LEAVE_AT) {
      moveScreen(-away);
      return;
    }
    stopSweepWatch();
    pairRef.current = {
      from,
      to,
      direction,
      slides: null,
      progress: slideProgress(finger, from, direction),
      landing: null,
      reverting: false,
      afterRevert: null,
      revertTimer: 0,
    };
    // From where the screen already is, following the finger.
    slideMotion().place(Math.abs(away));
    slideMotion().follow(Math.min(pairRef.current.progress, WAIT_LIMIT));
    navigateTo(to);
  }

  /** The finger reached the next screen: it is the one on display now, and the drag goes on from it. */
  function slidThrough(press: Press, pair: Pair) {
    press.slidThrough += 1;
    completePair(pair);
    // The finger may be still, or already past this screen: decide now, not on its next move.
    slideScreens(press);
  }

  // The view transition for a drag started: take its slides over.
  function adoptSlides() {
    const pair = pairRef.current;
    if (!pair || pair.slides || document.documentElement.dataset.tabDrag === undefined) return;
    const slides = takeSlides();
    if (!slides) return;
    pair.slides = slides;
    if (pair.reverting) {
      setSlides(slides, 0);
      return;
    }
    // Where the old screen's picture was taken; from there both catch up with the finger.
    setSlides(slides, slideMotion().progress);
    if (pressRef.current) slideMotion().follow(pair.progress);
    else landPair(pair, pair.landing ?? pair.from, 0);
  }

  /** The new screen is all the way in: the transition ends there. */
  function completePair(pair: Pair) {
    slideMotionRef.current?.stop();
    if (pair.slides) finishSlides(pair.slides);
    if (pairRef.current === pair) pairRef.current = null;
    setSlideStart(null);
  }

  /** Puts the slides away wherever they are (another navigation took over). */
  function dropPair(pair: Pair) {
    slideMotionRef.current?.stop();
    window.clearTimeout(pair.revertTimer);
    if (pair.slides) finishSlides(pair.slides);
    if (pairRef.current === pair) pairRef.current = null;
  }

  /** Slides back to the screen the drag started from, and takes the route back there. */
  function revertPair(pair: Pair, then: (() => void) | null) {
    slideMotionRef.current?.stop();
    pair.reverting = true;
    pair.afterRevert = then;
    pair.progress = 0;
    if (pair.slides) setSlides(pair.slides, 0);
    moveScreen(0);
    routeTabRef.current = pair.from;
    // Back, not another push (Next.js's router.back() is this too): the route
    // the drag tried leaves no trace in history. If it is not there yet, the
    // commit that lands it goes back.
    if (screenTabRef.current === pair.to) window.history.back();
    pair.revertTimer = window.setTimeout(() => endRevert(pair), REVERT_WAIT_MS);
  }

  function endRevert(pair: Pair) {
    window.clearTimeout(pair.revertTimer);
    if (pair.slides) rewindSlides(pair.slides);
    if (pairRef.current === pair) pairRef.current = null;
    setSlideStart(null);
    routeTabRef.current = screenTabRef.current;
    if (!pressRef.current) layerScreen(false);
    pair.afterRevert?.();
  }

  /**
   * The finger let go on tab `target`, moving at `speed` (tabs per second,
   * toward `to` when positive): the screens carry on at that speed, slowing
   * down, on or back to it.
   */
  function landPair(pair: Pair, target: number, speed: number) {
    if (!pair.slides) {
      pair.landing = target;
      return;
    }
    const onward = (target - pair.from) * pair.direction > 0;
    const velocity = Math.max(-MAX_LAND_SPEED, Math.min(MAX_LAND_SPEED, speed));
    slideMotion().land(onward ? 1 : 0, velocity, () => {
      if (onward) {
        completePair(pair);
        // Let go past the next tab: on to that one, as a tap would.
        if (target !== pair.to) navigateTo(target);
        else layerScreen(false);
      } else {
        revertPair(pair, target !== pair.from ? () => navigateTo(target) : null);
      }
    });
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
        if (press.strip) closeStrip();
        layerScreen(false);
        return;
      }
      if (Math.abs(dx) <= DRAG_SLOP) return;
      press.dragging = true;
      press.slop = dx / press.tabWidth;
      event.currentTarget.setPointerCapture(event.pointerId);
      followRef.current = !prefersReducedMotion();
      setHeld({ index: press.held, down: true, pathname });
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
      setHeld({ index: frame.held, down: true, pathname });
    }
    const strip = stripRef.current;
    if (press.strip && strip) stripMotion().follow(Math.min(strip.high, Math.max(strip.low, finger - press.slop)));
    else if (followRef.current) slideScreens(press);
    else followRoute(press);
    motion().follow(frame);
  }

  // Lifting the finger (or the system taking the gesture) lands on the tab the
  // selection snapped to: the screens slide on or back to it, and the
  // selection springs into place.
  function endPress(event: PointerEvent<HTMLDivElement>) {
    const press = pressRef.current;
    if (!press || event.pointerId !== press.pointerId) return;
    pressRef.current = null;
    if (!press.dragging) {
      if (press.strip) closeStrip();
      layerScreen(false);
      return;
    }
    swallowClicksUntilRef.current = event.timeStamp + CLICK_AFTER_DRAG_MS;
    stopSweepWatch();
    const target = press.held;
    const pair = pairRef.current;
    if (press.strip) landStrip(target, press.speed);
    else if (!pair) navigateTo(target);
    else if (!pair.reverting) landPair(pair, target, press.speed * pair.direction);
    else if (target !== pair.from) pair.afterRevert = () => navigateTo(target);
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
      <TabGhosts current={activeIndex} count={TABS.length} />
    </>
  );
}
