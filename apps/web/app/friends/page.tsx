// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { RefreshCw, Settings2 } from "lucide-react";

import { useCiclo, useTodayIso } from "@/lib/client/ciclo-context";
import { InviteNotFoundError, InviteUsedError, OwnInviteError } from "@/lib/client/friends-sync";
import { takePendingInvite } from "@/lib/client/pending-invite";
import { FRIENDS_AVAILABLE } from "@/lib/features";
import { FriendBookFullError, sharesWith } from "@/lib/friends/book";
import { MAX_NAME_LENGTH } from "@/lib/friends/limits";
import { AppShell } from "@/components/app-shell";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { FriendPhaseCard } from "@/components/friends/friend-card";
import { useFriends } from "@/components/friends/friends-provider";
import { FriendsSettingsSheet } from "@/components/friends/friends-settings-sheet";
import { InviteCard } from "@/components/friends/invite-card";
import { NoteComposer } from "@/components/friends/note-composer";
import { OwnCardPreview } from "@/components/friends/own-card-preview";
import { OfflineNotice } from "@/components/offline-notice";
import { UpdateNotice } from "@/components/update-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Refresh and settings, in the header: round, and a full tap target.
const HEADER_BUTTON = "size-11 shrink-0 rounded-full bg-card px-0";

/**
 * The Friends screen. The header holds refresh and settings (a sheet). Below,
 * top to bottom: the person's own note (a speech bubble, with a link to how
 * friends see them), their friends' cards, and the two ways to add a friend:
 * invite and join.
 */
export default function FriendsPage() {
  if (!FRIENDS_AVAILABLE) notFound();
  const { t, wallet, storageMode, readOnly, locale, diary } = useCiclo();
  const today = useTodayIso();
  const friends = useFriends();
  const [confirm, confirmDialog] = useConfirmDialog();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [name, setName] = useState("");
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { refresh, status } = friends;
  const hosted = Boolean(wallet) && storageMode === "hosted";

  useEffect(() => {
    if (!hosted) return;
    refresh().catch(() => undefined);
    // An invite link opened on this tab (app/friends/join): read once, after the first paint.
    const code = takePendingInvite();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (code) setPendingCode(code);
  }, [hosted, refresh]);

  if (!wallet) {
    return (
      <AppShell>
        <p>{t.unlockTitle}</p>
      </AppShell>
    );
  }

  function errorText(cause: unknown): string {
    if (cause instanceof InviteNotFoundError || cause instanceof InviteUsedError) return t.friendsInviteInvalid;
    if (cause instanceof OwnInviteError) return t.friendsInviteOwn;
    if (cause instanceof FriendBookFullError) return t.friendsFull;
    return t.friendsLoadFailed;
  }

  /** Runs a change, showing what went wrong; resolves either way. */
  async function act(work: () => Promise<void>) {
    await attempt(work).catch(() => undefined);
  }

  /** Like act, but rejects after showing the error (the caller keeps its draft). */
  async function attempt(work: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    try {
      await work();
    } catch (cause) {
      setMessage(errorText(cause));
      throw cause;
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    const ok = await confirm({
      message: t.friendsTurnOffConfirm,
      confirmLabel: t.friendsTurnOff,
      cancelLabel: t.cancel,
      destructive: true,
    });
    if (!ok) return;
    setSettingsOpen(false);
    void act(async () => {
      await friends.turnOff();
      setConsent(false);
    });
  }

  const book = friends.book;
  const writable = !readOnly && status === "on";

  return (
    <AppShell size="narrow">
      <div className="mb-[18px] flex items-center gap-2.5 desktop:mb-8">
        <h1 className="font-serif text-[30px] leading-none font-medium tracking-[-0.01em] text-foreground desktop:text-4xl desktop:tracking-tight">{t.friends}</h1>
        {/* While Friends is new: the sentence that goes with it is in the settings sheet. Remove both once it settles. */}
        <span
          title={t.friendsExperimental}
          className="rounded-full border border-primary/60 px-[9px] py-[3px] text-[11px] leading-tight font-extrabold tracking-[0.06em] whitespace-nowrap text-primary uppercase"
        >
          {t.friendsExperimentalBadge}
        </span>
        <span className="grow" />
        {status === "on" ? (
          <>
            <Button type="button" variant="outline" className={HEADER_BUTTON} aria-label={t.friendsRefresh} disabled={busy} onClick={() => void act(() => refresh())}>
              <RefreshCw className="size-[18px]" aria-hidden />
            </Button>
            {book ? (
              <Button type="button" variant="outline" className={HEADER_BUTTON} aria-label={t.friendsSettingsTitle} onClick={() => setSettingsOpen(true)}>
                <Settings2 className="size-[18px]" aria-hidden />
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
      <UpdateNotice className="mb-4" />
      <OfflineNotice className="mb-4" />
      {confirmDialog}
      {message ? (
        <p role="alert" className="mb-4 rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      {storageMode === "device" ? (
        <Card className="rounded-3xl p-4 text-sm leading-6 text-muted-foreground">{t.friendsDeviceOnly}</Card>
      ) : status === "idle" || status === "loading" || status === "unavailable" ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          …
        </p>
      ) : status === "error" ? (
        <Card className="flex flex-col gap-3 rounded-3xl p-4">
          <p className="text-sm">{t.friendsLoadFailed}</p>
          <Button type="button" variant="outline" onClick={() => void act(() => refresh())}>
            {t.friendsRefresh}
          </Button>
        </Card>
      ) : status === "newer" ? (
        <Card className="rounded-3xl p-4 text-sm leading-6">{t.friendsNewer}</Card>
      ) : status === "off" ? (
        <Card className="flex flex-col gap-4 rounded-3xl p-5">
          <p className="font-serif text-lg leading-snug">{t.friendsIntro}</p>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>{t.friendsWhatShared}</li>
            <li>{t.friendsSealed}</li>
            <li>{t.friendsDatesNote}</li>
          </ul>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="friends-name">{t.friendsYourName}</Label>
            <Input id="friends-name" value={name} maxLength={MAX_NAME_LENGTH} autoComplete="nickname" onChange={(event) => setName(event.target.value)} />
          </div>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>{t.friendsConsent}</span>
          </label>
          <Button type="button" disabled={!consent || !name.trim() || busy || readOnly} onClick={() => void act(() => friends.enable(name))}>
            {t.friendsTurnOn}
          </Button>
        </Card>
      ) : book ? (
        <div className="flex flex-col gap-[18px]">
          <NoteComposer
            name={book.name}
            note={book.note}
            today={today}
            t={t}
            disabled={!writable || busy}
            onSave={(text) => attempt(() => friends.setProfile({ note: { text, date: today } }))}
            onClear={() => attempt(() => friends.setProfile({ note: null }))}
            onPreview={() => setPreviewOpen(true)}
          />

          {friends.cards.length === 0 ? (
            <Card className="rounded-3xl p-4 text-sm text-muted-foreground">{t.friendsEmpty}</Card>
          ) : (
            <div className="flex flex-col gap-3">
              {friends.cards.map((card) => (
                <FriendPhaseCard
                  key={card.friend.id}
                  card={card}
                  today={today}
                  t={t}
                  locale={locale}
                  youPaused={!sharesWith(book, card.friend)}
                  actions={{
                    disabled: !writable || busy,
                    onTogglePause: () => void act(() => friends.setFriendPaused(card.friend.id, !card.friend.paused)),
                    onRemove: async () => {
                      const ok = await confirm({
                        message: t.friendsRemoveConfirm.replaceAll("{name}", card.friend.name),
                        confirmLabel: t.friendsRemove.replace("{name}", card.friend.name),
                        cancelLabel: t.cancel,
                        destructive: true,
                      });
                      if (ok) void act(() => friends.removeFriend(card.friend.id));
                    },
                  }}
                />
              ))}
              <p className="text-xs leading-5 text-muted-foreground">{t.friendsEstimatesNote}</p>
            </div>
          )}

          <InviteCard
            book={book}
            today={today}
            locale={locale}
            t={t}
            writable={writable}
            busy={busy}
            initialCode={pendingCode}
            act={act}
            onUnreadable={() => setMessage(t.friendsInviteUnreadable)}
          />

          <FriendsSettingsSheet
            open={settingsOpen}
            book={book}
            t={t}
            writable={writable}
            busy={busy}
            act={act}
            onClose={() => setSettingsOpen(false)}
            onTurnOff={() => void turnOff()}
          />
          {previewOpen ? <OwnCardPreview book={book} diary={diary} today={today} t={t} locale={locale} onClose={() => setPreviewOpen(false)} /> : null}
        </div>
      ) : null}
    </AppShell>
  );
}
