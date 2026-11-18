// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { UPGRADE_REQUIRED_CODE } from "@/lib/auth-codes";
import { CLIENT_HEADER, parseClientId } from "@/lib/client-version";

/**
 * Oldest Android versionCode the host still serves, from the optional
 * MIN_ANDROID_VERSION_CODE. Unset or unreadable: every build is served.
 */
export function minAndroidVersionCode(): number {
  const value = Number.parseInt(process.env.MIN_ANDROID_VERSION_CODE ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * A 426 for an Android build older than MIN_ANDROID_VERSION_CODE, else null.
 * Call it first in every API route the app uses, except sign-out and account
 * deletion: an old build must always be able to end its session and delete the
 * account. The web, and builds from before the header existed, are always
 * served: raise the minimum only once those builds are gone.
 */
export function rejectOutdatedClient(request: Request): Response | null {
  const minimum = minAndroidVersionCode();
  if (minimum === 0) return null;
  const client = parseClientId(request.headers.get(CLIENT_HEADER));
  // versionCode 0: a build made without apps/mobile/version.json baked in (a dev
  // build). It says nothing about its age, so it is served like a missing header.
  if (client?.platform !== "android" || client.versionCode === 0 || client.versionCode >= minimum) return null;
  return Response.json(
    { error: "This version of Ciclo is too old. Update it to continue.", code: UPGRADE_REQUIRED_CODE },
    { status: 426, headers: { "cache-control": "no-store" } },
  );
}
