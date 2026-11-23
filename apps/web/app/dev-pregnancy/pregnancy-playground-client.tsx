// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import dynamic from "next/dynamic";

const PregnancyPlayground = dynamic(
  () => import("./pregnancy-playground").then((mod) => mod.PregnancyPlayground),
  { ssr: false, loading: () => <div className="min-h-dvh bg-background" suppressHydrationWarning /> },
);

export function PregnancyPlaygroundClient() {
  return <PregnancyPlayground />;
}
