// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import Link from "next/link";

import { useCiclo } from "@/lib/client/ciclo-context";
import type { LicenseEntry, LicenseReport } from "@/lib/licenses/collect";
import { AppShell } from "@/components/app-shell";

const TEXT = "mt-2 overflow-x-auto rounded-xl bg-secondary p-3 text-xs leading-5 break-words whitespace-pre-wrap";

/** /licenses: the fonts and packages Ciclo ships, with their license texts (English, as written). */
export function LicensesView({ report }: { report: LicenseReport }) {
  const { t } = useCiclo();
  return (
    <AppShell size="reading">
      <h1 className="text-2xl font-semibold">{t.licensesTitle}</h1>
      <LicensesList report={report} />

      <p className="mt-8 text-sm">
        <Link href="/privacy" className="underline">
          {t.privacyPolicy}
        </Link>
      </p>
    </AppShell>
  );
}

/** The notices themselves: on /licenses, and in the sheet Settings opens (from /licenses.json). */
export function LicensesList({ report }: { report: LicenseReport }) {
  const { t } = useCiclo();
  return (
    <div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.licensesIntro}</p>

      <h2 className="mt-8 text-lg font-semibold">{t.licensesFonts}</h2>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {report.fonts.map((font) => (
          <li key={font.name}>
            <a href={font.url} target="_blank" rel="noreferrer" className="font-medium underline">
              {font.name}
            </a>{" "}
            · OFL-1.1
            <p className="text-xs text-muted-foreground">{font.copyright}</p>
          </li>
        ))}
      </ul>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-medium">SIL Open Font License 1.1</summary>
        <pre lang="en" className={TEXT}>
          {report.fontLicenseText}
        </pre>
      </details>

      <h2 className="mt-8 text-lg font-semibold">{t.licensesLibraries}</h2>
      <ul className="mt-3 flex flex-col gap-3 text-sm">
        {report.packages.map((entry) => (
          <li key={`${entry.name}@${entry.version}`}>
            <PackageLicense entry={entry} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PackageLicense({ entry }: { entry: LicenseEntry }) {
  const title = [entry.name, entry.version].filter(Boolean).join(" ");
  const link = entry.url ? (
    <a href={entry.url} target="_blank" rel="noreferrer" className="text-xs break-all underline">
      {entry.url}
    </a>
  ) : null;
  if (!entry.text) {
    return (
      <div>
        <p className="font-medium">
          {title}
          {entry.license ? <span className="font-normal text-muted-foreground"> · {entry.license}</span> : null}
        </p>
        {link}
      </div>
    );
  }
  return (
    <details>
      <summary className="cursor-pointer font-medium">
        {title}
        {entry.license ? <span className="font-normal text-muted-foreground"> · {entry.license}</span> : null}
      </summary>
      {link}
      <pre lang="en" className={TEXT}>
        {entry.text}
      </pre>
    </details>
  );
}
