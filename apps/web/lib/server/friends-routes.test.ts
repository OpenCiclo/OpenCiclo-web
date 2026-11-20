// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from "vitest";

import { FRIENDS_AVAILABLE } from "@/lib/features";

// While Friends is not available every route answers 404 before reading the
// session or touching the database, so nothing can be stored.
const touched: string[] = [];
vi.mock("@/lib/server/session", () => ({
  readSession: async () => {
    touched.push("session");
    return { pubkeyHash: "a".repeat(64) };
  },
}));
vi.mock("@/lib/db", () => ({
  getDb: () => {
    touched.push("db");
    throw new Error("no database in this test");
  },
}));

const routes = {
  "GET /api/friends/book": async () => (await import("@/app/api/friends/book/route")).GET,
  "PUT /api/friends/book": async () => (await import("@/app/api/friends/book/route")).PUT,
  "POST /api/friends/book/delete": async () => (await import("@/app/api/friends/book/delete/route")).POST,
  "PUT /api/friends/boxes": async () => (await import("@/app/api/friends/boxes/route")).PUT,
  "POST /api/friends/boxes/read": async () => (await import("@/app/api/friends/boxes/read/route")).POST,
  "POST /api/friends/boxes/delete": async () => (await import("@/app/api/friends/boxes/delete/route")).POST,
};

describe.skipIf(FRIENDS_AVAILABLE)("the cleanup while Friends is off", () => {
  // Production may not have friend_boxes yet: the cleanup that rides on
  // rate-limited requests (sign-in, vault saves) must never touch it then.
  it("never deletes from friend_boxes", async () => {
    const { pruneEphemeralRows } = await import("@/lib/server/rate-limit");
    const { friendBoxes } = await import("@/lib/db/schema");
    const tables: unknown[] = [];
    const db = { delete: (table: unknown) => (tables.push(table), { where: async () => undefined }) };
    await pruneEphemeralRows(db as never);
    expect(tables.length).toBeGreaterThan(0);
    expect(tables).not.toContain(friendBoxes);
  });
});

describe.skipIf(FRIENDS_AVAILABLE)("Friends routes while the feature is off", () => {
  it.each(Object.entries(routes))("%s answers 404 and touches nothing", async (_name, load) => {
    touched.length = 0;
    const handler = await load();
    const response = await handler(
      new Request("http://localhost/api/friends", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      }),
    );
    expect(response.status).toBe(404);
    expect(touched).toEqual([]);
  });
});
