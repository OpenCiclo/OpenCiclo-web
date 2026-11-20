// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Friends on the device: the invite handshake, reading friends' statuses and
// publishing this person's own, on top of a FriendsApi (lib/client/friends-api.ts).
// The keys and the message shapes are in lib/friends/*.
//
// Order matters wherever a crash or a lost answer could lose a key: the friend
// book is saved before any box that depends on it is written, and a box is
// deleted only after the book no longer needs it.
//
//   Inviter                                   Joiner
//   1. book += invite S; write invite box
//                                             2. read invite box (shows the name)
//                                             3. book += friend (waiting, S, R)
//                                                write handshake box; publish
//   4. refresh: handshake found → book += friend
//      (active), invite dropped; delete the
//      invite box; publish
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
  removeFriend,
  removeInvite,
  sharesWith,
  updateFriend,
  type Friend,
  type FriendBook,
} from "@/lib/friends/book";
import {
  fromBase64Url,
  handshakeAddress,
  handshakeLocation,
  inviteAddress,
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

async function writeInviteBox(session: FriendsSession, secret: Uint8Array, book: FriendBook, today: string) {
  const address = inviteAddress(secret);
  const message: InviteMessage = { t: "invite", v: MESSAGE_VERSION, selfId: book.selfId, name: book.name, at: today };
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
  const next = await updateBook(session, state, (book) => addInvite(book, toBase64Url(secret), today));
  await writeInviteBox(session, secret, next.book, today);
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

async function writeHandshake(
  session: FriendsSession,
  secret: Uint8Array,
  r: Uint8Array,
  book: FriendBook,
  today: string,
): Promise<"written" | "conflict"> {
  const address = handshakeAddress(secret, pairKey(secret, r));
  const message: HandshakeMessage = {
    t: "handshake",
    v: MESSAGE_VERSION,
    selfId: book.selfId,
    name: book.name,
    at: today,
    r: toBase64Url(r),
  };
  return session.api.putBox(
    { id: address.id, token: address.token, kind: "handshake", ...(await sealBox(address.key, message)) },
    session.account,
  );
}

/**
 * Accepts an invite: saves the friend (waiting, with S and R) first, then writes
 * the handshake box. Accepting the same invite again resumes with the same R,
 * so a retry after a lost answer is never "already used".
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
  const earlier = state.book.friends.find((friend) => friend.handshake?.secret === encoded);
  let next = state;
  let r: Uint8Array;
  if (earlier?.handshake) {
    r = secretBytes(earlier.handshake.r);
  } else {
    r = randomSecret();
    const key = toBase64Url(pairKey(secret, r));
    next = await updateBook(session, state, (book) =>
      addFriend(book, {
        selfId: invite.selfId,
        name: invite.name,
        key,
        role: "joiner",
        state: "waiting",
        since: today,
        handshake: { secret: encoded, r: toBase64Url(r) },
      }),
    );
  }
  if ((await writeHandshake(session, secret, r, next.book, today)) === "conflict") {
    const key = toBase64Url(pairKey(secret, r));
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
  state: BookState,
  today: string,
): Promise<{ state: BookState; cards: FriendCard[] }> {
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
  const missingInviteBoxes: Uint8Array[] = [];
  for (const item of invites) {
    const message = await openOrNull(item.handshake.key, boxes[item.handshake.id], parseHandshakeMessage);
    const r = message ? fromBase64Url(message.r) : null;
    if (message && r) {
      answered.push({ secret: item.invite.secret, pair: toBase64Url(pairKey(item.secret, r)), message });
    } else if (daysBetween(item.invite.createdAt, today) >= BOX_TTL_DAYS.invite) {
      expired.push(item.invite.secret);
    } else if (!boxes[item.box.id]) {
      missingInviteBoxes.push(item.secret);
    }
  }

  const statuses = new Map<string, StatusMessage>();
  const lostHandshakes: Friend[] = [];
  for (const item of friends) {
    const status = await openOrNull(item.theirs.key, boxes[item.theirs.id], parseStatusMessage);
    if (status) statuses.set(item.friend.key, status);
    else if (item.handshakeId && !boxes[item.handshakeId]) lostHandshakes.push(item.friend);
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
      if (!status) continue;
      const update: Parameters<typeof updateFriend>[2] = {};
      if (friend.selfId !== status.selfId) update.selfId = status.selfId;
      if (status.state !== "ended" && status.name && status.name !== friend.name) update.name = status.name;
      if (friend.state === "waiting") {
        update.state = "active";
        update.handshake = undefined;
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
  for (const secret of missingInviteBoxes) await bestEffort(() => writeInviteBox(session, secret, saved.book, today));
  for (const friend of lostHandshakes) {
    const current = saved.book.friends.find((entry) => entry.key === friend.key);
    if (!current?.handshake) continue;
    const { secret, r } = current.handshake;
    await bestEffort(() => writeHandshake(session, secretBytes(secret), secretBytes(r), saved.book, today));
  }
  for (const friend of dropped) {
    const mine = statusAddress(secretBytes(friend.key), friend.role);
    await bestEffort(() => session.api.deleteBoxes([{ id: mine.id, token: mine.token }], session.account));
  }

  return {
    state: saved,
    cards: saved.book.friends.map((friend) => ({ friend, status: statuses.get(friend.key) ?? null })),
  };
}

/** The messages publishStatus would write, as one string: publish again only when it changes. */
export function statusFingerprint(book: FriendBook, diary: Diary, today: string): string {
  return JSON.stringify(book.friends.map((friend) => [friend.key, statusFor(book, friend, diary, today)]));
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
    const mine = statusAddress(secretBytes(friend.key), friend.role);
    const sealed = await sealBox(mine.key, statusFor(book, friend, diary, today));
    await session.api.putBox({ id: mine.id, token: mine.token, kind: "status", ...sealed }, session.account);
  }
}

async function tellEnded(session: FriendsSession, book: FriendBook, friend: Friend, today: string) {
  const mine = statusAddress(secretBytes(friend.key), friend.role);
  const sealed = await sealBox(mine.key, endedStatus(book.selfId, today));
  await session.api.putBox({ id: mine.id, token: mine.token, kind: "status", ...sealed }, session.account);
}

/** Removes a friend: tells their device first, then drops them from the book. */
export async function removeFriendAndTell(
  session: FriendsSession,
  state: BookState,
  friendId: string,
  today: string,
): Promise<BookState> {
  const friend = state.book.friends.find((entry) => entry.id === friendId);
  if (!friend) return state;
  await tellEnded(session, state.book, friend, today);
  return updateBook(session, state, (book) => removeFriend(book, friendId));
}

/**
 * Turns Friends off: tells every friend it ended and deletes pending invites
 * (best effort: what is missed nobody can read, and expires), then deletes the
 * book (must succeed). Also run before the account is deleted.
 */
export async function turnOffFriends(session: FriendsSession, state: BookState, today: string): Promise<void> {
  for (const friend of state.book.friends) await bestEffort(() => tellEnded(session, state.book, friend, today));
  await bestEffort(() =>
    session.api.deleteBoxes(
      state.book.invites.map((invite) => {
        const address = inviteAddress(secretBytes(invite.secret));
        return { id: address.id, token: address.token };
      }),
      session.account,
    ),
  );
  await session.api.deleteBook(session.account);
}
