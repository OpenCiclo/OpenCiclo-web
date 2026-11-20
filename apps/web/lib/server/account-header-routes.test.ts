// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ACCOUNT_HEADER, ACCOUNT_MISMATCH_CODE } from "@/lib/auth-codes";

// The routes that change an account (and the Friends routes, which all name
// their account), with the real requireAccount and the
// database stubbed (C15): a request whose x-ciclo-account names another account
// than the session cookie's gets 409 account-mismatch before the account lookup,
// any rate limit, write, cookie change or mail. Without the header (builds from
// before it) and with the session's own account, they do what they always did.
const MINE = "a".repeat(64);
const OTHER = "b".repeat(64);

const state = vi.hoisted(() => ({
  session: null as { pubkeyHash: string } | null,
  accountExists: true,
  action: "start-pending" as "start-pending" | "reject-taken",
  lookups: 0,
  effects: [] as string[],
  buckets: [] as string[][],
  floorMs: 0,
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (task: () => unknown) => void task(),
}));
vi.mock("@/lib/server/session", () => ({
  readSession: async () => state.session,
  clearSessionCookie: async () => {
    state.effects.push("clear-cookie");
  },
}));
// requireAccount's lookup: select({ id }).from(accounts).where(…).limit(1).
vi.mock("@/lib/db", () => {
  const db = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            state.lookups += 1;
            return state.accountExists ? [{ id: "account-1" }] : [];
          },
        }),
      }),
    }),
  };
  return { getDb: () => db };
});
vi.mock("@/lib/server/account-activity", () => ({ recordAccountOpen: async () => undefined }));
vi.mock("@/lib/server/rate-limit", () => ({
  GLOBAL_KEY: "global",
  limitKey: (kind: string) => `${kind}-key`,
  sourceKey: () => "ip-key",
  takeRateLimit: async (_db: unknown, bucket: string) => {
    state.buckets.push([bucket]);
    return true;
  },
  takeRateLimits: async (_db: unknown, hits: { bucket: string }[]) => {
    state.buckets.push(hits.map((hit) => hit.bucket));
    return true;
  },
  tooManyRequests: () => new Response(null, { status: 429 }),
}));
vi.mock("@/lib/server/vault", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/vault")>()),
  writeVault: async () => {
    state.effects.push("write");
    return { ok: true, version: 4 };
  },
  deleteAccountRow: async () => {
    state.effects.push("delete");
    return "deleted";
  },
}));
// The minimum response time of a pending register, read on every request.
vi.mock("@/lib/server/mailbox", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/mailbox")>()),
  get MAILBOX_PENDING_MIN_RESPONSE_MS() {
    return state.floorMs;
  },
}));
vi.mock("@/lib/server/mailbox-store", () => ({
  findRegisterAction: async () => ({ action: state.action, verifiedAt: null }),
  startPendingMailbox: async () => {
    state.effects.push("pending");
  },
  confirmPendingMailbox: async () => {
    state.effects.push("confirm-claim");
    return "confirmed";
  },
}));
vi.mock("@/lib/features", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/features")>()),
  FRIENDS_AVAILABLE: true,
}));
vi.mock("@/lib/server/friends", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/friends")>()),
  readFriendBook: async () => {
    state.effects.push("book-read");
    return { ciphertext: "sealed", nonce: "n", version: 1 };
  },
  writeFriendBook: async () => {
    state.effects.push("book-write");
    return { ok: true, version: 2 };
  },
  deleteFriendBook: async () => {
    state.effects.push("book-delete");
  },
  putBox: async () => {
    state.effects.push("box-write");
    return "written";
  },
  readBoxes: async () => {
    state.effects.push("box-read");
    return {};
  },
  deleteBoxes: async () => {
    state.effects.push("box-delete");
    return 1;
  },
}));
vi.mock("@/lib/server/mail", () => ({
  mailTransportConfigured: () => true,
  sendMailboxCode: async () => {
    state.effects.push("mail");
  },
}));

const vaultRoute = await import("@/app/api/vault/route");
const accountRoute = await import("@/app/api/account/route");
const registerRoute = await import("@/app/api/recovery/register/route");
const confirmRoute = await import("@/app/api/recovery/confirm/route");
const friendBookRoute = await import("@/app/api/friends/book/route");
const friendBookDeleteRoute = await import("@/app/api/friends/book/delete/route");
const friendBoxesRoute = await import("@/app/api/friends/boxes/route");
const friendBoxesReadRoute = await import("@/app/api/friends/boxes/read/route");
const friendBoxesDeleteRoute = await import("@/app/api/friends/boxes/delete/route");

const BOX = {
  id: "1".repeat(64),
  token: "2".repeat(64),
  kind: "status",
  ciphertext: "A".repeat(2752),
  nonce: "B".repeat(16),
};

const kit = {
  wrappedSecret: "d3JhcHBlZA==",
  wrapNonce: "bm9uY2U=",
  wrapSalt: "c2FsdA==",
  wrapParams: { kdf: "pbkdf2-sha256", iterations: 600_000, hash: "SHA-256" },
};

function jsonRequest(path: string, method: string, body: unknown, headers: Record<string, string>) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

type Route = {
  name: string;
  send: (headers: Record<string, string>) => Promise<Response>;
  /** What the route does when it is allowed to. */
  effects: string[];
  buckets: string[][];
};

const ROUTES: Route[] = [
  {
    name: "PUT /api/vault",
    send: (headers) =>
      vaultRoute.PUT(
        jsonRequest("/api/vault", "PUT", { ciphertext: "sealed", nonce: "n", schemaVersion: 6, baseVersion: 3 }, headers),
      ),
    effects: ["write"],
    buckets: [["vault-write"]],
  },
  {
    name: "DELETE /api/account",
    send: (headers) =>
      accountRoute.DELETE(new Request("http://localhost/api/account?baseVersion=3", { method: "DELETE", headers })),
    effects: ["delete", "clear-cookie"],
    buckets: [],
  },
  {
    name: "POST /api/recovery/register",
    send: (headers) =>
      registerRoute.POST(
        jsonRequest("/api/recovery/register", "POST", { email: "someone@example.test", locale: "en", ...kit }, headers),
      ),
    effects: ["pending", "mail"],
    buckets: [["recovery-register", "code-send-account", "code-send-email", "code-send-email-day", "code-send-global"]],
  },
  {
    name: "POST /api/recovery/confirm",
    send: (headers) => confirmRoute.POST(jsonRequest("/api/recovery/confirm", "POST", { code: "123456" }, headers)),
    effects: ["confirm-claim"],
    buckets: [["recovery-confirm", "recovery-confirm-account"]],
  },
  {
    name: "GET /api/friends/book",
    send: (headers) => friendBookRoute.GET(new Request("http://localhost/api/friends/book", { headers })),
    effects: ["book-read"],
    buckets: [],
  },
  {
    name: "PUT /api/friends/book",
    send: (headers) =>
      friendBookRoute.PUT(
        jsonRequest("/api/friends/book", "PUT", { ciphertext: "c2VhbGVk", nonce: "B".repeat(16), baseVersion: 1 }, headers),
      ),
    effects: ["book-write"],
    buckets: [["friends-book-write"]],
  },
  {
    name: "POST /api/friends/book/delete",
    send: (headers) =>
      friendBookDeleteRoute.POST(new Request("http://localhost/api/friends/book/delete", { method: "POST", headers })),
    effects: ["book-delete"],
    buckets: [],
  },
  {
    name: "PUT /api/friends/boxes",
    send: (headers) => friendBoxesRoute.PUT(jsonRequest("/api/friends/boxes", "PUT", BOX, headers)),
    effects: ["box-write"],
    buckets: [["friends-box-write", "friends-box-write-global"]],
  },
  {
    name: "POST /api/friends/boxes/read",
    send: (headers) =>
      friendBoxesReadRoute.POST(jsonRequest("/api/friends/boxes/read", "POST", { ids: [BOX.id] }, headers)),
    effects: ["box-read"],
    buckets: [["friends-box-read"]],
  },
  {
    name: "POST /api/friends/boxes/delete",
    send: (headers) =>
      friendBoxesDeleteRoute.POST(
        jsonRequest("/api/friends/boxes/delete", "POST", { items: [{ id: BOX.id, token: BOX.token }] }, headers),
      ),
    effects: ["box-delete"],
    buckets: [],
  },
];

async function answer(route: Route, headers: Record<string, string>) {
  const response = await route.send(headers);
  return { status: response.status, body: await response.json() };
}

describe.each(ROUTES)("$name and the account it is for (x-ciclo-account)", (route) => {
  beforeAll(() => {
    vi.stubEnv("EMAIL_LOOKUP_SECRET", "test-email-lookup-secret");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });
  beforeEach(() => {
    state.session = { pubkeyHash: MINE };
    state.accountExists = true;
    state.action = "start-pending";
    state.lookups = 0;
    state.effects = [];
    state.buckets = [];
  });

  it("naming the session's account: does what it always did", async () => {
    const { status } = await answer(route, { [ACCOUNT_HEADER]: MINE });
    expect(status).toBe(200);
    expect(state.effects).toEqual(route.effects);
    expect(state.buckets).toEqual(route.buckets);
  });

  it("without the header (builds and tabs from before it): unchanged", async () => {
    const named = await answer(route, { [ACCOUNT_HEADER]: MINE });
    const namedEffects = state.effects;
    const namedBuckets = state.buckets;
    state.effects = [];
    state.buckets = [];
    expect(await answer(route, {})).toEqual(named);
    expect(state.effects).toEqual(namedEffects);
    expect(state.buckets).toEqual(namedBuckets);
  });

  it("naming another account: 409 account-mismatch before the lookup, any limit, write, cookie change or mail", async () => {
    const { status, body } = await answer(route, { [ACCOUNT_HEADER]: OTHER });
    expect(status).toBe(409);
    expect(body).toMatchObject({ code: ACCOUNT_MISMATCH_CODE });
    expect(state.lookups).toBe(0);
    expect(state.effects).toEqual([]);
    expect(state.buckets).toEqual([]);
  });

  it("no session is still 401, whatever the header names", async () => {
    state.session = null;
    expect((await answer(route, { [ACCOUNT_HEADER]: OTHER })).status).toBe(401);
    expect(state.effects).toEqual([]);
  });

  it("a cookie of an account deleted since: 409 when another is named (the app signs in again), 404 when it is named", async () => {
    state.accountExists = false;
    expect((await answer(route, { [ACCOUNT_HEADER]: OTHER })).status).toBe(409);
    expect((await answer(route, { [ACCOUNT_HEADER]: MINE })).status).toBe(404);
    expect(state.effects).toEqual([]);
  });
});

describe("POST /api/recovery/register, account mismatch and S1", () => {
  beforeAll(() => {
    vi.stubEnv("EMAIL_LOOKUP_SECRET", "test-email-lookup-secret");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
    state.floorMs = 0;
  });
  beforeEach(() => {
    state.session = { pubkeyHash: MINE };
    state.accountExists = true;
    state.effects = [];
    state.buckets = [];
    state.floorMs = 0;
  });

  async function register(email: string, headers: Record<string, string>) {
    const startedAt = Date.now();
    const response = await registerRoute.POST(
      jsonRequest("/api/recovery/register", "POST", { email, locale: "en", ...kit }, headers),
    );
    return { status: response.status, body: await response.json(), ms: Date.now() - startedAt };
  }

  it("answers for an address another account holds exactly as for a new one", async () => {
    state.action = "reject-taken";
    const taken = await register("taken@example.test", { [ACCOUNT_HEADER]: OTHER });
    state.action = "start-pending";
    const fresh = await register("new@example.test", { [ACCOUNT_HEADER]: OTHER });
    expect({ status: taken.status, body: taken.body }).toEqual({ status: fresh.status, body: fresh.body });
    expect(taken.status).toBe(409);
    expect(state.effects).toEqual([]);
    expect(state.buckets).toEqual([]);
  });

  it("answers a mismatch before the minimum response time, which the allowed path still waits", async () => {
    state.floorMs = 400;
    state.action = "start-pending";
    const refused = await register("new@example.test", { [ACCOUNT_HEADER]: OTHER });
    expect(refused.status).toBe(409);
    expect(refused.ms).toBeLessThan(300);
    const allowed = await register("new@example.test", { [ACCOUNT_HEADER]: MINE });
    expect(allowed.status).toBe(200);
    expect(allowed.ms).toBeGreaterThanOrEqual(380);
  });
});
