// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { apiUrl } from "@/lib/app-target";
import { useCiclo, useTodayIso } from "@/lib/client/ciclo-context";
import { InviteNotFoundError, InviteUsedError, OwnInviteError } from "@/lib/client/friends-sync";
import { takePendingInvite } from "@/lib/client/pending-invite";
import { FRIENDS_AVAILABLE } from "@/lib/features";
import { FriendBookFullError, sharesWith } from "@/lib/friends/book";
import { fromBase64Url } from "@/lib/friends/crypto";
import { inviteCode, inviteLink, parseInvite } from "@/lib/friends/invite";
import { MAX_NAME_LENGTH, MAX_NOTE_LENGTH } from "@/lib/friends/limits";
import type { InviteMessage } from "@/lib/friends/payload";
import { formatIsoUtc } from "@/lib/format-date";
import { AppShell } from "@/components/app-shell";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { FriendPhaseCard } from "@/components/friends/friend-card";
import { useFriends } from "@/components/friends/friends-provider";
import { LinkQrCode } from "@/components/friends/link-qr";
import { OfflineNotice } from "@/components/offline-notice";
import { UpdateNotice } from "@/components/update-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SWITCH_CLASS =
  "h-7 w-12 shrink-0 cursor-pointer appearance-none rounded-full bg-muted-foreground/30 p-1 transition-colors before:block before:size-5 before:rounded-full before:bg-white before:shadow-sm before:transition-transform checked:bg-primary checked:before:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50";

/** Where invite links point: the website (in the Android app, the API host), never the app's own origin. */
function siteOrigin(): string {
  return new URL(apiUrl("/"), window.location.href).origin;
}

export default function FriendsPage() {
  if (!FRIENDS_AVAILABLE) notFound();
  const { t, wallet, storageMode, readOnly, locale } = useCiclo();
  const today = useTodayIso();
  const friends = useFriends();
  const [confirm, confirmDialog] = useConfirmDialog();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [name, setName] = useState("");
  const [invite, setInvite] = useState<{ secret: Uint8Array; link: string } | null>(null);
  const [copied, setCopied] = useState<"link" | null>(null);
  const [pasted, setPasted] = useState("");
  const [received, setReceived] = useState<{ secret: Uint8Array; message: InviteMessage } | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const { refresh, status } = friends;
  const hosted = Boolean(wallet) && storageMode === "hosted";

  useEffect(() => {
    if (!hosted) return;
    refresh().catch(() => undefined);
    // An invite link opened on this tab (app/friends/join): read once, after the first paint.
    const code = takePendingInvite();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (code) setPasted(code);
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

  async function act(work: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    try {
      await work();
    } catch (cause) {
      setMessage(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  const book = friends.book;
  const writable = !readOnly && status === "on";

  return (
    <AppShell size="narrow">
      <div className="mb-3 flex items-center justify-between gap-3 desktop:mb-8">
        <h1 className="font-serif text-xl text-foreground desktop:text-4xl desktop:tracking-tight">{t.friends}</h1>
        {status === "on" ? (
          <Button
            type="button"
            variant="ghost"
            aria-label={t.friendsRefresh}
            disabled={busy}
            onClick={() => void act(() => refresh())}
          >
            <RefreshCw className="size-4" aria-hidden />
          </Button>
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
            <Input
              id="friends-name"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="nickname"
              onChange={(event) => setName(event.target.value)}
            />
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
          <Button
            type="button"
            disabled={!consent || !name.trim() || busy || readOnly}
            onClick={() => void act(() => friends.enable(name))}
          >
            {t.friendsTurnOn}
          </Button>
          <p className="text-xs leading-5 text-muted-foreground">{t.disclaimer}</p>
        </Card>
      ) : book ? (
        <div className="flex flex-col gap-4">
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
                  youPaused={!sharesWith(book, card.friend)}
                >
                  {card.friend.state !== "ended" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      disabled={!writable || busy}
                      onClick={() => void act(() => friends.setFriendPaused(card.friend.id, !card.friend.paused))}
                    >
                      {(card.friend.paused ? t.friendsResumeOne : t.friendsPauseOne).replace("{name}", card.friend.name)}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-3 text-xs text-muted-foreground"
                    disabled={!writable || busy}
                    onClick={async () => {
                      const ok = await confirm({
                        message: t.friendsRemoveConfirm.replace("{name}", card.friend.name),
                        confirmLabel: t.friendsRemove.replace("{name}", card.friend.name),
                        cancelLabel: t.cancel,
                        destructive: true,
                      });
                      if (ok) void act(() => friends.removeFriend(card.friend.id));
                    }}
                  >
                    {t.friendsRemove.replace("{name}", card.friend.name)}
                  </Button>
                </FriendPhaseCard>
              ))}
            </div>
          )}
          <p className="text-xs leading-5 text-muted-foreground">{t.friendsEstimatesNote}</p>

          <Card className="flex flex-col gap-3 rounded-3xl p-4">
            <p className="font-medium">{t.friendsInvite}</p>
            {invite ? (
              <>
                <p className="text-sm leading-6 text-muted-foreground">{t.friendsInviteHint}</p>
                <div className="flex justify-center">
                  <LinkQrCode text={invite.link} label={t.friendsInvite} />
                </div>
                <Input readOnly value={invite.link} onFocus={(event) => event.currentTarget.select()} aria-label={t.friendsCopyLink} />
                <Button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard?.writeText(invite.link).catch(() => undefined);
                    setCopied("link");
                  }}
                >
                  {copied === "link" ? t.friendsLinkCopied : t.friendsCopyLink}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                disabled={!writable || busy}
                onClick={() =>
                  void act(async () => {
                    const secret = await friends.createInvite();
                    setCopied(null);
                    setInvite({ secret, link: inviteLink(siteOrigin(), secret) });
                  })
                }
              >
                {t.friendsInvite}
              </Button>
            )}
          </Card>

          <Card className="flex flex-col gap-3 rounded-3xl p-4">
            <Label htmlFor="friends-paste">{t.friendsHaveInvite}</Label>
            {received ? (
              <>
                <p className="text-sm leading-6">{t.friendsInvitedBy.replace("{name}", received.message.name)}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" onClick={() => setReceived(null)}>
                    {t.cancel}
                  </Button>
                  <Button
                    type="button"
                    disabled={!writable || busy}
                    onClick={() =>
                      void act(async () => {
                        await friends.acceptInvite(received.secret, received.message);
                        setReceived(null);
                        setPasted("");
                      })
                    }
                  >
                    {t.friendsAccept}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Input
                  id="friends-paste"
                  value={pasted}
                  placeholder={t.friendsPasteInvite}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={(event) => setPasted(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!pasted.trim() || busy || !writable}
                  onClick={() =>
                    void act(async () => {
                      const secret = parseInvite(pasted);
                      if (!secret) {
                        setMessage(t.friendsInviteUnreadable);
                        return;
                      }
                      setReceived({ secret, message: await friends.readInvite(secret) });
                    })
                  }
                >
                  {t.friendsOpenInvite}
                </Button>
              </>
            )}
          </Card>

          {book.invites.length > 0 ? (
            <Card className="flex flex-col gap-2 rounded-3xl p-4">
              <p className="font-medium">{t.friendsPendingInvites}</p>
              {book.invites.map((pending) => {
                const secret = fromBase64Url(pending.secret);
                return (
                  <div key={pending.secret} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {t.friendsInviteSince.replace("{date}", formatIsoUtc(pending.createdAt, locale, { day: "numeric", month: "short" }))}
                    </span>
                    <div className="flex gap-1">
                      {secret ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          onClick={() => setInvite({ secret, link: inviteLink(siteOrigin(), secret) })}
                        >
                          {t.friendsCopyLink}
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-2 text-xs text-muted-foreground"
                        disabled={!writable || busy}
                        onClick={() =>
                          void act(async () => {
                            await friends.revokeInvite(pending.secret);
                            if (invite && inviteCode(invite.secret) === `v1.${pending.secret}`) setInvite(null);
                          })
                        }
                      >
                        {t.friendsCancelInvite}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>
          ) : null}

          <Card className="flex flex-col gap-3 rounded-3xl p-4">
            <p className="font-medium">{t.friendsYourSharing}</p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="friends-own-name">{t.friendsYourName}</Label>
              <Input
                id="friends-own-name"
                defaultValue={book.name}
                maxLength={MAX_NAME_LENGTH}
                disabled={!writable}
                onBlur={(event) => {
                  const next = event.target.value.trim();
                  if (next && next !== book.name) void act(() => friends.setProfile({ name: next }));
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="friends-note">{t.friendsNote}</Label>
              <textarea
                id="friends-note"
                className="min-h-16 rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                maxLength={MAX_NOTE_LENGTH}
                placeholder={t.friendsNotePlaceholder}
                disabled={!writable}
                value={note ?? book.note?.text ?? ""}
                onChange={(event) => setNote(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t.friendsNoteHint}</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!writable || busy || !book.note}
                  onClick={() =>
                    void act(async () => {
                      await friends.setProfile({ note: null });
                      setNote(null);
                    })
                  }
                >
                  {t.friendsClearNote}
                </Button>
                <Button
                  type="button"
                  disabled={!writable || busy || note === null || !note.trim()}
                  onClick={() =>
                    void act(async () => {
                      await friends.setProfile({ note: { text: note ?? "", date: today } });
                      setNote(null);
                    })
                  }
                >
                  {t.save}
                </Button>
              </div>
            </div>
            {(
              [
                ["friends-show-day", t.friendsShowDay, book.show.day, (value: boolean) => ({ show: { ...book.show, day: value } })],
                ["friends-show-expected", t.friendsShowExpected, book.show.expected, (value: boolean) => ({ show: { ...book.show, expected: value } })],
                ["friends-pause-all", t.friendsPauseAll, book.pausedAll, (value: boolean) => ({ pausedAll: value })],
              ] as const
            ).map(([id, label, checked, toChange]) => (
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
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              disabled={!writable || busy}
              onClick={async () => {
                const ok = await confirm({
                  message: t.friendsTurnOffConfirm,
                  confirmLabel: t.friendsTurnOff,
                  cancelLabel: t.cancel,
                  destructive: true,
                });
                if (ok) {
                  void act(async () => {
                    await friends.turnOff();
                    setInvite(null);
                    setConsent(false);
                  });
                }
              }}
            >
              {t.friendsTurnOff}
            </Button>
          </Card>
          <p className="text-xs leading-5 text-muted-foreground">{t.disclaimer}</p>
        </div>
      ) : null}
    </AppShell>
  );
}
