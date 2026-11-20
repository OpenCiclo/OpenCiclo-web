// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Settings2, X } from "lucide-react";

import type { FriendBook } from "@/lib/friends/book";
import { MAX_NAME_LENGTH } from "@/lib/friends/limits";
import type { Messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useFriends } from "@/components/friends/friends-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SWITCH_CLASS =
  "h-7 w-12 shrink-0 cursor-pointer appearance-none rounded-full bg-muted-foreground/30 p-1 transition-colors before:block before:size-5 before:rounded-full before:bg-white before:shadow-sm before:transition-transform checked:bg-primary checked:before:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The Friends settings, in a sheet from the bottom (a dialog on the desktop):
 * the name friends see, what they see, pause with everyone, turn Friends off.
 * Escape (and so Android Back) closes it, like every sheet in the app.
 */
export function FriendsSettingsSheet({
  open,
  book,
  t,
  writable,
  busy,
  act,
  onClose,
  onTurnOff,
}: {
  open: boolean;
  book: FriendBook;
  t: Messages;
  writable: boolean;
  busy: boolean;
  act: (work: () => Promise<void>) => Promise<void>;
  onClose: () => void;
  onTurnOff: () => void;
}) {
  const friends = useFriends();
  const titleId = useId();
  const [present, setPresent] = useState(open);
  const [name, setName] = useState(book.name);
  if (open && !present) {
    setPresent(true);
    setName(book.name);
  }
  // With reduced motion there is no closing animation to wait for.
  if (present && !open && prefersReducedMotion()) setPresent(false);
  const closing = present && !open;

  // A fallback in case the closing animation's end event never comes.
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setPresent(false), 450);
    return () => window.clearTimeout(timer);
  }, [closing]);

  function saveName() {
    const next = name.trim();
    if (next && next !== book.name) void act(() => friends.setProfile({ name: next }));
  }

  // Closing (X, outside, Escape or Android Back) keeps a name typed but not yet saved.
  function close() {
    saveName();
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!present) return null;

  const switches = [
    ["friends-show-day", t.friendsShowDay, book.show.day, (value: boolean) => ({ show: { ...book.show, day: value } })],
    ["friends-show-expected", t.friendsShowExpected, book.show.expected, (value: boolean) => ({ show: { ...book.show, expected: value } })],
    ["friends-pause-all", t.friendsPauseAll, book.pausedAll, (value: boolean) => ({ pausedAll: value })],
  ] as const;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center desktop:items-center desktop:p-6">
      <button
        type="button"
        aria-label={t.close}
        onClick={close}
        className={cn("absolute inset-0 bg-foreground/30 backdrop-blur-[2px]", closing ? "animate-overlay-out" : "animate-overlay-in")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && closing) setPresent(false);
        }}
        className={cn(
          "sheet-dialog relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-4xl bg-card shadow-2xl desktop:max-w-lg desktop:rounded-4xl",
          closing ? "animate-sheet-down" : "animate-sheet-up",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-6 pt-7 pb-3">
          <p id={titleId} className="flex items-center gap-2 font-serif text-xl leading-tight text-card-foreground">
            <Settings2 className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            {t.friendsSettingsTitle}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label={t.close}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform active:scale-90"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="friends-own-name">{t.friendsYourName}</Label>
            <Input
              id="friends-own-name"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              disabled={!writable}
              onChange={(event) => setName(event.target.value)}
              onBlur={saveName}
              onKeyDown={(event) => {
                if (event.key === "Enter") saveName();
              }}
            />
          </div>
          {switches.map(([id, label, checked, toChange]) => (
            <label key={id} htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-muted/60 p-3">
              <span className="text-sm font-semibold text-card-foreground">{label}</span>
              <input
                id={id}
                type="checkbox"
                role="switch"
                className={SWITCH_CLASS}
                checked={checked}
                disabled={!writable || busy}
                onChange={(event) => void act(() => friends.setProfile(toChange(event.target.checked)))}
              />
            </label>
          ))}
          <p className="text-xs leading-5 text-muted-foreground">{t.friendsDatesNote}</p>
          <Button type="button" variant="ghost" className="text-destructive" disabled={!writable || busy} onClick={onTurnOff}>
            {t.friendsTurnOff}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
