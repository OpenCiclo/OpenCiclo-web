// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// POST /api/recovery/register with the database stubbed: an address another
// account holds must get the same answer, the same limits and the same writes
// as a new one. Only the mail differs, and nobody can see that.
const state = vi.hoisted(() => ({
  action: "start-pending" as "start-pending" | "reject-taken" | "update-wrap",
  buckets: [] as string[][],
  pending: [] as { accountId: string; lookup: string; kit: unknown; code: string }[],
  mails: [] as { to: string; code: string }[],
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (task: () => unknown) => void task(),
}));
vi.mock("@/lib/db", () => ({ getDb: () => ({}) }));
vi.mock("@/lib/server/account", () => ({
  requireAccount: async () => ({ error: null, account: { id: "attacker-account" } }),
}));
vi.mock("@/lib/server/mailbox", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/mailbox")>()),
  MAILBOX_PENDING_MIN_RESPONSE_MS: 0,
}));
vi.mock("@/lib/server/mailbox-store", () => ({
  findRegisterAction: async () => ({ action: state.action, verifiedAt: null }),
  startPendingMailbox: async (_db: unknown, args: (typeof state.pending)[number]) => {
    state.pending.push(args);
  },
}));
vi.mock("@/lib/server/rate-limit", () => ({
  GLOBAL_KEY: "global",
  limitKey: (kind: string) => `${kind}-key`,
  sourceKey: () => "ip-key",
  takeRateLimits: async (_db: unknown, hits: { bucket: string }[]) => {
    state.buckets.push(hits.map((hit) => hit.bucket));
    return true;
  },
  tooManyRequests: () => new Response(null, { status: 429 }),
}));
vi.mock("@/lib/server/mail", () => ({
  mailTransportConfigured: () => true,
  sendMailboxCode: async (to: string, code: string) => {
    state.mails.push({ to, code });
  },
}));

const { POST } = await import("@/app/api/recovery/register/route");

const kit = {
  wrappedSecret: "d3JhcHBlZA==",
  wrapNonce: "bm9uY2U=",
  wrapSalt: "c2FsdA==",
  wrapParams: { kdf: "pbkdf2-sha256", iterations: 600_000, hash: "SHA-256" },
};

// The code is random on every call; everything else must match.
function withoutCode(entry: (typeof state.pending)[number]) {
  return { accountId: entry.accountId, lookup: entry.lookup, kit: entry.kit };
}

async function register(email: string) {
  const response = await POST(
    new Request("http://localhost/api/recovery/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, locale: "en", ...kit }),
    }),
  );
  return { status: response.status, body: await response.json() };
}

describe("POST /api/recovery/register", () => {
  beforeAll(() => {
    vi.stubEnv("EMAIL_LOOKUP_SECRET", "test-email-lookup-secret");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });
  beforeEach(() => {
    state.buckets = [];
    state.pending = [];
    state.mails = [];
  });

  it("treats an address another account holds exactly like a new one, except for the mail", async () => {
    state.action = "reject-taken";
    const taken = await register("someone@example.test");
    const takenWrites = state.pending.map(withoutCode);
    const takenBuckets = state.buckets;
    expect(state.mails).toEqual([]);

    state.buckets = [];
    state.pending = [];
    state.action = "start-pending";
    const fresh = await register("someone@example.test");
    const freshWrites = state.pending.map(withoutCode);

    expect(taken).toEqual(fresh);
    expect(taken).toEqual({ status: 200, body: { pending: true } });
    expect(takenBuckets).toEqual(state.buckets);
    expect(state.buckets).toEqual([
      ["recovery-register", "code-send-account", "code-send-email", "code-send-email-day", "code-send-global"],
    ]);
    expect(takenWrites).toEqual(freshWrites);
    expect(freshWrites).toHaveLength(1);
    expect(state.mails).toEqual([{ to: "someone@example.test", code: state.pending[0].code }]);
  });

  it("refuses a body that is not JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/recovery/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "email=someone@example.test",
      }),
    );
    expect(response.status).toBe(400);
    expect(state.pending).toEqual([]);
  });
});
