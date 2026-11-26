// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { hexToBytes } from "@/lib/crypto/bytes";
import { openBook, sealBook, toBase64Url } from "@/lib/friends/crypto";
import { MAX_FRIENDS, MAX_PENDING_INVITES } from "@/lib/friends/limits";

import {
  addFriend,
  addInvite,
  liveInvites,
  FriendBookFullError,
  newFriendBook,
  NewerFriendBookError,
  parseFriendBook,
  publishesTo,
  removeFriend,
  setProfile,
  sharesWith,
  updateFriend,
  type FriendBook,
} from "./book";

const key = (byte: number) => toBase64Url(new Uint8Array(32).fill(byte));

// Shapes only (the parser checks lengths); real keys come from newExchangeKeys.
const invite = (byte: number) => ({ secret: key(byte), key: "P".repeat(184), pub: "Q".repeat(87) });

function friend(byte: number, selfId: string | null = null) {
  return { selfId, name: `F${byte}`, key: key(byte), role: "inviter" as const, state: "active" as const, since: "2026-09-30" };
}

describe("friend book", () => {
  it("keeps the pregnancy she shares, and reads anything else as none", () => {
    const book = setProfile(newFriendBook("Emma"), { pregnancy: "0123456789abcdef0123456789abcdef" });
    expect(parseFriendBook(JSON.parse(JSON.stringify(book))).pregnancy).toBe("0123456789abcdef0123456789abcdef");
    expect(newFriendBook("Emma").pregnancy).toBeNull();
    expect(setProfile(book, { pregnancy: null }).pregnancy).toBeNull();
    // A book saved before the field existed, or with a damaged value: not shared.
    const older: Record<string, unknown> = { ...book };
    delete older.pregnancy;
    expect(parseFriendBook(older).pregnancy).toBeNull();
    for (const value of [true, 7, "", "yes", { id: "0123456789abcdef" }]) {
      expect(parseFriendBook({ ...book, pregnancy: value }).pregnancy).toBeNull();
    }
  });

  it("survives sealing and parsing unchanged", async () => {
    let book = newFriendBook("  Emma ");
    book = addInvite(book, invite(9), "2026-09-30");
    book = addFriend(book, friend(1, "a".repeat(32)));
    book = setProfile(book, { note: { text: "sore", date: "2026-09-30" }, show: { day: false, expected: true } });
    expect(book.name).toBe("Emma");
    const sealingKey = hexToBytes("55".repeat(32));
    const opened = parseFriendBook(await openBook(sealingKey, await sealBook(sealingKey, book)));
    expect(opened).toEqual(book);
  });

  it("adds a friend once, and drops the invite it came from", () => {
    let book = addInvite(newFriendBook("Emma"), invite(9), "2026-09-30");
    book = addFriend(book, friend(1), key(9));
    const again = addFriend(book, friend(1), key(9));
    expect(again.friends).toHaveLength(1);
    expect(again.invites).toEqual([]);
  });

  it("lists only the invites a friend could still open, oldest first", () => {
    let book = addInvite(newFriendBook("Emma"), invite(1), "2026-09-20");
    book = addInvite(book, invite(2), "2026-09-24");
    book = addInvite(book, invite(3), "2026-09-30");
    expect(liveInvites(book, "2026-09-30").map((entry) => entry.secret)).toEqual(book.invites.slice(1).map((entry) => entry.secret));
    // Seven days old is already refused by the joiner.
    expect(liveInvites(book, "2026-10-01").map((entry) => entry.secret)).toEqual([book.invites[2].secret]);
    expect(liveInvites(book, "2026-10-07")).toEqual([]);
  });

  it("stops at its limits", () => {
    let book = newFriendBook("Emma");
    for (let i = 0; i < MAX_PENDING_INVITES; i += 1) book = addInvite(book, invite(100 + i), "2026-09-30");
    expect(() => addInvite(book, invite(200), "2026-09-30")).toThrow(FriendBookFullError);
    let full = newFriendBook("Emma");
    for (let i = 0; i < MAX_FRIENDS; i += 1) full = addFriend(full, friend(i + 1));
    expect(() => addFriend(full, friend(250))).toThrow(FriendBookFullError);
  });

  it("pauses one friend or everyone", () => {
    let book = addFriend(newFriendBook("Emma"), friend(1));
    const [entry] = book.friends;
    expect(sharesWith(book, entry)).toBe(true);
    book = updateFriend(book, entry.id, { paused: true });
    expect(sharesWith(book, book.friends[0])).toBe(false);
    book = setProfile(updateFriend(book, entry.id, { paused: false }), { pausedAll: true });
    expect(sharesWith(book, book.friends[0])).toBe(false);
    expect(removeFriend(book, entry.id).friends).toEqual([]);
  });

  it("keeps an ended friend, and publishes nothing to them", async () => {
    let book = addFriend(newFriendBook("Emma"), friend(1, "d".repeat(32)));
    book = updateFriend(book, book.friends[0].id, { state: "ended" });
    expect(publishesTo(book.friends[0])).toBe(false);
    const sealingKey = hexToBytes("66".repeat(32));
    expect(parseFriendBook(await openBook(sealingKey, await sealBook(sealingKey, book))).friends[0].state).toBe("ended");
  });

  it("refuses a book from a newer version, and a damaged one", () => {
    const book: FriendBook = newFriendBook("Emma");
    expect(() => parseFriendBook({ ...book, format: 2 })).toThrow(NewerFriendBookError);
    expect(() => parseFriendBook({ ...book, friends: [{ id: "x" }] })).toThrow("Damaged");
    expect(() => parseFriendBook("nope")).toThrow("Damaged");
  });
});
