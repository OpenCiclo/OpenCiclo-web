// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Eye, X } from "lucide-react";

import { FriendPhaseCard } from "@/components/friends/friend-card";
import type { Diary } from "@/lib/diary";
import type { FriendBook } from "@/lib/friends/book";
import { buildStatus } from "@/lib/friends/payload";
import type { Locale, Messages } from "@/lib/i18n";

/**
 * "How friends see me": the person's own card, drawn from the status this
 * device would send right now (the same `buildStatus` as publishing, so the
 * name, the choices in settings, the note and "pause with everyone" all show).
 * Nothing is sent or saved. A sheet from the bottom (a dialog on the desktop);
 * Escape (and so Android Back) closes it.
 */
export function OwnCardPreview({
  book,
  diary,
  today,
  t,
  locale,
  onClose,
}: {
  book: FriendBook;
  diary: Diary;
  today: string;
  t: Messages;
  locale: Locale;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const status = buildStatus(diary, today, {
    selfId: book.selfId,
    name: book.name,
    show: book.show,
    note: book.note,
    paused: book.pausedAll,
    pregnancy: book.pregnancy,
  });

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center desktop:items-center desktop:p-6">
      <button type="button" aria-label={t.close} onClick={onClose} className="animate-overlay-in absolute inset-0 bg-foreground/30 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sheet-dialog animate-sheet-up relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-4xl bg-card shadow-2xl desktop:max-w-lg desktop:rounded-4xl"
      >
        <div className="flex items-center justify-between gap-3 px-6 pt-7 pb-3">
          <p id={titleId} className="flex items-center gap-2 font-serif text-xl leading-tight text-card-foreground">
            <Eye className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            {t.friendsPreview}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform active:scale-90"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <FriendPhaseCard
            card={{
              friend: { id: "self", selfId: book.selfId, name: book.name, key: "", role: "inviter", state: "active", paused: false, since: today },
              status,
            }}
            today={today}
            t={t}
            locale={locale}
            youPaused={false}
          />
          <p className="text-xs leading-5 text-muted-foreground">{t.friendsPreviewHint}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
