// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import nodemailer from "nodemailer";
import { Resend } from "resend";

import { mailFrom } from "@/lib/server/env";
import { mailCopy } from "@/lib/locales/registry";
import { confirmationEmail, type MailLocale } from "@/lib/server/mailbox-email";

export function mailTransportConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() || process.env.SMTP_HOST?.trim());
}

/**
 * The mail provider refused a message. `code` is the provider's error name (for
 * Resend: `rate_limit_exceeded`, `daily_quota_exceeded`, `validation_error`…),
 * safe to log; the provider's message is dropped because it can quote the address.
 */
export class MailSendError extends Error {
  readonly code: string;
  constructor(code: unknown) {
    super("Mail send failed");
    this.name = "MailSendError";
    this.code = typeof code === "string" && /^[a-z0-9_]{1,48}$/i.test(code) ? code : "unknown";
  }
}

export async function sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
  const from = mailFrom();
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const resend = new Resend(resendKey);
    const result = await resend.emails.send({ from, to, subject, text, html });
    if (result.error) {
      throw new MailSendError(result.error.name);
    }
    return;
  }

  const host = process.env.SMTP_HOST?.trim();
  if (host) {
    const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
    const transporter = nodemailer.createTransport({
      host,
      port: Number.isFinite(port) ? port : 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
        : undefined,
    });
    await transporter.sendMail({ from, to, subject, text, html });
    return;
  }

  throw new Error("Mail is not configured");
}

export async function sendMailboxCode(to: string, code: string, locale: MailLocale): Promise<void> {
  const message = confirmationEmail(await mailCopy(locale), locale, code);
  await sendMail(to, message.subject, message.text, message.html);
}
