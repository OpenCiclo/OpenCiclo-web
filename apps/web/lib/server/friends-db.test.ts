// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { eq, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import * as schema from "@/lib/db/schema";
import { inRolledBackTransaction, insertTestAccount, testDatabaseUrl } from "@/lib/db/test-db";
import { BOX_CIPHERTEXT_LENGTH } from "@/lib/friends/limits";
import { pruneEphemeralRows } from "@/lib/server/rate-limit";

import {
  boxExpiry,
  boxHash,
  deleteBoxes,
  deleteFriendBook,
  isSealedBox,
  putBox,
  readBoxes,
  readFriendBook,
  writeFriendBook,
} from "./friends";

// Against the local Postgres (DATABASE_URL; a remote host is refused), in a
// transaction that is always rolled back.

const ID = "1".repeat(64);
const TOKEN = "2".repeat(64);
const OTHER_TOKEN = "3".repeat(64);
const sealed = (letter: string) => ({ ciphertext: letter.repeat(BOX_CIPHERTEXT_LENGTH), nonce: "n".repeat(16) });
const NOW = new Date("2026-11-20T10:00:00Z");

describe.skipIf(!testDatabaseUrl)("friend books against Postgres", () => {
  it("creates once, then saves only on top of the version it read", async () => {
    await inRolledBackTransaction(async (db) => {
      const { id } = await insertTestAccount(db, "friends-book");
      expect(await readFriendBook(db, id)).toBeNull();
      expect(await writeFriendBook(db, id, { ciphertext: "a", nonce: "n" }, 0)).toEqual({ ok: true, version: 1 });
      // A second device creating at the same time gets the first book back.
      expect(await writeFriendBook(db, id, { ciphertext: "b", nonce: "n" }, 0)).toEqual({
        ok: false,
        current: { ciphertext: "a", nonce: "n", version: 1 },
      });
      expect(await writeFriendBook(db, id, { ciphertext: "c", nonce: "n" }, 1)).toEqual({ ok: true, version: 2 });
      expect(await writeFriendBook(db, id, { ciphertext: "d", nonce: "n" }, 1)).toMatchObject({ ok: false, current: { version: 2 } });
      await deleteFriendBook(db, id);
      expect(await writeFriendBook(db, id, { ciphertext: "e", nonce: "n" }, 2)).toEqual({ ok: false, current: null });
    });
  });

  it("goes with the account", async () => {
    await inRolledBackTransaction(async (db) => {
      const { id } = await insertTestAccount(db, "friends-cascade");
      await writeFriendBook(db, id, { ciphertext: "a", nonce: "n" }, 0);
      await db.delete(schema.accounts).where(eq(schema.accounts.id, id));
      expect(await readFriendBook(db, id)).toBeNull();
    });
  });

  it("refuses a book over the size cap", async () => {
    await inRolledBackTransaction(async (db) => {
      const { id } = await insertTestAccount(db, "friends-cap");
      await expect(writeFriendBook(db, id, { ciphertext: "a".repeat(43_713), nonce: "n" }, 0)).rejects.toThrow();
    });
  });
});

describe.skipIf(!testDatabaseUrl)("friend boxes against Postgres", () => {
  it("lets only the holder of the write token replace or delete a box", async () => {
    await inRolledBackTransaction(async (db) => {
      expect(await putBox(db, { id: ID, token: TOKEN, kind: "status", ...sealed("a") }, NOW)).toBe("written");
      expect(await putBox(db, { id: ID, token: OTHER_TOKEN, kind: "status", ...sealed("b") }, NOW)).toBe("conflict");
      expect(await readBoxes(db, [ID], NOW)).toEqual({ [ID]: sealed("a") });
      expect(await putBox(db, { id: ID, token: TOKEN, kind: "status", ...sealed("c") }, NOW)).toBe("written");
      expect(await readBoxes(db, [ID], NOW)).toEqual({ [ID]: sealed("c") });
      expect(await deleteBoxes(db, [{ id: ID, token: OTHER_TOKEN }])).toBe(0);
      expect(await deleteBoxes(db, [{ id: ID, token: TOKEN }])).toBe(1);
      expect(await readBoxes(db, [ID], NOW)).toEqual({});
    });
  });

  it("keeps a used handshake: a second person with the same link is refused", async () => {
    await inRolledBackTransaction(async (db) => {
      expect(await putBox(db, { id: ID, token: TOKEN, kind: "handshake", ...sealed("a") }, NOW)).toBe("written");
      // The first joiner retrying (same token) is fine; anyone else is not.
      expect(await putBox(db, { id: ID, token: TOKEN, kind: "handshake", ...sealed("a") }, NOW)).toBe("written");
      expect(await putBox(db, { id: ID, token: OTHER_TOKEN, kind: "handshake", ...sealed("z") }, NOW)).toBe("conflict");
    });
  });

  it("hides expired boxes, lets their address be taken again, and prunes them", async () => {
    await inRolledBackTransaction(async (db) => {
      await putBox(db, { id: ID, token: TOKEN, kind: "invite", ...sealed("a") }, NOW);
      const later = new Date(boxExpiry("invite", NOW).getTime() + 1000);
      expect(await readBoxes(db, [ID], later)).toEqual({});
      expect(await putBox(db, { id: ID, token: OTHER_TOKEN, kind: "invite", ...sealed("b") }, later)).toBe("written");
      await pruneEphemeralRows(db, new Date(later.getTime() + 60 * 24 * 60 * 60 * 1000));
      const left = await db.select().from(schema.friendBoxes).where(eq(schema.friendBoxes.boxHash, boxHash(ID)));
      expect(left).toEqual([]);
    });
  });

  it("stores hashes, never the id or the token, and no account", async () => {
    await inRolledBackTransaction(async (db) => {
      await putBox(db, { id: ID, token: TOKEN, kind: "status", ...sealed("a") }, NOW);
      const [row] = await db.select().from(schema.friendBoxes).where(eq(schema.friendBoxes.boxHash, boxHash(ID)));
      expect(row.writeHash).toBe(boxHash(TOKEN));
      expect(Object.values(row)).not.toContain(ID);
      expect(Object.values(row)).not.toContain(TOKEN);
      const columns = await db.execute<{ column_name: string }>(
        sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'friend_boxes'`,
      );
      expect(columns.map((column) => column.column_name).sort()).toEqual([
        "box_hash",
        "ciphertext",
        "expires_at",
        "nonce",
        "write_hash",
      ]);
    });
  });

  it("refuses a box of another length", async () => {
    await inRolledBackTransaction(async (db) => {
      await expect(
        putBox(db, { id: ID, token: TOKEN, kind: "status", ciphertext: "short", nonce: "n".repeat(16) }, NOW),
      ).rejects.toThrow();
    });
  });
});

describe("box rules", () => {
  it("round expiries up to a whole week", () => {
    const week = 7 * 24 * 60 * 60 * 1000;
    for (const kind of ["invite", "handshake", "status"] as const) {
      const expiry = boxExpiry(kind, NOW);
      expect(expiry.getTime() % week).toBe(0);
      expect(expiry.getTime()).toBeGreaterThan(NOW.getTime());
    }
    expect(boxExpiry("status", NOW).getTime() - NOW.getTime()).toBeGreaterThanOrEqual(45 * 24 * 60 * 60 * 1000);
  });

  it("take only boxes of the exact size", () => {
    expect(isSealedBox("A".repeat(BOX_CIPHERTEXT_LENGTH), "B".repeat(16))).toBe(true);
    expect(isSealedBox("A".repeat(BOX_CIPHERTEXT_LENGTH - 4), "B".repeat(16))).toBe(false);
    expect(isSealedBox("!".repeat(BOX_CIPHERTEXT_LENGTH), "B".repeat(16))).toBe(false);
  });
});
