// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { useBrowserValue, usePrefersReducedMotion } from "@/lib/client/hooks";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [intersected, setIntersected] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const noObserver = useBrowserValue(() => typeof IntersectionObserver === "undefined", false);
  // Without motion or an observer there is nothing to wait for: show at once.
  const visible = intersected || reduceMotion || noObserver;

  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion || noObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIntersected(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion, noObserver]);

  return (
    <Tag
      ref={ref as never}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
