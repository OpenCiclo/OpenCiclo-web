// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCiclo } from "@/lib/client/ciclo-context";
import { AppShell } from "@/components/app-shell";
import { CycleDashboard } from "@/components/cycle-dashboard";

export default function PatternsPage() {
  const { t, wallet } = useCiclo();

  if (!wallet) {
    return (
      <AppShell>
        <p>{t.unlockTitle}</p>
      </AppShell>
    );
  }

  return (
    <AppShell size="wide">
      <CycleDashboard tab="patterns" />
    </AppShell>
  );
}
