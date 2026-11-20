// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";

import { ACCOUNT_HEADER, ACCOUNT_MISMATCH_CODE } from "@/lib/auth-codes";
import { AccountMismatchError, HttpError } from "@/lib/client/api";
import { UpdateRequiredError } from "@/lib/client/http";
import { UnsupportedKitError, type WrappedKit } from "@/lib/crypto/wrap";
import {
  InvalidConfirmError,
  InvalidCredentialsError,
  RateLimitedError,
  confirmRecoveryCode,
  fetchRemoteKit,
  maskEmail,
  normalizeEmail,
  openKit,
  postRecoveryKit,
} from "./kit-store";

describe("kit-store", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes email addresses", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("masks local mailbox labels for the confirmation screen", () => {
    expect(maskEmail("bob@example.com")).toBe("b***@example.com");
    expect(maskEmail("  Ada@OpenCiclo.com ")).toBe("a***@openciclo.com");
  });

  it("throws InvalidCredentialsError when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 404 })),
    );
    await expect(fetchRemoteKit("missing@example.com")).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("returns wrapped kit when fetch succeeds", async () => {
    const kit = {
      wrappedSecret: "abc",
      wrapNonce: "def",
      wrapSalt: "ghi",
      wrapParams: { kdf: "pbkdf2-sha256" as const, iterations: 600_000, hash: "SHA-256" as const },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(kit)),
    );
    await expect(fetchRemoteKit("user@example.com")).resolves.toEqual(kit);
  });

  it("reports a host failure as itself, never as a wrong password", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 503 })),
    );
    const failure = fetchRemoteKit("user@example.com");
    await expect(failure).rejects.toBeInstanceOf(HttpError);
    await expect(failure).rejects.not.toBeInstanceOf(InvalidCredentialsError);
  });

  it("has its own error for the rate limit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 429 })),
    );
    await expect(fetchRemoteKit("user@example.com")).rejects.toBeInstanceOf(RateLimitedError);
  });
});

describe("openKit", () => {
  const OLD: WrappedKit = {
    wrappedSecret: "old",
    wrapNonce: "n",
    wrapSalt: "s",
    wrapParams: { kdf: "pbkdf2-sha256", iterations: 600_000, hash: "SHA-256" },
  };
  const NEW: WrappedKit = { ...OLD, wrappedSecret: "new" };

  // A kit opens with the one password it was wrapped with.
  function deps(options: { cached?: WrappedKit | null; remote?: WrappedKit | Error; passwords?: Record<string, string> }) {
    const passwords = options.passwords ?? { old: "old password", new: "new password" };
    return {
      loadLocal: vi.fn(() => options.cached ?? null),
      fetchRemote: vi.fn(async () => {
        if (options.remote instanceof Error) throw options.remote;
        return options.remote ?? NEW;
      }),
      unwrap: vi.fn(async (kit: WrappedKit, password: string) => {
        if (kit.wrapParams.iterations > 3_000_000) throw new UnsupportedKitError();
        if (passwords[kit.wrappedSecret] !== password) throw new Error("OperationError");
        return "alpha beta gamma";
      }),
    };
  }

  it("opens the kit cached on this device without asking the host", async () => {
    const d = deps({ cached: OLD });
    await expect(openKit("A@example.com", "old password", d)).resolves.toEqual({ mnemonic: "alpha beta gamma", kit: OLD });
    expect(d.loadLocal).toHaveBeenCalledWith("a@example.com");
    expect(d.fetchRemote).not.toHaveBeenCalled();
  });

  it("asks the host when the cached kit does not open (password changed on another device)", async () => {
    const d = deps({ cached: OLD, remote: NEW });
    await expect(openKit("a@example.com", "new password", d)).resolves.toEqual({ mnemonic: "alpha beta gamma", kit: NEW });
    expect(d.fetchRemote).toHaveBeenCalledTimes(1);
  });

  it("is a wrong password only when the host's kit does not open either", async () => {
    await expect(openKit("a@example.com", "typo", deps({ cached: OLD }))).rejects.toBeInstanceOf(InvalidCredentialsError);
    await expect(openKit("a@example.com", "typo", deps({ cached: null }))).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("reports a network or host failure as itself", async () => {
    const offline = new TypeError("Failed to fetch");
    await expect(openKit("a@example.com", "typo", deps({ cached: OLD, remote: offline }))).rejects.toBe(offline);
    const down = new HttpError(500, "Boom");
    await expect(openKit("a@example.com", "x", deps({ cached: null, remote: down }))).rejects.toBe(down);
  });

  it("asks for an update for a kit this build cannot read", async () => {
    const newer: WrappedKit = { ...NEW, wrapParams: { ...NEW.wrapParams, iterations: 9_000_000 } };
    await expect(openKit("a@example.com", "new password", deps({ cached: null, remote: newer }))).rejects.toBeInstanceOf(
      UpdateRequiredError,
    );
  });
});

describe("recovery register and confirm name their account (x-ciclo-account, C15)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const ACCOUNT = "ab".repeat(32);
  const kit: WrappedKit = {
    wrappedSecret: "abc",
    wrapNonce: "def",
    wrapSalt: "ghi",
    wrapParams: { kdf: "pbkdf2-sha256", iterations: 600_000, hash: "SHA-256" },
  };
  const mismatch = () => Response.json({ error: "x", code: ACCOUNT_MISMATCH_CODE }, { status: 409 });

  function stub(response: () => Response) {
    const fetchMock = vi.fn<typeof fetch>(async () => response());
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("send the account with the request", async () => {
    const fetchMock = stub(() => Response.json({ pending: true }));
    await expect(postRecoveryKit("a@example.test", kit, "en", ACCOUNT)).resolves.toEqual({ pending: true });
    await confirmRecoveryCode("123456", ACCOUNT);
    for (const [, init] of fetchMock.mock.calls) {
      expect(new Headers(init?.headers).get(ACCOUNT_HEADER)).toBe(ACCOUNT);
      expect(new Headers(init?.headers).get("content-type")).toBe("application/json");
    }
  });

  it("report a session of another account as such (signs in again), never as a wrong code", async () => {
    stub(mismatch);
    await expect(postRecoveryKit("a@example.test", kit, "en", ACCOUNT)).rejects.toBeInstanceOf(AccountMismatchError);
    await expect(confirmRecoveryCode("123456", ACCOUNT)).rejects.toBeInstanceOf(AccountMismatchError);
  });

  it("keep their other answers", async () => {
    stub(() => Response.json({ error: "Could not confirm" }, { status: 400 }));
    await expect(confirmRecoveryCode("123456", ACCOUNT)).rejects.toBeInstanceOf(InvalidConfirmError);
    stub(() => Response.json({ error: "Not authenticated" }, { status: 401 }));
    await expect(confirmRecoveryCode("123456", ACCOUNT)).rejects.toMatchObject({ status: 401 });
    await expect(postRecoveryKit("a@example.test", kit, "en", ACCOUNT)).rejects.toMatchObject({ status: 401 });
    stub(() => new Response(null, { status: 429 }));
    await expect(postRecoveryKit("a@example.test", kit, "en", ACCOUNT)).rejects.toBeInstanceOf(RateLimitedError);
    // A 409 without the code is not taken for a session of another account.
    stub(() => Response.json({ error: "Conflict" }, { status: 409 }));
    await expect(postRecoveryKit("a@example.test", kit, "en", ACCOUNT)).rejects.not.toBeInstanceOf(AccountMismatchError);
  });
});
