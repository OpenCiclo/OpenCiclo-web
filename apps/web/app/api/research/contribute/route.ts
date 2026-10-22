// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { eq } from "drizzle-orm";

import { researchContributions } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/server/env";
import { hashPoolContributorKey } from "@/lib/server/pool-key";
import { sourceKey, takeRateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { upsertPoolContribution } from "@/lib/server/research-pool";

function parseCycleLengths(raw: unknown): number[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length < 1 || raw.length > 200) return null;
  const cycleLengths: number[] = [];
  for (const value of raw) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 90) {
      return null;
    }
    cycleLengths.push(value);
  }
  return cycleLengths;
}

function parseContributorKey(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  return hashPoolContributorKey(raw);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { contributorKey?: unknown; cycleLengths?: unknown };
  const contributorKeyHash = parseContributorKey(body.contributorKey);
  if (!contributorKeyHash) {
    return jsonError("contributorKey must be a UUID", 400);
  }
  const cycleLengths = parseCycleLengths(body.cycleLengths);
  if (!cycleLengths) {
    return jsonError("Send between 1 and 200 cycle lengths (integers 1–90)", 400);
  }

  // A device uploads about once a month; this stops scripts from flooding the
  // pool with made-up contributor keys. The client retries later on 429.
  const db = getDb();
  if (!(await takeRateLimit(db, "pool-contribute", sourceKey(request)))) {
    return tooManyRequests();
  }
  await upsertPoolContribution(db, contributorKeyHash, cycleLengths);

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { contributorKey?: unknown };
  const contributorKeyHash = parseContributorKey(body.contributorKey);
  if (!contributorKeyHash) {
    return jsonError("contributorKey must be a UUID", 400);
  }

  const db = getDb();
  await db
    .delete(researchContributions)
    .where(eq(researchContributions.contributorKeyHash, contributorKeyHash));

  return Response.json({ ok: true });
}
