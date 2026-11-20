// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useRef, useState } from "react";
import { PencilLine } from "lucide-react";

import { SpeechBubble } from "@/components/friends/speech-bubble";
import { Button } from "@/components/ui/button";
import { daysBetween } from "@/lib/forecast/math";
import { MAX_NOTE_LENGTH } from "@/lib/friends/limits";
import { NOTE_DAYS, type FriendNote } from "@/lib/friends/payload";
import type { Messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const IDEAS = [
  "friendsNoteIdeaTired",
  "friendsNoteIdeaPain",
  "friendsNoteIdeaEnergy",
  "friendsNoteIdeaCuddles",
  "friendsNoteIdeaCravings",
] as const satisfies readonly (keyof Messages)[];

/**
 * The person's own note for their friends, at the top of the Friends screen:
 * a speech bubble above their name. Tap it to write; quick ideas fill it in
 * one tap. Friends see a note for NOTE_DAYS days.
 */
export function NoteComposer({
  name,
  note,
  today,
  t,
  disabled,
  onSave,
  onClear,
  onPreview,
}: {
  name: string;
  note: FriendNote | null;
  today: string;
  t: Messages;
  disabled: boolean;
  onSave: (text: string) => Promise<void>;
  onClear: () => Promise<void>;
  /** Opens "How friends see me"; the link sits beside the hint while the note is not being written. */
  onPreview?: () => void;
}) {
  const live = note && daysBetween(note.date, today) < NOTE_DAYS ? note : null;
  const [draft, setDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState(0);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const editing = draft !== null;

  useEffect(() => {
    if (editing) textRef.current?.focus();
  }, [editing]);

  // A failed save keeps the draft; the screen shows what went wrong.
  async function save() {
    if (draft === null || !draft.trim()) return;
    try {
      await onSave(draft.trim());
    } catch {
      return;
    }
    setDraft(null);
    setSaved((count) => count + 1);
  }

  return (
    <section aria-label={t.friendsNote} className="flex flex-col gap-2">
      <div key={saved} className={cn(saved > 0 && "animate-fade-up")}>
        <SpeechBubble size="large">
          {editing ? (
            <textarea
              ref={textRef}
              value={draft}
              maxLength={MAX_NOTE_LENGTH}
              rows={2}
              aria-label={t.friendsNoteEdit}
              placeholder={t.friendsNotePrompt}
              disabled={disabled}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void save();
                }
              }}
              className="block w-full resize-none bg-transparent font-serif text-[19px] leading-snug outline-none placeholder:text-muted-foreground/70"
            />
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setDraft(live?.text ?? "")}
              aria-label={t.friendsNoteEdit}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <span className={cn(!live && "text-muted-foreground/80 italic")}>{live?.text ?? t.friendsNotePrompt}</span>
              <PencilLine className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          )}
        </SpeechBubble>
      </div>
      <div className="flex items-center justify-between gap-3 pl-4">
        <p className="flex min-w-0 items-center gap-2 text-xs leading-snug font-bold text-muted-foreground">
          <span
            aria-hidden
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground"
          >
            {Array.from(name)[0]?.toUpperCase() ?? "?"}
          </span>
          {t.friendsYou} · {t.friendsNoteHint}
        </p>
        {editing ? (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {Array.from(draft).length}/{MAX_NOTE_LENGTH}
          </span>
        ) : onPreview ? (
          <button
            type="button"
            onClick={onPreview}
            className="-my-2 min-h-11 shrink-0 text-xs font-extrabold text-primary underline-offset-2 hover:underline"
          >
            {t.friendsPreview}
          </button>
        ) : null}
      </div>
      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.friendsNoteIdeas}>
            {IDEAS.map((key) => (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => setDraft(t[key])}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-card-foreground shadow-sm transition-transform active:scale-95"
              >
                {t[key]}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            {live ? (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                disabled={disabled}
                onClick={() =>
                  onClear().then(
                    () => setDraft(null),
                    () => undefined,
                  )
                }
              >
                {t.friendsClearNote}
              </Button>
            ) : null}
            <Button type="button" variant="outline" disabled={disabled} onClick={() => setDraft(null)}>
              {t.cancel}
            </Button>
            <Button type="button" disabled={disabled || !draft.trim()} onClick={() => void save()}>
              {t.save}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
