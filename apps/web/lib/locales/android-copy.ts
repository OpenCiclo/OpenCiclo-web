// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { Messages } from "@/lib/i18n";

// Texts that talk about "the browser" on the web, and their wording for the
// Android app, where there is no browser to speak of. `messagesFor` swaps them
// in the Android build, so every screen reads the plain key (`t.passwordHint`)
// in both builds. Each Android key sits right after its web key in every
// language file.
export const ANDROID_COPY = {
  createWithEmailHint: "createWithEmailHintAndroid",
  onboardingBody: "onboardingBodyAndroid",
  passwordHint: "passwordHintAndroid",
  keepLoggedInHint: "keepLoggedInHintAndroid",
  welcomeCta: "welcomeCtaAndroid",
} as const satisfies Partial<Record<keyof Messages, keyof Messages>>;

/** `messages` with the Android wording in place of the web one. */
export function withAndroidCopy(messages: Messages): Messages {
  const next = { ...messages };
  for (const [key, androidKey] of Object.entries(ANDROID_COPY) as Array<[keyof Messages, keyof Messages]>) {
    next[key] = messages[androidKey];
  }
  return next;
}
