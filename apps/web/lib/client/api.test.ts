// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";

import { NO_ACCOUNT_CODE, VAULT_CHANGED_CODE } from "@/lib/auth-codes";
import {
  AccountNotFoundError,
  HttpError,
  VaultChangedError,
  deleteAccount,
  loginWithWallet,
} from "@/lib/client/api";
import { createWallet } from "@/lib/crypto/wallet";

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
    await deleteAccount(7);
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/account?baseVersion=7");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });

  it("deletes unconditionally without a version", async () => {
    const fetchMock = stubDelete(Response.json({ ok: true }));
    await deleteAccount();
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/account");
  });

  it("counts an account that is already gone as deleted", async () => {
    stubDelete(Response.json({ error: "Account not found" }, { status: 404 }));
    await expect(deleteAccount(3)).resolves.toBeUndefined();
  });

  it("reports a vault another device changed", async () => {
    stubDelete(Response.json({ error: "Vault changed", code: VAULT_CHANGED_CODE }, { status: 409 }));
    await expect(deleteAccount(3)).rejects.toBeInstanceOf(VaultChangedError);
  });

  it("reports other refusals with their status", async () => {
    stubDelete(Response.json({ error: "Not authenticated" }, { status: 401 }));
    const failure = deleteAccount(3);
    await expect(failure).rejects.toBeInstanceOf(HttpError);
    await expect(failure).rejects.toMatchObject({ status: 401 });
  });
});
