"use client";

import Link from "next/link";

import { useCiclo } from "@/lib/client/ciclo-context";
import { privacyPolicy } from "@/lib/privacy/policy";
import { AppShell } from "@/components/app-shell";
import { LegalPage } from "@/components/legal-page";

// The privacy policy, in Spanish or English (lib/privacy/policy.ts). Other UI
// languages show one of the two with a badge, like Learn articles. `?lang=en`
// or `?lang=es` picks one regardless of the UI language (display only).
export default function PrivacyPage() {
  const { t } = useCiclo();
  return (
    <AppShell size="reading">
      <LegalPage build={privacyPolicy}>
        <p>
          <a className="underline" href="https://physionet.org/content/mcphases/1.0.0/">
            mcPHASES
          </a>
          {" · "}
          <a className="underline" href="https://doi.org/10.7278/S50d-4gxs-s4hj">
            Utah / Creighton
          </a>
        </p>
        <p className="flex flex-wrap gap-x-2 gap-y-1">
          <Link href="/licenses" className="underline">
            {t.licensesTitle}
          </Link>
          <span aria-hidden>·</span>
          <Link href="/help" className="underline">
            {t.helpDocs}
          </Link>
          <span aria-hidden>·</span>
          <Link href="/" className="underline">
            {t.back}
          </Link>
        </p>
      </LegalPage>
    </AppShell>
  );
}
