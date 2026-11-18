// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { CircleArrowUp } from "lucide-react";

import { IS_ANDROID_APP, PLAY_STORE_URL } from "@/lib/app-target";
import type { UpdateRequiredError } from "@/lib/client/http";
import type { Messages } from "@/lib/i18n";
import { useCiclo } from "@/lib/client/ciclo-context";
import { resolveTimeZone } from "@/lib/time-zone";
import { cn } from "@/lib/utils";

/**
 * What a sign-in or sign-up form says when it meets UpdateRequiredError. Null
 * when the notice on the page already says it: a 426 sets `updateRequired`, and
 * the Android notice is then showing. A kit from a newer build sets nothing, so
 * the form says it; on the web the update is a reload, never Google Play.
 */
export function updateErrorMessage(error: UpdateRequiredError, t: Messages): string | null {
  if (!IS_ANDROID_APP) return t.updateSignInBodyWeb;
  return error.reason === "server" ? null : t.updateSignInBody;
}

const ACTION_CLASS =
  "shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-card-foreground shadow-sm transition-transform active:scale-95";

/**
 * This build cannot save the open diary, or cannot sign in at all
 * (`updateRequired`): a newer version of Ciclo saved the diary, or the host no
 * longer serves this Android build (426). An open diary stays readable. The app
 * links to Google Play; the web reloads, which gets the build the host serves
 * now. Renders nothing otherwise. Also shown on the sign-in screens, where a 426
 * is the first sign of it.
 */
export function UpdateNotice({ className }: { className?: string }) {
  const { t, locale, timeZone, updateRequired, diaryNewer, wallet, copySavedAt } = useCiclo();
  if (!updateRequired) return null;
  // The copy kept on this phone opened because the host refuses this build: say when it was saved.
  const copyBody = copySavedAt
    ? t.updateBodyCopy.replace(
        "{date}",
        new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: resolveTimeZone(timeZone),
        }).format(new Date(copySavedAt)),
      )
    : null;
  // The web is always the build the host serves now: a reload is the update.
  const body = !IS_ANDROID_APP
    ? t.updateBodyWeb
    : diaryNewer
      ? t.updateBodyNewer
      : wallet
        ? (copyBody ?? t.updateBodyOutdated)
        : t.updateSignInBody;

  return (
    <div role="status" className={cn("flex gap-3 rounded-3xl bg-muted/70 p-4", className)}>
      <CircleArrowUp className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-card-foreground">{t.updateTitle}</p>
          {IS_ANDROID_APP ? (
            <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className={ACTION_CLASS}>
              {t.updateOpenStore}
            </a>
          ) : (
            <button type="button" onClick={() => window.location.reload()} className={ACTION_CLASS}>
              {t.updateReload}
            </button>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
