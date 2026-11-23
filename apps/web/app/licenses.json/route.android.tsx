// Android route: the same static JSON as route.ts next to it, exported as
// out-android/licenses.json with the app's own notices (apps/mobile, Maven).

import { buildLicenseReport } from "@/lib/licenses/report";

export const dynamic = "force-static";

export function GET() {
  return Response.json(buildLicenseReport());
}
