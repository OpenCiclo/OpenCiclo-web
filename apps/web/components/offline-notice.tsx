// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState } from "react";
import { CloudOff } from "lucide-react";

import { useCiclo } from "@/lib/client/ciclo-context";
import { resolveTimeZone } from "@/lib/time-zone";
import { cn } from "@/lib/utils";

/**
 * Android: the diary on screen is the offline copy kept on this device
 * (read-only). Says when it was last in step with the host, and tries the host
 * again on request. Renders nothing otherwise.
 */
export function OfflineNotice({ className }: { className?: string }) {
  const { t, locale, timeZone, offline, retryRestore } = useCiclo();
  const [retrying, setRetrying] = useState(false);
  if (!offline) return null;

  const date = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: resolveTimeZone(timeZone),
  }).format(new Date(offline.savedAt));

  return (
    <div role="status" className={cn("flex gap-3 rounded-3xl bg-muted/70 p-4", className)}>
      <CloudOff className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-card-foreground">{t.offlineTitle}</p>
          <button
            type="button"
            disabled={retrying}
            onClick={async () => {
              setRetrying(true);
              try {
                await retryRestore();
              } finally {
                setRetrying(false);
              }
            }}
            className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-card-foreground shadow-sm transition-transform active:scale-95 disabled:opacity-60"
          >
            {retrying ? "…" : t.restoreRetry}
          </button>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.offlineBody.replace("{date}", date)}</p>
      </div>
    </div>
  );
}
