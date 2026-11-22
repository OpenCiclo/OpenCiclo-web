// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { Messages } from "@/lib/i18n";
import { withAndroidCopy } from "@/lib/locales/android-copy";

// Texts of the app that name something Android has and iOS calls otherwise:
// Google Play (the App Store), the fingerprint and the screen lock (Face ID,
// Touch ID, the passcode), recent apps and screenshots (the app switcher; iOS
// cannot block screenshots). `messagesFor` swaps them in the iOS build, so
// every screen reads the plain key (`t.appLock`) in every build. Each iOS key
// sits right after the key it replaces in every language file.
export const IOS_COPY = {
  updateBodyNewer: "updateBodyNewerIos",
  updateBodyOutdated: "updateBodyOutdatedIos",
  updateSignInBody: "updateSignInBodyIos",
  updateBodyCopy: "updateBodyCopyIos",
  updateOpenStore: "updateOpenStoreIos",
  appLock: "appLockIos",
  appLockHint: "appLockHintIos",
  appLockUnavailable: "appLockUnavailableIos",
  deviceLockedBody: "deviceLockedBodyIos",
  deviceLockedKeyInvalidated: "deviceLockedKeyInvalidatedIos",
} as const satisfies Partial<Record<keyof Messages, keyof Messages>>;

/**
 * `messages` for the iOS app: the app wording where the web says "browser"
 * (the same one Android uses, android-copy.ts), then the iOS wording on top.
 */
export function withIosCopy(messages: Messages): Messages {
  const next = withAndroidCopy(messages);
  for (const [key, iosKey] of Object.entries(IOS_COPY) as Array<[keyof Messages, keyof Messages]>) {
    next[key] = messages[iosKey];
  }
  return next;
}
