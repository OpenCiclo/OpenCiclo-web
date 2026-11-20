// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";

import { useCiclo } from "@/lib/client/ciclo-context";
import { keepPendingInvite } from "@/lib/client/pending-invite";
import { FRIENDS_AVAILABLE } from "@/lib/features";
import { inviteCode, parseInvite } from "@/lib/friends/invite";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * Where an invite link lands (web only: the Android app takes the code
 * pasted). The code is read from the fragment, which never reached the
 * server, and removed from the address bar at once. Signed in with a hosted
 * account: on to the Friends screen with the code. Otherwise: the code to copy.
 */
export default function JoinFriendsPage() {
  if (!FRIENDS_AVAILABLE) notFound();
  const { t, ready, wallet, storageMode } = useCiclo();
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const secret = parseInvite(window.location.hash);
    window.history.replaceState(null, "", window.location.pathname);
    if (!secret) return;
    const text = inviteCode(secret);
    keepPendingInvite(text);
    // Reading the fragment happens once, after the first paint; the state only shows it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(text);
  }, []);

  useEffect(() => {
    if (ready && code && wallet && storageMode === "hosted") router.replace("/friends");
  }, [code, ready, router, storageMode, wallet]);

  return (
    <AppShell size="narrow">
      <h1 className="mb-4 font-serif text-xl text-foreground desktop:text-4xl">{t.friendsJoinTitle}</h1>
      <Card className="flex flex-col gap-3 rounded-3xl p-4">
        {code ? (
          <>
            <p className="text-sm leading-6">{t.friendsJoinSignedOut}</p>
            <Input readOnly value={code} aria-label={t.friendsCopyCode} onFocus={(event) => event.currentTarget.select()} />
            <Button
              type="button"
              onClick={async () => {
                await navigator.clipboard?.writeText(code).catch(() => undefined);
                setCopied(true);
              }}
            >
              {copied ? t.friendsLinkCopied : t.friendsCopyCode}
            </Button>
          </>
        ) : (
          <p className="text-sm leading-6">{t.friendsInviteUnreadable}</p>
        )}
      </Card>
    </AppShell>
  );
}
