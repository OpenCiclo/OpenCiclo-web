// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";

import { ACCOUNT_HEADER, ACCOUNT_MISMATCH_CODE, NO_ACCOUNT_CODE, VAULT_CHANGED_CODE } from "@/lib/auth-codes";
import {
  AccountMismatchError,
  AccountNotFoundError,
  HttpError,
  MAX_HOSTED_VAULT_CIPHERTEXT_LENGTH,
  SignInCancelledError,
  VaultChangedError,
  VaultTooLargeError,
  authSettled,
  deleteAccount,
  loginWithWallet,
  logoutSession,
  putVault,
  retryPendingLogout,
  setLocalSessionCookieClearer,
} from "@/lib/client/api";
import { MAX_VAULT_CIPHERTEXT_LENGTH } from "@/lib/server/vault-limits";
import { retryAfterSignInOnce } from "@/lib/client/vault-sync";
import { createWallet } from "@/lib/crypto/wallet";

// The account a request names (x-ciclo-account): a wallet’s public-key hash.
const ACCOUNT = "ab".repeat(32);

/** Answers the challenge, then the verify request with `verify`. */
function stubHost(verify: Response) {
  const fetchMock = vi.fn<typeof fetch>(async (url) =>
    String(url).endsWith("/api/auth/challenge") ? Response.json({ nonce: "a1b2c3d4" }) : verify,
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("loginWithWallet", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws AccountNotFoundError when the host has no account for the phrase", async () => {
    stubHost(Response.json({ error: "No account for this key", code: NO_ACCOUNT_CODE }, { status: 404 }));
    await expect(loginWithWallet(createWallet())).rejects.toBeInstanceOf(AccountNotFoundError);
  });

  it("keeps other failures generic", async () => {
    stubHost(Response.json({ error: "Challenge expired" }, { status: 401 }));
    const failure = loginWithWallet(createWallet());
    await expect(failure).rejects.toThrow("Challenge expired");
    await expect(failure).rejects.not.toBeInstanceOf(AccountNotFoundError);
  });

  it("sends the first diary on sign-up and reports the account as created", async () => {
    const fetchMock = stubHost(Response.json({ ok: true, created: true }));
    const created = await loginWithWallet(createWallet(), { ciphertext: "00ff", nonce: "0a0b", schemaVersion: 6 });
    expect(created).toBe(true);
    const body = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(body).toMatchObject({ ciphertext: "00ff", nonceVault: "0a0b", schemaVersion: 6 });
  });
});

describe("deleteAccount", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubDelete(response: Response) {
    const fetchMock = vi.fn<typeof fetch>(async () => response);
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("asks to delete only at the version this device last saw", async () => {
    const fetchMock = stubDelete(Response.json({ ok: true }));
    await deleteAccount(ACCOUNT, 7);
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/account?baseVersion=7");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get(ACCOUNT_HEADER)).toBe(ACCOUNT);
  });

  it("deletes unconditionally without a version", async () => {
    const fetchMock = stubDelete(Response.json({ ok: true }));
    await deleteAccount(ACCOUNT);
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/account");
  });

  it("counts an account that is already gone as deleted", async () => {
    stubDelete(Response.json({ error: "Account not found" }, { status: 404 }));
    await expect(deleteAccount(ACCOUNT, 3)).resolves.toBeUndefined();
  });

  it("reports a vault another device changed", async () => {
    stubDelete(Response.json({ error: "Vault changed", code: VAULT_CHANGED_CODE }, { status: 409 }));
    await expect(deleteAccount(ACCOUNT, 3)).rejects.toBeInstanceOf(VaultChangedError);
  });

  it("reports a session of another account, never as deleted or as a changed vault", async () => {
    stubDelete(Response.json({ error: "x", code: ACCOUNT_MISMATCH_CODE }, { status: 409 }));
    const failure = deleteAccount(ACCOUNT, 3);
    await expect(failure).rejects.toBeInstanceOf(AccountMismatchError);
    await expect(failure).rejects.toMatchObject({ status: 409 });
  });

  it("reports other refusals with their status", async () => {
    stubDelete(Response.json({ error: "Not authenticated" }, { status: 401 }));
    const failure = deleteAccount(ACCOUNT, 3);
    await expect(failure).rejects.toBeInstanceOf(HttpError);
    await expect(failure).rejects.toMatchObject({ status: 401 });
  });
});

describe("logoutSession (sign-out works offline)", () => {
  function memoryStorage(): Storage {
    const data = new Map<string, string>();
    return {
      get length() {
        return data.size;
      },
      clear: () => data.clear(),
      getItem: (key) => data.get(key) ?? null,
      key: (index) => [...data.keys()][index] ?? null,
      removeItem: (key) => void data.delete(key),
      setItem: (key, value) => void data.set(String(key), String(value)),
    };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("never throws without a connection, and marks the cookie to clear later", async () => {
    const storage = memoryStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    await expect(logoutSession()).resolves.toBe(false);
    expect(storage.getItem("ciclo.logoutPending")).toBe("1");
  });

  it("clears the mark once the host is reached again", async () => {
    const storage = memoryStorage();
    storage.setItem("ciclo.logoutPending", "1");
    vi.stubGlobal("localStorage", storage);
    const fetchMock = vi.fn<typeof fetch>(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    await retryPendingLogout();
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/auth/logout");
    expect(storage.getItem("ciclo.logoutPending")).toBeNull();
  });

  it("does nothing when no sign-out is pending", async () => {
    vi.stubGlobal("localStorage", memoryStorage());
    const fetchMock = vi.fn<typeof fetch>(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    await retryPendingLogout();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("a later sign-in replaces the cookie, so the mark goes", async () => {
    const storage = memoryStorage();
    storage.setItem("ciclo.logoutPending", "1");
    vi.stubGlobal("localStorage", storage);
    stubHost(Response.json({ ok: true, created: false }));
    await loginWithWallet(createWallet());
    expect(storage.getItem("ciclo.logoutPending")).toBeNull();
  });
});

describe("sign-ins and sign-outs in order (L6, M2)", () => {
  function memoryStorage(): Storage {
    const data = new Map<string, string>();
    return {
      get length() {
        return data.size;
      },
      clear: () => data.clear(),
      getItem: (key) => data.get(key) ?? null,
      key: (index) => [...data.keys()][index] ?? null,
      removeItem: (key) => void data.delete(key),
      setItem: (key, value) => void data.set(String(key), String(value)),
    };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    setLocalSessionCookieClearer(null);
  });

  it("sends nothing for a session that already ended", async () => {
    const fetchMock = stubHost(Response.json({ ok: true }));
    await expect(loginWithWallet(createWallet(), undefined, true, { isLive: () => false })).rejects.toBeInstanceOf(
      SignInCancelledError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("marks the cookie of a sign-in whose session ended while it was out, and clears it", async () => {
    const storage = memoryStorage();
    vi.stubGlobal("localStorage", storage);
    let live = true;
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async (url) => {
        const path = String(url);
        calls.push(path);
        if (path.endsWith("/api/auth/challenge")) return Response.json({ nonce: "a1b2c3d4" });
        if (path.endsWith("/api/auth/verify")) {
          live = false; // signed out meanwhile
          return Response.json({ ok: true });
        }
        return Response.json({ ok: true });
      }),
    );
    await loginWithWallet(createWallet(), undefined, true, { isLive: () => live });
    await authSettled();
    expect(calls.at(-1)).toBe("/api/auth/logout");
    expect(storage.getItem("ciclo.logoutPending")).toBeNull();
  });

  it("never retries a pending sign-out while a sign-in is running", async () => {
    const storage = memoryStorage();
    storage.setItem("ciclo.logoutPending", "1");
    vi.stubGlobal("localStorage", storage);
    let releaseChallenge!: () => void;
    const challengeHeld = new Promise<void>((resolve) => {
      releaseChallenge = resolve;
    });
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async (url) => {
        const path = String(url);
        calls.push(path);
        if (path.endsWith("/api/auth/challenge")) {
          await challengeHeld;
          return Response.json({ nonce: "a1b2c3d4" });
        }
        return Response.json({ ok: true });
      }),
    );
    const signingIn = loginWithWallet(createWallet());
    await retryPendingLogout();
    releaseChallenge();
    await signingIn;
    await authSettled();
    expect(calls).not.toContain("/api/auth/logout");
    // The new session replaced the old cookie: nothing left to clear.
    expect(storage.getItem("ciclo.logoutPending")).toBeNull();
  });

  it("runs a sign-in asked for after a sign-out only once that sign-out finished", async () => {
    vi.stubGlobal("localStorage", memoryStorage());
    const order: string[] = [];
    let releaseLogout!: () => void;
    const logoutHeld = new Promise<void>((resolve) => {
      releaseLogout = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async (url) => {
        const path = String(url);
        if (path.endsWith("/api/auth/logout")) {
          await logoutHeld;
          order.push("logout");
          return Response.json({ ok: true });
        }
        order.push(path.endsWith("/challenge") ? "challenge" : "verify");
        return path.endsWith("/challenge") ? Response.json({ nonce: "a1b2c3d4" }) : Response.json({ ok: true });
      }),
    );
    const out = logoutSession();
    const signingIn = loginWithWallet(createWallet());
    releaseLogout();
    await Promise.all([out, signingIn]);
    expect(order).toEqual(["logout", "challenge", "verify"]);
  });

  it("Android: an offline sign-out clears the cookie in the app's own jar", async () => {
    const storage = memoryStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    const clear = vi.fn(async () => undefined);
    setLocalSessionCookieClearer(clear);
    await expect(logoutSession()).resolves.toBe(true);
    expect(clear).toHaveBeenCalledTimes(1);
    expect(storage.getItem("ciclo.logoutPending")).toBeNull();
  });
});

describe("vault size cap", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports a save over the host's cap (413) as VaultTooLargeError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ error: "Vault too large" }, { status: 413 })),
    );
    await expect(putVault({ ciphertext: "aa", nonce: "bb", schemaVersion: 6 }, 1, ACCOUNT)).rejects.toBeInstanceOf(
      VaultTooLargeError,
    );
  });

  it("never checks against a larger cap than the host's", () => {
    expect(MAX_HOSTED_VAULT_CIPHERTEXT_LENGTH).toBeLessThanOrEqual(MAX_VAULT_CIPHERTEXT_LENGTH);
  });
});

describe("the account a request is for (x-ciclo-account, C15)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const BLOB = { ciphertext: "aa", nonce: "bb", schemaVersion: 6 };

  // A host with one cookie slot, like the app's: verify sets it, and a request that
  // names another account than the cookie's gets 409 account-mismatch, unwritten.
  function fakeHost(options: { cookie: string | null; lateSignInFor?: string }) {
    const host = { cookie: options.cookie, calls: [] as string[], named: [] as (string | null)[], writes: [] as string[] };
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async (url, init) => {
        const path = String(url);
        host.calls.push(`${init?.method ?? "GET"} ${path}`);
        if (path.endsWith("/api/auth/challenge")) return Response.json({ nonce: "a1b2c3d4" });
        if (path.endsWith("/api/auth/verify")) {
          host.cookie = JSON.parse(String(init?.body)).pubkeyHash;
          // A sign-in for another account that timed out in the app lands right after.
          if (options.lateSignInFor) host.cookie = options.lateSignInFor;
          return Response.json({ ok: true, created: false });
        }
        const named = new Headers(init?.headers).get(ACCOUNT_HEADER);
        host.named.push(named);
        if (named !== null && named !== host.cookie) {
          return Response.json({ error: "x", code: ACCOUNT_MISMATCH_CODE }, { status: 409 });
        }
        host.writes.push(`${init?.method} ${path} into ${host.cookie}`);
        return path === "/api/vault" ? Response.json({ ok: true, version: 4 }) : Response.json({ ok: true });
      }),
    );
    return host;
  }

  it("a save names its account, and a vault conflict still comes back to merge", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({ error: "Vault changed", ...BLOB, version: 7 }, { status: 409 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(putVault(BLOB, 3, ACCOUNT)).resolves.toEqual({
      ok: false,
      current: { error: "Vault changed", ...BLOB, version: 7 },
    });
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get(ACCOUNT_HEADER)).toBe(ACCOUNT);
  });

  it("a save refused as another account's is never read as another device's save", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ error: "x", code: ACCOUNT_MISMATCH_CODE }, { status: 409 })),
    );
    await expect(putVault(BLOB, 3, ACCOUNT)).rejects.toBeInstanceOf(AccountMismatchError);
  });

  it("a 409 with no vault version is an error, not an empty diary to merge", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "Conflict" }, { status: 409 })));
    const failure = putVault(BLOB, 3, ACCOUNT);
    await expect(failure).rejects.toBeInstanceOf(HttpError);
    await expect(failure).rejects.not.toBeInstanceOf(AccountMismatchError);
  });

  it("a save meeting another account's cookie signs in with the wallet in memory and saves into its own account", async () => {
    const wallet = createWallet();
    const host = fakeHost({ cookie: "cd".repeat(32) });
    const withSession = retryAfterSignInOnce(() => loginWithWallet(wallet));
    await expect(withSession(() => putVault(BLOB, 3, wallet.pubkeyHash))).resolves.toEqual({ ok: true, version: 4 });
    expect(host.calls).toEqual(["PUT /api/vault", "POST /api/auth/challenge", "POST /api/auth/verify", "PUT /api/vault"]);
    expect(host.named).toEqual([wallet.pubkeyHash, wallet.pubkeyHash]);
    expect(host.writes).toEqual([`PUT /api/vault into ${wallet.pubkeyHash}`]);
  });

  it("still another account's after signing in again: fails once more and never writes", async () => {
    const wallet = createWallet();
    const other = "cd".repeat(32);
    const host = fakeHost({ cookie: other, lateSignInFor: other });
    const withSession = retryAfterSignInOnce(() => loginWithWallet(wallet));
    await expect(withSession(() => putVault(BLOB, 3, wallet.pubkeyHash))).rejects.toBeInstanceOf(AccountMismatchError);
    expect(host.calls.filter((call) => call === "PUT /api/vault")).toHaveLength(2);
    expect(host.writes).toEqual([]);
  });

  it("an account delete meeting another account's cookie deletes only the account it names", async () => {
    const wallet = createWallet();
    const host = fakeHost({ cookie: "cd".repeat(32) });
    await retryAfterSignInOnce(() => loginWithWallet(wallet))(() => deleteAccount(wallet.pubkeyHash));
    expect(host.writes).toEqual([`DELETE /api/account into ${wallet.pubkeyHash}`]);

    const stuck = fakeHost({ cookie: "cd".repeat(32), lateSignInFor: "cd".repeat(32) });
    await expect(
      retryAfterSignInOnce(() => loginWithWallet(wallet))(() => deleteAccount(wallet.pubkeyHash)),
    ).rejects.toBeInstanceOf(AccountMismatchError);
    expect(stuck.writes).toEqual([]);
  });
});
