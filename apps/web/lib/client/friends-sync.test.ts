// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { sha256 } from "@noble/hashes/sha2.js";
import { describe, expect, it } from "vitest";

import { bytesToHex, utf8ToBytes } from "@/lib/crypto/bytes";
import { parseDiary } from "@/lib/diary";
import type { FriendsApi, SealedBook } from "@/lib/client/friends-api";
import {
  exchangeSecret,
  handshakeLocation,
  inviteAddress,
  keyFingerprint,
  newExchangeKeys,
  openBox,
  pairKey,
  sealBox,
  toBase64Url,
  type Sealed,
} from "@/lib/friends/crypto";
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
  publishFromLatest,
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

/** What anyone holding the link (S) can read from the handshake box. */
async function readHandshake(host: FakeHost, secret: Uint8Array): Promise<Record<string, unknown>> {
  const location = handshakeLocation(secret);
  const sealed = (await host.api().readBoxes([location.id], "anyone"))[location.id];
  return (await openBox(location.key, sealed)) as Record<string, unknown>;
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
  let emmaState = await enableFriends(emma, "EmmaQuokka");
  let anaState = await enableFriends(ana, "AnaPangolin");
  const invited = await createInvite(emma, emmaState, TODAY);
  emmaState = invited.state;
  const invite = await readInvite(ana, anaState, invited, TODAY);
  expect(invite.name).toBe("EmmaQuokka");
  anaState = await acceptInvite(ana, anaState, invited.secret, invite, TODAY);
  await publishStatus(ana, anaState.book, DIARY, TODAY);
  const emmaSees = await refreshFriends(emma, emmaState, TODAY);
  emmaState = emmaSees.state;
  await publishStatus(emma, emmaState.book, DIARY, TODAY);
  const anaSees = await refreshFriends(ana, anaState, TODAY);
  anaState = anaSees.state;
  return { emma, ana, emmaState, anaState, emmaSees, anaSees, secret: invited.secret, link: invited };
}

describe("friends handshake", () => {
  it("connects two people who then see each other's phase", async () => {
    const host = new FakeHost();
    const { emmaState, anaState, emmaSees, anaSees } = await befriend(host);
    expect(emmaSees.cards).toHaveLength(1);
    expect(emmaSees.cards[0].friend).toMatchObject({ name: "AnaPangolin", role: "inviter", state: "active" });
    expect(emmaState.book.invites).toEqual([]);
    expect(anaSees.cards[0].friend).toMatchObject({ name: "EmmaQuokka", role: "joiner", state: "active" });
    expect(anaSees.cards[0].friend.handshake).toBeUndefined();
    expect(anaState.book.friends[0].key).toBe(emmaState.book.friends[0].key);
    const view = readStatus(anaSees.cards[0].status!, TODAY);
    expect(view).toMatchObject({ kind: "phase", source: "estimated" });
  });

  it("leaves the host nothing it can read", async () => {
    const host = new FakeHost();
    await befriend(host);
    const stored = host.storedText();
    for (const word of ["EmmaQuokka", "AnaPangolin", "luteal", "follicular", "2026-10-21", "cramps", "secret diary words"]) {
      expect(stored).not.toContain(word);
    }
    // One book per person; the invite box is gone; two status boxes and the
    // used handshake (kept until it expires) remain.
    expect(host.books.size).toBe(2);
    expect(host.boxes.size).toBe(3);
  });

  it("refuses the same link for a second person", async () => {
    const host = new FakeHost();
    const { link } = await befriend(host);
    const third = session(host, "third", 3);
    const state = await enableFriends(third, "ThirdNarwhal");
    await expect(readInvite(third, state, link, TODAY)).rejects.toBeInstanceOf(InviteNotFoundError);
  });

  it("refuses a second person who read the invite before the first one's answer landed", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const ana = session(host, "ana", 2);
    const third = session(host, "third", 3);
    const invited = await createInvite(emma, await enableFriends(emma, "EmmaQuokka"), TODAY);
    const anaState = await enableFriends(ana, "AnaPangolin");
    const thirdState = await enableFriends(third, "ThirdNarwhal");
    const invite = await readInvite(third, thirdState, invited, TODAY);
    await acceptInvite(ana, anaState, invited.secret, await readInvite(ana, anaState, invited, TODAY), TODAY);
    await expect(acceptInvite(third, thirdState, invited.secret, invite, TODAY)).rejects.toBeInstanceOf(InviteUsedError);
    expect((await loadBook(third))?.book.friends).toEqual([]);
  });

  it("resumes an accept whose handshake write was lost, without using up the invite", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const ana = session(host, "ana", 2);
    let emmaState = await enableFriends(emma, "EmmaQuokka");
    const invited = await createInvite(emma, emmaState, TODAY);
    emmaState = invited.state;
    let anaState = await enableFriends(ana, "AnaPangolin");
    const invite = await readInvite(ana, anaState, invited, TODAY);
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
    const invited = await createInvite(emma, await enableFriends(emma, "EmmaQuokka"), TODAY);
    await expect(readInvite(emma, invited.state, invited, TODAY)).rejects.toBeInstanceOf(OwnInviteError);
  });

  it("keeps both cards when two people invited each other, and both work", async () => {
    const host = new FakeHost();
    const { emma, ana, emmaState, anaState } = await befriend(host);
    const second = await createInvite(ana, anaState, TODAY);
    let emmaNext = await acceptInvite(emma, emmaState, second.secret, await readInvite(emma, emmaState, second, TODAY), TODAY);
    await publishStatus(emma, emmaNext.book, DIARY, TODAY);
    const anaNext = (await refreshFriends(ana, second.state, TODAY)).state;
    await publishStatus(ana, anaNext.book, DIARY, TODAY);
    emmaNext = (await refreshFriends(emma, emmaNext, TODAY)).state;
    const anaFinal = (await refreshFriends(ana, anaNext, TODAY)).state;
    // Nothing is merged on an id the other side declares: each person can remove one.
    expect(emmaNext.book.friends.map((f) => f.state)).toEqual(["active", "active"]);
    expect(anaFinal.book.friends.map((f) => f.state)).toEqual(["active", "active"]);
    expect(emmaNext.book.friends.map((f) => f.key).sort()).toEqual(anaFinal.book.friends.map((f) => f.key).sort());
  });

  it("drops an invite nobody answered after a week, and can revoke one", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const invited = await createInvite(emma, await enableFriends(emma, "EmmaQuokka"), "2026-11-01");
    const later = await refreshFriends(emma, invited.state, "2026-11-08");
    expect(later.state.book.invites).toEqual([]);
    const again = await createInvite(emma, later.state, "2026-11-08");
    const revoked = await revokeInvite(emma, again.state, again.state.book.invites[0].secret);
    expect(revoked.book.invites).toEqual([]);
    expect(host.boxes.size).toBe(0);
  });
});

describe("what someone holding only the link can do", () => {
  it("opens the invite and the handshake but never reaches the pair's statuses", async () => {
    const host = new FakeHost();
    const { emmaState, secret } = await befriend(host);
    // Both boxes the link opens hold only public keys; neither holds a secret.
    const opened = await readHandshake(host, secret);
    expect(Object.keys(opened).sort()).toEqual(["at", "name", "pub", "selfId", "t", "v"]);
    // Pairing a fresh key with the joiner's public key gives a different pair key.
    const stranger = await newExchangeKeys();
    const guess = toBase64Url(pairKey(secret, await exchangeSecret(stranger.privateKey, (opened as { pub: string }).pub)));
    expect(guess).not.toBe(emmaState.book.friends[0].key);
  });
});

describe("what someone holding the link can write", () => {
  it("cannot replace the invite box: its write token needs the inviter's private key", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const invited = await createInvite(emma, await enableFriends(emma, "EmmaQuokka"), TODAY);
    const mallory = await newExchangeKeys();
    const swapped = inviteAddress(invited.secret, mallory.privateKey);
    const sealed = await sealBox(swapped.key, { t: "invite", v: 1, selfId: "f".repeat(32), name: "EmmaQuokka", at: TODAY, pub: mallory.publicKey });
    expect(await host.api().putBox({ id: swapped.id, token: swapped.token, kind: "invite", ...sealed }, "mallory")).toBe("conflict");
  });

  it("is refused when the invite box's key does not match the link's fingerprint", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const ana = session(host, "ana", 2);
    const invited = await createInvite(emma, await enableFriends(emma, "EmmaQuokka"), TODAY);
    const other = await newExchangeKeys();
    const anaState = await enableFriends(ana, "AnaPangolin");
    await expect(
      readInvite(ana, anaState, { secret: invited.secret, fingerprint: keyFingerprint(other.publicKey) }, TODAY),
    ).rejects.toBeInstanceOf(InviteNotFoundError);
  });
});

describe("invites answered late or seen late", () => {
  it("completes an answer given in time even when the inviter opens Ciclo after day 7", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const ana = session(host, "ana", 2);
    const invited = await createInvite(emma, await enableFriends(emma, "EmmaQuokka"), "2026-11-01");
    const anaState = await enableFriends(ana, "AnaPangolin");
    await acceptInvite(ana, anaState, invited.secret, await readInvite(ana, anaState, invited, "2026-11-03"), "2026-11-03");
    const emmaSees = await refreshFriends(emma, invited.state, "2026-11-12");
    expect(emmaSees.cards).toHaveLength(1);
    expect(emmaSees.cards[0].friend.state).toBe("active");
  });

  it("refuses an invite 7 days old or more, and tells a joiner who answered too late", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const ana = session(host, "ana", 2);
    const invited = await createInvite(emma, await enableFriends(emma, "EmmaQuokka"), "2026-11-01");
    let anaState = await enableFriends(ana, "AnaPangolin");
    const invite = await readInvite(ana, anaState, invited, "2026-11-02");
    await expect(readInvite(ana, anaState, invited, "2026-11-08")).rejects.toBeInstanceOf(InviteNotFoundError);
    // An answer written on day 9 (read earlier, accepted late) is refused by the inviter...
    anaState = await acceptInvite(ana, anaState, invited.secret, invite, "2026-11-10");
    const emmaSees = await refreshFriends(emma, invited.state, "2026-11-10");
    expect(emmaSees.cards).toEqual([]);
    expect(emmaSees.state.book.invites).toEqual([]);
    // ...and the joiner hears it ended, so it stops waiting.
    const anaSees = await refreshFriends(ana, anaState, "2026-11-10");
    expect(anaSees.cards[0].friend.state).toBe("ended");
  });
});

describe("devices with an old copy of the book", () => {
  it("repairs 'ended' after a publish from an old copy lands after a removal", async () => {
    const host = new FakeHost();
    const { emma, ana, emmaState, anaState } = await befriend(host);
    await removeFriendAndTell(emma, emmaState, emmaState.book.friends[0].id, TODAY);
    // Another tab still holds the old copy and publishes from it.
    await publishStatus(emma, emmaState.book, DIARY, TODAY);
    const anaSees = await refreshFriends(ana, anaState, TODAY);
    expect(readStatus(anaSees.cards[0].status!, TODAY)).toEqual({ kind: "ended" });
  });

  it("turning off from an old copy still tells a friend added on another device", async () => {
    const host = new FakeHost();
    const { emma, ana, emmaState, anaState } = await befriend(host);
    const staleCopy = emmaState;
    // A third person joins on another of Emma's devices.
    const cara = session(host, "cara", 3);
    const invited = await createInvite(emma, (await loadBook(emma))!, TODAY);
    let caraState = await enableFriends(cara, "CaraOcelot");
    caraState = await acceptInvite(cara, caraState, invited.secret, await readInvite(cara, caraState, invited, TODAY), TODAY);
    await publishStatus(cara, caraState.book, DIARY, TODAY);
    const emmaNow = (await refreshFriends(emma, invited.state, TODAY)).state;
    await publishStatus(emma, emmaNow.book, DIARY, TODAY);
    await turnOffFriends(emma, staleCopy, TODAY);
    expect(readStatus((await refreshFriends(cara, caraState, TODAY)).cards[0].status!, TODAY)).toEqual({ kind: "ended" });
    expect(readStatus((await refreshFriends(ana, anaState, TODAY)).cards[0].status!, TODAY)).toEqual({ kind: "ended" });
  });

  it("cannot undo a removal made on another device", async () => {
    const host = new FakeHost();
    const { emma, ana, emmaState, anaState } = await befriend(host);
    const staleCopy = emmaState;
    await removeFriendAndTell(emma, emmaState, emmaState.book.friends[0].id, TODAY);
    // The other device publishes from the host's book, which no longer lists Ana.
    await publishFromLatest(emma, DIARY, TODAY);
    expect(staleCopy.book.friends).toHaveLength(1);
    const anaSees = await refreshFriends(ana, anaState, TODAY);
    expect(readStatus(anaSees.cards[0].status!, TODAY)).toEqual({ kind: "ended" });
  });

  it("writes nothing once Friends was turned off elsewhere", async () => {
    const host = new FakeHost();
    const { emma, ana, emmaState, anaState } = await befriend(host);
    await turnOffFriends(emma, emmaState, TODAY);
    expect(await publishFromLatest(emma, DIARY, TODAY)).toBeNull();
    const anaSees = await refreshFriends(ana, anaState, TODAY);
    expect(readStatus(anaSees.cards[0].status!, TODAY)).toEqual({ kind: "ended" });
  });

  it("does not bring back an invite revoked elsewhere", async () => {
    const host = new FakeHost();
    const emma = session(host, "emma", 1);
    const invited = await createInvite(emma, await enableFriends(emma, "EmmaQuokka"), TODAY);
    const staleCopy = invited.state;
    await revokeInvite(emma, invited.state, invited.state.book.invites[0].secret);
    const after = await refreshFriends(emma, staleCopy, TODAY);
    expect(after.state.book.invites).toEqual([]);
    expect(host.boxes.size).toBe(0);
  });
});

describe("friends' messages", () => {
  it("ignores a status that names another person than the friend", async () => {
    const host = new FakeHost();
    const { emma, ana, emmaState, anaState } = await befriend(host);
    const impostor = { ...anaState.book, selfId: "e".repeat(32) };
    await publishStatus(ana, impostor, DIARY, TODAY);
    const emmaSees = await refreshFriends(emma, emmaState, TODAY);
    expect(emmaSees.cards[0].status).toBeNull();
    expect(emmaSees.cards[0].friend.selfId).toBe(anaState.book.selfId);
  });

  it("remembers that a friend ended it, after their box is gone", async () => {
    const host = new FakeHost();
    const { emma, ana, emmaState, anaState } = await befriend(host);
    await removeFriendAndTell(emma, emmaState, emmaState.book.friends[0].id, TODAY);
    const seen = await refreshFriends(ana, anaState, TODAY);
    expect(seen.state.book.friends[0].state).toBe("ended");
    host.boxes.clear();
    const later = await refreshFriends(ana, seen.state, TODAY);
    expect(later.cards[0]).toMatchObject({ friend: { state: "ended" }, status: null });
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
    expect(anaSees.cards[0].friend.name).toBe("EmmaQuokka");
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
    const first: BookState = await enableFriends(emma, "EmmaQuokka");
    // Another device renames while this one still holds version 1.
    await updateBook(emma, first, (book) => setProfile(book, { name: "EmQuokka" }));
    const saved = await updateBook(emma, first, (book) => setProfile(book, { note: { text: "hi", date: TODAY } }));
    expect(saved.version).toBe(3);
    expect(saved.book).toMatchObject({ name: "EmQuokka", note: { text: "hi" } });
  });
});
