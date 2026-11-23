// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { appVersionLabel } from "@/lib/app-target";
import { useCiclo } from "@/lib/client/ciclo-context";
import { apiFetch } from "@/lib/client/http";
import { FEEDBACK_KINDS, FEEDBACK_MAX_LENGTH, type FeedbackKind } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = { kind: "sent" | "error"; text: string } | null;

/**
 * Settings: "Send feedback". A type, the text, and an email only if the person
 * wants an answer. Sent to the host without the account (POST /api/feedback,
 * no session read there); works with a diary kept only on the phone too.
 */
export function FeedbackCard() {
  const { t, locale } = useCiclo();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>("problem");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const kindLabel: Record<FeedbackKind, string> = {
    problem: t.feedbackKindProblem,
    idea: t.feedbackKindIdea,
    other: t.feedbackKindOther,
  };
  const text = body.trim();

  async function send() {
    if (!text || busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await apiFetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          body: text,
          contactEmail: email.trim() || null,
          appVersion: appVersionLabel(),
          locale,
        }),
      });
      if (response.status === 429) {
        setStatus({ kind: "error", text: t.feedbackTooMany });
      } else if (response.status === 400 && email.trim()) {
        setStatus({ kind: "error", text: t.feedbackInvalidEmail });
      } else if (!response.ok) {
        setStatus({ kind: "error", text: t.errorGeneric });
      } else {
        setBody("");
        setEmail("");
        setStatus({ kind: "sent", text: t.feedbackSent });
      }
    } catch {
      setStatus({ kind: "error", text: t.errorGeneric });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-4 flex flex-col gap-3 rounded-3xl">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left font-medium"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {t.feedbackTitle}
        <ChevronDown className={cn("size-5 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <>
          <p className="text-sm text-muted-foreground">{t.feedbackIntro}</p>
          <div role="radiogroup" aria-label={t.feedbackKindLabel} className="grid grid-cols-3 gap-2">
            {FEEDBACK_KINDS.map((option) => (
              <Button
                key={option}
                type="button"
                role="radio"
                aria-checked={kind === option}
                variant={kind === option ? "default" : "outline"}
                onClick={() => setKind(option)}
              >
                {kindLabel[option]}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feedback-body">{t.feedbackBodyLabel}</Label>
            <textarea
              id="feedback-body"
              value={body}
              maxLength={FEEDBACK_MAX_LENGTH}
              rows={5}
              onChange={(event) => setBody(event.target.value)}
              className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
            />
            <p className="self-end text-xs text-muted-foreground" aria-live="polite">
              {body.length}/{FEEDBACK_MAX_LENGTH}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feedback-email">{t.feedbackEmailLabel}</Label>
            <Input
              id="feedback-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-describedby="feedback-email-hint"
            />
            <p id="feedback-email-hint" className="text-xs text-muted-foreground">
              {t.feedbackEmailHint}
            </p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{t.feedbackPrivacyNote}</p>
          <Button type="button" disabled={!text || busy} aria-busy={busy} onClick={() => void send()}>
            {t.feedbackSend}
          </Button>
          {status ? (
            <p role={status.kind === "error" ? "alert" : "status"} className="text-sm">
              {status.text}
            </p>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
