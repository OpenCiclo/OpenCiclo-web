// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { sha256 } from "@noble/hashes/sha2.js";
import { describe, expect, it } from "vitest";

import { bytesToHex, utf8ToBytes } from "@/lib/crypto/bytes";
import { parseDiary } from "@/lib/diary";
import type { FriendsApi, SealedBook } from "@/lib/client/friends-api";
import type { Sealed } from "@/lib/friends/crypto";
import { BOX_CIPHERTEXT_LENGTH } from "@/lib/friends/limits";
import { readStatus } from "@/lib/friends/payload";

import {
  acceptInvite,
  createInvite,
  enableFriends,
  InviteNotFoundError,
  InviteUsedError,
  loadBook,
  OwnInviteError,
  publishStatus,
  readInvite,
  refreshFriends,
  removeFriendAndTell,
  revokeInvite,
  turnOffFriends,
  updateBook,
  type BookState,
  type FriendsSession,
} from "./friends-sync";
import { setProfile } from "@/lib/friends/book";

// An in-memory host with the same rules as lib/server/friends.ts: books are
// compare-and-set per account; boxes are keyed by SHA-256 of their id, and only
// the holder of the token they were created with may replace or delete them.
// It records everything it stores, to check that no plaintext ever reaches it.
class FakeHost {
  books = new Map<string, SealedBook>();
  boxes = new Map<string, Sealed & { writeHash: string }>();
  failNextBoxWrite = false;

  api(): FriendsApi {
    const hash = (value: string) => bytesToHex(sha256(utf8ToBytes(value)));
    return {
      getBook: async (account) => this.books.get(account) ?? null,
      putBook: async (sealed, baseVersion, account) => {
        const current = this.books.get(account) ?? null;
        if ((current?.version ?? 0) !== baseVersion) return { ok: false, current };
        const version = baseVersion + 1;
        this.books.set(account, { ...sealed, version });
        return { ok: true, version };
      },
      deleteBook: async (account) => {
        this.books.delete(account);
      },
      readBoxes: async (ids) => {
        const found: Record<string, Sealed> = {};
        for (const id of ids) {
          const box = this.boxes.get(hash(id));
          if (box) found[id] = { ciphertext: box.ciphertext, nonce: box.nonce };
        }
        return found;
      },
      putBox: async (box) => {
        if (this.failNextBoxWrite) {
          this.failNextBoxWrite = false;
          throw new TypeError("Network down");
        }
        expect(box.ciphertext).toHaveLength(BOX_CIPHERTEXT_LENGTH);
        const existing = this.boxes.get(hash(box.id));
        if (existing && existing.writeHash !== hash(box.token)) return "conflict";
        this.boxes.set(hash(box.id), { ciphertext: box.ciphertext, nonce: box.nonce, writeHash: hash(box.token) });
        return "written";
      },
      deleteBoxes: async (items) => {
        for (const item of items) {
          const existing = this.boxes.get(hash(item.id));
          if (existing?.writeHash === hash(item.token)) this.boxes.delete(hash(item.id));
        }
      },
    };
  }

  storedText(): string {
    return JSON.stringify([...this.books.values(), ...this.boxes.values()]);
  }
}

function session(host: FakeHost, account: string, keyByte: number): FriendsSession {
  return { api: host.api(), account, friendsKey: new Uint8Array(32).fill(keyByte) };
}

const DIARY = parseDiary({
  schemaVersion: 3,
  locale: "en",
  periodStarts: ["2026-08-26", "2026-09-23", "2026-10-21"],
  days: {
    "2026-08-26": { flow: "medium", symptoms: {} },
    "2026-09-23": { flow: "medium", symptoms: {} },
    "2026-10-21": { flow: "medium", symptoms: { cramps: "severe" }, note: "secret diary words" },
  },
});
const TODAY = "2026-11-01";

async function befriend(host: FakeHost) {
  const emma = session(host, "emma", 1);
  const ana = session(host, "ana", 2);
  let emmaState = await enableFriends(emma, "Emma");
  let anaState = await enableFriends(ana, "Ana");
  const invited = await createInvite(emma, emmaState, TODAY);
  emmaState = invited.state;
  const invite = await readInvite(ana, anaState, invited.secret);
  expect(invite.name).toBe("Emma");
  anaState = await acceptInvite(ana, anaState, invited.secret, invite, TODAY);
  await publishStatus(ana, anaState.book, DIARY, TODAY);
  const emmaSees = await refreshFriends(emma, emmaState, TODAY);
  emmaState = emmaSees.state;
  await publishStatus(emma, emmaState.book, DIARY, TODAY);
  const anaSees = await refreshFriends(ana, anaState, TODAY);
  anaState = anaSees.state;
  return { emma, ana, emmaState, anaState, emmaSees, anaSees, secret: invited.secret };
}

describe("friends handshake", () => {
  it("connects two people who then see each other's phase", async () => {
    const host = new FakeHost();
    const { emmaState, anaState, emmaSees, anaSees } = await befriend(host);
    expect(emmaSees.cards).toHaveLength(1);
    expect(emmaSees.cards[0].friend).toMatchObject({ name: "Ana", role: "inviter", state: "active" });
    expect(emmaState.book.invites).toEqual([]);
    expect(anaSees.cards[0].friend).toMatchObject({ name: "Emma", role: "joiner", state: "active" });
    expect(anaSees.cards[0].friend.handshake).toBeUndefined();
    expect(anaState.book.friends[0].key).toBe(emmaState.book.friends[0].key);
    const view = readStatus(anaSees.cards[0].status!, TODAY);
    expect(view).toMatchObject({ kind: "phase", source: "estimated" });
  });

  it("leaves the host nothing it can read", async () => {
    const host = new FakeHost();
    await befriend(host);
    const stored = host.storedText();
    for (const word of ["Emma", "Ana", "luteal", "follicular", "2026-10-21", "cramps", "secret diary words"]) {
      expect(stored).not.toContain(word);
    }
    // One book per person; the invite box is gone; two status boxes and the
    // used handshake (kept until it expires) remain.
    expect(host.books.size).toBe(2);
    expect(host.boxes.size).toBe(3);
  });

  it("refuses the same link for a second person", async () => {
    const host = new FakeHost();
    const { secret } = await befriend(host);
    const third = session(host, "third", 3);
    const state = await enableFriends(third, "Third");
    await expect(readInvite(third, state, secret)).rejects.toBeInstanceOf(InviteNotFoundError);
  });

  it("refuses a second person who read the invite before the first one's answer landed", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const ana = session(host, "ana", 2);
    const third = session(host, "third", 3);
    const invited = await createInvite(emma, await enableFriends(emma, "Emma"), TODAY);
    const anaState = await enableFriends(ana, "Ana");
    const thirdState = await enableFriends(third, "Third");
    const invite = await readInvite(third, thirdState, invited.secret);
    await acceptInvite(ana, anaState, invited.secret, await readInvite(ana, anaState, invited.secret), TODAY);
    await expect(acceptInvite(third, thirdState, invited.secret, invite, TODAY)).rejects.toBeInstanceOf(InviteUsedError);
    expect((await loadBook(third))?.book.friends).toEqual([]);
  });

  it("resumes an accept whose handshake write was lost, without using up the invite", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const ana = session(host, "ana", 2);
    let emmaState = await enableFriends(emma, "Emma");
    const invited = await createInvite(emma, emmaState, TODAY);
    emmaState = invited.state;
    let anaState = await enableFriends(ana, "Ana");
    const invite = await readInvite(ana, anaState, invited.secret);
    host.failNextBoxWrite = true;
    await expect(acceptInvite(ana, anaState, invited.secret, invite, TODAY)).rejects.toThrow("Network down");
    anaState = (await loadBook(ana))!;
    expect(anaState.book.friends[0]).toMatchObject({ state: "waiting" });
    // The next refresh writes the handshake again with the same R.
    anaState = (await refreshFriends(ana, anaState, TODAY)).state;
    const emmaSees = await refreshFriends(emma, emmaState, TODAY);
    expect(emmaSees.cards[0].friend.key).toBe(anaState.book.friends[0].key);
  });

  it("refuses your own invite", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const invited = await createInvite(emma, await enableFriends(emma, "Emma"), TODAY);
    await expect(readInvite(emma, invited.state, invited.secret)).rejects.toBeInstanceOf(OwnInviteError);
  });

  it("keeps one card when two people invited each other", async () => {
    const host = new FakeHost();
    const { emma, ana, emmaState, anaState } = await befriend(host);
    const second = await createInvite(ana, anaState, TODAY);
    let emmaNext = await acceptInvite(emma, emmaState, second.secret, await readInvite(emma, emmaState, second.secret), TODAY);
    await publishStatus(emma, emmaNext.book, DIARY, TODAY);
    const anaNext = (await refreshFriends(ana, second.state, TODAY)).state;
    await publishStatus(ana, anaNext.book, DIARY, TODAY);
    emmaNext = (await refreshFriends(emma, emmaNext, TODAY)).state;
    const anaFinal = (await refreshFriends(ana, anaNext, TODAY)).state;
    expect(emmaNext.book.friends).toHaveLength(1);
    expect(anaFinal.book.friends).toHaveLength(1);
    expect(emmaNext.book.friends[0].key).toBe(anaFinal.book.friends[0].key);
  });

  it("drops an invite nobody answered after a week, and can revoke one", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const invited = await createInvite(emma, await enableFriends(emma, "Emma"), "2026-11-01");
    const later = await refreshFriends(emma, invited.state, "2026-11-08");
    expect(later.state.book.invites).toEqual([]);
    const again = await createInvite(emma, later.state, "2026-11-08");
    const revoked = await revokeInvite(emma, again.state, again.state.book.invites[0].secret);
    expect(revoked.book.invites).toEqual([]);
    expect(host.boxes.size).toBe(0);
  });
});

describe("sharing choices", () => {
  it("pausing one friend sends them only 'paused'", async () => {
    const host = new FakeHost();
    const { emma, ana, emmaState, anaState } = await befriend(host);
    const paused = await updateBook(emma, emmaState, (book) => ({
      ...book,
      friends: book.friends.map((friend) => ({ ...friend, paused: true })),
    }));
    await publishStatus(emma, paused.book, DIARY, TODAY);
    const anaSees = await refreshFriends(ana, anaState, TODAY);
    expect(readStatus(anaSees.cards[0].status!, TODAY)).toEqual({ kind: "paused" });
  });

  it("removing a friend tells their device", async () => {
    const host = new FakeHost();
    const { emma, ana, emmaState, anaState } = await befriend(host);
    const left = await removeFriendAndTell(emma, emmaState, emmaState.book.friends[0].id, TODAY);
    expect(left.book.friends).toEqual([]);
    const anaSees = await refreshFriends(ana, anaState, TODAY);
    expect(readStatus(anaSees.cards[0].status!, TODAY)).toEqual({ kind: "ended" });
    expect(anaSees.cards[0].friend.name).toBe("Emma");
  });

  it("turning Friends off tells everyone and deletes the book", async () => {
    const host = new FakeHost();
    const { emma, ana, emmaState, anaState } = await befriend(host);
    const withInvite = await createInvite(emma, emmaState, TODAY);
    await turnOffFriends(emma, withInvite.state, TODAY);
    expect(await loadBook(emma)).toBeNull();
    const anaSees = await refreshFriends(ana, anaState, TODAY);
    expect(readStatus(anaSees.cards[0].status!, TODAY)).toEqual({ kind: "ended" });
  });

  it("applies a change again on top of what another device saved", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const first: BookState = await enableFriends(emma, "Emma");
    // Another device renames while this one still holds version 1.
    await updateBook(emma, first, (book) => setProfile(book, { name: "Em" }));
    const saved = await updateBook(emma, first, (book) => setProfile(book, { note: { text: "hi", date: TODAY } }));
    expect(saved.version).toBe(3);
    expect(saved.book).toMatchObject({ name: "Em", note: { text: "hi" } });
  });
});
