// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The friend book: everything one account knows about its friendships, sealed
// with the wallet's `friendsKey` (lib/crypto/wallet.ts) and stored by the host
// as one blob (friend_books). Kept apart from the diary on purpose: pair keys
// must never reach a diary export, and the diary's schema version stays as it
// is (old Play builds keep saving diaries).
//
// Operations are pure: each takes a book and returns a new one, so a save
// refused by compare-and-set can fetch the newer book and apply the same
// operation again (lib/client/friends-sync.ts).

import { isIsoDate } from "@/lib/diary";
import { randomId, type PairRole } from "@/lib/friends/crypto";
import { MAX_FRIENDS, MAX_NAME_LENGTH, MAX_NOTE_LENGTH, MAX_PENDING_INVITES } from "@/lib/friends/limits";
import { cleanText, type FriendNote, type ShareChoices } from "@/lib/friends/payload";

export const FRIEND_BOOK_FORMAT = 1;

export type Friend = {
  /** This book's id for the entry (not shared). */
  id: string;
  /** The friend's own random id, from their messages; null until seen. */
  selfId: string | null;
  name: string;
  /** The pair key K, URL-safe base64. */
  key: string;
  /** Which side of the invite this device was. */
  role: PairRole;
  /** "waiting": the joiner answered, the inviter's device has not seen it yet. */
  state: "waiting" | "active";
  /** Not sharing with this friend. */
  paused: boolean;
  since: string;
  /**
   * Joiner side, while "waiting": the invite secret S and this device's R, to
   * write the handshake box again if the first write was lost. Dropped once the
   * inviter's status arrives.
   */
  handshake?: { secret: string; r: string };
};

export type PendingInvite = {
  /** The invite secret S, URL-safe base64. */
  secret: string;
  createdAt: string;
};

export type FriendBook = {
  format: number;
  /** This person's random id inside every message they send. */
  selfId: string;
  /** The name friends see. */
  name: string;
  show: ShareChoices;
  pausedAll: boolean;
  note: FriendNote | null;
  friends: Friend[];
  invites: PendingInvite[];
};

/** The host's friend book was written by a newer version of Ciclo: open it read-only. */
export class NewerFriendBookError extends Error {
  constructor() {
    super("The friend book was saved by a newer version of Ciclo");
    this.name = "NewerFriendBookError";
  }
}

export class FriendBookFullError extends Error {
  constructor() {
    super("Too many friends or invites");
    this.name = "FriendBookFullError";
  }
}

export function newFriendBook(name: string): FriendBook {
  return {
    format: FRIEND_BOOK_FORMAT,
    selfId: randomId(),
    name: cleanText(name, MAX_NAME_LENGTH),
    show: { day: true, expected: true },
    pausedAll: false,
    note: null,
    friends: [],
    invites: [],
  };
}

export function addInvite(book: FriendBook, secret: string, today: string): FriendBook {
  if (book.invites.length >= MAX_PENDING_INVITES || book.friends.length >= MAX_FRIENDS) {
    throw new FriendBookFullError();
  }
  if (book.invites.some((invite) => invite.secret === secret)) return book;
  return { ...book, invites: [...book.invites, { secret, createdAt: today }] };
}

export function removeInvite(book: FriendBook, secret: string): FriendBook {
  return { ...book, invites: book.invites.filter((invite) => invite.secret !== secret) };
}

/**
 * Adds a friend (or leaves the book as is when this pair key is there already:
 * a retried operation). On the inviter's side it also drops the invite it came from.
 */
export function addFriend(
  book: FriendBook,
  friend: Omit<Friend, "id" | "paused">,
  fromInvite?: string,
): FriendBook {
  const invites = fromInvite ? book.invites.filter((invite) => invite.secret !== fromInvite) : book.invites;
  if (book.friends.some((entry) => entry.key === friend.key)) return { ...book, invites };
  if (book.friends.length >= MAX_FRIENDS) throw new FriendBookFullError();
  const entry: Friend = { ...friend, id: randomId(), name: cleanText(friend.name, MAX_NAME_LENGTH), paused: false };
  return { ...book, invites, friends: [...book.friends, entry] };
}

export function updateFriend(
  book: FriendBook,
  id: string,
  change: Partial<Pick<Friend, "selfId" | "name" | "state" | "paused" | "handshake">>,
): FriendBook {
  return {
    ...book,
    friends: book.friends.map((friend) => {
      if (friend.id !== id) return friend;
      const next: Friend = { ...friend, ...change };
      if (change.name !== undefined) next.name = cleanText(change.name, MAX_NAME_LENGTH);
      if ("handshake" in change && change.handshake === undefined) delete next.handshake;
      return next;
    }),
  };
}

export function removeFriend(book: FriendBook, id: string): FriendBook {
  return { ...book, friends: book.friends.filter((friend) => friend.id !== id) };
}

export function setProfile(
  book: FriendBook,
  change: Partial<{ name: string; show: ShareChoices; pausedAll: boolean; note: FriendNote | null }>,
): FriendBook {
  const next = { ...book, ...change };
  if (change.name !== undefined) next.name = cleanText(change.name, MAX_NAME_LENGTH);
  if (change.note) {
    const text = cleanText(change.note.text, MAX_NOTE_LENGTH);
    next.note = text ? { text, date: change.note.date } : null;
  }
  return next;
}

/** Whether this device shares with `friend` now. */
export function sharesWith(book: FriendBook, friend: Friend): boolean {
  return !book.pausedAll && !friend.paused;
}

/**
 * Two entries for the same person (both invited each other). Both devices keep
 * the pair whose key sorts first, so they always agree on which one stays.
 * Returns the book without the others, and the entries dropped.
 */
export function dropDuplicates(book: FriendBook): { book: FriendBook; dropped: Friend[] } {
  const keep = new Map<string, Friend>();
  for (const friend of book.friends) {
    if (!friend.selfId) continue;
    const current = keep.get(friend.selfId);
    if (!current || friend.key < current.key) keep.set(friend.selfId, friend);
  }
  const dropped = book.friends.filter((friend) => friend.selfId && keep.get(friend.selfId) !== friend);
  if (dropped.length === 0) return { book, dropped };
  return { book: { ...book, friends: book.friends.filter((friend) => !dropped.includes(friend)) }, dropped };
}

// Parsing. The book is this account's own, but it may come from a newer
// version of the app (NewerFriendBookError) or an older one.

type Unknown = Record<string, unknown>;

function isObject(value: unknown): value is Unknown {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && isIsoDate(value);
}

const ID = /^[0-9a-f]{32}$/;
const KEY = /^[A-Za-z0-9_-]{43}$/;

function parseFriend(value: unknown): Friend | null {
  if (!isObject(value)) return null;
  const { id, selfId, name, key, role, state, paused, since } = value;
  if (typeof id !== "string" || !ID.test(id)) return null;
  if (selfId !== null && (typeof selfId !== "string" || !ID.test(selfId))) return null;
  if (typeof name !== "string" || typeof key !== "string" || !KEY.test(key)) return null;
  if (role !== "inviter" && role !== "joiner") return null;
  if (state !== "waiting" && state !== "active") return null;
  if (!isDate(since)) return null;
  const friend: Friend = { id, selfId, name, key, role, state, paused: paused === true, since };
  const handshake = value.handshake;
  if (handshake !== undefined) {
    if (!isObject(handshake) || typeof handshake.secret !== "string" || !KEY.test(handshake.secret)) return null;
    if (typeof handshake.r !== "string" || !KEY.test(handshake.r)) return null;
    friend.handshake = { secret: handshake.secret, r: handshake.r };
  }
  return friend;
}

function parseInvite(value: unknown): PendingInvite | null {
  if (!isObject(value) || typeof value.secret !== "string" || !KEY.test(value.secret) || !isDate(value.createdAt)) {
    return null;
  }
  return { secret: value.secret, createdAt: value.createdAt };
}

/** A book read from the host. Throws NewerFriendBookError for a newer format, Error when damaged. */
export function parseFriendBook(value: unknown): FriendBook {
  if (!isObject(value) || typeof value.format !== "number") throw new Error("Damaged friend book");
  if (value.format > FRIEND_BOOK_FORMAT) throw new NewerFriendBookError();
  if (typeof value.selfId !== "string" || !ID.test(value.selfId) || typeof value.name !== "string") {
    throw new Error("Damaged friend book");
  }
  const show = isObject(value.show) ? value.show : {};
  const note =
    isObject(value.note) && typeof value.note.text === "string" && isDate(value.note.date)
      ? { text: value.note.text, date: value.note.date }
      : null;
  const friends = Array.isArray(value.friends) ? value.friends.map(parseFriend) : [];
  const invites = Array.isArray(value.invites) ? value.invites.map(parseInvite) : [];
  if (friends.includes(null) || invites.includes(null)) throw new Error("Damaged friend book");
  return {
    format: FRIEND_BOOK_FORMAT,
    selfId: value.selfId,
    name: value.name,
    show: { day: show.day !== false, expected: show.expected !== false },
    pausedAll: value.pausedAll === true,
    note,
    friends: friends as Friend[],
    invites: invites as PendingInvite[],
  };
}
