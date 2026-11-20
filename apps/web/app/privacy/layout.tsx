// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { Metadata } from "next";

// Web only: the Android build reads `layout.android.tsx` files, so the app keeps the root title.
export const metadata: Metadata = {
  title: "Privacy policy · Ciclo",
  description: "What personal data Ciclo handles, why, where it is kept, for how long, and your rights.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
