// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A comic-style speech bubble in the app's colours: a rounded bubble with a
 * faint halftone dot pattern and a small tail. "small" sits under a friend's
 * name on their card (tail up); "large" is the person's own note (tail down,
 * towards their name).
 */
export function SpeechBubble({
  size,
  className,
  children,
}: {
  size: "small" | "large";
  className?: string;
  children: ReactNode;
}) {
  const large = size === "large";
  return (
    <div className={cn("relative", className)}>
      {/* On the page (large) the bubble takes the card colour; inside a card (small), the page colour. */}
      <span
        aria-hidden
        className={cn(
          "absolute z-[2] size-4 rotate-45 border-border",
          large ? "-bottom-[8px] left-8 border-r border-b bg-card" : "-top-[7px] left-6 border-t border-l bg-background",
        )}
      />
      <div
        className={cn(
          "relative z-[1] overflow-hidden border border-border shadow-sm",
          large ? "rounded-[26px] bg-card px-5 py-4" : "rounded-2xl bg-background px-3 py-2",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(color-mix(in_oklch,var(--primary)_16%,transparent)_1px,transparent_1.3px)] [background-size:9px_9px] opacity-70"
        />
        <div className={cn("relative text-pretty", large ? "font-serif text-[19px] leading-snug" : "text-[13px] leading-snug font-semibold")}>
          {children}
        </div>
      </div>
    </div>
  );
}
