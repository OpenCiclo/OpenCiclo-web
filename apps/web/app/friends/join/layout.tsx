// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { Metadata } from "next";
import type { ReactNode } from "react";

// Invite links carry their secret in the fragment; the page itself is the same
// for everyone and must never be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function JoinLayout({ children }: { children: ReactNode }) {
  return children;
}
