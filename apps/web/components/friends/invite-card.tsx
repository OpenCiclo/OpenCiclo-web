// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState } from "react";
import { ArrowLeft, QrCode, ScanLine, UserPlus } from "lucide-react";

import { apiUrl } from "@/lib/app-target";
import { inviteFingerprint } from "@/lib/client/friends-sync";
import { liveInvites, type FriendBook, type PendingInvite } from "@/lib/friends/book";
import { fromBase64Url, toBase64Url } from "@/lib/friends/crypto";
import { inviteLink, parseInvite } from "@/lib/friends/invite";
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

// The two choices: tall enough for a comfortable tap, and a long label may take two lines.
const CHOICE_CLASS = "h-auto min-h-[52px] gap-2 rounded-[18px] px-3 py-2 text-center text-[15px] leading-tight font-extrabold text-balance";

/**
 * Inviting and joining: two buttons side by side, and under them a line that
 * opens the invites still waiting. Tapping a button turns the pair into a card
 * for that choice (with a way back).
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

  const live = liveInvites(book, today);

  // The link on show left the book (the friend opened it, or it was cancelled
  // or expired, here or on another device): never keep offering a dead link.
  if (invite && !live.some((pending) => pending.secret === invite.secret)) {
    setInvite(null);
    setCopied(false);
    if (mode === "invite") setMode("choose");
  }

  function back() {
    setMode("choose");
    setReceived(null);
    setCopied(false);
  }

  /** Puts a waiting invite's link on show, to send it (again). */
  function show(pending: PendingInvite) {
    const bytes = fromBase64Url(pending.secret);
    if (!bytes) return;
    setCopied(false);
    setInvite({ secret: pending.secret, link: inviteLink(siteOrigin(), bytes, inviteFingerprint(pending)) });
  }

  /**
   * One link is for one friend (whoever opens it first). Opening "Invite"
   * shows the link already waiting (the one last on show here, else the
   * newest) and makes one only when none waits, so taps never pile up invites.
   * "New link" makes another on purpose; if that fails (the book is full) the
   * card stays on the waiting links, where each can be cancelled.
   */
  function openInvite(fresh = false) {
    setMode("invite");
    setCopied(false);
    if (!fresh) {
      if (invite) return;
      const newest = live.at(-1);
      if (newest) {
        show(newest);
        return;
      }
    }
    if (!writable) {
      if (!fresh) setMode("choose");
      return;
    }
    void act(async () => {
      try {
        const created = await friends.createInvite();
        setCopied(false);
        setInvite({ secret: toBase64Url(created.secret), link: inviteLink(siteOrigin(), created.secret, created.fingerprint) });
      } catch (error) {
        if (!fresh) setMode("choose");
        throw error;
      }
    });
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

  if (mode === "choose") {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Button type="button" className={CHOICE_CLASS} disabled={!writable || busy} onClick={() => openInvite()}>
            <UserPlus className="size-[18px] shrink-0" aria-hidden />
            {t.friendsInviteShort}
          </Button>
          <Button type="button" variant="outline" className={cn(CHOICE_CLASS, "bg-card")} disabled={!writable} onClick={() => setMode("join")}>
            {t.friendsHaveCode}
          </Button>
        </div>
        {live.length > 0 ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => openInvite()}
            className="min-h-11 self-center rounded-full px-3 text-center text-[13px] font-bold text-primary underline-offset-2 hover:underline disabled:opacity-50"
          >
            {live.length === 1 ? t.friendsPendingOne : t.friendsPendingMany.replace("{count}", String(live.length))}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden rounded-3xl p-0">
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
          <p className="font-semibold">{mode === "invite" ? t.friendsInvite : t.friendsHaveCode}</p>
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
            {live.length > 0 ? (
              <div className="mt-1 flex flex-col gap-1 border-t border-border pt-3">
                <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{t.friendsPendingInvites}</p>
                {live.map((pending) => (
                  <div key={pending.secret} className="flex items-center justify-between gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => show(pending)}
                      aria-current={invite?.secret === pending.secret ? "true" : undefined}
                      className={cn("text-left text-muted-foreground underline-offset-2 hover:underline", invite?.secret === pending.secret && "font-semibold text-card-foreground")}
                    >
                      {t.friendsInviteSince.replace("{date}", formatIsoUtc(pending.createdAt, locale, { day: "numeric", month: "short" }))}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 text-xs text-muted-foreground"
                      disabled={!writable || busy}
                      onClick={() => void act(() => friends.revokeInvite(pending.secret))}
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
      {scanning ? (
        <PhraseQrScanner
          t={t}
          title={t.friendsHaveCode}
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
