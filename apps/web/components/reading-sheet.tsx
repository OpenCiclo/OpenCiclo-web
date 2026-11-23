// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, X } from "lucide-react";

import { IS_ANDROID_APP } from "@/lib/app-target";
import { useCiclo } from "@/lib/client/ciclo-context";
import { useSheetDrag } from "@/lib/client/use-sheet-drag";
import { cn } from "@/lib/utils";

/**
 * A document over the screen that opened it (Settings: the privacy policy,
 * Help, the licenses). Phones: a sheet across the whole width, 90% of the
 * screen high, like a Learn article; desktop: a dialog in the middle
 * (`.sheet-dialog`). The X, the dimmed area, Escape and Android Back close it;
 * in the Android app dragging the handle or the title block down does too.
 *
 * `onBack` shows a back arrow before the title (an inner step, such as a Help
 * article over the Help index); Escape and Back then go back a step first.
 * `contentKey` resets the scroll when the content changes.
 */
export function ReadingSheet({
  title,
  eyebrow,
  onClose,
  onBack,
  contentKey,
  children,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  onBack?: () => void;
  contentKey?: string;
  children: ReactNode;
}) {
  const { t } = useCiclo();
  const [closing, setClosing] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onBackRef = useRef(onBack);
  useEffect(() => {
    onBackRef.current = onBack;
  });

  const close = useCallback(() => {
    if (closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    setClosing(true);
  }, [closing, onClose]);

  const { sheetRef, handleProps } = useSheetDrag({
    enabled: IS_ANDROID_APP,
    onDismiss: () => {
      close();
      return true;
    },
  });

  // Focus goes to the X, and back to what opened the sheet when it goes.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    if (closing) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (onBackRef.current) onBackRef.current();
      else close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closing, close]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center desktop:items-center desktop:p-6">
      <button
        type="button"
        aria-label={t.close}
        onClick={close}
        className={cn("absolute inset-0 bg-foreground/40", closing ? "animate-overlay-out" : "animate-overlay-in")}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && closing) onClose();
        }}
        className={cn(
          "sheet-dialog relative z-10 flex h-[90dvh] w-full flex-col overflow-hidden rounded-t-4xl bg-card text-card-foreground shadow-2xl sm:max-w-xl desktop:h-auto desktop:max-h-[88vh] desktop:max-w-2xl desktop:rounded-3xl",
          closing ? "animate-sheet-down" : "animate-sheet-up",
        )}
      >
        <div
          {...handleProps}
          className={cn(
            "relative shrink-0 border-b border-border px-5 pb-4 desktop:px-8 desktop:py-6",
            IS_ANDROID_APP ? "touch-none pt-2.5 select-none" : "pt-5",
          )}
        >
          {IS_ANDROID_APP ? <div aria-hidden className="mx-auto mb-2.5 h-1 w-9 rounded-full bg-muted-foreground/30" /> : null}
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={t.close}
            className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform active:scale-90"
          >
            <X className="size-5" aria-hidden />
          </button>
          <div className="flex items-center gap-2 pr-10">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={t.back}
                className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-transform active:scale-90"
              >
                <ArrowLeft className="size-5" aria-hidden />
              </button>
            ) : null}
            <div className="min-w-0">
              {eyebrow ? <p className="text-xs font-semibold tracking-wide text-primary uppercase">{eyebrow}</p> : null}
              <h2 className="mt-0.5 font-serif text-2xl text-balance desktop:text-3xl">{title}</h2>
            </div>
          </div>
        </div>
        <div
          key={contentKey}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] desktop:px-8 desktop:py-6"
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** What a sheet shows while its document loads, or when it could not load. */
export function SheetLoadState({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
  const { t } = useCiclo();
  if (!failed) {
    return (
      <p role="status" className="py-8 text-center text-sm text-muted-foreground">
        {t.sheetLoading}
      </p>
    );
  }
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center text-sm text-muted-foreground">
      <p>{t.sheetLoadFailed}</p>
      <button type="button" onClick={onRetry} className="font-semibold text-primary underline">
        {t.restoreRetry}
      </button>
    </div>
  );
}
