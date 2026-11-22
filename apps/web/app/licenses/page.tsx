// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import path from "node:path";

import { API_BASE, IS_ANDROID_APP, IS_NATIVE_APP } from "@/lib/app-target";
import { collectLicenses } from "@/lib/licenses/collect";
import { LicensesView } from "@/components/licenses-view";

// Third-party notices, gathered from node_modules when the page is built
// (`next build` runs in apps/web). Static on purpose: node_modules is not there
// at run time on Vercel, and the app exports have no server at all.
export const dynamic = "force-static";

export default function LicensesPage() {
  const webDir = process.cwd();
  const report = collectLicenses(
    webDir,
    IS_NATIVE_APP
      ? // An https API base is a release export: a notice missing there fails the build.
        {
          mobileDir: path.join(webDir, "../mobile"),
          androidLibraries: IS_ANDROID_APP,
          release: API_BASE.startsWith("https://"),
        }
      : {},
  );
  return <LicensesView report={report} />;
}
