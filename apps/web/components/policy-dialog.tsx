// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useCiclo } from "@/lib/client/ciclo-context";
import { contentLocale } from "@/lib/i18n";
import { privacyPolicy } from "@/lib/privacy/policy";
import { LegalDocument } from "@/components/legal-document";

/**
 * The privacy policy over the sign-up screen, so reading it keeps what the
 * person already chose (the consent tick). Escape and Android Back close it.
 */
export function PolicyDialog({ onClose }: { onClose: () => void }) {
  const { t, locale } = useCiclo();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lang = contentLocale(locale);
  const fallback = lang !== locale;
  const doc = privacyPolicy(lang);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    return () => opener?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-stretch justify-center desktop:items-center desktop:p-8">
      <button type="button" aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-foreground/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={doc.title}
        className="relative z-10 flex w-full max-w-3xl flex-col bg-background text-foreground shadow-2xl desktop:max-h-full desktop:rounded-3xl"
      >
        <div className="flex justify-end p-3">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform active:scale-90"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-8 desktop:px-8">
          <LegalDocument
            doc={doc}
            lang={fallback ? lang : undefined}
            badge={fallback ? (lang === "es" ? t.learnSpanishOnly : t.learnEnglishOnly) : undefined}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
