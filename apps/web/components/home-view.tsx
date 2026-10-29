// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCiclo } from "@/lib/client/ciclo-context";
import { AppShell } from "@/components/app-shell";
import { CycleDashboard } from "@/components/cycle-dashboard";
import { WelcomeScreen } from "@/components/welcome-screen";

export function HomeView() {
  const { ready, wallet } = useCiclo();
  if (!ready) {
    return <div className="p-8 text-sm text-muted-foreground">…</div>;
  }
  if (!wallet) {
    return (
      <AppShell>
        <WelcomeScreen />
      </AppShell>
    );
  }
  return (
    <AppShell size="wide">
      <CycleDashboard tab="calendar" />
    </AppShell>
  );
}
