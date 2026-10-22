// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, eq, gt, isNotNull, sql } from "drizzle-orm";

import { recoveryAttempts, recoveryMailboxes } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { emailLookup, hashIp, jsonError } from "@/lib/server/env";
import { mailboxIsFetchable } from "@/lib/server/mailbox";
import { clientIp, sourceKey, takeRateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { decoyKit } from "@/lib/server/recovery-decoy";

const MAX_PER_HOUR = 5;

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email.includes("@") || email.length > 320) {
    return jsonError("Invalid email", 400);
  }
  const lookup = emailLookup(email);
  const ip = clientIp(request);
  const db = getDb();
  // Per source, on top of the per-email limit below: stops one client from
  // collecting kits (or decoys) for many addresses. Same for every email.
  if (!(await takeRateLimit(db, "recovery-fetch", sourceKey(request)))) {
    return tooManyRequests();
  }
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(recoveryAttempts)
    .where(and(eq(recoveryAttempts.emailLookup, lookup), gt(recoveryAttempts.createdAt, hourAgo)));
  if ((recent[0]?.n ?? 0) >= MAX_PER_HOUR) {
    return jsonError("Too many attempts", 429);
  }
  await db.insert(recoveryAttempts).values({ emailLookup: lookup, ipHash: hashIp(ip) });

  const rows = await db
    .select()
    .from(recoveryMailboxes)
    .where(and(eq(recoveryMailboxes.emailLookup, lookup), isNotNull(recoveryMailboxes.verifiedAt)))
    .limit(1);
  const kit = rows[0];
  if (!kit || !mailboxIsFetchable(kit)) {
    // Same status and shape as a real kit, so the answer does not say whether
    // this email has an account. See lib/server/recovery-decoy.ts.
    return Response.json(await decoyKit(lookup));
  }
  return Response.json({
    wrappedSecret: kit.wrappedSecret,
    wrapNonce: kit.wrapNonce,
    wrapSalt: kit.wrapSalt,
    wrapParams: kit.wrapParams,
  });
}
