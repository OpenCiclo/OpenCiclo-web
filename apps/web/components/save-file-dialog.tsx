// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { buttonVariants } from "@/components/ui/button";
import { SAVE_ASKS_WHERE, downloadFile, saveToDevice, shareFile } from "@/lib/client/save-file";
import type { Messages } from "@/lib/i18n";

/** What became of the file. `downloaded`: the web, where the browser says so itself. */
export type SaveOutcome = "downloaded" | "saved" | "shared" | "cancelled";

type Choice = "device" | "share" | null;
type Pending = { resolve: (choice: Choice) => void };

/**
 * Hands a text file to the person. On the web it downloads at once. In the
 * Android app it first asks where it should go: saved on the phone (Android's
 * "Save to" screen) or shared with another app. Returns `save`, which resolves
 * to what happened, and the dialog, to render anywhere in the caller's tree.
 *
 *   const [save, saveDialog] = useSaveFile(t);
 *   const outcome = await save("ciclo-diary.json", () => exportDiaryJson(), "application/json");
 *
 * `body` may be a function: it runs only once she has chosen, so backing out
 * builds nothing. A failure to build, save or share rejects.
 */
export function useSaveFile(
  t: Messages,
): [(filename: string, body: string | (() => string), type: string) => Promise<SaveOutcome>, ReactNode] {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);

  const answer = useCallback((choice: Choice) => {
    const current = pendingRef.current;
    pendingRef.current = null;
    setPending(null);
    current?.resolve(choice);
  }, []);

  const ask = useCallback(
    () =>
      new Promise<Choice>((resolve) => {
        // A second request while one is open: the first one is cancelled.
        pendingRef.current?.resolve(null);
        const next = { resolve };
        pendingRef.current = next;
        setPending(next);
      }),
    [],
  );

  // A screen that goes away with the dialog open: nothing is saved or shared.
  useEffect(() => () => pendingRef.current?.resolve(null), []);

  const save = useCallback(
    async (filename: string, body: string | (() => string), type: string): Promise<SaveOutcome> => {
      const text = () => (typeof body === "function" ? body() : body);
      if (!SAVE_ASKS_WHERE) {
        downloadFile(filename, text(), type);
        return "downloaded";
      }
      const choice = await ask();
      if (choice === "device") return (await saveToDevice(filename, text(), type)) ? "saved" : "cancelled";
      if (choice === "share") {
        await shareFile(filename, text(), type);
        return "shared";
      }
      return "cancelled";
    },
    [ask],
  );

  const dialog = pending ? <SaveChoiceDialog t={t} onAnswer={answer} /> : null;
  return [save, dialog];
}

function SaveChoiceDialog({ t, onAnswer }: { t: Messages; onAnswer: (choice: Choice) => void }) {
  const messageId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    firstRef.current?.focus();
    return () => previous?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // Before any sheet's own Escape listener (capture phase on window): Android Back closes only this.
        event.stopImmediatePropagation();
        event.preventDefault();
        onAnswer(null);
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
      <div aria-hidden className="absolute inset-0 animate-overlay-in bg-foreground/40" onClick={() => onAnswer(null)} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={messageId}
        className="relative w-full max-w-sm animate-pop-in rounded-3xl bg-card p-5 text-card-foreground shadow-2xl"
      >
        <p id={messageId} className="text-base leading-relaxed text-pretty">
          {t.exportChoiceMessage}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button ref={firstRef} type="button" className={buttonVariants({ variant: "default" })} onClick={() => onAnswer("device")}>
            {t.exportSaveToDevice}
          </button>
          <button type="button" className={buttonVariants({ variant: "outline" })} onClick={() => onAnswer("share")}>
            {t.exportShare}
          </button>
          <button type="button" className={buttonVariants({ variant: "ghost" })} onClick={() => onAnswer(null)}>
            {t.cancel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
