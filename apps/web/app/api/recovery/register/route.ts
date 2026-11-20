// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, eq } from "drizzle-orm";
import { after } from "next/server";

import { recoveryMailboxes } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { requireAccount } from "@/lib/server/account";
import { emailLookup, jsonError } from "@/lib/server/env";
import { apiRoute, describeError, readJson } from "@/lib/server/http";
import {
  generateMailboxCode,
  MAILBOX_PENDING_MIN_RESPONSE_MS,
  parseMailboxEmail,
  parseMailboxKit,
  parseMailLocale,
} from "@/lib/server/mailbox";
import { findRegisterAction, startPendingMailbox } from "@/lib/server/mailbox-store";
import { GLOBAL_KEY, limitKey, sourceKey, takeRateLimits, tooManyRequests } from "@/lib/server/rate-limit";
import { mailTransportConfigured, sendMailboxCode } from "@/lib/server/mail";
import { rejectOutdatedClient } from "@/lib/server/client-version";

export const POST = apiRoute(async (request: Request) => {
  const outdated = rejectOutdatedClient(request);
  if (outdated) return outdated;
  const startedAt = Date.now();
  const { error, account } = await requireAccount(request);
  if (error || !account) return error;

  const parsed = await readJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;
  // Checked before any lookup, so the answer depends only on the input.
  const email = parseMailboxEmail(body.email);
  if (!email) {
    return jsonError("Invalid email", 400);
  }
  const kit = parseMailboxKit(body);
  if (!kit) {
    return jsonError("Incomplete kit", 400);
  }

  const lookup = emailLookup(email);
  const db = getDb();
  const { action, verifiedAt } = await findRegisterAction(db, lookup, account.id);

  if (action === "update-wrap") {
    await db
      .update(recoveryMailboxes)
      .set({ ...kit, verifiedAt: verifiedAt ?? new Date() })
      .where(
        and(eq(recoveryMailboxes.emailLookup, lookup), eq(recoveryMailboxes.accountId, account.id)),
      );
    return Response.json({ ok: true, pending: false });
  }

  // From here on, an email that belongs to another account and a new email
  // must look the same to the caller: same status codes, same rate limits, same
  // database writes (so /api/recovery/confirm behaves the same afterwards), and
  // no faster answer for "taken" (a new email waits for the mail send).
  if (!mailTransportConfigured()) {
    return jsonError("Mail is not configured", 503);
  }

  // Before we know which branch applies, so taken and new emails count the
  // same. Per IP, per account, per address (hour and day), and a host-wide
  // spend cap on code mails.
  const addressKey = limitKey("email", lookup);
  const allowed = await takeRateLimits(db, [
    { bucket: "recovery-register", keyHash: sourceKey(request) },
    { bucket: "code-send-account", keyHash: limitKey("account", account.id) },
    { bucket: "code-send-email", keyHash: addressKey },
    { bucket: "code-send-email-day", keyHash: addressKey },
    { bucket: "code-send-global", keyHash: GLOBAL_KEY },
  ]);
  if (!allowed) {
    return tooManyRequests();
  }

  // For a taken address the code is never sent: the placeholder row only makes
  // the account's pending state the same as after a real send.
  const code = generateMailboxCode();
  await startPendingMailbox(db, { accountId: account.id, lookup, kit, code });

  if (action === "start-pending") {
    // Send after the response: waiting for the mail provider would make a new
    // email slower to answer than a taken one. If sending fails, the person can
    // ask for a new code or use the phrase. Never log the address or the code.
    const locale = parseMailLocale(body.locale);
    after(async () => {
      try {
        await sendMailboxCode(email, code, locale);
      } catch (cause) {
        console.error(`Mailbox code email failed to send: ${describeError(cause)}`);
      }
    });
  }

  await sleepUntil(startedAt + MAILBOX_PENDING_MIN_RESPONSE_MS);
  return Response.json({ pending: true });
});

function sleepUntil(deadline: number): Promise<void> {
  const wait = deadline - Date.now();
  return wait > 0 ? new Promise((resolve) => setTimeout(resolve, wait)) : Promise.resolve();
}
