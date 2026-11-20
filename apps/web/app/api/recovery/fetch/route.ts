// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, eq, isNotNull } from "drizzle-orm";

import { recoveryMailboxes } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { emailLookup, jsonError } from "@/lib/server/env";
import { apiRoute, readJson } from "@/lib/server/http";
import { mailboxIsFetchable } from "@/lib/server/mailbox";
import { sourceKey, takeRateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { decoyKit } from "@/lib/server/recovery-decoy";
import { rejectOutdatedClient } from "@/lib/server/client-version";

export const POST = apiRoute(async (request: Request) => {
  const outdated = rejectOutdatedClient(request);
  if (outdated) return outdated;
  const parsed = await readJson(request);
  if (!parsed.ok) return parsed.response;
  const raw = parsed.body.email;
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!email.includes("@") || email.length > 320) {
    return jsonError("Invalid email", 400);
  }
  const lookup = emailLookup(email);
  const db = getDb();
  // Per source only, and the same for every email. There is no per-email
  // limit: anyone who knows an address could use it up and lock its owner out
  // of signing in on a new device, and it would not slow down an attacker
  // (guessing the password happens offline, on the downloaded kit).
  if (!(await takeRateLimit(db, "recovery-fetch", sourceKey(request)))) {
    return tooManyRequests();
  }

  const rows = await db
    .select({
      wrappedSecret: recoveryMailboxes.wrappedSecret,
      wrapNonce: recoveryMailboxes.wrapNonce,
      wrapSalt: recoveryMailboxes.wrapSalt,
      wrapParams: recoveryMailboxes.wrapParams,
      verifiedAt: recoveryMailboxes.verifiedAt,
    })
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
});
