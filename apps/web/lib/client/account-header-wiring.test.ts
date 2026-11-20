// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { isOpenSessionWallet } from "@/lib/client/vault-sync";

// C15: a request that changes an account names it (x-ciclo-account), and the
// name is always the wallet whose diary is open, whose key sealed the diary, and
// that a retry signs in with. The React wiring is read from the source, like the
// restore wiring in restore-session.test.ts.

describe("isOpenSessionWallet", () => {
  const mine = { pubkeyHash: "a".repeat(64) };
  const other = { pubkeyHash: "b".repeat(64) };

  it("is true only for the open wallet in the generation it opened in", () => {
    expect(isOpenSessionWallet({ gen: 3, wallet: mine }, 3, mine)).toBe(true);
    expect(isOpenSessionWallet({ gen: 3, wallet: mine }, 3, { pubkeyHash: mine.pubkeyHash })).toBe(true);
    expect(isOpenSessionWallet({ gen: 3, wallet: mine }, 3, other)).toBe(false);
    expect(isOpenSessionWallet({ gen: 3, wallet: mine }, 4, mine)).toBe(false);
    expect(isOpenSessionWallet(null, 3, mine)).toBe(false);
  });
});

describe("account header wiring in ciclo-context.tsx", () => {
  const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "ciclo-context.tsx"), "utf8");

  function body(start: string, length = 1500): string {
    const at = source.indexOf(start);
    expect(at, start).toBeGreaterThan(-1);
    return source.slice(at, at + length);
  }

  it("hydrate records the wallet whose diary opened, with its generation", () => {
    expect(body("const hydrate = useCallback(", 4000)).toMatch(
      /const gen = \(sessionGenRef\.current \+= 1\);\s+sessionWalletRef\.current = \{ gen, wallet: nextWallet \};/,
    );
  });

  it("saveMerged refuses any saver but the open wallet before it sends anything", () => {
    const saveMerged = body("const saveMerged = useCallback(");
    const guard = saveMerged.indexOf('if (!isOpenSessionWallet(sessionWalletRef.current, gen, saver)) throw new Error("Locked");');
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(saveMerged.indexOf("saveWithMerge("));
    expect(saveMerged).toContain("seal: (diary) => sealDiary(saver.aesKey, diary),");
    expect(saveMerged).toContain("withSession((account) => backend.save(blob, baseVersion, account))");
    expect(saveMerged).toContain("const withSession = sessionRetry(saver,");
  });

  it("sessionRetry names the wallet it signs in with", () => {
    const sessionRetry = body("function sessionRetry(");
    expect(sessionRetry).toContain("loginWithWallet(wallet, undefined, persist, { isLive })");
    expect(sessionRetry).toContain("retry(() => run(wallet.pubkeyHash))");
  });

  it("liveSessionRetry acts only for the open wallet", () => {
    const live = body("const liveSessionRetry = useCallback(");
    expect(live).toContain("isOpenSessionWallet(sessionWalletRef.current, gen, who)");
    expect(live).toContain('live() ? retry(run) : Promise.reject(new Error("Locked"))');
  });

  it("the move to the host saves into the wallet's own account", () => {
    expect(source).toContain("const saved = await hostedVault.save(sealed, remote.version, wallet.pubkeyHash);");
  });

  it("account deletes name the account of the retry's wallet", () => {
    expect(source).toContain("deleteHosted: (baseVersion) => deleteSession((account) => deleteAccount(account, baseVersion)),");
    expect(source).toContain("const deleteSession = sessionRetry(wallet,");
    expect(source).toContain("await liveSessionRetry(wallet)((account) => deleteAccount(account));");
  });

  it("recovery register and confirm name the account of the retry's wallet", () => {
    const calls = source.match(/(postRecoveryKit|confirmRecoveryCode)\([^)]*\)/g) ?? [];
    expect(calls.length).toBeGreaterThanOrEqual(7);
    for (const call of calls) expect(call, call).toMatch(/, account\)$/);
  });
});
