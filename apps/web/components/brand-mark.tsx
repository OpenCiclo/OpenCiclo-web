// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { SEA_MARK_PATH } from "@/lib/brand/sea-mark";

export function BrandMark() {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className="size-8 shrink-0">
      <circle cx="16" cy="16" r="16" className="fill-primary" />
      <path d={SEA_MARK_PATH} className="fill-primary-foreground" />
    </svg>
  );
}
