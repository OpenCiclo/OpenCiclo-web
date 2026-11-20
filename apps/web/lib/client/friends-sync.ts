// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Friends on the device: the invite handshake, reading friends' statuses and
// publishing this person's own, on top of a FriendsApi (lib/client/friends-api.ts).
// The keys and the message shapes are in lib/friends/*.
//
// Order matters wherever a crash or a lost answer could lose a key: the friend
// book is saved before any box that depends on it is written, and a box is
// deleted only after the book no longer needs it. Removing a friend or turning
// Friends off changes the book first, and every publish reads the book from the
// host first (publishFromLatest), so a device with an old copy never writes
// over an "ended" or "paused".
//
//   Inviter                                   Joiner
//   1. book += invite (S, key pair A);
//      write invite box (name, A's public half)
//                                             2. read invite box (shows the name)
//                                             3. make key pair B; K = HKDF(S ‖ ECDH(B, A));
//                                                book += friend (waiting, K, S, B's
//                                                public half); write handshake box
//                                                (name, B's public half); publish
//   4. refresh: handshake found → K = HKDF(S ‖ ECDH(A, B));
//      book += friend (active), invite (and A)
//      dropped; delete the invite box; publish
//                                             5. refresh: inviter's status found →
//                                                friend active

import type { Diary } from "@/lib/diary";
import type { FriendsApi, SealedBook } from "@/lib/client/friends-api";
import {
  addFriend,
  addInvite,
  dropDuplicates,
  FriendBookFullError,
  newFriendBook,
  parseFriendBook,
  publishesTo,
  removeFriend,
  removeInvite,
  sharesWith,
  updateFriend,
  type Friend,
  type FriendBook,
} from "@/lib/friends/book";
import {
  exchangeSecret,
  fromBase64Url,
  handshakeAddress,
  handshakeLocation,
  inviteAddress,
  newExchangeKeys,
  openBook,
  openBox,
  otherRole,
  pairKey,
  randomSecret,
  sealBook,
  sealBox,
  statusAddress,
  toBase64Url,
  type Sealed,
} from "@/lib/friends/crypto";
import { BOX_TTL_DAYS, MAX_BOX_READ } from "@/lib/friends/limits";
import {
  buildStatus,
  endedStatus,
  MESSAGE_VERSION,
  parseHandshakeMessage,
  parseInviteMessage,
  parseStatusMessage,
  type HandshakeMessage,
  type InviteMessage,
  type StatusMessage,
} from "@/lib/friends/payload";
import { daysBetween } from "@/lib/forecast/math";

/** Who is acting: the host calls, the account they name, and the key that seals the book. */
export type FriendsSession = { api: FriendsApi; account: string; friendsKey: Uint8Array };

export type BookState = { book: FriendBook; version: number };

/** The invite was revoked, expired, or already used by someone else. */
export class InviteNotFoundError extends Error {
  constructor() {
    super("This invite cannot be used");
    this.name = "InviteNotFoundError";
  }
}

/** Someone else answered this invite first. */
export class InviteUsedError extends Error {
  constructor() {
    super("This invite was already used");
    this.name = "InviteUsedError";
  }
}

/** The invite is this person's own. */
export class OwnInviteError extends Error {
  constructor() {
    super("This is your own invite");
    this.name = "OwnInviteError";
  }
}

/** Friends was turned off (on another device) while this one was changing the book. */
export class FriendsOffError extends Error {
  constructor() {
    super("Friends is off for this account");
    this.name = "FriendsOffError";
  }
}

class BookConflictError extends Error {
  constructor() {
    super("The friend book kept changing");
    this.name = "BookConflictError";
  }
}

const SAVE_ATTEMPTS = 4;

function secretBytes(text: string): Uint8Array {
  const bytes = fromBase64Url(text);
  if (!bytes) throw new Error("Damaged friend book");
  return bytes;
}

async function openStored(session: FriendsSession, stored: SealedBook): Promise<BookState> {
  const value = await openBook(session.friendsKey, stored);
  return { book: parseFriendBook(value), version: stored.version };
}

/** The account's friend book, or null when Friends is off. NewerFriendBookError for a newer format. */
export async function loadBook(session: FriendsSession): Promise<BookState | null> {
  const stored = await session.api.getBook(session.account);
  return stored ? openStored(session, stored) : null;
}

/**
 * Applies `change` to the book and saves it. When another device saved first,
 * applies the same change to the book that won and tries again. Returns the
 * state unchanged (no request) when the change changes nothing.
 */
export async function updateBook(
  session: FriendsSession,
  state: BookState,
  change: (book: FriendBook) => FriendBook,
): Promise<BookState> {
  let current: BookState | null = state;
  for (let attempt = 0; attempt < SAVE_ATTEMPTS; attempt += 1) {
    if (!current) throw new FriendsOffError();
    const next = change(current.book);
    if (JSON.stringify(next) === JSON.stringify(current.book)) return current;
    const sealed = await sealBook(session.friendsKey, next);
    const result = await session.api.putBook(sealed, current.version, session.account);
    if (result.ok) return { book: next, version: result.version };
    current = result.current ? await openStored(session, result.current) : null;
  }
  throw new BookConflictError();
}

/** Turns Friends on: creates the book, or returns the one another device created. */
export async function enableFriends(session: FriendsSession, name: string): Promise<BookState> {
  const existing = await loadBook(session);
  if (existing) return existing;
  const book = newFriendBook(name);
  const result = await session.api.putBook(await sealBook(session.friendsKey, book), 0, session.account);
  if (result.ok) return { book, version: result.version };
  if (result.current) return openStored(session, result.current);
  throw new BookConflictError();
}

async function writeInviteBox(session: FriendsSession, secret: Uint8Array, pub: string, book: FriendBook, today: string) {
  const address = inviteAddress(secret);
  const message: InviteMessage = { t: "invite", v: MESSAGE_VERSION, selfId: book.selfId, name: book.name, at: today, pub };
  await session.api.putBox(
    { id: address.id, token: address.token, kind: "invite", ...(await sealBox(address.key, message)) },
    session.account,
  );
}

/** A new invite: saved in the book first, then its box. Returns the secret for the link. */
export async function createInvite(
  session: FriendsSession,
  state: BookState,
  today: string,
): Promise<{ state: BookState; secret: Uint8Array }> {
  const secret = randomSecret();
  const keys = await newExchangeKeys();
  const next = await updateBook(session, state, (book) =>
    addInvite(book, { secret: toBase64Url(secret), key: keys.privateKey, pub: keys.publicKey }, today),
  );
  await writeInviteBox(session, secret, keys.publicKey, next.book, today);
  return { state: next, secret };
}

/** Stops an invite nobody has answered. */
export async function revokeInvite(session: FriendsSession, state: BookState, secret: string): Promise<BookState> {
  const address = inviteAddress(secretBytes(secret));
  await session.api.deleteBoxes([{ id: address.id, token: address.token }], session.account);
  return updateBook(session, state, (book) => removeInvite(book, secret));
}

/** Who sent an invite, before accepting it. */
export async function readInvite(
  session: FriendsSession,
  state: BookState | null,
  secret: Uint8Array,
): Promise<InviteMessage> {
  const encoded = toBase64Url(secret);
  if (state?.book.invites.some((invite) => invite.secret === encoded)) throw new OwnInviteError();
  const address = inviteAddress(secret);
  const sealed = (await session.api.readBoxes([address.id], session.account))[address.id];
  if (!sealed) throw new InviteNotFoundError();
  const message = parseInviteMessage(await openBox(address.key, sealed).catch(() => null));
  if (!message) throw new InviteNotFoundError();
  if (state && message.selfId === state.book.selfId) throw new OwnInviteError();
  return message;
}

/** The handshake box for the joiner entry `friend` (it holds K and, while waiting, S and its public key). */
async function writeHandshake(
  session: FriendsSession,
  friend: Pick<Friend, "key" | "handshake">,
  book: FriendBook,
  today: string,
): Promise<"written" | "conflict"> {
  if (!friend.handshake) throw new Error("No handshake to write");
  const address = handshakeAddress(secretBytes(friend.handshake.secret), secretBytes(friend.key));
  const message: HandshakeMessage = {
    t: "handshake",
    v: MESSAGE_VERSION,
    selfId: book.selfId,
    name: book.name,
    at: today,
    pub: friend.handshake.pub,
  };
  return session.api.putBox(
    { id: address.id, token: address.token, kind: "handshake", ...(await sealBox(address.key, message)) },
    session.account,
  );
}

/**
 * Accepts an invite: makes this device's exchange key, derives K from S and
 * the ECDH secret with the inviter's public key, saves the friend (waiting,
 * with K, S and our public key) first, then writes the handshake box. The
 * private half is used once and dropped: K is all the friendship needs.
 * Accepting the same invite again resumes with the saved entry, so a retry
 * after a lost answer is never "already used".
 */
export async function acceptInvite(
  session: FriendsSession,
  state: BookState,
  secret: Uint8Array,
  invite: InviteMessage,
  today: string,
): Promise<BookState> {
  const encoded = toBase64Url(secret);
  if (state.book.invites.some((pending) => pending.secret === encoded) || invite.selfId === state.book.selfId) {
    throw new OwnInviteError();
  }
  let next = state;
  let entry = state.book.friends.find((friend) => friend.handshake?.secret === encoded);
  if (!entry) {
    const keys = await newExchangeKeys();
    const key = toBase64Url(pairKey(secret, await exchangeSecret(keys.privateKey, invite.pub)));
    next = await updateBook(session, state, (book) =>
      addFriend(book, {
        selfId: invite.selfId,
        name: invite.name,
        key,
        role: "joiner",
        state: "waiting",
        since: today,
        handshake: { secret: encoded, pub: keys.publicKey },
      }),
    );
    entry = next.book.friends.find((friend) => friend.key === key);
    if (!entry) throw new Error("Friend not saved");
  }
  const key = entry.key;
  if ((await writeHandshake(session, entry, next.book, today)) === "conflict") {
    await updateBook(session, next, (book) => ({ ...book, friends: book.friends.filter((friend) => friend.key !== key) }));
    throw new InviteUsedError();
  }
  return next;
}

/** One friend as the Friends screen shows it: their entry and their latest status. */
export type FriendCard = { friend: Friend; status: StatusMessage | null };

async function readAll(session: FriendsSession, ids: string[]): Promise<Record<string, Sealed>> {
  const found: Record<string, Sealed> = {};
  for (let start = 0; start < ids.length; start += MAX_BOX_READ) {
    Object.assign(found, await session.api.readBoxes(ids.slice(start, start + MAX_BOX_READ), session.account));
  }
  return found;
}

async function openOrNull<T>(key: Uint8Array, sealed: Sealed | undefined, parse: (value: unknown) => T | null): Promise<T | null> {
  if (!sealed) return null;
  return parse(await openBox(key, sealed).catch(() => null));
}

async function bestEffort(work: () => Promise<unknown>): Promise<void> {
  await work().catch(() => undefined);
}

/**
 * Reads every friend's status, completes invites someone answered, and tidies
 * the book (names, waiting friends who became active, expired invites,
 * duplicates). Saves the book only when something changed.
 */
export async function refreshFriends(
  session: FriendsSession,
  _known: BookState | null,
  today: string,
): Promise<{ state: BookState; cards: FriendCard[] }> {
  // Always from the host's book, never the caller's copy: another device may
  // have revoked an invite, removed a friend, or turned Friends off and on
  // (a new book starts at version 1 again). FriendsOffError if it is gone.
  const state = await loadBook(session);
  if (!state) throw new FriendsOffError();
  const invites = state.book.invites.map((invite) => {
    const secret = secretBytes(invite.secret);
    return { invite, secret, handshake: handshakeLocation(secret), box: inviteAddress(secret) };
  });
  const friends = state.book.friends.map((friend) => {
    const pair = secretBytes(friend.key);
    const waiting = friend.state === "waiting" && friend.handshake ? friend.handshake : null;
    return {
      friend,
      theirs: statusAddress(pair, otherRole(friend.role)),
      handshakeId: waiting ? handshakeLocation(secretBytes(waiting.secret)).id : null,
    };
  });
  const boxes = await readAll(session, [
    ...invites.flatMap((item) => [item.handshake.id, item.box.id]),
    ...friends.flatMap((item) => (item.handshakeId ? [item.theirs.id, item.handshakeId] : [item.theirs.id])),
  ]);

  const answered: { secret: string; pair: string; message: HandshakeMessage }[] = [];
  const expired: string[] = [];
  const missingInviteBoxes: { secret: string; pub: string }[] = [];
  for (const item of invites) {
    const expiredNow = daysBetween(item.invite.createdAt, today) >= BOX_TTL_DAYS.invite;
    const message = expiredNow ? null : await openOrNull(item.handshake.key, boxes[item.handshake.id], parseHandshakeMessage);
    const shared = message ? await exchangeSecret(item.invite.key, message.pub).catch(() => null) : null;
    if (message && shared) {
      answered.push({ secret: item.invite.secret, pair: toBase64Url(pairKey(item.secret, shared)), message });
    } else if (expiredNow) {
      // Past the invite's life even if someone answers later: never accepted.
      expired.push(item.invite.secret);
    } else if (!boxes[item.box.id] && !boxes[item.handshake.id]) {
      missingInviteBoxes.push({ secret: item.invite.secret, pub: item.invite.pub });
    }
  }

  const statuses = new Map<string, StatusMessage>();
  const lostHandshakes: Friend[] = [];
  for (const item of friends) {
    const status = await openOrNull(item.theirs.key, boxes[item.theirs.id], parseStatusMessage);
    // The friend's id is pinned when the friendship starts (invite or
    // handshake): a status naming another person is not theirs to send.
    if (status && (!item.friend.selfId || status.selfId === item.friend.selfId)) statuses.set(item.friend.key, status);
    else if (!status && item.handshakeId && !boxes[item.handshakeId]) lostHandshakes.push(item.friend);
  }

  let dropped: Friend[] = [];
  const change = (book: FriendBook): FriendBook => {
    let next = book;
    for (const { secret, pair, message } of answered) {
      if (!next.invites.some((invite) => invite.secret === secret)) continue;
      if (message.selfId === next.selfId) {
        next = removeInvite(next, secret);
        continue;
      }
      try {
        next = addFriend(
          next,
          { selfId: message.selfId, name: message.name, key: pair, role: "inviter", state: "active", since: today },
          secret,
        );
      } catch (error) {
        if (!(error instanceof FriendBookFullError)) throw error;
        next = removeInvite(next, secret);
      }
    }
    for (const secret of expired) next = removeInvite(next, secret);
    for (const friend of next.friends) {
      const status = statuses.get(friend.key);
      if (!status || friend.state === "ended") continue;
      const update: Parameters<typeof updateFriend>[2] = {};
      if (!friend.selfId) update.selfId = status.selfId;
      const duplicate =
        status.state === "ended" &&
        next.friends.some((other) => other.id !== friend.id && other.selfId === status.selfId && other.state !== "ended");
      if (duplicate) {
        // The other device merged two entries for us (both invited each
        // other) and ended this one: drop it quietly, the other stays.
        next = removeFriend(next, friend.id);
        continue;
      }
      if (status.state === "ended") {
        // Kept in the book so the card still says so once their box expires.
        update.state = "ended";
        update.handshake = undefined;
      } else {
        if (status.name && status.name !== friend.name) update.name = status.name;
        if (friend.state === "waiting") {
          update.state = "active";
          update.handshake = undefined;
        }
      }
      if (Object.keys(update).length > 0) next = updateFriend(next, friend.id, update);
    }
    const deduped = dropDuplicates(next);
    dropped = deduped.dropped;
    return deduped.book;
  };
  const saved = await updateBook(session, state, change);

  // The book no longer needs these; losing any of the calls below loses nothing.
  const done = [...answered.map(({ secret }) => secret), ...expired].filter(
    (secret) => !saved.book.invites.some((invite) => invite.secret === secret),
  );
  await bestEffort(() =>
    session.api.deleteBoxes(
      done.map((secret) => {
        const address = inviteAddress(secretBytes(secret));
        return { id: address.id, token: address.token };
      }),
      session.account,
    ),
  );
  // Only invites the saved book still holds: one revoked on another device stays revoked.
  for (const { secret, pub } of missingInviteBoxes) {
    if (!saved.book.invites.some((invite) => invite.secret === secret)) continue;
    await bestEffort(() => writeInviteBox(session, secretBytes(secret), pub, saved.book, today));
  }
  for (const friend of lostHandshakes) {
    const current = saved.book.friends.find((entry) => entry.key === friend.key);
    if (!current?.handshake || current.state !== "waiting") continue;
    await bestEffort(() => writeHandshake(session, current, saved.book, today));
  }
  // A merged duplicate: tell the other device, which drops its entry for this
  // pair too (it may still be waiting on it).
  for (const friend of dropped) await bestEffort(() => tellEnded(session, saved.book, friend, today));

  return {
    state: saved,
    cards: saved.book.friends.map((friend) => ({ friend, status: statuses.get(friend.key) ?? null })),
  };
}

/** The messages publishStatus would write, as one string: publish again only when it changes. */
export function statusFingerprint(book: FriendBook, diary: Diary, today: string): string {
  return JSON.stringify(
    book.friends.filter(publishesTo).map((friend) => [friend.key, statusFor(book, friend, diary, today)]),
  );
}

function statusFor(book: FriendBook, friend: Friend, diary: Diary, today: string): StatusMessage {
  return buildStatus(diary, today, {
    selfId: book.selfId,
    name: book.name,
    show: book.show,
    note: book.note,
    paused: !sharesWith(book, friend),
  });
}

/** Writes this person's status to each friend (or the ones in `only`). */
export async function publishStatus(
  session: FriendsSession,
  book: FriendBook,
  diary: Diary,
  today: string,
  only?: string[],
): Promise<void> {
  for (const friend of book.friends) {
    if (only && !only.includes(friend.id)) continue;
    if (!publishesTo(friend)) continue;
    const mine = statusAddress(secretBytes(friend.key), friend.role);
    const sealed = await sealBox(mine.key, statusFor(book, friend, diary, today));
    await session.api.putBox({ id: mine.id, token: mine.token, kind: "status", ...sealed }, session.account);
  }
}

/**
 * Publishes from the book as the host has it now, never from a copy another
 * device may have changed since (a friend removed or paused there, Friends
 * turned off). Returns that book, or null when Friends is off (nothing written).
 */
export async function publishFromLatest(
  session: FriendsSession,
  diary: Diary,
  today: string,
  only?: string[],
): Promise<BookState | null> {
  const latest = await loadBook(session);
  if (!latest) return null;
  await publishStatus(session, latest.book, diary, today, only);
  return latest;
}

async function tellEnded(session: FriendsSession, book: FriendBook, friend: Friend, today: string) {
  const mine = statusAddress(secretBytes(friend.key), friend.role);
  const sealed = await sealBox(mine.key, endedStatus(book.selfId, today));
  await session.api.putBox({ id: mine.id, token: mine.token, kind: "status", ...sealed }, session.account);
}

/**
 * Removes a friend: drops them from the book first (so no device that reloads
 * the book publishes to them again), then tells their device (best effort; if
 * that is lost, their card goes to "no recent update" and the box expires).
 */
export async function removeFriendAndTell(
  session: FriendsSession,
  state: BookState,
  friendId: string,
  today: string,
): Promise<BookState> {
  const friend = state.book.friends.find((entry) => entry.id === friendId);
  if (!friend) return state;
  const next = await updateBook(session, state, (book) => removeFriend(book, friendId));
  if (publishesTo(friend)) await bestEffort(() => tellEnded(session, next.book, friend, today));
  return next;
}

/**
 * Before the account is deleted (or moved to the device): turns Friends off if
 * it is on. Best effort for the caller; a book this build cannot read is left
 * to the account's cascade.
 */
export async function leaveFriends(session: FriendsSession, today: string): Promise<void> {
  const state = await loadBook(session);
  if (state) await turnOffFriends(session, state, today);
}

/**
 * Turns Friends off: deletes the book first (must succeed; from then on no
 * device that reloads it publishes anything), then tells every friend it ended
 * and deletes pending invites, with the keys still in memory (best effort:
 * what is missed nobody can read, and expires). Also run before the account
 * is deleted.
 */
export async function turnOffFriends(session: FriendsSession, state: BookState, today: string): Promise<void> {
  await session.api.deleteBook(session.account);
  for (const friend of state.book.friends) {
    if (publishesTo(friend)) await bestEffort(() => tellEnded(session, state.book, friend, today));
  }
  await bestEffort(() =>
    session.api.deleteBoxes(
      state.book.invites.map((invite) => {
        const address = inviteAddress(secretBytes(invite.secret));
        return { id: address.id, token: address.token };
      }),
      session.account,
    ),
  );
}
