// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// These values are inlined at build time. The web build leaves them unset. The
// app builds (`npm run build:android`, `npm run build:ios`, see next.config.ts)
// set them. Each app gets its own static export.

/** True in the static bundle that apps/mobile wraps for Android. */
export const IS_ANDROID_APP = process.env.NEXT_PUBLIC_CICLO_TARGET === "android";

/** True in the static bundle that apps/mobile wraps for iOS. */
export const IS_IOS_APP = process.env.NEXT_PUBLIC_CICLO_TARGET === "ios";

/**
 * True in either app. Most of what sets the apps apart from the web is shared:
 * the phone layout, on-device storage, native HTTP, the share sheet, the
 * swipes. Use IS_ANDROID_APP / IS_IOS_APP only for what one system has and the
 * other does not (the Back button, the store, the wording of the app lock).
 */
export const IS_NATIVE_APP = IS_ANDROID_APP || IS_IOS_APP;

/**
 * Origin of the Ciclo host that serves `/api`. Empty on the web, where the API
 * is same-origin. An app bundle is served from the device, so it needs
 * the host spelled out.
 */
export const API_BASE = process.env.NEXT_PUBLIC_CICLO_API_BASE ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/**
 * The app build's versionCode (apps/mobile/version.json, baked in by
 * next.config.ts; the iOS build number is the same value). 0 on the web and in
 * builds made before it existed.
 */
export const APP_VERSION_CODE = Number.parseInt(process.env.NEXT_PUBLIC_CICLO_VERSION_CODE ?? "", 10) || 0;

/** The app's Google Play listing (appId in apps/mobile/capacitor.config.ts). Android opens it in the Play Store. */
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.openciclo.app";

/**
 * The app's App Store page. Null until the app exists in App Store Connect:
 * the address holds an id Apple assigns then (https://apps.apple.com/app/id<number>).
 */
export const APP_STORE_URL: string | null = null;

/** Where this build is updated from. Null on the web, and on iOS until APP_STORE_URL is set. */
export const STORE_URL: string | null = IS_ANDROID_APP ? PLAY_STORE_URL : IS_IOS_APP ? APP_STORE_URL : null;

/** The host the app's diary lives on, for copy that tells people where to go ("openciclo.com"). */
export function apiHostLabel(): string {
  try {
    return new URL(API_BASE || window.location.origin).host.replace(/^www\./, "");
  } catch {
    return "openciclo.com";
  }
}
