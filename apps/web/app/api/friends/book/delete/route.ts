// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { getDb } from "@/lib/db";
import { requireAccount } from "@/lib/server/account";
import { deleteFriendBook, friendsUnavailable } from "@/lib/server/friends";
import { apiRoute } from "@/lib/server/http";

// Turns Friends off for this account. No body, and never refused to an
// outdated build (no rejectOutdatedClient): leaving must always work.
export const POST = apiRoute(async (request: Request) => {
  const unavailable = friendsUnavailable();
  if (unavailable) return unavailable;
  const { error, account } = await requireAccount(request);
  if (error || !account) return error;
  await deleteFriendBook(getDb(), account.id);
  return Response.json({ ok: true });
});
