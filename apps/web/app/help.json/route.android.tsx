// Android route: the same static JSON as route.ts next to it, exported as
// out-android/help.json.

import { helpBodies } from "@/lib/help/bodies";

export const dynamic = "force-static";

export function GET() {
  return Response.json(helpBodies());
}
