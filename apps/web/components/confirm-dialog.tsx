// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { buttonVariants } from "@/components/ui/button";

export type ConfirmOptions = {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  /** The confirm button in the destructive colour (deleting, discarding). */
  destructive?: boolean;
};

type Pending = ConfirmOptions & { resolve: (confirmed: boolean) => void };

/**
 * The app's own confirmation dialog, in place of `window.confirm` (whose
 * buttons the Android WebView draws in English). Returns `confirm`, which
 * opens it and resolves to the answer, and the dialog itself, to render
 * anywhere in the caller's tree (it portals to <body>, above sheets).
 *
 *   const [confirm, confirmDialog] = useConfirmDialog();
 *   if (!(await confirm({ message, confirmLabel, cancelLabel }))) return;
 *
 * Escape, the Android back button (which sends Escape to an `aria-modal`
 * overlay) and a tap outside answer "cancel". The dialog takes Escape before
 * any sheet under it, so Back closes only the dialog.
 */
export function useConfirmDialog(): [(options: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);

  const answer = useCallback((confirmed: boolean) => {
    const current = pendingRef.current;
    pendingRef.current = null;
    setPending(null);
    current?.resolve(confirmed);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        // A second request while one is open: the first one is answered "no".
        pendingRef.current?.resolve(false);
        const next = { ...options, resolve };
        pendingRef.current = next;
        setPending(next);
      }),
    [],
  );

  // A screen that goes away with the dialog open: its question is answered "no".
  useEffect(() => () => pendingRef.current?.resolve(false), []);

  const dialog = pending ? <ConfirmDialog options={pending} onAnswer={answer} /> : null;
  return [confirm, dialog];
}

function ConfirmDialog({ options, onAnswer }: { options: ConfirmOptions; onAnswer: (confirmed: boolean) => void }) {
  const messageId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // The safe answer has the focus: Enter right away does not delete anything.
    cancelRef.current?.focus();
    return () => previous?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // Before any sheet's own Escape listener (capture phase on window).
        event.stopImmediatePropagation();
        event.preventDefault();
        onAnswer(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      // Keep Tab inside the dialog.
      const buttons = [...panelRef.current.querySelectorAll<HTMLButtonElement>("button")];
      const first = buttons[0];
      const last = buttons.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onAnswer]);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div aria-hidden className="absolute inset-0 animate-overlay-in bg-foreground/40" onClick={() => onAnswer(false)} />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={messageId}
        className="relative w-full max-w-sm animate-pop-in rounded-3xl bg-card p-5 text-card-foreground shadow-2xl"
      >
        <p id={messageId} className="text-base leading-relaxed text-pretty">
          {options.message}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 min-[360px]:flex-row min-[360px]:justify-end">
          <button
            ref={cancelRef}
            type="button"
            className={buttonVariants({ variant: "outline" })}
            onClick={() => onAnswer(false)}
          >
            {options.cancelLabel}
          </button>
          <button
            type="button"
            className={buttonVariants({ variant: options.destructive ? "destructive" : "default" })}
            onClick={() => onAnswer(true)}
          >
            {options.confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
