// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { buildLicenseReport } from "@/lib/licenses/report";
import { LicensesView } from "@/components/licenses-view";

// Third-party notices, gathered from node_modules when the page is built.
// Static on purpose: node_modules is not there at run time on Vercel, and the
// Android export has no server at all.
export const dynamic = "force-static";

export default function LicensesPage() {
  return <LicensesView report={buildLicenseReport()} />;
}
