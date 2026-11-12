// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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
const OPEN_TRANSITION = "height 0.55s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease";
const CLOSE_TRANSITION = "height 0.42s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease";
const SETTLE_TRANSITION = "height 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
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
  const [open, setOpen] = useState(instant);
  const [closing, setClosing] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoOpenRef = useLatest(infoOpen);
  const onClosedRef = useLatest(onClosed);
  const expanded = open && !closing;
  const top = Math.max(origin.top, TOP_GAP);
  const expandedHeight = `calc(100dvh - ${top}px - ${BOTTOM_GAP}px - env(safe-area-inset-bottom))`;
  const height = expanded ? expandedHeight : `${origin.height}px`;
  const transition = reduceMotion ? "none" : expanded ? OPEN_TRANSITION : CLOSE_TRANSITION;
  // What React last wrote, so a drag can hand the card back to it.
  const rendered = useRef({ height, transition });
  useLayoutEffect(() => {
    rendered.current = { height, transition };
  });

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
    setClosing(true);
  }, [onClosedRef, reduceMotion]);

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

  // Dragging the handle up (Android): the card follows, then closes past a
  // distance or on a flick, or settles back.
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
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const moved = dy - drag.slop;
    const next = moved > 0 ? drag.from + resist(moved, PULL_DOWN_LIMIT) : Math.max(origin.height, drag.from + moved);
    drag.height = next;
    card.style.height = `${next}px`;
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
    if (!cancelled && sheetShouldClose(travel, velocity, drag.from)) {
      // React writes the closing height and transition on the next render.
      requestClose();
      return;
    }
    card.style.transition = SETTLE_TRANSITION;
    card.style.height = rendered.current.height;
    window.setTimeout(() => {
      if (dragRef.current || !cardRef.current) return;
      cardRef.current.style.transition = rendered.current.transition;
    }, 360);
  }

  function onHandleClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.timeStamp < swallowClickUntilRef.current) return;
    requestClose();
  }

  const content = (
    <>
      <PhaseAura phase={phase} next={next} animate={false} wide={expanded} />
      <button
        ref={closeRef}
        type="button"
        onClick={requestClose}
        aria-label={t.close}
        className="absolute top-3.5 right-3.5 z-20 flex size-[26px] items-center justify-center rounded-full border border-[var(--glass-edge)] bg-[var(--glass)] text-card-foreground transition-transform active:scale-90"
      >
        <ChevronUp className="size-3.5" aria-hidden />
      </button>
      <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto overscroll-contain px-[18px] pt-4 pb-2">
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        {header}
        {details(() => setInfoOpen(true))}
      </div>
      {desktop ? null : (
        <div className="relative z-[2] flex shrink-0 justify-center pt-1 pb-2">
          <button
            type="button"
            aria-label={t.close}
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
      )}
    </>
  );

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={t.close}
        tabIndex={-1}
        onClick={requestClose}
        className={cn(
          "absolute inset-0 touch-none bg-foreground/30 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none",
          expanded ? "opacity-100" : "opacity-0",
        )}
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
            {content}
          </div>
        </div>
      ) : (
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-phase-open={expanded ? "" : undefined}
          className="absolute isolate flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card text-card-foreground"
          style={{
            top,
            left: origin.left,
            width: origin.width,
            height,
            transition,
            boxShadow: expanded ? "0 24px 60px rgba(10, 6, 20, 0.35)" : "0 1px 2px rgba(0, 0, 0, 0.06)",
          }}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget || event.propertyName !== "height" || !closing) return;
            onClosedRef.current();
          }}
        >
          {content}
        </div>
      )}
      {infoOpen ? <ForecastInfoDialog t={t} onClose={() => setInfoOpen(false)} /> : null}
    </div>,
    document.body,
  );
}
