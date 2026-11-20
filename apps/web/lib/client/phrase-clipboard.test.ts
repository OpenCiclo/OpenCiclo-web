// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PHRASE_CLEAR_RETRY_MS,
  PHRASE_CLIPBOARD_MS,
  androidPhraseClipboard,
  phraseCopier,
  webPhraseClipboard,
  type PhraseClipboard,
} from "@/lib/client/phrase-clipboard";

const PHRASE = "abandon ability able about above absent absorb abstract absurd abuse access accident";

describe("phraseCopier", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function fakeClipboard() {
    return {
      write: vi.fn<PhraseClipboard["write"]>(async () => {}),
      clearIfUnchanged: vi.fn<PhraseClipboard["clearIfUnchanged"]>(async () => true),
    };
  }

  /** Stands in for document visibilitychange: `show()` brings the page back. */
  function fakeVisibility() {
    const callbacks = new Set<() => void>();
    return {
      whenVisible: (callback: () => void) => {
        callbacks.add(callback);
        return () => callbacks.delete(callback);
      },
      show: () => callbacks.forEach((callback) => callback()),
      get listeners() {
        return callbacks.size;
      },
    };
  }

  it("clears the phrase about a minute after copying it", async () => {
    const clipboard = fakeClipboard();
    await phraseCopier(clipboard)(PHRASE);
    expect(clipboard.write).toHaveBeenCalledWith(PHRASE);
    await vi.advanceTimersByTimeAsync(PHRASE_CLIPBOARD_MS - 1);
    expect(clipboard.clearIfUnchanged).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(clipboard.clearIfUnchanged).toHaveBeenCalledWith(PHRASE);
  });

  it("waits again after a second copy, and clears once", async () => {
    const clipboard = fakeClipboard();
    const copy = phraseCopier(clipboard);
    await copy(PHRASE);
    await vi.advanceTimersByTimeAsync(PHRASE_CLIPBOARD_MS / 2);
    await copy(PHRASE);
    await vi.advanceTimersByTimeAsync(PHRASE_CLIPBOARD_MS / 2);
    expect(clipboard.clearIfUnchanged).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(PHRASE_CLIPBOARD_MS);
    expect(clipboard.clearIfUnchanged).toHaveBeenCalledTimes(1);
  });

  it("swallows a failed clear", async () => {
    const clipboard = fakeClipboard();
    clipboard.clearIfUnchanged.mockRejectedValue(new Error("denied"));
    const visibility = fakeVisibility();
    await phraseCopier(clipboard, { whenVisible: visibility.whenVisible })(PHRASE);
    await expect(vi.advanceTimersByTimeAsync(PHRASE_CLIPBOARD_MS)).resolves.not.toThrow();
    expect(visibility.listeners).toBe(0);
  });

  it("tries again once the app is back in front when it could not look", async () => {
    const clipboard = fakeClipboard();
    clipboard.clearIfUnchanged.mockResolvedValueOnce(false).mockResolvedValueOnce(false);
    const visibility = fakeVisibility();
    await phraseCopier(clipboard, { whenVisible: visibility.whenVisible })(PHRASE);
    await vi.advanceTimersByTimeAsync(PHRASE_CLIPBOARD_MS);
    expect(clipboard.clearIfUnchanged).toHaveBeenCalledTimes(1);
    expect(visibility.listeners).toBe(1);

    // Back in front: a moment later it looks again; still no luck, so it keeps waiting.
    visibility.show();
    await vi.advanceTimersByTimeAsync(PHRASE_CLEAR_RETRY_MS);
    expect(clipboard.clearIfUnchanged).toHaveBeenCalledTimes(2);
    expect(visibility.listeners).toBe(1);

    // Two quick returns start one look, and this one can check: it stops listening.
    visibility.show();
    visibility.show();
    await vi.advanceTimersByTimeAsync(PHRASE_CLEAR_RETRY_MS);
    expect(clipboard.clearIfUnchanged).toHaveBeenCalledTimes(3);
    expect(clipboard.clearIfUnchanged).toHaveBeenLastCalledWith(PHRASE);
    expect(visibility.listeners).toBe(0);
  });

  it("drops a pending retry when the phrase is copied again", async () => {
    const clipboard = fakeClipboard();
    clipboard.clearIfUnchanged.mockResolvedValueOnce(false);
    const visibility = fakeVisibility();
    const copy = phraseCopier(clipboard, { whenVisible: visibility.whenVisible });
    await copy(PHRASE);
    await vi.advanceTimersByTimeAsync(PHRASE_CLIPBOARD_MS);
    expect(visibility.listeners).toBe(1);
    await copy(PHRASE);
    expect(visibility.listeners).toBe(0);
  });
});

describe("androidPhraseClipboard", () => {
  it("copies through the plugin, marked sensitive there, and clears through it", async () => {
    const plugin = {
      copySensitive: vi.fn(async () => {}),
      clearCopied: vi.fn(async () => ({ checked: true })),
    };
    const clipboard = androidPhraseClipboard(plugin);
    await clipboard.write(PHRASE);
    expect(await clipboard.clearIfUnchanged(PHRASE)).toBe(true);
    expect(plugin.copySensitive).toHaveBeenCalledWith({ text: PHRASE });
    expect(plugin.clearCopied).toHaveBeenCalledTimes(1);
  });

  it("says so when the app could not look at the clipboard", async () => {
    const plugin = {
      copySensitive: vi.fn(async () => {}),
      clearCopied: vi.fn(async () => ({ checked: false })),
    };
    expect(await androidPhraseClipboard(plugin).clearIfUnchanged(PHRASE)).toBe(false);
  });
});

describe("webPhraseClipboard", () => {
  function environment(options: { permission?: PermissionState; focused?: boolean; contents?: string } = {}) {
    let contents = options.contents ?? "";
    const env = {
      clipboard: {
        writeText: vi.fn(async (text: string) => {
          contents = text;
        }),
        readText: vi.fn(async () => contents),
      },
      permissions: options.permission
        ? { query: vi.fn(async () => ({ state: options.permission }) as PermissionStatus) }
        : undefined,
      window: new EventTarget(),
      document: Object.assign(new EventTarget(), { hasFocus: () => options.focused ?? true }),
    };
    return { env, contents: () => contents, setContents: (text: string) => (contents = text) };
  }

  it("with read access, clears only its own phrase", async () => {
    const own = environment({ permission: "granted" });
    const clipboard = webPhraseClipboard(own.env);
    await clipboard.write(PHRASE);
    await clipboard.clearIfUnchanged(PHRASE);
    expect(own.contents()).toBe("");

    const other = environment({ permission: "granted" });
    const second = webPhraseClipboard(other.env);
    await second.write(PHRASE);
    other.setContents("something else");
    await second.clearIfUnchanged(PHRASE);
    expect(other.contents()).toBe("something else");
  });

  it("without read access, clears when the page kept the focus and saw no copy", async () => {
    const { env, contents } = environment({ permission: "prompt" });
    const clipboard = webPhraseClipboard(env);
    await clipboard.write(PHRASE);
    await clipboard.clearIfUnchanged(PHRASE);
    expect(env.clipboard.readText).not.toHaveBeenCalled();
    expect(contents()).toBe("");
  });

  it("without read access, leaves the clipboard alone once the page lost the focus or saw a copy", async () => {
    for (const event of ["blur", "copy", "cut"] as const) {
      const { env, contents } = environment();
      const clipboard = webPhraseClipboard(env);
      await clipboard.write(PHRASE);
      (event === "blur" ? env.window : env.document).dispatchEvent(new Event(event));
      await clipboard.clearIfUnchanged(PHRASE);
      expect(contents(), event).toBe(PHRASE);
    }
  });

  it("without read access, leaves it alone when the page is not focused now", async () => {
    const { env, contents } = environment({ focused: false });
    const clipboard = webPhraseClipboard(env);
    await clipboard.write(PHRASE);
    await clipboard.clearIfUnchanged(PHRASE);
    expect(contents()).toBe(PHRASE);
  });
});
