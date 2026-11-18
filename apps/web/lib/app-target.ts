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

/**
 * The Android build's versionCode (apps/mobile/version.json, baked in by
 * next.config.ts). 0 on the web and in builds made before it existed.
 */
export const APP_VERSION_CODE = Number.parseInt(process.env.NEXT_PUBLIC_CICLO_VERSION_CODE ?? "", 10) || 0;

/** The app's Google Play listing (appId in apps/mobile/capacitor.config.ts). Android opens it in the Play Store. */
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.openciclo.app";

/** The host the app's diary lives on, for copy that tells people where to go ("openciclo.com"). */
export function apiHostLabel(): string {
  try {
    return new URL(API_BASE || window.location.origin).host.replace(/^www\./, "");
  } catch {
    return "openciclo.com";
  }
}
