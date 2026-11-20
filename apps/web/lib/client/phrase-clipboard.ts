// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { IS_ANDROID_APP } from "@/lib/app-target";
import type { DeviceVaultPlugin } from "@/lib/device-vault";

// Copying the 12-word phrase (onboarding). The phrase opens the diary, so it
// should not sit on the clipboard: about a minute later it is cleared, if the
// clipboard still holds it and Ciclo can tell. In the Android app the clip is
// also marked sensitive (Android 13+ hides it in the clipboard preview).

/** How long the copied phrase may stay on the clipboard. */
export const PHRASE_CLIPBOARD_MS = 60_000;

/** After the app comes back to the front, the wait before looking again (the window gets the focus a moment later). */
export const PHRASE_CLEAR_RETRY_MS = 500;

export type PhraseClipboard = {
  write(text: string): Promise<void>;
  /**
   * Empties the clipboard if it still holds `text`, as far as it can tell.
   * False when it could not look at all (the Android app in the background):
   * try again once the app is visible.
   */
  clearIfUnchanged(text: string): Promise<boolean>;
};

/** Calls `callback` each time the page becomes visible; returns the unsubscribe. */
export type WhenVisible = (callback: () => void) => () => void;

const whenDocumentVisible: WhenVisible = (callback) => {
  const listener = () => {
    if (document.visibilityState === "visible") callback();
  };
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
};

/**
 * Copies, then clears `delayMs` later; if the clipboard could not be checked
 * then, again each time the page comes back into view, until it could. A new
 * copy restarts all of it.
 */
export function phraseCopier(
  clipboard: PhraseClipboard,
  { delayMs = PHRASE_CLIPBOARD_MS, whenVisible = whenDocumentVisible }: { delayMs?: number; whenVisible?: WhenVisible } = {},
) {
  let cancel = () => {};
  return async (text: string): Promise<void> => {
    cancel();
    await clipboard.write(text);
    let timer: ReturnType<typeof setTimeout> | null = null;
    let unsubscribe: (() => void) | null = null;
    let live = true;
    cancel = () => {
      live = false;
      if (timer !== null) clearTimeout(timer);
      unsubscribe?.();
    };
    const attempt = async () => {
      timer = null;
      const checked = await clipboard.clearIfUnchanged(text).catch(() => true);
      if (!live) return;
      if (checked) {
        cancel();
      } else {
        unsubscribe ??= whenVisible(() => {
          if (timer === null) timer = setTimeout(() => void attempt(), PHRASE_CLEAR_RETRY_MS);
        });
      }
    };
    timer = setTimeout(() => void attempt(), delayMs);
  };
}

/** The native clipboard of the Android app (DeviceVaultPlugin.java). */
export function androidPhraseClipboard(plugin: Pick<DeviceVaultPlugin, "copySensitive" | "clearCopied">): PhraseClipboard {
  return {
    write: (text) => plugin.copySensitive({ text }),
    clearIfUnchanged: async () => (await plugin.clearCopied()).checked !== false,
  };
}

type WebEnvironment = {
  clipboard: Pick<Clipboard, "writeText" | "readText">;
  permissions?: Pick<Permissions, "query">;
  /** Where focus and copies are watched (window and document in the browser). */
  window: Pick<EventTarget, "addEventListener" | "removeEventListener">;
  document: Pick<EventTarget, "addEventListener" | "removeEventListener"> & { hasFocus(): boolean };
};

/**
 * The browser clipboard. Reading it back needs a permission Ciclo never asks
 * for, so without one the phrase is cleared only when nothing else can have
 * been copied since: the page kept the focus the whole time and saw no copy.
 */
export function webPhraseClipboard(env: WebEnvironment): PhraseClipboard {
  let watch: { copiedElsewhere: boolean; stop: () => void } | null = null;

  function startWatching() {
    watch?.stop();
    const state = { copiedElsewhere: false, stop: () => {} };
    const mark = () => {
      state.copiedElsewhere = true;
    };
    env.window.addEventListener("blur", mark);
    env.document.addEventListener("copy", mark);
    env.document.addEventListener("cut", mark);
    state.stop = () => {
      env.window.removeEventListener("blur", mark);
      env.document.removeEventListener("copy", mark);
      env.document.removeEventListener("cut", mark);
    };
    watch = state;
  }

  return {
    write: async (text) => {
      await env.clipboard.writeText(text);
      startWatching();
    },
    clearIfUnchanged: async (text) => {
      const state = watch;
      watch = null;
      state?.stop();
      const permission = await env.permissions
        ?.query({ name: "clipboard-read" as PermissionName })
        .catch(() => null);
      if (permission?.state === "granted") {
        if ((await env.clipboard.readText()) === text) await env.clipboard.writeText("");
        return true;
      }
      if (state && !state.copiedElsewhere && env.document.hasFocus()) await env.clipboard.writeText("");
      // Without read access a later look would not tell more: done either way.
      return true;
    },
  };
}

let copier: ((text: string) => Promise<void>) | null = null;

/** Copies the phrase and clears it from the clipboard about a minute later. */
export async function copyPhrase(phrase: string): Promise<void> {
  if (!copier) {
    const clipboard = IS_ANDROID_APP
      ? androidPhraseClipboard((await import("@/lib/client/device-storage")).deviceVault)
      : webPhraseClipboard({ clipboard: navigator.clipboard, permissions: navigator.permissions, window, document });
    copier = phraseCopier(clipboard);
  }
  await copier(phrase);
}
