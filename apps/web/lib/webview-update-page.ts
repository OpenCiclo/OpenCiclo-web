// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { FALLBACK_LOCALE, PICK_LOCALE_ES5 } from "@/lib/client/initial-locale";
import { LOCALE_KEY } from "@/lib/client/storage-migrate";
import type { Locale } from "@/lib/i18n";

// The Android app's "update your WebView" page, exported as
// out-android/webview-update.html by app/webview-update.html/route.android.tsx.
// The bundle needs Chrome 111 (oklch colours, Next 16's browser targets); on an
// older WebView it would stay blank. The Android root layout runs
// `webviewGuardScript()` before the bundle and sends such a WebView here. So the
// page is plain HTML, CSS without modern colour functions, and an ES5 script: it
// must work on the very WebView the app cannot run on.
//
// Not Capacitor's `android.minWebViewVersion` + `server.errorPath`: below Android 8
// Capacitor reads the version of the com.android.chrome / com.android.webview
// packages rather than the WebView actually in use (a disabled Chrome stuck at its
// factory version sends a phone with a recent WebView to the error page on every
// start), Huawei's WebView is compared against another setting, and `errorPath`
// also replaces the app on any page load error. The user agent names the engine
// that is really running.

export const MIN_WEBVIEW_VERSION = 111;

/** Where the guard sends an old WebView (a static file next to the app's pages). */
export const WEBVIEW_UPDATE_PATH = "/webview-update.html";

// ES5: the WebView's Chrome major version from its user agent, or null.
const CHROME_MAJOR_ES5 = `(function(){var m=/(?:Chrome|Chromium)\\/(\\d+)\\./.exec(navigator.userAgent||"");return m?parseInt(m[1],10):null;})()`;

/**
 * Inline script for the Android root layout, before the bundle: a WebView older
 * than Chrome 111 goes to the update page. One that names no Chrome version
 * stays (better a possible blank screen than a false alarm on every start).
 */
export function webviewGuardScript(): string {
  return `(function(){try{var major=${CHROME_MAJOR_ES5};if(major!==null&&major<${MIN_WEBVIEW_VERSION})location.replace(${JSON.stringify(WEBVIEW_UPDATE_PATH)});}catch(e){}})();`;
}

export const WEBVIEW_PLAY_URL = "https://play.google.com/store/apps/details?id=com.google.android.webview";

export type WebViewPageCopy = {
  /** Shown when the WebView is too old. */
  updateTitle: string;
  updateBody: string;
  openStore: string;
  /** Shown on a WebView recent enough for the app, with a way back to it. */
  errorBody: string;
  retry: string;
};

/** JSON safe to embed in an inline <script>. */
function scriptJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .split(String.fromCharCode(0x2028))
    .join("\\u2028")
    .split(String.fromCharCode(0x2029))
    .join("\\u2029");
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * The page in every language: English in the markup, and a script that picks
 * the language as the app does (the one saved on this device, else the
 * device's) and, on a WebView recent enough for the app, a plain "something
 * failed, try again" back to the app instead of the update request. It never
 * sends itself anywhere: the guard would bounce an old WebView straight back.
 */
export function webviewUpdatePage(copy: Record<Locale, WebViewPageCopy>): string {
  const fallback = copy[FALLBACK_LOCALE];
  const script = `(function(){try{var copy=${scriptJson(copy)};var pick=${PICK_LOCALE_ES5};var langs=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];var stored=null;try{stored=localStorage.getItem(${JSON.stringify(LOCALE_KEY)});}catch(e){}var lang=Object.prototype.hasOwnProperty.call(copy,stored)?stored:pick(langs,Object.keys(copy),${JSON.stringify(FALLBACK_LOCALE)});var text=copy[lang];var major=${CHROME_MAJOR_ES5};var recent=major!==null&&major>=${MIN_WEBVIEW_VERSION};document.documentElement.lang=lang;document.getElementById("title").textContent=recent?"Ciclo":text.updateTitle;document.getElementById("body").textContent=recent?text.errorBody:text.updateBody;var action=document.getElementById("action");action.textContent=recent?text.retry:text.openStore;if(recent)action.setAttribute("href","/");}catch(e){}})();`;
  return `<!doctype html>
<html lang="${FALLBACK_LOCALE}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
<title>Ciclo</title>
<style>
html,body{margin:0;height:100%}
body{display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;background:#f7f7f8;color:#2b2530;font-family:sans-serif;text-align:center}
main{max-width:22rem}
h1{font-size:1.4rem;margin:0 0 12px}
p{font-size:1rem;line-height:1.5;margin:0 0 24px}
a{display:inline-block;padding:12px 20px;border-radius:12px;background:#b4566e;color:#fff;text-decoration:none;font-weight:bold}
@media (prefers-color-scheme: dark){body{background:#1c1c1f;color:#efeaf0}a{background:#a14a57}}
</style>
</head>
<body>
<main>
<h1 id="title">${escapeHtml(fallback.updateTitle)}</h1>
<p id="body">${escapeHtml(fallback.updateBody)}</p>
<a id="action" href="${WEBVIEW_PLAY_URL}">${escapeHtml(fallback.openStore)}</a>
</main>
<script>${script}</script>
</body>
</html>
`;
}
