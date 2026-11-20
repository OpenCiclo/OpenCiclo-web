// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState } from "react";
import { ArrowLeft, QrCode, ScanLine, Ticket, UserPlus } from "lucide-react";

import { apiUrl } from "@/lib/app-target";
import { inviteFingerprint } from "@/lib/client/friends-sync";
import { daysBetween } from "@/lib/forecast/math";
import type { FriendBook } from "@/lib/friends/book";
import { fromBase64Url, toBase64Url } from "@/lib/friends/crypto";
import { inviteLink, parseInvite } from "@/lib/friends/invite";
import { BOX_TTL_DAYS } from "@/lib/friends/limits";
import type { InviteMessage } from "@/lib/friends/payload";
import { formatIsoUtc } from "@/lib/format-date";
import type { Locale, Messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useFriends } from "@/components/friends/friends-provider";
import { LinkQrCode } from "@/components/friends/link-qr";
import { PhraseQrScanner } from "@/components/phrase-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/** Where invite links point: the website (in the Android app, the API host), never the app's own origin. */
function siteOrigin(): string {
  return new URL(apiUrl("/"), window.location.href).origin;
}

type Mode = "choose" | "invite" | "join";

/**
 * Inviting and joining in one card: two choices, and the card becomes the one
 * tapped (with a way back). Inviting reuses the newest invite still open, so
 * going back and forth does not pile up links.
 */
export function InviteCard({
  book,
  today,
  locale,
  t,
  writable,
  busy,
  initialCode,
  act,
  onUnreadable,
}: {
  book: FriendBook;
  today: string;
  locale: Locale;
  t: Messages;
  writable: boolean;
  busy: boolean;
  /** A code handed over by /friends/join: opens "I have an invite" with it. */
  initialCode: string | null;
  act: (work: () => Promise<void>) => Promise<void>;
  onUnreadable: () => void;
}) {
  const friends = useFriends();
  const [mode, setMode] = useState<Mode>(initialCode ? "join" : "choose");
  const [invite, setInvite] = useState<{ secret: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(initialCode ?? "");
  const [received, setReceived] = useState<{ secret: Uint8Array; message: InviteMessage } | null>(null);
  const [scanning, setScanning] = useState(false);
  // A code arriving later (the join page) switches to "I have an invite".
  const [seenCode, setSeenCode] = useState(initialCode);
  if (initialCode && initialCode !== seenCode) {
    setSeenCode(initialCode);
    setPasted(initialCode);
    setMode("join");
  }

  function back() {
    setMode("choose");
    setReceived(null);
    setCopied(false);
  }

  /**
   * One link is for one friend (whoever opens it first). So each time the card
   * opens "Invite" it makes a new link, unless the one this card already showed
   * is still waiting (going back and forth by mistake). "New link" makes
   * another on purpose; links still waiting stay listed with Cancel.
   */
  function openInvite(fresh = false) {
    setMode("invite");
    setCopied(false);
    const shown = invite ? book.invites.find((pending) => pending.secret === invite.secret) : null;
    if (!fresh && shown && daysBetween(shown.createdAt, today) < BOX_TTL_DAYS.invite) return;
    setInvite(null);
    if (!writable) return;
    void act(async () => {
      try {
        const created = await friends.createInvite();
        setInvite({ secret: toBase64Url(created.secret), link: inviteLink(siteOrigin(), created.secret, created.fingerprint) });
      } catch (error) {
        setMode("choose");
        throw error;
      }
    });
  }

  /** The link of a pending invite listed below, to send it again. */
  function showPending(secret: string) {
    const pending = book.invites.find((entry) => entry.secret === secret);
    const bytes = pending ? fromBase64Url(pending.secret) : null;
    if (pending && bytes) {
      setCopied(false);
      setInvite({ secret: pending.secret, link: inviteLink(siteOrigin(), bytes, inviteFingerprint(pending)) });
    }
  }

  async function readCode(text: string) {
    const link = parseInvite(text);
    if (!link) {
      onUnreadable();
      return;
    }
    await act(async () => {
      setReceived({ secret: link.secret, message: await friends.readInvite(link) });
    });
  }

  return (
    <Card className="overflow-hidden rounded-3xl p-0">
      {mode === "choose" ? (
        <div className="grid grid-cols-2 divide-x divide-border">
          {(
            [
              { key: "invite", icon: UserPlus, title: t.friendsInvite, hint: t.friendsInviteOptionHint, onClick: () => openInvite() },
              { key: "join", icon: Ticket, title: t.friendsHaveInvite, hint: t.friendsJoinOptionHint, onClick: () => setMode("join") },
            ] as const
          ).map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.key}
                type="button"
                disabled={!writable}
                onClick={option.onClick}
                className="flex flex-col items-start gap-2 p-4 text-left transition-colors hover:bg-muted/60 active:bg-muted disabled:opacity-50"
              >
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="font-semibold leading-tight">{option.title}</span>
                <span className="text-xs leading-snug text-muted-foreground">{option.hint}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="animate-fade-up flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={back}
              aria-label={t.back}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform active:scale-90"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <p className="font-semibold">{mode === "invite" ? t.friendsInvite : t.friendsHaveInvite}</p>
          </div>

          {mode === "invite" ? (
            <>
              <p className="text-sm leading-6 text-muted-foreground">{t.friendsInviteHint}</p>
              {invite ? (
                <>
                  <div className="flex justify-center">
                    <LinkQrCode text={invite.link} label={t.friendsInvite} />
                  </div>
                  <Input readOnly value={invite.link} onFocus={(event) => event.currentTarget.select()} aria-label={t.friendsCopyLink} />
                  <Button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard?.writeText(invite.link).catch(() => undefined);
                      setCopied(true);
                    }}
                  >
                    {copied ? t.friendsLinkCopied : t.friendsCopyLink}
                  </Button>
                  <Button type="button" variant="ghost" disabled={!writable || busy} onClick={() => openInvite(true)}>
                    <UserPlus className="size-4" aria-hidden />
                    {t.friendsNewLink}
                  </Button>
                </>
              ) : (
                <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
                  <QrCode className="size-4 animate-pulse" aria-hidden />…
                </p>
              )}
              {book.invites.length > 0 ? (
                <div className="mt-1 flex flex-col gap-1 border-t border-border pt-3">
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{t.friendsPendingInvites}</p>
                  {book.invites.map((pending) => (
                    <div key={pending.secret} className="flex items-center justify-between gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => showPending(pending.secret)}
                        className={cn("text-left text-muted-foreground underline-offset-2 hover:underline", invite?.secret === pending.secret && "font-semibold text-card-foreground")}
                      >
                        {t.friendsInviteSince.replace("{date}", formatIsoUtc(pending.createdAt, locale, { day: "numeric", month: "short" }))}
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-2 text-xs text-muted-foreground"
                        disabled={!writable || busy}
                        onClick={() =>
                          void act(async () => {
                            await friends.revokeInvite(pending.secret);
                            if (invite?.secret === pending.secret) back();
                          })
                        }
                      >
                        {t.friendsCancelInvite}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : received ? (
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
                      setMode("choose");
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
                value={pasted}
                placeholder={t.friendsPasteInvite}
                aria-label={t.friendsPasteInvite}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) => setPasted(event.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" disabled={!writable || busy} onClick={() => setScanning(true)}>
                  <ScanLine className="size-4" aria-hidden />
                  {t.scanBackupQr}
                </Button>
                <Button type="button" disabled={!pasted.trim() || busy || !writable} onClick={() => void readCode(pasted)}>
                  {t.friendsOpenInvite}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      {scanning ? (
        <PhraseQrScanner
          t={t}
          title={t.friendsHaveInvite}
          hint={t.friendsScanHint}
          deniedText={t.friendsScanDenied}
          invalidText={t.friendsInviteUnreadable}
          parse={(raw) => (parseInvite(raw) ? raw : null)}
          onCancel={() => setScanning(false)}
          onPhrase={(raw) => {
            setScanning(false);
            setPasted(raw);
            void readCode(raw);
          }}
        />
      ) : null}
    </Card>
  );
}
