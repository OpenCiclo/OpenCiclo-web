// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { helpBodies } from "@/lib/help/bodies";

// Every Help article's markdown as JSON, for the Help sheet in Settings (the
// catalog, lib/help/articles.ts, ships with the client). Static: built from
// content/help with the app. The Android export has its twin, route.android.tsx.
export const dynamic = "force-static";

export function GET() {
  return Response.json(helpBodies(), { headers: { "X-Robots-Tag": "noindex" } });
}
