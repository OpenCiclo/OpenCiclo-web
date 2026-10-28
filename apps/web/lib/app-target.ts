// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Both values are inlined at build time. The web build leaves them unset. The
// Android build (`npm run build:android`, see next.config.ts) sets them.

/** True in the static bundle that apps/mobile wraps for Android. */
export const IS_ANDROID_APP = process.env.NEXT_PUBLIC_CICLO_TARGET === "android";

/**
 * Origin of the Ciclo host that serves `/api`. Empty on the web, where the API
 * is same-origin. The Android bundle is served from the device, so it needs
 * the host spelled out.
 */
export const API_BASE = process.env.NEXT_PUBLIC_CICLO_API_BASE ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
