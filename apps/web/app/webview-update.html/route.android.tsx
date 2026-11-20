// The Android app's "update your WebView" page, exported as
// out-android/webview-update.html (the root layout's guard script sends an old
// WebView there; see lib/webview-update-page.ts). Android build only, and
// static: the one route handler with an .android.tsx name, because the page has
// no web twin and no request to answer.

import { LOCALES, type Locale } from "@/lib/i18n";
import { loadLocale } from "@/lib/locales/registry";
import { webviewUpdatePage, type WebViewPageCopy } from "@/lib/webview-update-page";

export const dynamic = "force-static";

export async function GET() {
  const copy = Object.fromEntries(
    await Promise.all(
      LOCALES.map(async (locale): Promise<[Locale, WebViewPageCopy]> => {
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
        ];
      }),
    ),
  ) as Record<Locale, WebViewPageCopy>;
  return new Response(webviewUpdatePage(copy), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
