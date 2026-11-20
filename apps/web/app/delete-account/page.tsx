// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import Link from "next/link";

import { useCiclo } from "@/lib/client/ciclo-context";
import { deleteAccountGuide } from "@/lib/privacy/delete-account";
import { AppShell } from "@/components/app-shell";
import { LegalPage } from "@/components/legal-page";

// Web only (no .android.tsx twin): the public address Google Play asks for, so
// people can learn how to delete their account without installing the app.
// Spanish or English (lib/privacy/delete-account.ts), like /privacy, and
// `?lang=en` / `?lang=es` picks one (display only).
export default function DeleteAccountPage() {
  const { t } = useCiclo();
  return (
    <AppShell size="reading">
      <LegalPage build={deleteAccountGuide}>
        <p>
          <Link href="/" className="underline">
            {t.back}
          </Link>
        </p>
      </LegalPage>
    </AppShell>
  );
}
