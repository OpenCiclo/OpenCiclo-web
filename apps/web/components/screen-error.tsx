// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState } from "react";
import { catchError, type ErrorInfo } from "next/error";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";

import { useCiclo } from "@/lib/client/ciclo-context";
import { saveFile } from "@/lib/client/save-file";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * What a screen shows when it fails to draw (app/error.tsx, ScreenBoundary).
 * Never the error itself: its text could quote diary data. It offers trying
 * again (`onRetry`: the boundary draws the screen again, no page load, which in
 * the app would restart at / and close a session not kept signed in), a JSON
 * export while a diary is open, and signing out of a hosted account, so a diary
 * that keeps breaking a screen can still be saved and left.
 */
export function ScreenErrorView({ onRetry }: { onRetry: () => void }) {
  const { t, wallet, storageMode, offline, exportDiaryJson, signOut } = useCiclo();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Signing out needs the host; the offline copy cannot (see the context).
  const canSignOut = Boolean(wallet) && storageMode === "hosted" && offline === null;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
    } catch {
      setMessage(t.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card role="alert" className="flex flex-col gap-3 rounded-3xl">
      <div className="flex items-start gap-2">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
        <div className="min-w-0">
          <h2 className="font-serif text-xl text-card-foreground">{t.screenErrorTitle}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.screenErrorBody}</p>
        </div>
      </div>
      <Button type="button" disabled={busy} onClick={onRetry}>
        {t.restoreRetry}
      </Button>
      {wallet ? (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void run(() => saveFile("ciclo-diary.json", exportDiaryJson(), "application/json"))}
        >
          {t.exportJson}
        </Button>
      ) : null}
      {canSignOut ? (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await signOut();
              router.push("/app");
              // Already on /app, the navigation would not clear the boundary.
              onRetry();
            })
          }
        >
          {t.logout}
        </Button>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </Card>
  );
}

/**
 * An error boundary for part of a screen (each column of the desktop
 * dashboard): a failure there shows ScreenErrorView in its place and leaves the
 * rest of the screen working. It clears on the next navigation.
 */
export const ScreenBoundary = catchError(function ScreenBoundaryFallback(_props: object, { reset }: ErrorInfo) {
  return <ScreenErrorView onRetry={reset} />;
});

/**
 * Around each ghost of a tab screen (TabGhosts): a ghost that fails to draw
 * shows nothing, instead of taking the whole app down. The real screen, once
 * opened, has its own boundary.
 */
export const GhostBoundary = catchError(function GhostBoundaryFallback() {
  return null;
});
