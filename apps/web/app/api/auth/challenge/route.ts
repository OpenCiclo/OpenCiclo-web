// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { getDb } from "@/lib/db";
import { issueChallenge } from "@/lib/server/auth-challenges";
import { jsonError } from "@/lib/server/env";
import { sourceKey, takeRateLimit, tooManyRequests } from "@/lib/server/rate-limit";

// Never refused for an outdated app build (no rejectOutdatedClient): signing in
// writes no diary data, and the session it leads to is what lets an old build
// still sign out and delete the account. The vault routes refuse the build.
export async function POST(request: Request) {
  const body = (await request.json()) as { pubkeyHash?: string };
  const pubkeyHash = body.pubkeyHash?.trim().toLowerCase();
  if (!pubkeyHash || !/^[0-9a-f]{64}$/.test(pubkeyHash)) {
    return jsonError("Invalid public key hash", 400);
  }
  const db = getDb();
  if (!(await takeRateLimit(db, "auth-challenge", sourceKey(request)))) {
    return tooManyRequests();
  }
  const { nonce, expiresAt } = await issueChallenge(db, pubkeyHash);
  return Response.json({ nonce, expiresAt: expiresAt.toISOString() });
}
