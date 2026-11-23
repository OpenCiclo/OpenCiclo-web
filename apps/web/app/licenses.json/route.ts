// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { buildLicenseReport } from "@/lib/licenses/report";

// The /licenses notices as JSON, for the licenses sheet in Settings. Built with
// the app like the page (node_modules is not there at run time on Vercel).
// The Android export has its twin, route.android.tsx.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildLicenseReport(), { headers: { "X-Robots-Tag": "noindex" } });
}
