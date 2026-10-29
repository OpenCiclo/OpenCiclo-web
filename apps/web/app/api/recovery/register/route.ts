// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, eq, gt, sql } from "drizzle-orm";
import { after } from "next/server";

import { mailboxPending, recoveryAttempts, recoveryMailboxes } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { requireAccount } from "@/lib/server/account";
import { emailLookup, hashIp, jsonError } from "@/lib/server/env";
import {
  generateMailboxCode,
  hashMailboxCode,
  MAILBOX_CODE_TTL_MS,
  MAILBOX_PENDING_MIN_RESPONSE_MS,
  MAILBOX_SEND_MAX_PER_HOUR,
  mailboxRegisterAction,
  parseMailboxEmail,
  parseMailboxKit,
  parseMailLocale,
} from "@/lib/server/mailbox";
import { clientIp, sourceKey, takeRateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { mailTransportConfigured, sendMailboxCode } from "@/lib/server/mail";

export async function POST(request: Request) {
  const startedAt = Date.now();
  const { error, account } = await requireAccount();
  if (error || !account) return error;

  const body = (await request.json()) as Record<string, unknown>;
  // Checked before any lookup, so the answer depends only on the input.
  const email = parseMailboxEmail(body.email);
  if (!email) {
    return jsonError("Invalid email", 400);
  }
  const kit = parseMailboxKit(body);
  if (!kit) {
    return jsonError("Incomplete kit", 400);
  }
  const { wrappedSecret, wrapNonce, wrapSalt, wrapParams } = kit;

  const lookup = emailLookup(email);
  const db = getDb();
  const existing = await db
    .select({
      accountId: recoveryMailboxes.accountId,
      verifiedAt: recoveryMailboxes.verifiedAt,
    })
    .from(recoveryMailboxes)
    .where(eq(recoveryMailboxes.emailLookup, lookup))
    .limit(1);
  const existingRow = existing[0] ?? null;
  const action = mailboxRegisterAction({
    existingMailbox: existingRow ? { accountId: existingRow.accountId } : null,
    accountId: account.id,
  });

  if (action === "update-wrap") {
    await db
      .update(recoveryMailboxes)
      .set({
        wrappedSecret,
        wrapNonce,
        wrapSalt,
        wrapParams,
        verifiedAt: existingRow?.verifiedAt ?? new Date(),
      })
      .where(
        and(eq(recoveryMailboxes.emailLookup, lookup), eq(recoveryMailboxes.accountId, account.id)),
      );
    return Response.json({ ok: true, pending: false });
  }

  // From here on, an email that belongs to another account and a new email
  // must look the same to the caller: same status codes, same rate limit,
  // and no faster answer for "taken" (a new email waits for the mail send).
  const respondPending = async () => {
    await sleepUntil(startedAt + MAILBOX_PENDING_MIN_RESPONSE_MS);
    return Response.json({ pending: true });
  };

  if (!mailTransportConfigured()) {
    return jsonError("Mail is not configured", 503);
  }

  // Per source, before we know which branch applies, so it treats taken and
  // new emails the same. Caps how many code mails one client can trigger.
  if (!(await takeRateLimit(db, "recovery-register", sourceKey(request)))) {
    return tooManyRequests();
  }

  const ip = clientIp(request);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(recoveryAttempts)
    .where(and(eq(recoveryAttempts.emailLookup, lookup), gt(recoveryAttempts.createdAt, hourAgo)));
  if ((recent[0]?.n ?? 0) >= MAILBOX_SEND_MAX_PER_HOUR) {
    return jsonError("Too many attempts", 429);
  }

  if (action === "reject-taken") {
    // Count the attempt like a real send, but never mail or touch the owner's mailbox.
    await db.insert(recoveryAttempts).values({ emailLookup: lookup, ipHash: hashIp(ip) });
    return respondPending();
  }

  const code = generateMailboxCode();
  const expiresAt = new Date(Date.now() + MAILBOX_CODE_TTL_MS);
  await db.delete(mailboxPending).where(eq(mailboxPending.emailLookup, lookup));
  await db.delete(mailboxPending).where(eq(mailboxPending.accountId, account.id));
  await db.insert(mailboxPending).values({
    emailLookup: lookup,
    accountId: account.id,
    wrappedSecret,
    wrapNonce,
    wrapSalt,
    wrapParams,
    codeHash: hashMailboxCode(code),
    expiresAt,
    attemptCount: 0,
  });
  await db.insert(recoveryAttempts).values({ emailLookup: lookup, ipHash: hashIp(ip) });

  // Send after the response: waiting for the mail provider would make a new
  // email slower to answer than a taken one. If sending fails, the person can
  // ask for a new code. Never log the address or the provider error.
  const locale = parseMailLocale(body.locale);
  after(async () => {
    try {
      await sendMailboxCode(email, code, locale);
    } catch {
      console.error("Mailbox code email failed to send");
    }
  });

  return respondPending();
}

function sleepUntil(deadline: number): Promise<void> {
  const wait = deadline - Date.now();
  return wait > 0 ? new Promise((resolve) => setTimeout(resolve, wait)) : Promise.resolve();
}
