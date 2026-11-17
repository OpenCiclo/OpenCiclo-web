// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { Locale } from "@/lib/i18n";
import type { MailCopy } from "@/lib/mail-copy";

export type MailLocale = Locale;

export type ConfirmationEmail = {
  subject: string;
  text: string;
  html: string;
};

const ROSE = "#c45368";
const INK = "#3c3336";
const PAGE = "#f6f1f2";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function htmlFor(locale: MailLocale, code: string, intro: string, rest: string[]): string {
  const safeCode = escapeHtml(code);
  const lang = locale;
  const blocks = rest
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.5;color:${INK};">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="${lang}">
<body style="margin:0;padding:0;background:${PAGE};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;">
          <tr>
            <td style="padding:28px 32px 8px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="36" height="36" align="center" valign="middle" style="width:36px;height:36px;background:${ROSE};border-radius:18px;">
                    <div style="width:12px;height:12px;background:#fff7f8;border-radius:6px;font-size:0;line-height:0;">&nbsp;</div>
                  </td>
                  <td style="padding-left:12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1;color:${INK};">OpenCiclo</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.5;color:${INK};">${escapeHtml(intro)}</p>
              <p style="margin:20px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:36px;letter-spacing:6px;line-height:1.2;color:${ROSE};">${safeCode}</p>
              ${blocks}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** `copy` is the MailCopy of the chosen language (`mailCopy` in lib/locales/registry.ts). */
export function confirmationEmail(copy: MailCopy, locale: MailLocale, code: string): ConfirmationEmail {
  const [first = "", ...rest] = copy.paragraphs;
  const paragraphs = [first.replace("{code}", code), ...rest];
  // The HTML shows the code large under the first sentence, without its ": {code}" tail.
  const intro = first.replace(/[\s:：]*\{code\}[\s.]*$/, "");
  return {
    subject: copy.subject,
    text: ["OpenCiclo", "", ...paragraphs].join("\n\n"),
    html: htmlFor(locale, code, intro, rest),
  };
}
