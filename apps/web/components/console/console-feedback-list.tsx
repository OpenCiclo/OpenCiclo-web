// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState } from "react";
import Link from "next/link";

import { useCiclo } from "@/lib/client/ciclo-context";
import { apiFetch } from "@/lib/client/http";
import { consoleCopy } from "@/lib/console/copy";
import { FEEDBACK_KINDS, type FeedbackKind } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type ConsoleFeedbackItem = {
  id: string;
  /** ISO instant. */
  createdAt: string;
  kind: FeedbackKind;
  body: string;
  contactEmail: string | null;
  platform: string;
  appVersion: string | null;
  locale: string | null;
};

function href(kind: FeedbackKind | null, before?: string): string {
  const params = new URLSearchParams();
  if (kind) params.set("kind", kind);
  if (before) params.set("before", before);
  const query = params.toString();
  return query ? `/console/feedback?${query}` : "/console/feedback";
}

/** The console's feedback list. `items` is null when the table could not be read (0009 not applied). */
export function ConsoleFeedbackList({
  items,
  kind,
  paged,
  hasMore,
}: {
  items: ConsoleFeedbackItem[] | null;
  kind: FeedbackKind | null;
  paged: boolean;
  hasMore: boolean;
}) {
  const { locale } = useCiclo();
  const copy = consoleCopy(locale);
  const [confirm, confirmDialog] = useConfirmDialog();
  const [deleted, setDeleted] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const kindLabel: Record<FeedbackKind, string> = {
    problem: copy.feedbackKindProblem,
    idea: copy.feedbackKindIdea,
    other: copy.feedbackKindOther,
  };
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
  const visible = items?.filter((item) => !deleted.has(item.id)) ?? null;

  async function remove(id: string) {
    const ok = await confirm({
      message: copy.feedbackDeleteConfirm,
      confirmLabel: copy.feedbackDelete,
      cancelLabel: copy.cancel,
      destructive: true,
    });
    if (!ok) return;
    setBusy(id);
    setFailed(false);
    try {
      const response = await apiFetch(`/api/console/feedback/${id}`, { method: "DELETE" });
      // 404: already gone (another tab, or the 12-month cleanup).
      if (!response.ok && response.status !== 404) throw new Error(`HTTP ${response.status}`);
      setDeleted((current) => new Set(current).add(id));
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl tracking-tight">{copy.feedback}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.feedbackIntro}</p>
      </div>
      <nav className="flex flex-wrap gap-2 text-sm font-semibold">
        {[null, ...FEEDBACK_KINDS].map((option) => (
          <Link
            key={option ?? "all"}
            href={href(option)}
            className={cn(
              "rounded-full border px-3 py-1",
              option === kind ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
            )}
          >
            {option ? kindLabel[option] : copy.feedbackAll}
          </Link>
        ))}
      </nav>
      {failed ? (
        <p role="alert" className="text-sm text-destructive">
          {copy.feedbackDeleteFailed}
        </p>
      ) : null}
      {visible === null ? (
        <p className="text-sm text-muted-foreground">{copy.feedbackMissingTable}</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.feedbackEmpty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((item) => (
            <li key={item.id}>
              <Card className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">{kindLabel[item.kind]}</span>
                  <time dateTime={item.createdAt}>{dateFormat.format(new Date(item.createdAt))} UTC</time>
                  <span>{[item.platform, item.appVersion, item.locale].filter(Boolean).join(" · ")}</span>
                </div>
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{item.body}</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {item.contactEmail ? (
                    <a href={`mailto:${item.contactEmail}`} className="text-sm font-medium break-all text-primary underline">
                      {copy.feedbackReply}: {item.contactEmail}
                    </a>
                  ) : (
                    <span />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy === item.id}
                    onClick={() => void remove(item.id)}
                  >
                    {copy.feedbackDelete}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-4 text-sm font-semibold">
        {paged ? (
          <Link href={href(kind)} className="text-primary underline">
            {copy.feedbackNewest}
          </Link>
        ) : null}
        {hasMore && items && items.length > 0 ? (
          <Link href={href(kind, items[items.length - 1].createdAt)} className="text-primary underline">
            {copy.feedbackOlder}
          </Link>
        ) : null}
      </div>
      {confirmDialog}
    </div>
  );
}
