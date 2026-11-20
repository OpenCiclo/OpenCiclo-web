// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A note, drawn as a chat bubble in the app's colours. "large" is the person's
 * own note at the top of the Friends screen: a wide rounded box in the card
 * colour. "small" sits under a friend's name on their card: as wide as its
 * text, in the page colour, with one sharper corner towards the friend.
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
    <div
      className={cn(
        "border border-border text-pretty",
        large
          ? "rounded-[26px] bg-card px-5 py-4 font-serif text-xl leading-tight"
          : "w-fit max-w-full rounded-2xl rounded-bl-[4px] bg-background px-3 py-2 text-sm leading-snug font-semibold",
        className,
      )}
    >
      {children}
    </div>
  );
}
