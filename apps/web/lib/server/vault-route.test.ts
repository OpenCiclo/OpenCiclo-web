// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from "vitest";

// /api/vault with the database stubbed.
const state = vi.hoisted(() => ({
  session: { pubkeyHash: "a".repeat(64) } as { pubkeyHash: string } | null,
  writes: [] as unknown[],
  opens: [] as string[],
  afterTasks: [] as (() => unknown)[],
  limited: false,
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (task: () => unknown) => {
    state.afterTasks.push(task);
  },
}));
vi.mock("@/lib/db", () => ({ getDb: () => ({}) }));
vi.mock("@/lib/server/session", () => ({ readSession: async () => state.session }));
vi.mock("@/lib/server/account", () => ({
  requireAccount: async () =>
    state.session
      ? { error: null, account: { id: "account-1" } }
      : { error: Response.json({ error: "Not authenticated" }, { status: 401 }), account: null },
}));
vi.mock("@/lib/server/account-activity", () => ({
  recordAccountOpen: async (_db: unknown, pubkeyHash: string) => {
    state.opens.push(pubkeyHash);
  },
}));
vi.mock("@/lib/server/rate-limit", () => ({
  limitKey: (kind: string, value: string) => `${kind}:${value}`,
  takeRateLimit: async () => !state.limited,
  tooManyRequests: () => new Response(null, { status: 429 }),
}));
vi.mock("@/lib/server/vault", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/vault")>()),
  readVault: async (_db: unknown, pubkeyHash: string) =>
    pubkeyHash === "a".repeat(64)
      ? { id: "account-1", ciphertext: "sealed", nonce: "n", schemaVersion: 6, updatedAt: new Date(0), version: 3 }
      : null,
  writeVault: async (...args: unknown[]) => {
    state.writes.push(args);
    return { ok: true, version: 4 };
  },
}));

const { GET, PUT } = await import("@/app/api/vault/route");

function put(body: Record<string, unknown>) {
  return PUT(
    new Request("http://localhost/api/vault", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("/api/vault", () => {
  beforeEach(() => {
    state.session = { pubkeyHash: "a".repeat(64) };
    state.writes = [];
    state.opens = [];
    state.afterTasks = [];
    state.limited = false;
  });

  it("GET returns the blob and records the day's open after the response", async () => {
    const response = await GET(new Request("http://localhost/api/vault"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ciphertext: "sealed", version: 3 });
    expect(state.opens).toEqual([]);
    await Promise.all(state.afterTasks.map((task) => task()));
    expect(state.opens).toEqual(["a".repeat(64)]);
  });

  it("GET without a session is 401 and records nothing", async () => {
    state.session = null;
    expect((await GET(new Request("http://localhost/api/vault"))).status).toBe(401);
    expect(state.afterTasks).toEqual([]);
  });

  it("PUT without baseVersion is refused", async () => {
    const response = await put({ ciphertext: "sealed", nonce: "n", schemaVersion: 6 });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "baseVersion is required" });
    expect(state.writes).toEqual([]);
  });

  it("PUT with baseVersion saves", async () => {
    const response = await put({ ciphertext: "sealed", nonce: "n", schemaVersion: 6, baseVersion: 3 });
    expect(await response.json()).toEqual({ ok: true, version: 4 });
    expect(state.writes).toHaveLength(1);
  });

  it("PUT over the cap or the write budget is refused", async () => {
    const huge = await put({ ciphertext: "a".repeat(512 * 1024 + 1), nonce: "n", schemaVersion: 6, baseVersion: 3 });
    expect(huge.status).toBe(413);
    state.limited = true;
    const limited = await put({ ciphertext: "sealed", nonce: "n", schemaVersion: 6, baseVersion: 3 });
    expect(limited.status).toBe(429);
    expect(state.writes).toEqual([]);
  });
});
