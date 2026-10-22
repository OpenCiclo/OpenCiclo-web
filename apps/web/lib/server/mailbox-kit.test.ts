// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { createWallet } from "@/lib/crypto/wallet";
import { wrapMnemonic } from "@/lib/crypto/wrap";
import { parseMailboxKit } from "@/lib/server/mailbox";

describe("parseMailboxKit", () => {
  it("accepts a kit made by the client", async () => {
    const kit = await wrapMnemonic(createWallet().mnemonic, "correct horse battery");
    expect(parseMailboxKit({ ...kit })).toEqual(kit);
  });

  it("rejects oversized or malformed fields", async () => {
    const kit = await wrapMnemonic(createWallet().mnemonic, "correct horse battery");
    expect(parseMailboxKit({ ...kit, wrappedSecret: "A".repeat(600) })).toBeNull();
    expect(parseMailboxKit({ ...kit, wrapNonce: "A".repeat(100) })).toBeNull();
    expect(parseMailboxKit({ ...kit, wrapSalt: "not base64!" })).toBeNull();
    expect(parseMailboxKit({ ...kit, wrappedSecret: "" })).toBeNull();
  });

  it("only accepts the PBKDF2-SHA-256 parameters the client uses", async () => {
    const kit = await wrapMnemonic(createWallet().mnemonic, "correct horse battery");
    expect(parseMailboxKit({ ...kit, wrapParams: { ...kit.wrapParams, iterations: 1 } })).toBeNull();
    expect(parseMailboxKit({ ...kit, wrapParams: { ...kit.wrapParams, hash: "SHA-1" } })).toBeNull();
    expect(parseMailboxKit({ ...kit, wrapParams: "pbkdf2" })).toBeNull();
    // Extra keys are dropped rather than stored.
    const parsed = parseMailboxKit({ ...kit, wrapParams: { ...kit.wrapParams, extra: "x".repeat(10_000) } });
    expect(parsed?.wrapParams).toEqual(kit.wrapParams);
  });
});
