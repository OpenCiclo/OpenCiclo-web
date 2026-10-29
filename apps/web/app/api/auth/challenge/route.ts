// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { getDb } from "@/lib/db";
import { issueChallenge } from "@/lib/server/auth-challenges";
import { jsonError } from "@/lib/server/env";
import { sourceKey, takeRateLimit, tooManyRequests } from "@/lib/server/rate-limit";

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
