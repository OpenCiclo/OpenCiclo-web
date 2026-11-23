// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import path from "node:path";

import { API_BASE, IS_ANDROID_APP } from "@/lib/app-target";
import { collectLicenses, type LicenseReport } from "@/lib/licenses/collect";

/**
 * This build's third-party notices (/licenses and /licenses.json), gathered
 * from node_modules when the page is built (`next build` runs in apps/web).
 * The Android build adds apps/mobile's packages and the Maven libraries.
 */
export function buildLicenseReport(): LicenseReport {
  const webDir = process.cwd();
  return collectLicenses(
    webDir,
    IS_ANDROID_APP
      ? // An https API base is a release export: a notice missing there fails the build.
        { mobileDir: path.join(webDir, "../mobile"), release: API_BASE.startsWith("https://") }
      : {},
  );
}
