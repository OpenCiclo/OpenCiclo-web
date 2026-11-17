"use client";

import Link from "next/link";

import { useCiclo } from "@/lib/client/ciclo-context";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  const { t } = useCiclo();
  return (
    <AppShell size="reading">
      <h1 className="text-2xl font-semibold">{t.privacyTitle}</h1>
      <Card className="mt-4 flex flex-col gap-3 text-sm leading-6">
        <p>{t.privacyBody1}</p>
        <p>{t.privacyBody2}</p>
        <p>{t.privacyBody3}</p>
        <p>{t.privacyBody4}</p>
        <p>{t.privacyBody5}</p>
        <p>
          <a className="underline" href="https://physionet.org/content/mcphases/1.0.0/">
            mcPHASES
          </a>
          {" · "}
          <a className="underline" href="https://doi.org/10.7278/S50d-4gxs-s4hj">
            Utah / Creighton
          </a>
        </p>
        <p>
          <Link href="/help" className="underline">
            {t.helpDocs}
          </Link>
          {" · "}
          <Link href="/" className="underline">
            {t.back}
          </Link>
        </p>
      </Card>
    </AppShell>
  );
}
