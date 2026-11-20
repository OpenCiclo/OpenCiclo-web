// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from "vitest";

import {
  AccountNotFoundError,
  HttpError,
  SignInCancelledError,
  type PutVaultResult,
  type VaultBlob,
} from "@/lib/client/api";
import { UpdateRequiredError } from "@/lib/client/http";
import {
  RestoreGeneration,
  loadVaultWithSession,
  opensWithKey,
  restoreRetryDelay,
  retryAfterSignInOnce,
  saveWithMerge,
  shouldApplyRefresh,
  type LoadedVault,
} from "@/lib/client/vault-sync";
import { encryptAesGcm } from "@/lib/crypto/aes";
import { utf8ToBytes } from "@/lib/crypto/bytes";
import { createWallet } from "@/lib/crypto/wallet";
import { DIARY_SCHEMA_VERSION, emptyDiary, parseDiary, upsertDay, type DayLog, type Diary } from "@/lib/diary";

const BLOB: VaultBlob = { ciphertext: "c0ffee", nonce: "0a0b", schemaVersion: DIARY_SCHEMA_VERSION };

describe("loadVaultWithSession (start with a kept phrase)", () => {
  function deps(answers: Array<LoadedVault | Error>, options: { opens?: boolean; signIn?: () => Promise<unknown> } = {}) {
    const calls: string[] = [];
    let index = 0;
    return {
      calls,
      fetchVault: vi.fn(async () => {
        calls.push("vault");
        const answer = answers[Math.min(index, answers.length - 1)];
        index += 1;
        if (answer instanceof Error) throw answer;
        return answer;
      }),
      signIn: vi.fn(async () => {
        calls.push("sign-in");
        return options.signIn?.();
      }),
      opensWithKey: vi.fn(async () => options.opens ?? true),
    };
  }

  it("opens with the session cookie it has: one request, no sign-in", async () => {
    const d = deps([{ blob: BLOB, version: 4 }]);
    const result = await loadVaultWithSession(d);
    expect(result).toEqual({ vault: { blob: BLOB, version: 4 }, signedIn: false });
    expect(d.calls).toEqual(["vault"]);
  });

  it("signs in and asks again only when the host refuses the session (401)", async () => {
    const d = deps([new HttpError(401, "Not authenticated"), { blob: BLOB, version: 4 }]);
    const result = await loadVaultWithSession(d);
    expect(result.signedIn).toBe(true);
    expect(result.vault.version).toBe(4);
    expect(d.calls).toEqual(["vault", "sign-in", "vault"]);
  });

  it("signs in when the session's account is gone (404), so a deleted account reads as no account", async () => {
    const d = deps([new HttpError(404, "Account not found")], {
      signIn: async () => {
        throw new AccountNotFoundError();
      },
    });
    await expect(loadVaultWithSession(d)).rejects.toBeInstanceOf(AccountNotFoundError);
    expect(d.calls).toEqual(["vault", "sign-in"]);
  });

  it("signs in when the cookie's vault does not open with this key (another account's session)", async () => {
    const d = deps([{ blob: BLOB, version: 9 }], { opens: false });
    const result = await loadVaultWithSession(d);
    expect(result.signedIn).toBe(true);
    expect(d.calls).toEqual(["vault", "sign-in", "vault"]);
  });

  it("signs in when the vault has no blob: it says nothing about whose it is", async () => {
    const d = deps([{ blob: null, version: 0 }]);
    await loadVaultWithSession(d);
    expect(d.calls).toEqual(["vault", "sign-in", "vault"]);
    expect(d.opensWithKey).not.toHaveBeenCalled();
  });

  it.each([
    ["a network failure", new TypeError("Failed to fetch")],
    ["a host failure", new HttpError(503, "Unavailable")],
    ["a refused build", new UpdateRequiredError()],
  ])("throws %s as it came, without signing in (the phrase is kept)", async (_, failure) => {
    const d = deps([failure]);
    await expect(loadVaultWithSession(d)).rejects.toBe(failure);
    expect(d.signIn).not.toHaveBeenCalled();
  });

  it("throws when the vault fails again after the sign-in", async () => {
    const failure = new HttpError(500, "Boom");
    const d = deps([new HttpError(401, "Not authenticated"), failure]);
    await expect(loadVaultWithSession(d)).rejects.toBe(failure);
  });
});

describe("opensWithKey", () => {
  it("tells this key's vault from another account's", async () => {
    const mine = createWallet();
    const other = createWallet();
    const sealed = await encryptAesGcm(mine.aesKey, utf8ToBytes(JSON.stringify(emptyDiary("es"))));
    const blob = { ciphertext: sealed.ciphertext, nonce: sealed.nonce, schemaVersion: DIARY_SCHEMA_VERSION };
    await expect(opensWithKey(mine.aesKey, blob)).resolves.toBe(true);
    await expect(opensWithKey(other.aesKey, blob)).resolves.toBe(false);
  });
});

describe("retryAfterSignInOnce (a session that expired while the app was open)", () => {
  it("signs in once and runs the request again after a 401", async () => {
    const signIn = vi.fn(async () => undefined);
    const save = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new HttpError(401, "Not authenticated"))
      .mockResolvedValueOnce("saved");
    await expect(retryAfterSignInOnce(signIn)(save)).resolves.toBe("saved");
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("gives up on a second 401", async () => {
    const signIn = vi.fn(async () => undefined);
    const save = vi.fn(async () => {
      throw new HttpError(401, "Not authenticated");
    });
    await expect(retryAfterSignInOnce(signIn)(save)).rejects.toMatchObject({ status: 401 });
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("signs in at most once per wrapper, across requests", async () => {
    const signIn = vi.fn(async () => undefined);
    const withSession = retryAfterSignInOnce(signIn);
    const save = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new HttpError(401, "x"))
      .mockResolvedValueOnce("first")
      .mockRejectedValueOnce(new HttpError(401, "x"));
    await expect(withSession(save)).resolves.toBe("first");
    await expect(withSession(save)).rejects.toMatchObject({ status: 401 });
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it("never signs in for other failures", async () => {
    const signIn = vi.fn(async () => undefined);
    const failure = new HttpError(500, "Boom");
    await expect(
      retryAfterSignInOnce(signIn)(async () => {
        throw failure;
      }),
    ).rejects.toBe(failure);
    expect(signIn).not.toHaveBeenCalled();
  });

  it("reports a failed sign-in (the account was deleted elsewhere)", async () => {
    const save = vi.fn(async () => {
      throw new HttpError(401, "Not authenticated");
    });
    const signIn = async () => {
      throw new AccountNotFoundError();
    };
    await expect(retryAfterSignInOnce(signIn)(save)).rejects.toBeInstanceOf(AccountNotFoundError);
    expect(save).toHaveBeenCalledTimes(1);
  });
});

describe("shouldApplyRefresh (back to the front)", () => {
  const idle = { syncedVersion: 3, fetchedVersion: 4, savesPending: 0, overlayOpen: false };

  it("replaces the diary when the host has a newer version and nothing is being saved", () => {
    expect(shouldApplyRefresh(idle)).toBe(true);
  });

  it("leaves it alone when the version did not move, or went back (a stale answer)", () => {
    expect(shouldApplyRefresh({ ...idle, fetchedVersion: 3 })).toBe(false);
    expect(shouldApplyRefresh({ ...idle, fetchedVersion: 2 })).toBe(false);
  });

  it("waits while a save is queued or in flight: the 409 merge handles it", () => {
    expect(shouldApplyRefresh({ ...idle, savesPending: 1 })).toBe(false);
  });

  it("waits while a sheet or dialog is open (it may hold a draft)", () => {
    expect(shouldApplyRefresh({ ...idle, overlayOpen: true })).toBe(false);
  });

  it("never applies with nothing open", () => {
    expect(shouldApplyRefresh({ ...idle, syncedVersion: null })).toBe(false);
  });
});

describe("restoreRetryDelay", () => {
  it("waits longer each time, then stays at the longest delay", () => {
    const delays = [0, 1, 2, 3, 4, 5, 6, 50].map(restoreRetryDelay);
    for (let i = 1; i < 6; i += 1) expect(delays[i]).toBeGreaterThan(delays[i - 1]);
    expect(delays[6]).toBe(delays[5]);
    expect(delays[7]).toBe(delays[5]);
    expect(restoreRetryDelay(-1)).toBe(delays[0]);
  });
});

describe("saveWithMerge (the 409 loop)", () => {
  function log(partial: Partial<DayLog>): DayLog {
    return { symptoms: {}, ...partial };
  }

  // Blobs here are plain JSON: the loop never looks inside them.
  const seal = async (diary: Diary): Promise<VaultBlob> => ({
    ciphertext: JSON.stringify(diary),
    nonce: "n",
    schemaVersion: diary.schemaVersion,
  });
  const openRemote = async (blob: VaultBlob) => ({ diary: parseDiary(JSON.parse(blob.ciphertext)), newerJson: null });

  const base = parseDiary({ ...emptyDiary("es"), days: { "2026-09-01": log({ flow: "medium" }) } });

  it("saves on top of the synced version", async () => {
    const local = upsertDay(base, "2026-09-02", log({ flow: "light" }));
    const save = vi.fn(async (): Promise<PutVaultResult> => ({ ok: true, version: 6 }));
    const onSynced = vi.fn();
    const result = await saveWithMerge({ synced: { diary: base, version: 5 }, local, maxAttempts: 3, seal, save, openRemote, onSynced });
    expect(result).toMatchObject({ kind: "saved", version: 6 });
    expect(save).toHaveBeenCalledWith(expect.anything(), 5);
    expect(onSynced).toHaveBeenLastCalledWith({ diary: local, version: 6 });
  });

  it("merges another device's save (409) and saves again on its version", async () => {
    const remote = upsertDay(base, "2026-09-10", log({ note: "from the phone" }));
    const local = upsertDay(base, "2026-09-02", log({ flow: "light" }));
    const remoteBlob = await seal(remote);
    const save = vi
      .fn<(blob: VaultBlob, baseVersion: number) => Promise<PutVaultResult>>()
      .mockResolvedValueOnce({ ok: false, current: { ...remoteBlob, version: 6 } })
      .mockResolvedValueOnce({ ok: true, version: 7 });
    const onSynced = vi.fn();
    const result = await saveWithMerge({ synced: { diary: base, version: 5 }, local, maxAttempts: 3, seal, save, openRemote, onSynced });
    expect(save.mock.calls.map(([, baseVersion]) => baseVersion)).toEqual([5, 6]);
    if (result.kind !== "saved") throw new Error("expected a save");
    expect(result.diary.days["2026-09-02"]?.flow).toBe("light");
    expect(result.diary.days["2026-09-10"]?.note).toBe("from the phone");
    expect(onSynced).toHaveBeenNthCalledWith(1, { diary: remote, version: 6 });
    expect(onSynced).toHaveBeenLastCalledWith({ diary: result.diary, version: 7 });
  });

  it("does not bring back a day the other device deleted", async () => {
    const remote = parseDiary({ ...base, days: {}, periodStarts: [] });
    const local = upsertDay(base, "2026-09-02", log({ flow: "light" }));
    const save = vi
      .fn<(blob: VaultBlob, baseVersion: number) => Promise<PutVaultResult>>()
      .mockResolvedValueOnce({ ok: false, current: { ...(await seal(remote)), version: 6 } })
      .mockResolvedValueOnce({ ok: true, version: 7 });
    const result = await saveWithMerge({ synced: { diary: base, version: 5 }, local, maxAttempts: 3, seal, save, openRemote, onSynced: () => undefined });
    if (result.kind !== "saved") throw new Error("expected a save");
    expect(result.diary.days["2026-09-01"]).toBeUndefined();
    expect(result.diary.days["2026-09-02"]?.flow).toBe("light");
  });

  it("gives up after maxAttempts when the diary keeps changing elsewhere", async () => {
    let version = 5;
    const save = vi.fn(async (): Promise<PutVaultResult> => {
      version += 1;
      return { ok: false, current: { ...(await seal(base)), version } };
    });
    const onSynced = vi.fn();
    await expect(
      saveWithMerge({ synced: { diary: base, version: 5 }, local: base, maxAttempts: 3, seal, save, openRemote, onSynced }),
    ).rejects.toThrow("keeps changing");
    expect(save).toHaveBeenCalledTimes(3);
    // What it learned from the host is kept for the next save.
    expect(onSynced).toHaveBeenLastCalledWith({ diary: base, version: 8 });
  });

  it("returns a diary saved by a newer build unmerged, and saves nothing more", async () => {
    const save = vi.fn(async (): Promise<PutVaultResult> => ({ ok: false, current: { ...BLOB, version: 9 } }));
    const newer = { diary: base, newerJson: '{"schemaVersion":999}' };
    const result = await saveWithMerge({
      synced: { diary: base, version: 5 },
      local: base,
      maxAttempts: 3,
      seal,
      save,
      openRemote: async () => newer,
      onSynced: () => undefined,
    });
    expect(result).toEqual({ kind: "newer", diary: base, newerJson: newer.newerJson, version: 9 });
    expect(save).toHaveBeenCalledTimes(1);
  });
});

describe("RestoreGeneration (a retry never outlives a sign-out)", () => {
  function deferred<T = void>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((r) => {
      resolve = r;
    });
    return { promise, resolve };
  }

  // A retry like restoreStoredSession: waits for the host, then opens the diary unless cancelled.
  function fakeRestore(host: Promise<void>, opened: string[], name: string) {
    return async (isCancelled: () => boolean) => {
      await host;
      if (isCancelled()) return;
      opened.push(name);
    };
  }

  it("a late answer after a sign-out (cancel) never opens the old account", async () => {
    const generation = new RestoreGeneration();
    const host = deferred();
    const opened: string[] = [];
    const retry = generation.run(fakeRestore(host.promise, opened, "A"));
    generation.cancel(); // sign-out, Forget, a device diary, or another sign-in
    host.resolve();
    await retry;
    expect(opened).toEqual([]);
  });

  it("runs one retry per generation: the button and the timer share it", async () => {
    const generation = new RestoreGeneration();
    const host = deferred();
    const task = vi.fn(fakeRestore(host.promise, [], "A"));
    const first = generation.run(task);
    const second = generation.run(task);
    expect(second).toBe(first);
    host.resolve();
    await first;
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("a cancelled retry still in flight never blocks the next one", async () => {
    const generation = new RestoreGeneration();
    const stuck = deferred();
    const opened: string[] = [];
    const old = generation.run(fakeRestore(stuck.promise, opened, "A"));
    generation.cancel();
    await generation.run(fakeRestore(Promise.resolve(), opened, "B"));
    expect(opened).toEqual(["B"]);
    stuck.resolve();
    await old;
    expect(opened).toEqual(["B"]);
  });

  it("guards work started outside run (the start-up restore)", () => {
    const generation = new RestoreGeneration();
    const isCancelled = generation.guard();
    expect(isCancelled()).toBe(false);
    generation.cancel();
    expect(isCancelled()).toBe(true);
    expect(generation.guard()()).toBe(false);
  });

  it("a cancelled start never signs in, even after a 401", async () => {
    const signIn = vi.fn(async () => undefined);
    await expect(
      loadVaultWithSession({
        fetchVault: async () => {
          throw new HttpError(401, "Not authenticated");
        },
        signIn,
        opensWithKey: async () => true,
        isCancelled: () => true,
      }),
    ).rejects.toBeInstanceOf(SignInCancelledError);
    expect(signIn).not.toHaveBeenCalled();
  });
});

describe("retryAfterSignInOnce after the session ended", () => {
  it("never signs in for a session that is no longer open", async () => {
    const signIn = vi.fn(async () => undefined);
    const expired = new HttpError(401, "Not authenticated");
    await expect(
      retryAfterSignInOnce(signIn, () => false)(async () => {
        throw expired;
      }),
    ).rejects.toBe(expired);
    expect(signIn).not.toHaveBeenCalled();
  });

  it("does not run the request again when the session ended during the sign-in", async () => {
    let live = true;
    const signIn = vi.fn(async () => {
      live = false; // signed out while the sign-in was out
    });
    const save = vi.fn(async () => {
      throw new HttpError(401, "Not authenticated");
    });
    await expect(retryAfterSignInOnce(signIn, () => live)(save)).rejects.toBeInstanceOf(SignInCancelledError);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
