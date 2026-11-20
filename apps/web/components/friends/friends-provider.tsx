// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useCiclo, useTodayIso } from "@/lib/client/ciclo-context";
import { retryingFriendsApi } from "@/lib/client/friends-api";
import {
  acceptInvite as acceptInviteCall,
  createInvite as createInviteCall,
  enableFriends,
  FriendsOffError,
  publishFromLatest,
  publishStatus,
  readInvite as readInviteCall,
  refreshFriends,
  removeFriendAndTell,
  revokeInvite as revokeInviteCall,
  statusFingerprint,
  turnOffFriends,
  updateBook,
  type BookState,
  type FriendCard,
  type FriendsSession,
} from "@/lib/client/friends-sync";
import { NewerFriendBookError, setProfile as setProfileOp, updateFriend, type FriendBook } from "@/lib/friends/book";
import type { ParsedInvite } from "@/lib/friends/invite";
import type { FriendNote, InviteMessage, ShareChoices } from "@/lib/friends/payload";

export type FriendsStatus = "unavailable" | "idle" | "loading" | "off" | "on" | "newer" | "error";

type ProfileChange = Partial<{ name: string; show: ShareChoices; pausedAll: boolean; note: FriendNote | null }>;

type FriendsValue = {
  status: FriendsStatus;
  book: FriendBook | null;
  cards: FriendCard[];
  /** Loads the book and every friend's status. */
  refresh: () => Promise<void>;
  enable: (name: string) => Promise<void>;
  /** A new invite: the secret and the key fingerprint for its link. */
  createInvite: () => Promise<{ secret: Uint8Array; fingerprint: string }>;
  revokeInvite: (secret: string) => Promise<void>;
  /** Who sent the invite in a pasted link or code (lib/friends/invite.ts parseInvite). */
  readInvite: (link: ParsedInvite) => Promise<InviteMessage>;
  acceptInvite: (secret: Uint8Array, invite: InviteMessage) => Promise<void>;
  setProfile: (change: ProfileChange) => Promise<void>;
  setFriendPaused: (friendId: string, paused: boolean) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  turnOff: () => Promise<void>;
};

const FriendsContext = createContext<FriendsValue | null>(null);

// A device that has seen Friends on for this account checks it at start (to
// publish and complete invites); others wait until the Friends screen opens.
const HINT_PREFIX = "ciclo.friends.";

function readHint(account: string): boolean {
  try {
    return window.localStorage.getItem(HINT_PREFIX + account) === "on";
  } catch {
    return false;
  }
}

function writeHint(account: string, on: boolean) {
  try {
    if (on) window.localStorage.setItem(HINT_PREFIX + account, "on");
    else window.localStorage.removeItem(HINT_PREFIX + account);
  } catch {
    // Storage blocked: Friends then loads when its screen opens.
  }
}

// A diary change publishes after a random wait, so the write does not land
// next to the vault save it follows.
function publishDelay(): number {
  return 20_000 + Math.floor(Math.random() * 60_000);
}

/** Friends for the hosted account open now. Renders children only; mounted inside CicloProvider. */
export function FriendsProvider({ children }: { children: ReactNode }) {
  const { friendsRun, wallet, diary, readOnly } = useCiclo();
  const friendsSession = useMemo<FriendsSession | null>(
    () =>
      friendsRun && wallet
        ? { api: retryingFriendsApi(friendsRun), account: wallet.pubkeyHash, friendsKey: wallet.friendsKey }
        : null,
    [friendsRun, wallet],
  );
  const today = useTodayIso();
  const [status, setStatus] = useState<FriendsStatus>("idle");
  const [state, setState] = useState<BookState | null>(null);
  const [cards, setCards] = useState<FriendCard[]>([]);
  const stateRef = useRef<BookState | null>(null);
  const sessionRef = useRef<FriendsSession | null>(friendsSession);
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const publishedRef = useRef<string | null>(null);
  const diaryRef = useRef(diary);
  const todayRef = useRef(today);
  useEffect(() => {
    diaryRef.current = diary;
    todayRef.current = today;
  }, [diary, today]);

  // A new session (sign-in, sign-out, another account) starts over: the state
  // here during the render that sees it, the refs right after.
  const [shownSession, setShownSession] = useState(friendsSession);
  if (shownSession !== friendsSession) {
    setShownSession(friendsSession);
    setState(null);
    setCards([]);
    setStatus(friendsSession ? "idle" : "unavailable");
  }
  useEffect(() => {
    sessionRef.current = friendsSession;
    stateRef.current = null;
    publishedRef.current = null;
  }, [friendsSession]);

  const apply = useCallback((session: FriendsSession, next: BookState | null) => {
    if (sessionRef.current !== session) return;
    stateRef.current = next;
    setState(next);
    setStatus(next ? "on" : "off");
    writeHint(session.account, next !== null);
    if (!next) setCards([]);
  }, []);

  /**
   * Runs `work` after every earlier change, for the session open when it was
   * asked. The session comes from this render (a screen's effect can ask
   * before this provider's effect has stored it); the queued work checks the
   * stored one, which is set by then.
   */
  const run = useCallback(
    <T,>(work: (session: FriendsSession) => Promise<T>): Promise<T> => {
      const session = friendsSession;
      if (!session) return Promise.reject(new Error("Locked"));
      const next = queueRef.current.then(() => {
        if (sessionRef.current !== session) throw new Error("Locked");
        return work(session);
      });
      queueRef.current = next.catch(() => undefined);
      return next;
    },
    [friendsSession],
  );

  const publishNow = useCallback(
    (session: FriendsSession, book: FriendBook, only?: string[]) => {
      const fingerprint = statusFingerprint(book, diaryRef.current, todayRef.current);
      if (!only && fingerprint === publishedRef.current) return Promise.resolve();
      return publishStatus(session, book, diaryRef.current, todayRef.current, only).then(() => {
        if (!only && sessionRef.current === session) publishedRef.current = fingerprint;
      });
    },
    [],
  );

  const refresh = useCallback(
    () =>
      run(async (session) => {
        if (!stateRef.current) setStatus("loading");
        try {
          // Reads the host's book itself: another device may have removed, paused or turned off since.
          let result;
          try {
            result = await refreshFriends(session, stateRef.current, todayRef.current);
          } catch (error) {
            if (!(error instanceof FriendsOffError)) throw error;
            apply(session, null);
            return;
          }
          apply(session, result.state);
          if (sessionRef.current === session) setCards(result.cards);
          await publishNow(session, result.state.book).catch(() => undefined);
        } catch (error) {
          if (sessionRef.current !== session) return;
          if (error instanceof NewerFriendBookError) setStatus("newer");
          else if (error instanceof FriendsOffError) apply(session, null);
          else if (!stateRef.current) setStatus("error");
          throw error;
        }
      }),
    [apply, publishNow, run],
  );

  /** A change to the book, then (when it changes what friends see) a publish. */
  const change = useCallback(
    (edit: (book: FriendBook) => FriendBook, publish = true) =>
      run(async (session) => {
        const current = stateRef.current;
        if (!current) throw new FriendsOffError();
        const next = await updateBook(session, current, edit);
        apply(session, next);
        if (sessionRef.current === session) {
          setCards((previous) => previous.map((card) => ({ ...card, friend: next.book.friends.find((f) => f.id === card.friend.id) ?? card.friend })));
        }
        if (publish) await publishNow(session, next.book);
      }),
    [apply, publishNow, run],
  );

  // At start, a device that has seen Friends on loads it, completes invites
  // and publishes; the Friends screen refreshes on its own.
  useEffect(() => {
    if (!friendsSession || readOnly || !readHint(friendsSession.account)) return;
    refresh().catch(() => undefined);
  }, [friendsSession, readOnly, refresh]);

  // The diary or the day changed: publish again (after a random wait) when
  // what friends would get is different.
  const book = state?.book ?? null;
  useEffect(() => {
    const session = sessionRef.current;
    if (!session || !book || readOnly) return;
    if (statusFingerprint(book, diary, today) === publishedRef.current) return;
    const timer = window.setTimeout(() => {
      // From the host's book, not this tab's copy: if Friends was turned off or
      // a friend removed elsewhere, nothing is written over it.
      run(async (current) => {
        if (!stateRef.current) return;
        const fingerprint = statusFingerprint(stateRef.current.book, diaryRef.current, todayRef.current);
        if (fingerprint === publishedRef.current) return;
        const latest = await publishFromLatest(current, diaryRef.current, todayRef.current);
        apply(current, latest);
        if (latest && sessionRef.current === current) {
          publishedRef.current = statusFingerprint(latest.book, diaryRef.current, todayRef.current);
        }
      }).catch(() => undefined);
    }, publishDelay());
    return () => window.clearTimeout(timer);
  }, [apply, book, diary, today, readOnly, run]);

  const value = useMemo<FriendsValue>(
    () => ({
      status,
      book,
      cards,
      refresh,
      enable: (name) =>
        run(async (session) => {
          apply(session, await enableFriends(session, name));
        }),
      createInvite: () =>
        run(async (session) => {
          const current = stateRef.current;
          if (!current) throw new FriendsOffError();
          const result = await createInviteCall(session, current, todayRef.current);
          apply(session, result.state);
          return { secret: result.secret, fingerprint: result.fingerprint };
        }),
      revokeInvite: (secret) =>
        run(async (session) => {
          const current = stateRef.current;
          if (!current) throw new FriendsOffError();
          apply(session, await revokeInviteCall(session, current, secret));
        }),
      readInvite: (link) => run((session) => readInviteCall(session, stateRef.current, link, todayRef.current)),
      acceptInvite: (secret, invite) =>
        run(async (session) => {
          const current = stateRef.current;
          if (!current) throw new FriendsOffError();
          const next = await acceptInviteCall(session, current, secret, invite, todayRef.current);
          apply(session, next);
          const added = next.book.friends.filter((friend) => !current.book.friends.some((old) => old.id === friend.id));
          await publishNow(session, next.book, added.map((friend) => friend.id)).catch(() => undefined);
          if (sessionRef.current === session) setCards(next.book.friends.map((friend) => ({ friend, status: null })));
        }).then(() => refresh().catch(() => undefined)),
      setProfile: (profile) => change((current) => setProfileOp(current, profile)),
      setFriendPaused: (friendId, paused) => change((current) => updateFriend(current, friendId, { paused })),
      removeFriend: (friendId) =>
        run(async (session) => {
          const current = stateRef.current;
          if (!current) return;
          const next = await removeFriendAndTell(session, current, friendId, todayRef.current);
          apply(session, next);
          if (sessionRef.current === session) setCards((previous) => previous.filter((card) => card.friend.id !== friendId));
        }),
      turnOff: () =>
        run(async (session) => {
          const current = stateRef.current;
          if (current) await turnOffFriends(session, current, todayRef.current);
          else await session.api.deleteBook(session.account);
          publishedRef.current = null;
          apply(session, null);
        }),
    }),
    [apply, book, cards, change, publishNow, refresh, run, status],
  );

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
}

export function useFriends(): FriendsValue {
  const value = useContext(FriendsContext);
  if (!value) throw new Error("useFriends needs FriendsProvider");
  return value;
}
