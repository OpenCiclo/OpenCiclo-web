// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronUp } from "lucide-react";

import { ForecastInfoDialog } from "@/components/calendar/forecast-info-dialog";
import { PhaseAura } from "@/components/calendar/phase-visuals";
import { IS_ANDROID_APP } from "@/lib/app-target";
import { useLatest, usePrefersReducedMotion } from "@/lib/client/hooks";
import { VelocityTracker, sheetDragIntent, sheetShouldClose } from "@/lib/client/swipe";
import { resist } from "@/lib/client/tab-drag";
import type { CyclePhase } from "@/lib/cycle/phases";
import type { Messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type CardRect = { top: number; left: number; width: number; height: number };

/** Space between the expanded card and the bottom of the screen, in px. */
const BOTTOM_GAP = 16;
/** Never higher than this from the top of the screen, in px. */
const TOP_GAP = 12;
const CLOSE_MS = 420;
const CLOSE_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const OPEN_TRANSITION = "height 0.55s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease";
const CLOSE_TRANSITION = `height ${CLOSE_MS}ms ${CLOSE_EASING}, box-shadow 0.4s ease`;
const SETTLE_TRANSITION = "height 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
const SETTLE_MS = 360;
/** The open card's shadow, on a layer of its own that only scales and fades with the card (see below). */
const SHADOW = "0 24px 60px rgba(10, 6, 20, 0.35)";
const SHADOW_OPEN = "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease";
const SHADOW_CLOSE = `transform ${CLOSE_MS}ms ${CLOSE_EASING}, opacity ${CLOSE_MS}ms ${CLOSE_EASING}`;
const SHADOW_SETTLE = "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease";
/**
 * The handle shows once the card is nearly open. As it closes, its words fade
 * out along the way (gone at about three quarters of it) and the band behind
 * them, which hides the content under the words, a little later: both gone
 * when the card is back. A drag does the same by distance.
 */
const HANDLE_IN = "opacity 0.3s ease 0.25s";
const HINT_OUT = "opacity 0.26s linear";
const HANDLE_BAND_OUT = "opacity 0.24s ease 0.18s";
const HANDLE_SETTLE = "opacity 0.3s ease";
/** Share of a drag back to the card's size at which the words have faded out. */
const HINT_GONE_AT = 0.75;
/** Room under the content for the handle, in px. */
const HANDLE_ROOM = IS_ANDROID_APP ? 60 : 40;
/** Farthest the card stretches, in px, when its handle is pulled down. */
const PULL_DOWN_LIMIT = 16;
const CLICK_AFTER_DRAG_MS = 500;

type Drag = {
  pointerId: number;
  x: number;
  y: number;
  dragging: boolean;
  slop: number;
  from: number;
  height: number;
  /** Finger travel since it came down, in px (negative is up). Closing goes by this, slop included. */
  dy: number;
};

/**
 * The phase card, expanded. On a phone it grows down from where the card sits
 * to near the bottom of the screen, still a floating card, over a dimmed page;
 * in the Android app its handle can be dragged up to close it. On the desktop
 * it is a dialog in the middle of the window. Closes on its arrow, a tap
 * outside, Escape and the Android back button.
 */
export function PhaseCardOverlay({
  origin,
  desktop,
  phase,
  next,
  title,
  header,
  details,
  t,
  onClosed,
}: {
  origin: CardRect;
  desktop: boolean;
  phase: CyclePhase;
  next: CyclePhase;
  /** For screen readers: what the dialog is. */
  title: string;
  header: ReactNode;
  /** The expanded content; `howEstimated` opens the forecast explainer. */
  details: (howEstimated: () => void) => ReactNode;
  t: Messages;
  onClosed: () => void;
}) {
  const titleId = useId();
  const reduceMotion = usePrefersReducedMotion();
  const instant = reduceMotion || desktop;
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrimRef = useRef<HTMLButtonElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLButtonElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(instant);
  const [closing, setClosing] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoOpenRef = useLatest(infoOpen);
  const onClosedRef = useLatest(onClosed);
  const expanded = open && !closing;
  const top = Math.max(origin.top, TOP_GAP);
  const openHeight = `100dvh - ${top}px - ${BOTTOM_GAP}px - env(safe-area-inset-bottom)`;
  const height = expanded ? `calc(${openHeight})` : `${origin.height}px`;
  const transition = reduceMotion ? "none" : expanded ? OPEN_TRANSITION : CLOSE_TRANSITION;
  const handleTransition = reduceMotion ? "none" : expanded ? HANDLE_IN : HANDLE_BAND_OUT;
  const hintTransition = reduceMotion ? "none" : expanded ? HANDLE_IN : HINT_OUT;
  // A big blurred shadow on a card that changes height is drawn again every
  // frame, which made opening and closing stutter. The shadow sits on its own
  // layer at the open size instead, and is squeezed to the card's height: with
  // the same timing as the card, it keeps to the card's edge. (The open size
  // here leaves out the safe area; it is only used while the shadow is faint.)
  const [collapsedScale] = useState(() =>
    Math.min(1, origin.height / Math.max(1, window.innerHeight - top - BOTTOM_GAP)),
  );
  const shadowTransform = expanded ? "none" : `scaleY(${collapsedScale})`;
  const shadowTransition = reduceMotion ? "none" : expanded ? SHADOW_OPEN : SHADOW_CLOSE;
  // What React last wrote, so a drag can hand the card back to it.
  const rendered = useRef({ height, transition, handleTransition, hintTransition, shadowTransition });
  useLayoutEffect(() => {
    rendered.current = { height, transition, handleTransition, hintTransition, shadowTransition };
  });
  // Built once: the card's own state changes (opening, closing) leave the content alone.
  const openInfo = useCallback(() => setInfoOpen(true), []);
  const content = useMemo(() => details(openInfo), [details, openInfo]);

  // Grow from the card's own height: the expanded height once that one has
  // been drawn (two frames; a timer too, as frames stop in a hidden page).
  useLayoutEffect(() => {
    if (instant) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setOpen(true));
    });
    const fallback = window.setTimeout(() => setOpen(true), 80);
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      window.clearTimeout(fallback);
    };
  }, [instant]);

  useEffect(() => {
    if (expanded) closeRef.current?.focus();
  }, [expanded]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const requestClose = useCallback(() => {
    if (reduceMotion) {
      onClosedRef.current();
      return;
    }
    // Scrolled down: the content glides back to the top while the card closes,
    // so it ends where the card above the calendar starts.
    const scroller = scrollRef.current;
    const inner = contentRef.current;
    if (!desktop && scroller && inner && scroller.scrollTop > 0 && typeof inner.animate === "function") {
      const offset = scroller.scrollTop;
      scroller.scrollTop = 0;
      inner.animate([{ transform: `translateY(${-offset}px)` }, { transform: "none" }], {
        duration: CLOSE_MS,
        easing: CLOSE_EASING,
      });
    }
    setClosing(true);
  }, [desktop, onClosedRef, reduceMotion]);

  // The phone card reports the end of its height transition; this covers the
  // desktop dialog's animation and a transition that never runs.
  useEffect(() => {
    if (!closing) return;
    const id = window.setTimeout(() => onClosedRef.current(), desktop ? 260 : 520);
    return () => window.clearTimeout(id);
  }, [closing, desktop, onClosedRef]);

  const requestCloseRef = useLatest(requestClose);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // The forecast explainer on top closes first.
      if (event.key !== "Escape" || infoOpenRef.current) return;
      requestCloseRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [infoOpenRef, requestCloseRef]);

  // Dragging the handle up (Android): the card follows, the handle and the dim
  // fade with it, then it closes past a distance or on a flick, or settles back.
  const dragRef = useRef<Drag | null>(null);
  const trackerRef = useRef(new VelocityTracker());
  const swallowClickUntilRef = useRef(0);
  const canDrag = IS_ANDROID_APP && !desktop && expanded;

  function onHandleDown(event: PointerEvent<HTMLButtonElement>) {
    if (!canDrag || !event.isPrimary || event.pointerType === "mouse") return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, dragging: false, slop: 0, from: 0, height: 0, dy: 0 };
    trackerRef.current.reset(event.timeStamp, 0);
  }

  function onHandleMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const card = cardRef.current;
    if (!drag || !card || event.pointerId !== drag.pointerId) return;
    const dy = event.clientY - drag.y;
    drag.dy = dy;
    trackerRef.current.add(event.timeStamp, -dy);
    if (!drag.dragging) {
      const intent = sheetDragIntent(event.clientX - drag.x, dy);
      if (intent === "pending") return;
      if (intent === "other") {
        dragRef.current = null;
        return;
      }
      drag.dragging = true;
      drag.slop = dy;
      drag.from = card.getBoundingClientRect().height;
      card.style.transition = "none";
      for (const element of [handleRef.current, hintRef.current, scrimRef.current, shadowRef.current]) {
        if (element) element.style.transition = "none";
      }
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const moved = dy - drag.slop;
    const next = moved > 0 ? drag.from + resist(moved, PULL_DOWN_LIMIT) : Math.max(origin.height, drag.from + moved);
    drag.height = next;
    card.style.height = `${next}px`;
    const range = drag.from - origin.height;
    const back = range > 0 ? Math.min(1, Math.max(0, (drag.from - next) / range)) : 0;
    if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - back / HINT_GONE_AT));
    if (handleRef.current) handleRef.current.style.opacity = String(1 - back * back);
    if (scrimRef.current) scrimRef.current.style.opacity = String(1 - back);
    if (shadowRef.current) {
      shadowRef.current.style.transform = `scaleY(${next / drag.from})`;
      shadowRef.current.style.opacity = String(1 - back);
    }
  }

  function onHandleEnd(event: PointerEvent<HTMLButtonElement>, cancelled: boolean) {
    const drag = dragRef.current;
    const card = cardRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    if (!drag.dragging || !card) return;
    swallowClickUntilRef.current = event.timeStamp + CLICK_AFTER_DRAG_MS;
    if (!cancelled) {
      drag.dy = event.clientY - drag.y;
      trackerRef.current.add(event.timeStamp, -drag.dy);
    }
    const travel = -drag.dy;
    const velocity = trackerRef.current.velocity(event.timeStamp);
    const scrim = scrimRef.current;
    // The dim's transition comes from its class again.
    if (scrim) scrim.style.transition = "";
    if (!cancelled && sheetShouldClose(travel, velocity, drag.from)) {
      // React writes the closing height, opacities and transitions on the next
      // render; they carry on from where the drag left them.
      requestClose();
      return;
    }
    const shadow = shadowRef.current;
    card.style.transition = SETTLE_TRANSITION;
    card.style.height = rendered.current.height;
    for (const element of [handleRef.current, hintRef.current]) {
      if (!element) continue;
      element.style.transition = HANDLE_SETTLE;
      element.style.opacity = "1";
    }
    if (shadow) {
      shadow.style.transition = SHADOW_SETTLE;
      shadow.style.transform = "none";
      shadow.style.opacity = "1";
    }
    if (scrim) scrim.style.opacity = "1";
    window.setTimeout(() => {
      if (dragRef.current) return;
      if (cardRef.current) cardRef.current.style.transition = rendered.current.transition;
      if (handleRef.current) handleRef.current.style.transition = rendered.current.handleTransition;
      if (hintRef.current) hintRef.current.style.transition = rendered.current.hintTransition;
      if (shadowRef.current) shadowRef.current.style.transition = rendered.current.shadowTransition;
    }, SETTLE_MS);
  }

  function onHandleClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.timeStamp < swallowClickUntilRef.current) return;
    requestClose();
  }

  const closeButton = (
    <button
      ref={closeRef}
      type="button"
      onClick={requestClose}
      aria-label={t.close}
      className="absolute top-3.5 right-3.5 z-20 flex size-[26px] items-center justify-center rounded-full border border-[var(--glass-edge)] bg-[var(--glass)] text-card-foreground transition-transform active:scale-90"
    >
      <ChevronUp className="size-3.5" aria-hidden />
    </button>
  );
  const body = (
    <>
      <h2 id={titleId} className="sr-only">
        {title}
      </h2>
      {header}
      {content}
    </>
  );

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* A plain dim, no backdrop blur: blurring the whole page every frame made the card stutter on phones. */}
      <button
        ref={scrimRef}
        type="button"
        aria-label={t.close}
        tabIndex={-1}
        onClick={requestClose}
        className="absolute inset-0 touch-none bg-black/40 transition-opacity duration-300 motion-reduce:transition-none"
        style={{ opacity: expanded ? 1 : 0 }}
      />
      {desktop ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-phase-open=""
            className={cn(
              "sheet-dialog pointer-events-auto relative isolate flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-4xl border border-border/70 bg-card text-card-foreground shadow-2xl",
              closing ? "animate-sheet-down" : "animate-sheet-up",
            )}
          >
            <PhaseAura phase={phase} next={next} animate={false} wide />
            {closeButton}
            <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto overscroll-contain px-[18px] pt-4 pb-4">{body}</div>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={shadowRef}
            aria-hidden
            className="pointer-events-none absolute origin-top rounded-3xl will-change-transform"
            style={{
              top,
              left: origin.left,
              width: origin.width,
              height: `calc(${openHeight})`,
              boxShadow: SHADOW,
              transform: shadowTransform,
              opacity: expanded ? 1 : 0,
              transition: shadowTransition,
            }}
          />
          <div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-phase-open={expanded ? "" : undefined}
            className="absolute isolate overflow-hidden rounded-3xl border border-border/70 bg-card text-card-foreground shadow-sm"
            style={{ top, left: origin.left, width: origin.width, height, transition }}
            onTransitionEnd={(event) => {
              if (event.target !== event.currentTarget || event.propertyName !== "height" || !closing) return;
              onClosedRef.current();
            }}
          >
            <PhaseAura phase={phase} next={next} animate={false} wide={expanded} />
            {closeButton}
            {/* Laid out at the open size from the start (less the 2 px border): the
                card only uncovers it, so nothing inside reflows while it grows or shrinks. */}
            <div className="relative z-[1] flex flex-col" style={{ height: `calc(${openHeight} - 2px)` }}>
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[18px] pt-4"
                style={{ paddingBottom: HANDLE_ROOM }}
              >
                <div ref={contentRef}>{body}</div>
              </div>
            </div>
            {/* Rides the card's bottom edge. */}
            <div
              ref={handleRef}
              className="absolute inset-x-0 bottom-0 z-[2] flex justify-center bg-linear-to-t from-card from-55% to-transparent pt-5 pb-2"
              style={{ opacity: expanded ? 1 : 0, transition: handleTransition }}
            >
              <button
                ref={hintRef}
                type="button"
                aria-label={t.close}
                tabIndex={expanded ? 0 : -1}
                style={{ opacity: expanded ? 1 : 0, transition: hintTransition }}
                onClick={onHandleClick}
                onPointerDown={onHandleDown}
                onPointerMove={onHandleMove}
                onPointerUp={(event) => onHandleEnd(event, false)}
                onPointerCancel={(event) => onHandleEnd(event, true)}
                className="flex touch-none flex-col items-center gap-1 px-12 py-1.5 select-none"
              >
                <span className="h-[5px] w-[38px] rounded-full bg-muted-foreground/40" />
                {IS_ANDROID_APP ? (
                  <span className="text-[10px] font-bold text-muted-foreground">{t.swipeUpToClose}</span>
                ) : null}
              </button>
            </div>
          </div>
        </>
      )}
      {infoOpen ? <ForecastInfoDialog t={t} onClose={() => setInfoOpen(false)} /> : null}
    </div>,
    document.body,
  );
}
