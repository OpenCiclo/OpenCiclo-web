// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { AccountNotFoundError } from "@/lib/client/api";
import { restoreKeptPhrase, type RestoreKeptPhraseSteps } from "@/lib/client/restore-session";
import type { UnlockStoreState } from "@/lib/client/storage-migrate";
import type { LoadedVault } from "@/lib/client/vault-sync";
import { createWallet, unlockWallet } from "@/lib/crypto/wallet";

const KEPT = createWallet().mnemonic;
const VAULT: LoadedVault = { blob: { ciphertext: "c0ffee", nonce: "0a0b", schemaVersion: 6 }, version: 3 };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Steps that record what reached the screen, in order. */
function steps(options: {
  kept?: Partial<UnlockStoreState>;
  load?: () => Promise<LoadedVault>;
  copy?: boolean;
  diaryOpen?: boolean;
  open?: () => Promise<void>;
}) {
  const shown: string[] = [];
  const result: RestoreKeptPhraseSteps = {
    readKept: async () => ({ mnemonic: KEPT, persist: true, persistCookie: true, ...options.kept }),
    clearKept: async () => {
      shown.push("cleared");
    },
    unlockWallet,
    diaryOpen: () => options.diaryOpen ?? false,
    guard: () => {
      shown.push("guard");
    },
    prepare: () => {
      shown.push("prepare");
    },
    load: () => options.load?.() ?? Promise.resolve(VAULT),
    open: async () => {
      await options.open?.();
      shown.push("open");
    },
    openCopy: async (_, isCancelled) => {
      if (!options.copy || isCancelled()) return false;
      shown.push("copy");
      return true;
    },
    showNoPhrase: async () => {
      shown.push("no-phrase");
    },
    showUnreadable: () => {
      shown.push("unreadable");
    },
    showFailed: (_, noAccount) => {
      shown.push(noAccount ? "no-account" : "failed");
    },
    startAnswerMs: 20,
  };
  return { shown, steps: result };
}

describe("restoreKeptPhrase (start with a kept phrase)", () => {
  it("guards the kept phrase before asking the host, then opens its diary", async () => {
    const { shown, steps: s } = steps({});
    await restoreKeptPhrase(s, () => false);
    expect(shown).toEqual(["guard", "prepare", "open"]);
  });

  it("shows the offline copy within the deadline when the host is silent, then the host's diary if it arrives", async () => {
    const host = deferred<LoadedVault>();
    const { shown, steps: s } = steps({ load: () => host.promise, copy: true });
    await restoreKeptPhrase(s, () => false);
    expect(shown).toEqual(["guard", "prepare", "copy"]);
    host.resolve(VAULT);
    await flush();
    expect(shown).toEqual(["guard", "prepare", "copy", "open"]);
  });

  it("shows Try again within the deadline without a copy (the web), and still opens a late answer", async () => {
    const host = deferred<LoadedVault>();
    const { shown, steps: s } = steps({ load: () => host.promise });
    await restoreKeptPhrase(s, () => false);
    expect(shown).toEqual(["guard", "prepare", "failed"]);
    host.resolve(VAULT);
    await flush();
    expect(shown.at(-1)).toBe("open");
  });

  it("never opens a late answer after a cancel (sign-out, Forget, a device diary)", async () => {
    const host = deferred<LoadedVault>();
    let cancelled = false;
    const { shown, steps: s } = steps({ load: () => host.promise, copy: true });
    await restoreKeptPhrase(s, () => cancelled);
    cancelled = true;
    host.resolve(VAULT);
    await flush();
    expect(shown).not.toContain("open");
  });

  it("a cancelled restore touches nothing, wherever the cancel lands", async () => {
    // Cancel while the kept phrase is read.
    let cancelled = false;
    const read = deferred<UnlockStoreState>();
    const first = steps({});
    first.steps.readKept = () => read.promise;
    const running = restoreKeptPhrase(first.steps, () => cancelled);
    cancelled = true;
    read.resolve({ mnemonic: KEPT, persist: true, persistCookie: true });
    await running;
    expect(first.shown).toEqual([]);

    // Cancel while the host is asked, which then fails.
    cancelled = false;
    const host = deferred<LoadedVault>();
    const second = steps({ load: () => host.promise, copy: true });
    const loading = restoreKeptPhrase({ ...second.steps, startAnswerMs: 1_000 }, () => cancelled);
    await flush();
    cancelled = true;
    host.reject(new TypeError("Failed to fetch"));
    await loading;
    expect(second.shown).toEqual(["guard", "prepare"]);

    // Cancel while the diary opens: whatever hydrate does it checks itself; nothing else runs after.
    cancelled = false;
    const third = steps({
      open: async () => {
        cancelled = true;
        throw new Error("cancelled mid-open");
      },
      copy: true,
    });
    await restoreKeptPhrase(third.steps, () => cancelled);
    expect(third.shown).toEqual(["guard", "prepare"]);
  });

  it("an unreadable kept phrase shows Try again, but leaves an open diary alone", async () => {
    const closed = steps({ kept: { mnemonic: null, unreadable: true } });
    await restoreKeptPhrase(closed.steps, () => false);
    expect(closed.shown).toEqual(["unreadable"]);
    const open = steps({ kept: { mnemonic: null, unreadable: true }, diaryOpen: true });
    await restoreKeptPhrase(open.steps, () => false);
    expect(open.shown).toEqual([]);
  });

  it("no kept phrase shows the start screen, unless a diary is open", async () => {
    const closed = steps({ kept: { mnemonic: null } });
    await restoreKeptPhrase(closed.steps, () => false);
    expect(closed.shown).toEqual(["no-phrase"]);
    const open = steps({ kept: { mnemonic: null }, diaryOpen: true });
    await restoreKeptPhrase(open.steps, () => false);
    expect(open.shown).toEqual([]);
  });

  it("forgets only a phrase that is not a phrase", async () => {
    const { shown, steps: s } = steps({ kept: { mnemonic: "not twelve words" } });
    await restoreKeptPhrase(s, () => false);
    expect(shown).toEqual(["cleared", "no-phrase"]);
  });

  it("never opens the copy when the host has no account", async () => {
    const { shown, steps: s } = steps({
      load: async () => {
        throw new AccountNotFoundError();
      },
      copy: true,
    });
    await restoreKeptPhrase(s, () => false);
    expect(shown).toEqual(["guard", "prepare", "no-account"]);
  });

  it("a failed retry while the copy is shown leaves it on screen", async () => {
    const { shown, steps: s } = steps({
      load: async () => {
        throw new TypeError("Failed to fetch");
      },
      diaryOpen: true,
    });
    await restoreKeptPhrase(s, () => false);
    expect(shown).toEqual(["guard", "prepare"]);
  });

  it("a late answer that lands while the copy is opening is not covered by the copy", async () => {
    const host = deferred<LoadedVault>();
    const { shown, steps: s } = steps({ load: () => host.promise });
    const copyGate = deferred<void>();
    s.openCopy = async (_, isCancelled) => {
      await copyGate.promise;
      if (isCancelled()) return true; // hydrate saw it was stale and set nothing
      shown.push("copy");
      return true;
    };
    const running = restoreKeptPhrase(s, () => false);
    await wait(40); // past the deadline: the copy starts opening
    host.resolve(VAULT);
    await flush();
    copyGate.resolve();
    await running;
    expect(shown).toEqual(["guard", "prepare", "open"]);
  });
});

describe("restore wiring in ciclo-context.tsx", () => {
  const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "ciclo-context.tsx"), "utf8");

  // Each of these must cancel a running restore (and its retry timer) before it
  // waits for anything, so a late answer can never open the old account.
  it.each([
    ["signOut", "signOut: async () => {"],
    ["Forget", "const forgetSavedSignIn = useCallback(async () => {"],
    ["createDeviceDiary", "const createDeviceDiary = useCallback("],
    ["wipe", "wipe: async () => {"],
  ])("%s cancels the restore before its first await", (_, start) => {
    const at = source.indexOf(start);
    expect(at, start).toBeGreaterThan(-1);
    const body = source.slice(at);
    const cancel = body.indexOf("cancelRestores();");
    const firstAwait = body.search(/\bawait\b/);
    expect(cancel, "cancelRestores()").toBeGreaterThan(-1);
    expect(cancel).toBeLessThan(firstAwait);
  });

  it("every restore and retry runs under the generation, and hydrate cancels it when opened another way", () => {
    expect(source).toContain("restoreGen.run((isCancelled) => restoreStoredSession(isCancelled))");
    expect(source).toContain("if (!options.fromRestore) cancelRestores();");
    expect(source).toMatch(/const startGuard = restoreGen\.guard\(\);/);
  });
});

