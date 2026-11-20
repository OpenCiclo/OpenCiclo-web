// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { LOCALES, type Locale } from "@/lib/i18n";
import { loadLocale } from "@/lib/locales/registry";
import { LOCALE_KEY } from "@/lib/client/storage-migrate";
import {
  MIN_WEBVIEW_VERSION,
  WEBVIEW_PLAY_URL,
  WEBVIEW_UPDATE_PATH,
  webviewGuardScript,
  webviewUpdatePage,
  type WebViewPageCopy,
} from "@/lib/webview-update-page";

// The same copy the route builds (app/webview-update.html/route.android.tsx).
async function copy(): Promise<Record<Locale, WebViewPageCopy>> {
  const entries = await Promise.all(
    LOCALES.map(async (locale) => {
      const { messages } = await loadLocale(locale);
      return [
        locale,
        {
          updateTitle: messages.webviewUpdateTitle,
          updateBody: messages.webviewUpdateBody,
          openStore: messages.updateOpenStore,
          errorBody: messages.errorGeneric,
          retry: messages.restoreRetry,
        },
      ] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<Locale, WebViewPageCopy>;
}

function inlineScript(html: string): string {
  const match = /<script>([\s\S]*)<\/script>/.exec(html);
  if (!match) throw new Error("no script");
  return match[1];
}

type Element = { textContent: string; href?: string; setAttribute(name: string, value: string): void };

function run(html: string, languages: string[], userAgent: string, stored: string | null = null) {
  const elements: Record<string, Element> = {};
  for (const id of ["title", "body", "action"]) {
    const element: Element = {
      textContent: "",
      href: id === "action" ? WEBVIEW_PLAY_URL : undefined,
      setAttribute(name, value) {
        if (name === "href") element.href = value;
      },
    };
    elements[id] = element;
  }
  const root = { lang: "en" };
  const localStorage = { getItem: (key: string) => (key === LOCALE_KEY ? stored : null) };
  new Function("navigator", "document", "localStorage", inlineScript(html))(
    { languages, language: languages[0], userAgent },
    { documentElement: root, getElementById: (id: string) => elements[id] },
    localStorage,
  );
  return { lang: root.lang, title: elements.title.textContent, body: elements.body.textContent, action: elements.action };
}

const OLD = "Mozilla/5.0 (Linux; Android 9; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.91 Mobile Safari/537.36";
const NEW = "Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.39 Mobile Safari/537.36";

/** Runs the layout's guard; returns where it sent the page, or null. */
function guard(userAgent: string | undefined): string | null {
  let target: string | null = null;
  new Function("navigator", "location", webviewGuardScript())(
    { userAgent },
    {
      replace: (url: string) => {
        target = url;
      },
    },
  );
  return target;
}

const CHROMIUM_OLD = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/110.0.5481.77 Chrome/110.0.5481.77 Safari/537.36";
const HUAWEI_NEW = "Mozilla/5.0 (Linux; Android 10; HarmonyOS; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 HuaweiBrowser/14.0 Mobile Safari/537.36";

describe("webviewGuardScript", () => {
  it("sends a WebView older than Chrome 111 to the update page", () => {
    expect(guard(OLD)).toBe(WEBVIEW_UPDATE_PATH);
    expect(guard(CHROMIUM_OLD)).toBe(WEBVIEW_UPDATE_PATH);
    expect(guard(OLD.replace("Chrome/90.", `Chrome/${MIN_WEBVIEW_VERSION - 1}.`))).toBe(WEBVIEW_UPDATE_PATH);
  });

  it("leaves a recent WebView, or one that names no Chrome version, alone", () => {
    expect(guard(NEW)).toBeNull();
    expect(guard(HUAWEI_NEW)).toBeNull();
    expect(guard(OLD.replace("Chrome/90.", `Chrome/${MIN_WEBVIEW_VERSION}.`))).toBeNull();
    expect(guard("Mozilla/5.0 (Linux; Android 7.0; wv) AppleWebKit/537.36")).toBeNull();
    expect(guard(undefined)).toBeNull();
  });

  it("is ES5", () => {
    expect(webviewGuardScript()).not.toMatch(/=>|\blet\b|\bconst\b|`|\?\?|\?\./);
  });

  it("is not undone by Capacitor's own WebView check", () => {
    // Below Android 8 Capacitor reads the Chrome / Android WebView package versions,
    // not the WebView in use, and errorPath would also replace the app on any load
    // error. The guard in the layout does this job (lib/webview-update-page.ts).
    const config = readFileSync(path.resolve(__dirname, "../../mobile/capacitor.config.ts"), "utf8");
    expect(config).not.toMatch(/^\s*(minWebViewVersion|errorPath)\s*:/m);
  });
});

describe("webviewUpdatePage", () => {
  it("prefers the language saved on this device", async () => {
    const all = await copy();
    const shown = run(webviewUpdatePage(all), ["fr-FR"], OLD, "eu");
    expect(shown.lang).toBe("eu");
    expect(shown.title).toBe(all.eu.updateTitle);
    expect(run(webviewUpdatePage(all), ["fr-FR"], OLD, "klingon").lang).toBe("fr");
  });

  it("never sends itself anywhere: an old WebView only gets the store link", async () => {
    const all = await copy();
    expect(inlineScript(webviewUpdatePage(all))).not.toMatch(/location\.(replace|assign|href)/);
    expect(run(webviewUpdatePage(all), ["en"], OLD).action.href).toBe(WEBVIEW_PLAY_URL);
  });

  it("asks an old WebView to update, in the device's language", async () => {
    const all = await copy();
    const shown = run(webviewUpdatePage(all), ["pt-PT", "en"], OLD);
    expect(shown.lang).toBe("pt-BR");
    expect(shown.title).toBe(all["pt-BR"].updateTitle);
    expect(shown.body).toBe(all["pt-BR"].updateBody);
    expect(shown.action.textContent).toBe(all["pt-BR"].openStore);
    expect(shown.action.href).toBe(WEBVIEW_PLAY_URL);
  });

  it("offers to try again on a recent WebView", async () => {
    const all = await copy();
    const shown = run(webviewUpdatePage(all), ["de-DE"], NEW);
    expect(shown.body).toBe(all.de.errorBody);
    expect(shown.action.textContent).toBe(all.de.retry);
    expect(shown.action.href).toBe("/");
  });

  it("works without the script, in English, and stays plain for old WebViews", async () => {
    const all = await copy();
    const html = webviewUpdatePage(all);
    expect(html).toContain(`<h1 id="title">${all.en.updateTitle}</h1>`);
    expect(html).not.toMatch(/oklch|color-mix|var\(--/);
    expect(inlineScript(html)).not.toMatch(/=>|\blet\b|\bconst\b|`|\?\?|\?\./);
    for (const locale of LOCALES) {
      expect(all[locale].updateTitle, locale).toBeTruthy();
      expect(all[locale].updateBody, locale).toBeTruthy();
    }
  });

  it("cannot be broken out of by its own copy", () => {
    const evil: WebViewPageCopy = {
      updateTitle: "</script><b>x</b>",
      updateBody: "a < b",
      openStore: "Store",
      errorBody: "e",
      retry: "r",
    };
    const all = Object.fromEntries(LOCALES.map((locale) => [locale, evil])) as Record<Locale, WebViewPageCopy>;
    const html = webviewUpdatePage(all);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).toContain("&lt;/script&gt;&lt;b&gt;x&lt;/b&gt;");
  });
});
