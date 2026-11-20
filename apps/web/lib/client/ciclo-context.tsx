"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { IS_ANDROID_APP, apiUrl } from "@/lib/app-target";
import { decryptAesGcm, encryptAesGcm } from "@/lib/crypto/aes";
import { bytesToUtf8, utf8ToBytes } from "@/lib/crypto/bytes";
import { InvalidPhraseError, createWallet, unlockWallet, type Wallet } from "@/lib/crypto/wallet";
import { wrapMnemonic, type WrappedKit } from "@/lib/crypto/wrap";
import {
  AccountNotFoundError,
  MAX_HOSTED_VAULT_CIPHERTEXT_LENGTH,
  VaultTooLargeError,
  authSettled,
  deleteAccount,
  hostedVault,
  isLogoutPending,
  loginWithWallet,
  logoutSession,
  retryPendingLogout,
  setLocalSessionCookieClearer,
  type StorageMode,
  type VaultBackend,
  type VaultBlob,
} from "@/lib/client/api";
import { UpdateRequiredError, onUpdateRequired } from "@/lib/client/http";
import { moveHostedDiaryToDevice } from "@/lib/client/move-to-device";
import {
  browserPendingSignupStore,
  type PendingSignupStore,
  type StoredPendingSignup,
} from "@/lib/client/pending-signup";
import {
  RestoreGeneration,
  isOpenSessionWallet,
  loadVaultWithSession,
  opensWithKey,
  restoreRetryDelay,
  retryAfterSignInOnce,
  saveWithMerge,
  settleWithin,
  shouldApplyRefresh,
  type LoadedVault,
} from "@/lib/client/vault-sync";
import { restoreKeptPhrase } from "@/lib/client/restore-session";
import { deviceLockReason, phraseKeyIsGone, type AuthPrompt, type DeviceLockReason } from "@/lib/device-vault";
import { OfflineError, offlineBackend, type HostedCopyStore } from "@/lib/hosted-copy";
import { diaryToJson, mergeDiaries } from "@/lib/diary-io";
import {
  InvalidConfirmError,
  InvalidCredentialsError,
  MailNotConfiguredError,
  RateLimitedError,
  clearLocalKits,
  confirmRecoveryCode,
  lastEmail,
  normalizeEmail,
  openKit,
  postRecoveryKit,
  saveLocalKit,
} from "@/lib/client/kit-store";
import {
  LOCALE_KEY,
  LUNAR_PHASES_ENABLED_KEY,
  LUNAR_PHASES_VISIBLE_KEY,
  TIME_ZONE_KEY,
  VISUAL_SEASONS_KEY,
  WEEK_STARTS_ON_KEY,
  migrateBrowserStorage,
  parseLunarPhasesEnabled,
  parseLunarPhasesVisible,
  parseVisualSeasons,
  parseWeekStartsOn,
} from "@/lib/client/storage-migrate";
import { browserPhraseStore, type PhraseStore } from "@/lib/client/phrase-store";
import { syncPoolIfDue } from "@/lib/pool-sync";
import {
  DIARY_SCHEMA_VERSION,
  NewerDiaryError,
  emptyDiary,
  parseDiary,
  parseNewerDiaryForDisplay,
  type Diary,
} from "@/lib/diary";
import { mergeDiaryEdits } from "@/lib/diary-merge";
import { FRIENDS_AVAILABLE, VISUAL_SEASONS_AVAILABLE } from "@/lib/features";
import { retryingFriendsApi, type SessionRun } from "@/lib/client/friends-api";
import { leaveFriends } from "@/lib/client/friends-sync";
import { type Locale, type Messages } from "@/lib/i18n";
import { initialLocale } from "@/lib/client/initial-locale";
import { loadLocale, messagesFor } from "@/lib/locales/registry";
import { useLocaleMessages } from "@/lib/locales/use-locale-messages";
import { COLOR_SCHEME_KEY, parseColorScheme, type ColorScheme } from "@/lib/client/color-scheme";
import {
  TIME_ZONE_AUTO,
  parseTimeZoneSetting,
  resolveTimeZone,
  type TimeZoneSetting,
} from "@/lib/time-zone";
import { todayInSavedZone, useTodayIn } from "@/lib/client/today";

type UnlockOptions = { create?: boolean; persist?: boolean };
type PersistOptions = { persist?: boolean };

type CicloContextValue = {
  ready: boolean;
  wallet: Wallet | null;
  diary: Diary;
  locale: Locale;
  visualSeasons: boolean;
  lunarPhasesEnabled: boolean;
  lunarPhasesVisible: boolean;
  weekStartsOn: 0 | 1;
  timeZone: TimeZoneSetting;
  colorScheme: ColorScheme;
  t: Messages;
  error: string | null;
  /** The phrase kept on this device could not sign in (offline, server error). It is still stored. */
  restoreFailed: boolean;
  /**
   * The host has no account for the phrase kept on this device (deleted from
   * another device, say). Nothing was created; the phrase is still stored.
   */
  restoreNoAccount: boolean;
  /**
   * With restoreFailed: a phrase is kept on this device but Android Keystore could
   * not open it. It blocks other sign-ins like a failed one; Try again or Forget.
   */
  restoreUnreadable: boolean;
  /** Web: a sign-out could not reach the host; the server session ends once this browser is back online. */
  sessionEndPending: boolean;
  retryRestore: () => Promise<void>;
  /**
   * The phrase kept on this device for a sign-in that did not open (restoreFailed,
   * restoreNoAccount). Throws when it cannot be read.
   */
  readSavedPhrase: () => Promise<string>;
  /**
   * Forgets the sign-in kept on this device after it did not open. Until then, every
   * other sign-in or sign-up throws SavedSignInError: it would replace the only copy
   * of that phrase. Throws if the kept phrase may still be there.
   */
  forgetSavedSignIn: () => Promise<void>;
  /**
   * Android, hosted account kept signed in: the host could not be reached at start,
   * so the diary on screen is the copy kept on this device, read-only. `savedAt` is
   * when that copy was last in step with the host. `retryRestore` tries the host again.
   */
  offline: { savedAt: string } | null;
  /**
   * Android: the hosted diary on screen is the copy kept on this device (offline,
   * or because the host refuses this build), last in step with the host then.
   */
  copySavedAt: string | null;
  /**
   * This build cannot save the open diary: a newer version of Ciclo saved it,
   * or the host refuses this Android build (426). The diary shows read-only and
   * the screen asks to update the app (`UpdateNotice`).
   */
  updateRequired: boolean;
  /** Nothing that saves the diary may run: the offline copy is open, or `updateRequired`. */
  readOnly: boolean;
  /**
   * The open diary was saved by a newer version of Ciclo: what is on screen may
   * lack entries this build cannot read. A CSV export would lose them too.
   */
  diaryNewer: boolean;
  /**
   * The diary as a JSON backup. For a diary from a newer build, its full text as
   * stored (an older build refuses to import it; a newer one reads it whole).
   */
  exportDiaryJson: () => string;
  /** Where the open diary lives. Null while nothing is open. */
  storageMode: StorageMode | null;
  /** Android: this install keeps an on-device diary that is not open (app lock, or the phrase is needed). */
  deviceLocked: boolean;
  /**
   * Android: why the on-device diary did not open at start (the lock screen explains
   * it and hides what cannot work). Null while it is open, or locked after the app
   * lock's time in the background.
   */
  deviceLockReason: DeviceLockReason | null;
  /**
   * Android: whether this install keeps an on-device diary could not be read. Never
   * taken as "no diary": the lock screen blocks everything and offers to try again.
   */
  deviceStatusFailed: boolean;
  /**
   * Android: deletes the on-device diary while it is locked (its phrase is lost, say).
   * Without the 12 words that diary is gone for good; the lock screen asks for a typed word first.
   */
  deleteLockedDeviceDiary: () => Promise<void>;
  /** Android, app lock on: the app is (or was just) in the background; the screen is covered. */
  appCovered: boolean;
  /** Android 11+ with a fingerprint or screen lock: the app lock can be turned on. */
  appLockAvailable: boolean;
  appLockEnabled: boolean;
  createDeviceDiary: (wallet: Wallet) => Promise<void>;
  /** Turning it off asks for the fingerprint or screen lock first, like opening the diary. */
  setAppLock: (enabled: boolean) => Promise<void>;
  /** On-device → hosted phrase account. Deletes the device copy once the host has it. */
  moveToHosted: () => Promise<void>;
  /**
   * Hosted → on-device. Copies the host's latest diary to the device, then deletes
   * the hosted account (and its email sign-in) at that version. "unconfirmed": the
   * diary is on the device, but the host's answer to the delete was lost and the
   * hosted account may still exist.
   */
  moveToDevice: () => Promise<{ hostedDeleted: "confirmed" | "unconfirmed" }>;
  /**
   * Resolves once the diary saved the new language, and rejects when that save fails.
   * Read-only (offline copy, or an update needed) or with no diary open, the language
   * changes on screen only and it always resolves.
   */
  setLocale: (locale: Locale) => Promise<void>;
  setVisualSeasons: (enabled: boolean) => void;
  setLunarPhasesEnabled: (enabled: boolean) => void;
  setLunarPhasesVisible: (visible: boolean) => void;
  setWeekStartsOn: (weekStartsOn: 0 | 1) => void;
  setTimeZone: (timeZone: TimeZoneSetting) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  startOnboarding: () => Wallet;
  unlock: (mnemonic: string, options?: UnlockOptions) => Promise<void>;
  createEmailAccount: (email: string, password: string, options?: PersistOptions) => Promise<void>;
  /**
   * An email sign-up waiting for its code, kept across app restarts (sealed in
   * Keystore on Android, this tab only on the web). `confirmed`: the host took the
   * code and only opening the diary is left.
   */
  pendingSignup: { email: string; confirmed: boolean } | null;
  /** Throws SignupConfirmedError when the code was taken but the diary did not open; calling it again just opens it. */
  confirmEmailAccount: (code: string) => Promise<void>;
  /** `confirmed`: an earlier code had already gone through, and the diary is now open. */
  resendEmailCode: () => Promise<{ confirmed: boolean }>;
  /**
   * Hosted account with no email sign-in (a phrase account, or one moved back from
   * this device): wraps the phrase with `password` and mails a 6-digit code to
   * `email`. The sign-in works once `confirmEmailSignIn` takes the code.
   */
  addEmailSignIn: (email: string, password: string) => Promise<{ pending: boolean }>;
  /** The address waiting for its code while an email sign-in is being added. */
  pendingEmailSignIn: string | null;
  confirmEmailSignIn: (code: string) => Promise<void>;
  resendEmailSignInCode: () => Promise<void>;
  cancelEmailSignIn: () => void;
  unlockWithPassword: (email: string, password: string, options?: PersistOptions) => Promise<void>;
  changePassword: (email: string, currentPassword: string, nextPassword: string) => Promise<void>;
  persistDiary: (next: Diary) => Promise<void>;
  enablePoolOptIn: () => Promise<void>;
  disablePoolOptIn: () => Promise<void>;
  /**
   * Runs a Friends call for the hosted account open now (signs in once and
   * retries on a 401 or account-mismatch; the call names that account). Null
   * while Friends is not available, nothing is open, or the diary lives only
   * on this device. FriendsProvider builds its session from it.
   */
  friendsRun: SessionRun | null;
  wipe: () => Promise<void>;
  signOut: () => Promise<void>;
  setError: (message: string | null) => void;
};

const CicloContext = createContext<CicloContextValue | null>(null);

/**
 * This device still keeps a sign-in that did not open at start (restoreFailed or
 * restoreNoAccount). Another sign-in or sign-up would replace the only copy of
 * that phrase, so it is refused until the person forgets it (`forgetSavedSignIn`).
 */
export class SavedSignInError extends Error {
  constructor() {
    super("A saved sign-in is still kept on this device");
    this.name = "SavedSignInError";
  }
}

/** The email sign-up's code was taken, but the diary did not open (no connection, say). Trying again only opens it. */
export class SignupConfirmedError extends Error {
  constructor() {
    super("The email is confirmed; the diary did not open");
    this.name = "SignupConfirmedError";
  }
}

type PendingEmailSignup = {
  wallet: Wallet;
  email: string;
  kit: WrappedKit;
  persist: boolean;
  confirmed: boolean;
};

function storedSignup(pending: PendingEmailSignup): StoredPendingSignup {
  return {
    mnemonic: pending.wallet.mnemonic,
    email: pending.email,
    kit: pending.kit,
    persist: pending.persist,
    confirmed: pending.confirmed,
  };
}

/** The vault was fetched but does not decrypt (or parse) with this key. */
export class VaultUnreadableError extends Error {
  constructor() {
    super("The diary on the host could not be opened with this key");
    this.name = "VaultUnreadableError";
  }
}

/**
 * A request that signs in once with `wallet` and runs again if the host answers
 * 401, or 409 `account-mismatch` (the session cookie is another account's).
 * `run` gets the account to name (`x-ciclo-account`): always `wallet`'s, the one
 * the retry signs in with, so a request never names another account. `isLive`:
 * the session it belongs to is still open; after a sign-out (or another account)
 * nothing signs in, and a sign-in already out is undone.
 */
function sessionRetry(wallet: Wallet, persist: boolean, isLive: () => boolean = () => true) {
  const retry = retryAfterSignInOnce(() => loginWithWallet(wallet, undefined, persist, { isLive }), isLive);
  return <T,>(run: (account: string) => Promise<T>): Promise<T> => retry(() => run(wallet.pubkeyHash));
}

// The start's first vault request waits this long, at most, for a sign-out still
// on its way (the session cookie it clears).
const AUTH_SETTLE_WAIT_MS = 2_000;

// Stands for a kept phrase that Keystore could not read: it blocks other sign-ins
// like a phrase whose sign-in failed, but can never equal a typed phrase.
const UNREADABLE_PHRASE = "\u0000unreadable";

// A sheet or dialog is open (they all set aria-modal for the Android back button).
// It may hold a draft built from the diary on screen, so a refresh waits.
function overlayOpen(): boolean {
  return typeof document !== "undefined" && document.querySelector('[aria-modal="true"]') !== null;
}

function persistFlag(options?: PersistOptions): boolean {
  return options?.persist !== false;
}

// A save that keeps hitting 409 means another device is saving nonstop. Give up
// and surface an error rather than loop.
const MAX_SAVE_ATTEMPTS = 3;

async function sealDiary(aesKey: Uint8Array, diary: Diary): Promise<VaultBlob> {
  const sealed = await encryptAesGcm(aesKey, utf8ToBytes(JSON.stringify(diary)));
  return { ciphertext: sealed.ciphertext, nonce: sealed.nonce, schemaVersion: diary.schemaVersion };
}

/** Decrypts and reads a sealed diary. Throws NewerDiaryError when a newer build saved it. */
async function openVault(aesKey: Uint8Array, blob: VaultBlob): Promise<Diary> {
  return parseDiary(bytesToUtf8(await decryptAesGcm(aesKey, blob.ciphertext, blob.nonce)));
}

/**
 * Like openVault, but a diary from a newer build comes back as far as this build
 * can read it, to be shown read-only and never saved, together with its full
 * decrypted text (`newerJson`), which is what an export of it must write.
 */
async function openVaultForDisplay(
  aesKey: Uint8Array,
  blob: VaultBlob,
  fallbackLocale: Locale,
): Promise<{ diary: Diary; newerJson: string | null }> {
  const json = bytesToUtf8(await decryptAesGcm(aesKey, blob.ciphertext, blob.nonce));
  try {
    return { diary: parseDiary(json), newerJson: null };
  } catch (cause) {
    if (!(cause instanceof NewerDiaryError)) throw cause;
    return { diary: parseNewerDiaryForDisplay(json, fallbackLocale), newerJson: json };
  }
}

// Wraps a backend so nothing can be saved through it: the diary came from a
// newer build, or the host refuses this one. Loading still works.
function updateRequiredBackend(inner: VaultBackend, reason: "server" | "diary"): VaultBackend {
  if (inner.updateRequired) return inner;
  return {
    ...inner,
    updateRequired: true,
    save: async () => {
      throw new UpdateRequiredError(reason);
    },
  };
}

// Android only. The web build still emits Capacitor as a lazy chunk, but this
// guard means the web never requests it.
async function loadDeviceStorage() {
  if (!IS_ANDROID_APP) throw new Error("On-device storage is Android-only");
  return import("@/lib/client/device-storage");
}

// Where a hosted account's phrase is kept between starts: browser storage on the
// web, Android Keystore in the app.
async function phraseStore(): Promise<PhraseStore> {
  if (!IS_ANDROID_APP) return browserPhraseStore;
  return (await loadDeviceStorage()).hostedPhraseStore;
}

// Android only: the sealed copy of a hosted diary, for reading without a connection.
async function hostedCopyStore(): Promise<HostedCopyStore | null> {
  if (!IS_ANDROID_APP) return null;
  return (await loadDeviceStorage()).hostedCopyStore;
}

const browserPendingSignups = browserPendingSignupStore(() =>
  typeof sessionStorage === "undefined" ? null : sessionStorage,
);

// Where an email sign-up waits for its code: this tab's sessionStorage on the web,
// Android Keystore in the app.
async function pendingSignupStore(): Promise<PendingSignupStore> {
  if (!IS_ANDROID_APP) return browserPendingSignups;
  return (await loadDeviceStorage()).pendingSignupStore;
}

// The offline copy is read-only: nothing that writes the diary or acts on the
// account runs on top of it, since the host may hold newer edits.
function assertOnline(backend: VaultBackend | null) {
  if (backend?.readOnlySince) throw new OfflineError();
}

// Everything that saves the diary checks this first: not on the offline copy,
// and not when this build must not save it (`updateRequired`).
function assertWritable(backend: VaultBackend | null) {
  assertOnline(backend);
  if (backend?.updateRequired) throw new UpdateRequiredError();
}

// Sign-out and account deletion only need the host to answer. The offline copy
// stops them, unless the copy is open because the host refused this build (426):
// then the host is reachable and never refuses either request.
function assertHostReachable(backend: VaultBackend | null, hostRefusesBuild: boolean) {
  if (!hostRefusesBuild) assertOnline(backend);
}

function authPrompt(locale: Locale): AuthPrompt {
  const t = messagesFor(locale);
  return { title: t.appLockPromptTitle, subtitle: t.appLockPromptSubtitle };
}

// With the app lock on, an on-device diary closes again after the app has been
// in the background this long.
const APP_LOCK_GRACE_MS = 30_000;

export function CicloProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [diary, setDiary] = useState<Diary>(emptyDiary("es"));
  const [visualSeasons, setVisualSeasonsState] = useState(false);
  const [lunarPhasesEnabled, setLunarPhasesEnabledState] = useState(true);
  const [lunarPhasesVisible, setLunarPhasesVisibleState] = useState(false);
  const [weekStartsOn, setWeekStartsOnState] = useState<0 | 1>(1);
  const [timeZone, setTimeZoneState] = useState<TimeZoneSetting>(TIME_ZONE_AUTO);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("system");
  const [error, setError] = useState<string | null>(null);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [restoreNoAccount, setRestoreNoAccount] = useState(false);
  // With restoreFailed: the kept phrase is there but Keystore could not open it.
  const [restoreUnreadable, setRestoreUnreadable] = useState(false);
  // Web: a sign-out could not reach the host, so its session cookie is still in this browser.
  const [sessionEndPending, setSessionEndPending] = useState(false);
  // Restarts the automatic retries after an action that stopped them failed.
  const [retryEpoch, setRetryEpoch] = useState(0);
  // The start-up restore and its retries: cancelled by sign-out, forgetting the
  // saved sign-in, a device diary, or a diary opened another way.
  const [restoreGen] = useState(() => new RestoreGeneration());
  // Stops the running loop of automatic retries.
  const retryLoopStopRef = useRef<(() => void) | null>(null);
  const [pendingSignup, setPendingSignup] = useState<PendingEmailSignup | null>(null);
  const [pendingEmailSignIn, setPendingEmailSignIn] = useState<{ email: string; kit: WrappedKit } | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode | null>(null);
  const [deviceLocked, setDeviceLocked] = useState(false);
  const [deviceLockReasonState, setDeviceLockReason] = useState<DeviceLockReason | null>(null);
  const [deviceStatusFailed, setDeviceStatusFailed] = useState(false);
  const [appCovered, setAppCovered] = useState(false);
  const [appLockAvailable, setAppLockAvailable] = useState(false);
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [offline, setOffline] = useState<{ savedAt: string } | null>(null);
  // When the copy on screen was last in step with the host, offline or not.
  const [copySavedAt, setCopySavedAt] = useState<string | null>(null);
  // The open diary was saved by a newer build (reset by every load).
  const [diaryNewer, setDiaryNewer] = useState(false);
  // The full decrypted text of that newer diary: exports write it unchanged.
  const newerDiaryJsonRef = useRef<string | null>(null);
  // The host answered 426 to this build. Lasts until the app restarts (updated).
  const [serverOutdated, setServerOutdated] = useState(false);
  const serverOutdatedRef = useRef(false);
  // Where the open diary is loaded from and saved to.
  const backendRef = useRef<VaultBackend | null>(null);
  // Android, hosted account with "Keep me signed in": keep a sealed copy of the
  // diary on the device, in step with the host, to read it without a connection.
  const keepCopyRef = useRef(false);
  // Android: this install keeps its diary on the device. A phrase then opens that
  // file and never signs in to a host, which would create an empty account there.
  const deviceDiaryRef = useRef(false);
  // Goes up whenever a diary opens or closes. Work that started for one session
  // (a save in flight, the pool sync after a load) never touches the next one.
  const sessionGenRef = useRef(0);
  // The wallet whose diary is open, and the session (sessionGenRef) it opened in.
  // Only it saves: a hosted save names its account (x-ciclo-account) and is sealed
  // with its key, so a save left from an earlier session (another account) can
  // never go out under the one open now.
  const sessionWalletRef = useRef<{ gen: number; wallet: Wallet } | null>(null);
  // The "Keep me signed in" choice of the hosted session open now, for signing in
  // again when its cookie expires while the app is open.
  const sessionPersistRef = useRef(true);
  // The phrase kept on this device whose sign-in did not open at start. Until it is
  // forgotten, no other sign-in or sign-up may replace it.
  const blockedPhraseRef = useRef<string | null>(null);

  const locale = diary.locale;
  // Spanish and English are always there; another language loads on first use.
  const t = useLocaleMessages(locale);
  // Not before `ready`: until then `locale` is the placeholder diary's "es" (what the
  // server renders), and writing it would undo the first-run language the Android
  // layout's boot script already put on <html>. Once ready the restored or first-run
  // locale is in place.
  useEffect(() => {
    if (ready) document.documentElement.lang = locale;
  }, [locale, ready]);

  // Loads and decrypts the vault before touching state. The wallet is set only
  // once the real diary is in memory: an unlocked wallet next to an empty diary
  // would let the next save upload that empty diary over the real one.
  // What the server holds as of this device's last load or save. Every save is
  // made on top of this version, and it is the base for merging another
  // device's edits (see lib/diary-merge.ts).
  const syncedRef = useRef<{ diary: Diary; version: number } | null>(null);
  // The diary on screen. Callers build `next` from it, so a queued save can
  // re-apply just that edit on top of saves that finished in the meantime.
  const shownDiaryRef = useRef<Diary>(diary);
  useEffect(() => {
    shownDiaryRef.current = diary;
  }, [diary]);
  // One save at a time on this device.
  const saveQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  // Saves (and moves) queued or running. A refresh from the host waits for none.
  const savesPendingRef = useRef(0);
  // One refresh from the host at a time.
  const refreshingRef = useRef(false);

  // Runs `task` after any save in flight, and holds later saves until it ends.
  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    savesPendingRef.current += 1;
    const run = async () => {
      try {
        return await task();
      } finally {
        savesPendingRef.current -= 1;
      }
    };
    const queued = saveQueueRef.current.then(run, run);
    saveQueueRef.current = queued.catch(() => undefined);
    return queued;
  }, []);

  // Writes the offline copy after a load from or a save to the host. Best effort:
  // the host has the diary either way.
  const keepCopy = useCallback(async (blob: VaultBlob, version: number) => {
    if (!keepCopyRef.current) return;
    const store = await hostedCopyStore();
    if (!store || !keepCopyRef.current) return;
    await store.write({ blob, version, savedAt: new Date().toISOString() }).catch(() => undefined);
    // Signed out (or the copy turned off) while that write was on its way: it must not stay.
    if (!keepCopyRef.current) await store.clear().catch(() => undefined);
  }, []);

  // The email sign-up waiting for its code, kept between starts.
  const writePendingSignup = useCallback(async (pending: PendingEmailSignup) => {
    const store = await pendingSignupStore().catch(() => null);
    await store?.write(storedSignup(pending));
  }, []);

  const dropPendingSignup = useCallback(async () => {
    setPendingSignup(null);
    const store = await pendingSignupStore().catch(() => null);
    await store?.clear();
  }, []);

  // Refuses a sign-in or sign-up that would replace a kept phrase whose sign-in
  // did not open. The same phrase typed again is fine.
  const assertNoSavedSignIn = useCallback((mnemonic?: string) => {
    const blocked = blockedPhraseRef.current;
    if (blocked && blocked !== mnemonic) throw new SavedSignInError();
  }, []);

  // Whether the open hosted diary keeps an offline copy. Without one, any copy
  // left on the device (another account, an earlier session) is deleted.
  const keepCopies = useCallback(async (keep: boolean) => {
    keepCopyRef.current = IS_ANDROID_APP && keep;
    if (keepCopyRef.current) return;
    const store = await hostedCopyStore().catch(() => null);
    await store?.clear().catch(() => undefined);
  }, []);

  // Cancels the start-up restore and its retries (one in flight never opens its
  // diary afterwards) and stops the timer that would start the next one.
  const cancelRestores = useCallback(() => {
    restoreGen.cancel();
    retryLoopStopRef.current?.();
    retryLoopStopRef.current = null;
  }, [restoreGen]);

  // Nothing open: no diary, backend or wallet (a failed start, or a retry that
  // found the kept phrase unusable with nothing on screen). Work started for the
  // session that was open stops (sessionGenRef).
  const closeDiaryState = useCallback((fallbackLocale: Locale) => {
    sessionGenRef.current += 1;
    backendRef.current = null;
    syncedRef.current = null;
    newerDiaryJsonRef.current = null;
    setStorageMode(null);
    setOffline(null);
    setCopySavedAt(null);
    setDiaryNewer(false);
    setWallet(null);
    setDiary(emptyDiary(fallbackLocale));
  }, []);

  // The vault for the kept phrase, at start or on a retry: the session cookie
  // first, a sign-in only if the host refuses it or its vault is another key's.
  // A load still out for the same phrase (a slow host) is shared, so retries do
  // not pile up requests that each wait a minute.
  const keptLoadRef = useRef<{
    mnemonic: string;
    isCancelled: () => boolean;
    promise: Promise<LoadedVault>;
  } | null>(null);
  const loadKeptVault = useCallback(
    (nextWallet: Wallet, persistCookie: boolean, isCancelled: () => boolean): Promise<LoadedVault> => {
      const running = keptLoadRef.current;
      if (running && running.mnemonic === nextWallet.mnemonic && !running.isCancelled()) return running.promise;
      const promise = loadVaultWithSession({
        fetchVault: async () => {
          // A sign-out still on its way gets a moment to finish, never more: a
          // cookie it would have cleared fails opensWithKey or gets a 401 anyway.
          await settleWithin(authSettled(), AUTH_SETTLE_WAIT_MS);
          return hostedVault.load();
        },
        signIn: () => loginWithWallet(nextWallet, undefined, persistCookie, { isLive: () => !isCancelled() }),
        opensWithKey: (blob) => opensWithKey(nextWallet.aesKey, blob),
        isCancelled,
      }).then(({ vault }) => vault);
      const entry = { mnemonic: nextWallet.mnemonic, isCancelled, promise };
      keptLoadRef.current = entry;
      void promise
        .catch(() => undefined)
        .finally(() => {
          if (keptLoadRef.current === entry) keptLoadRef.current = null;
        });
      return promise;
    },
    [],
  );

  // Ends the host session after a sign-out: never waits for it. Without a
  // connection, Android clears the cookie in its own jar (logoutSession); the web
  // says the server session ends once the browser is back online.
  const endHostSession = useCallback(() => {
    void logoutSession().then((ended) => {
      if (!IS_ANDROID_APP) setSessionEndPending(!ended);
    });
  }, []);

  // Saves `local` on top of the synced version. If another device saved first
  // (409), merges its edits in and tries again (lib/client/vault-sync.ts). Returns
  // what was stored. If the diary there was saved by a newer build, nothing is
  // merged or saved: the newer diary goes on screen read-only and this throws
  // UpdateRequiredError. A hosted save answered 401 (the session expired while
  // the app was open) or 409 account-mismatch (the cookie is another account's)
  // signs in once with `saver` and saves again. `saver` must be the wallet whose
  // diary is open: its key seals the diary and its account is the one the save
  // names, so the host never stores it in another account.
  const saveMerged = useCallback(async (saver: Wallet, local: Diary): Promise<Diary> => {
    const synced = syncedRef.current;
    const backend = backendRef.current;
    if (!synced || !backend) throw new Error("Locked");
    const gen = sessionGenRef.current;
    if (!isOpenSessionWallet(sessionWalletRef.current, gen, saver)) throw new Error("Locked");
    const live = () => sessionGenRef.current === gen;
    const withSession = sessionRetry(saver, sessionPersistRef.current, live);
    const result = await saveWithMerge({
      synced,
      local,
      maxAttempts: MAX_SAVE_ATTEMPTS,
      seal: (diary) => sealDiary(saver.aesKey, diary),
      save: (blob, baseVersion) => {
        // Signed out or locked meanwhile: nothing more is sent for that session.
        if (!live()) throw new Error("Locked");
        return backend === hostedVault
          ? withSession((account) => backend.save(blob, baseVersion, account))
          : backend.save(blob, baseVersion, saver.pubkeyHash);
      },
      openRemote: (blob, fallbackLocale) => openVaultForDisplay(saver.aesKey, blob, fallbackLocale),
      onSynced: (next) => {
        if (live()) syncedRef.current = next;
      },
    });
    if (!live()) throw new Error("Locked");
    if (result.kind === "newer") {
      backendRef.current = updateRequiredBackend(backend, "diary");
      syncedRef.current = { diary: result.diary, version: result.version };
      newerDiaryJsonRef.current = result.newerJson;
      setDiaryNewer(true);
      setDiary(result.diary);
      throw new UpdateRequiredError("diary");
    }
    if (backend === hostedVault) await keepCopy(result.blob, result.version);
    return result.diary;
  }, [keepCopy]);

  // Loads and decrypts the vault before touching state. The wallet is set only
  // once the real diary is in memory: an unlocked wallet next to an empty diary
  // would let the next save upload that empty diary over the real one.
  // `preloaded`: the vault already fetched from `backend` (startup, R1).
  // `fromRestore`: the start-up restore (or one of its retries) is opening it.
  // Opened any other way, a restore still running is cancelled.
  // Returns once the diary is on screen; the offline copy and the research pool
  // run after, so they never hold the first screen.
  const hydrate = useCallback(
    async (
      nextWallet: Wallet,
      fallbackLocale: Locale,
      backend: VaultBackend,
      options: { isCancelled?: () => boolean; preloaded?: LoadedVault; fromRestore?: boolean } = {},
    ) => {
      const isCancelled = options.isCancelled ?? (() => false);
      const vault = options.preloaded ?? (await backend.load());
      let opened: { diary: Diary; newerJson: string | null };
      try {
        opened = vault.blob
          ? await openVaultForDisplay(nextWallet.aesKey, vault.blob, fallbackLocale)
          : { diary: emptyDiary(fallbackLocale), newerJson: null };
      } catch {
        throw new VaultUnreadableError();
      }
      const { diary: loaded, newerJson } = opened;
      const newer = newerJson !== null;
      // The diary may be in another language than the last one on this device.
      await loadLocale(loaded.locale).catch(() => undefined);
      if (isCancelled()) return;
      if (!options.fromRestore) cancelRestores();
      // A diary from a newer build, or a hosted one with a build the host refuses: read-only.
      const refused = serverOutdatedRef.current && backend.mode === "hosted";
      const usable = newer || refused ? updateRequiredBackend(backend, newer ? "diary" : "server") : backend;
      const gen = (sessionGenRef.current += 1);
      sessionWalletRef.current = { gen, wallet: nextWallet };
      backendRef.current = usable;
      syncedRef.current = { diary: loaded, version: vault.version };
      newerDiaryJsonRef.current = newerJson;
      blockedPhraseRef.current = null;
      // A session is open: an email sign-up or an email sign-in left waiting is
      // given up, and any cookie a sign-out left behind was replaced.
      void dropPendingSignup().catch(() => undefined);
      setPendingEmailSignIn(null);
      setSessionEndPending(false);
      setRestoreUnreadable(false);
      setStorageMode(backend.mode);
      // The copy opened because the host refused this build is not "offline": the
      // host answers, and only an update helps (UpdateNotice says so). No retries.
      setOffline(backend.readOnlySince && !refused ? { savedAt: backend.readOnlySince } : null);
      setCopySavedAt(backend.readOnlySince ?? null);
      setDiaryNewer(newer);
      setDiary(loaded);
      setWallet(nextWallet);
      setRestoreFailed(false);
      setRestoreNoAccount(false);
      setDeviceLocked(false);
      setDeviceLockReason(null);
      setDeviceStatusFailed(false);
      const afterLoad = async () => {
        if (backend === hostedVault && vault.blob) await keepCopy(vault.blob, vault.version);
        if (!loaded.poolOptIn || usable.readOnlySince || usable.updateRequired) return;
        const withPool = await syncPoolIfDue(loaded);
        if (withPool.poolLastSyncedAt === loaded.poolLastSyncedAt) return;
        await enqueue(async () => {
          const synced = syncedRef.current;
          if (sessionGenRef.current !== gen || isCancelled() || !synced) return;
          // Just the pool fields, on top of anything saved since the load.
          const saved = await saveMerged(nextWallet, mergeDiaryEdits(loaded, withPool, synced.diary));
          if (sessionGenRef.current === gen && !isCancelled()) setDiary(saved);
        });
      };
      // The pool is optional; the next save retries it.
      void afterLoad().catch(() => undefined);
    },
    [cancelRestores, dropPendingSignup, enqueue, keepCopy, saveMerged],
  );

  // Android: opens the copy of the hosted diary kept on this device, read-only,
  // when the host cannot be reached at start. False when there is no copy this
  // phrase opens.
  const openOfflineCopy = useCallback(
    async (nextWallet: Wallet, fallbackLocale: Locale, isCancelled: () => boolean): Promise<boolean> => {
      const store = await hostedCopyStore().catch(() => null);
      const copy = await store?.read();
      if (!store || !copy) return false;
      try {
        await hydrate(nextWallet, fallbackLocale, offlineBackend(copy), { isCancelled, fromRestore: true });
        return true;
      } catch {
        // Another account's copy, or a damaged one. The host still has the diary.
        await store.clear().catch(() => undefined);
        return false;
      }
    },
    [hydrate],
  );

  // Opens this install's on-device diary with the phrase sealed in Keystore.
  // With the app lock on, Android asks for a fingerprint or the screen lock first.
  const openDeviceDiary = useCallback(
    async (fallbackLocale: Locale, isCancelled: () => boolean = () => false) => {
      const device = await loadDeviceStorage();
      const { phrase } = await device.deviceVault.readPhrase(authPrompt(fallbackLocale));
      await hydrate(unlockWallet(phrase), fallbackLocale, device.deviceBackend, { isCancelled, fromRestore: true });
    },
    [hydrate],
  );

  // Returns true when this install keeps an on-device diary, opened or not. Then
  // the hosted restore below must not run.
  const restoreDeviceDiary = useCallback(
    async (storedLocale: Locale, isCancelled: () => boolean): Promise<boolean> => {
      let device;
      let status;
      try {
        device = await loadDeviceStorage();
        status = await device.deviceVault.status();
      } catch {
        // Never read as "no diary": a diary that is there would be left closed while a
        // sign-up starts next to it. The lock screen blocks and offers to try again.
        // A retry while a diary is open (the offline copy) leaves it as it is.
        if (!isCancelled() && !backendRef.current) {
          closeDiaryState(storedLocale);
          setDeviceStatusFailed(true);
        }
        return true;
      }
      // Cancelled (sign-out, a diary opened another way): touch nothing.
      if (isCancelled()) return true;
      setDeviceStatusFailed(false);
      setAppLockAvailable(status.lockAvailable);
      setAppLockEnabled(status.phraseNeedsAuth);
      if (!status.hasDiary) return false;
      deviceDiaryRef.current = true;
      if (status.phraseNeedsAuth) {
        void device.deviceVault.setSecureScreen({ enabled: true }).catch(() => undefined);
      }
      try {
        await openDeviceDiary(storedLocale, isCancelled);
      } catch (cause) {
        // Canceled app lock, invalidated key, no sealed phrase, or an unreadable file.
        // The lock screen says which, and offers only what can work.
        if (isCancelled()) return true;
        setWallet(null);
        setDiary(emptyDiary(storedLocale));
        setDeviceLockReason(deviceLockReason(cause));
        setDeviceLocked(true);
      }
      return true;
    },
    [closeDiaryState, openDeviceDiary],
  );

  // An email sign-up left waiting for its code (the app was closed while the email
  // was read): it goes on where it stopped, with the account already created.
  const resumePendingSignup = useCallback(async (isCancelled: () => boolean) => {
    const store = await pendingSignupStore().catch(() => null);
    const stored = await store?.read();
    if (!store || !stored || isCancelled()) return;
    let pendingWallet: Wallet;
    try {
      pendingWallet = unlockWallet(stored.mnemonic);
    } catch {
      await store.clear();
      return;
    }
    setPendingSignup({
      wallet: pendingWallet,
      email: stored.email,
      kit: stored.kit,
      persist: stored.persist,
      confirmed: stored.confirmed,
    });
  }, []);

  // Signs in again with the phrase kept on this device. Only an unusable phrase
  // is forgotten. Network, server, or sign-in race failures keep it, so the
  // person can retry instead of losing access to a phrase-only diary. A host
  // with no account for it (deleted elsewhere, or a host that lost its data)
  // keeps it too: the account is never recreated empty, and the phrase is
  // never dropped on the host's word alone.
  const restoreStoredSession = useCallback(
    async (isCancelled: () => boolean = () => false) => {
      // Saved on this device, or else the device's own language (navigator.languages).
      const storedLocale = initialLocale();
      // Under the splash, so the first screen is already in that language.
      await loadLocale(storedLocale).catch(() => undefined);
      if (IS_ANDROID_APP && (await restoreDeviceDiary(storedLocale, isCancelled))) return;
      if (isCancelled()) return;
      const store = await phraseStore();
      // The order, the deadline for a silent host, and the cancellation rules live
      // in lib/client/restore-session.ts; these are its steps.
      await restoreKeptPhrase(
        {
          readKept: () => store.read(),
          clearKept: () => store.clear(),
          unlockWallet,
          diaryOpen: () => backendRef.current !== null,
          guard: (mnemonic) => {
            blockedPhraseRef.current = mnemonic;
          },
          prepare: (kept) => {
            // A phrase kept between starts is "Keep me signed in": the diary keeps an offline copy.
            keepCopyRef.current = IS_ANDROID_APP && kept.persist;
            sessionPersistRef.current = kept.persistCookie;
          },
          load: (nextWallet, kept) => loadKeptVault(nextWallet, kept.persistCookie, isCancelled),
          open: (nextWallet, vault, cancelled) =>
            hydrate(nextWallet, storedLocale, hostedVault, {
              isCancelled: cancelled,
              preloaded: vault,
              fromRestore: true,
            }),
          openCopy: async (nextWallet, cancelled) =>
            keepCopyRef.current && (await openOfflineCopy(nextWallet, storedLocale, cancelled)),
          showNoPhrase: async () => {
            blockedPhraseRef.current = null;
            setRestoreUnreadable(false);
            setDiary(emptyDiary(storedLocale));
            await resumePendingSignup(isCancelled);
          },
          showUnreadable: () => {
            // A phrase is kept but Keystore could not open it. It may be the only copy:
            // like a failed sign-in, it blocks every other sign-in or sign-up until it
            // opens (Try again) or is forgotten on purpose.
            closeDiaryState(storedLocale);
            blockedPhraseRef.current = UNREADABLE_PHRASE;
            setRestoreNoAccount(false);
            setRestoreUnreadable(true);
            setRestoreFailed(true);
          },
          showFailed: (nextWallet, noAccount) => {
            closeDiaryState(storedLocale);
            // The only copy of this phrase may be here: nothing replaces it until it is forgotten.
            blockedPhraseRef.current = nextWallet.mnemonic;
            setRestoreUnreadable(false);
            setRestoreNoAccount(noAccount);
            setRestoreFailed(!noAccount);
          },
        },
        isCancelled,
      );
    },
    [closeDiaryState, hydrate, loadKeptVault, openOfflineCopy, restoreDeviceDiary, resumePendingSignup],
  );

  // The button, a reconnect, the app returning to the front, or the timer. One at
  // a time, and a sign-out (or another account) cancels it (RestoreGeneration).
  const retryRestore = useCallback(
    () => restoreGen.run((isCancelled) => restoreStoredSession(isCancelled)),
    [restoreGen, restoreStoredSession],
  );

  // Any API request answered 426: the host no longer serves this Android build.
  // A hosted diary that is open stays readable but nothing more is saved until
  // the app is updated. An on-device diary needs no host and is left alone.
  useEffect(
    () =>
      onUpdateRequired(() => {
        serverOutdatedRef.current = true;
        setServerOutdated(true);
        const backend = backendRef.current;
        if (backend?.mode === "hosted") backendRef.current = updateRequiredBackend(backend, "server");
      }),
    [],
  );

  // While the offline copy is on screen, or after a start that could not reach the
  // host, try the host again: when the connection comes back, when the app returns
  // to the front, and on a timer that waits longer each time. It stops once the
  // diary opens from the host (offline and restoreFailed both clear).
  // `cancelRestores` (sign-out, Forget, a device diary, a diary opened another
  // way) stops this loop at once; `retryEpoch` starts it again after one of those
  // failed and left the person where they were.
  const needsRetry = offline !== null || restoreFailed;
  useEffect(() => {
    if (!needsRetry) return;
    let stopped = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      stopped = true;
      clearTimeout(timer);
    };
    retryLoopStopRef.current = stop;
    const canTry = () => document.visibilityState !== "hidden" && navigator.onLine;
    const retry = () => {
      if (!stopped && canTry()) void retryRestore();
    };
    const schedule = () => {
      timer = setTimeout(() => {
        if (stopped) return;
        const run = canTry() ? retryRestore() : Promise.resolve();
        attempt += 1;
        void run.finally(() => {
          if (!stopped) schedule();
        });
      }, restoreRetryDelay(attempt));
    };
    schedule();
    window.addEventListener("online", retry);
    document.addEventListener("visibilitychange", retry);
    return () => {
      stop();
      if (retryLoopStopRef.current === stop) retryLoopStopRef.current = null;
      window.removeEventListener("online", retry);
      document.removeEventListener("visibilitychange", retry);
    };
  }, [needsRetry, retryEpoch, retryRestore]);

  // Android: a sign-out that cannot reach the host clears the session cookie in
  // the app's own cookie jar (the one native HTTP uses).
  useEffect(() => {
    if (!IS_ANDROID_APP) return;
    setLocalSessionCookieClearer(async () => {
      const device = await loadDeviceStorage();
      await device.deviceVault.clearSessionCookie({ url: apiUrl("/") });
    });
    return () => setLocalSessionCookieClearer(null);
  }, []);

  // A sign-out that could not reach the host left its session cookie: clear it
  // once the connection is back (never while a sign-in is running).
  useEffect(() => {
    const retry = () =>
      void retryPendingLogout().then((ended) => {
        if (!IS_ANDROID_APP) setSessionEndPending(!ended);
      });
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const startGuard = restoreGen.guard();
    const isCancelled = () => cancelled || startGuard();
    migrateBrowserStorage();
    void retryPendingLogout().then((ended) => {
      if (!cancelled && !IS_ANDROID_APP) setSessionEndPending(!ended && isLogoutPending());
    });
    void (async () => {
      try {
        await Promise.resolve();
        setVisualSeasonsState(parseVisualSeasons(localStorage.getItem(VISUAL_SEASONS_KEY)));
        setLunarPhasesEnabledState(
          parseLunarPhasesEnabled(localStorage.getItem(LUNAR_PHASES_ENABLED_KEY)),
        );
        setLunarPhasesVisibleState(
          parseLunarPhasesVisible(localStorage.getItem(LUNAR_PHASES_VISIBLE_KEY)),
        );
        setWeekStartsOnState(parseWeekStartsOn(localStorage.getItem(WEEK_STARTS_ON_KEY)));
        setTimeZoneState(parseTimeZoneSetting(localStorage.getItem(TIME_ZONE_KEY)));
        setColorSchemeState(parseColorScheme(localStorage.getItem(COLOR_SCHEME_KEY)));
        await restoreStoredSession(isCancelled);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    // StrictMode mounts twice in development; only the live run may set state.
    return () => {
      cancelled = true;
    };
  }, [restoreGen, restoreStoredSession]);

  const persistDiary = useCallback(
    (next: Diary) => {
      // The caller's edit is the change from what was on screen to `next`.
      const shown = shownDiaryRef.current;
      return enqueue(async () => {
        if (!wallet || !syncedRef.current) throw new Error("Locked");
        assertWritable(backendRef.current);
        const gen = sessionGenRef.current;
        // Re-apply that edit on top of anything saved since the caller rendered.
        let local = mergeDiaryEdits(shown, parseDiary(next), syncedRef.current.diary);
        if (local.poolOptIn) {
          local = await syncPoolIfDue(local);
        }
        const saved = await saveMerged(wallet, local);
        if (sessionGenRef.current !== gen) return;
        setDiary(saved);
        localStorage.setItem(LOCALE_KEY, saved.locale);
      });
    },
    [enqueue, wallet, saveMerged],
  );

  // When the app returns to the front (or comes back online), fetch the hosted
  // vault: entries made on another device show up without a save or a restart.
  // It replaces the diary in memory only under `shouldApplyRefresh`; otherwise the
  // next save meets the newer version as a 409 and merges it.
  const refreshHostedVault = useCallback(
    async (current: Wallet) => {
      if (refreshingRef.current || backendRef.current !== hostedVault || !syncedRef.current) return;
      refreshingRef.current = true;
      const gen = sessionGenRef.current;
      const live = () => sessionGenRef.current === gen;
      try {
        const vault = await sessionRetry(current, sessionPersistRef.current, live)(() => hostedVault.load());
        const applies = () =>
          sessionGenRef.current === gen &&
          backendRef.current === hostedVault &&
          shouldApplyRefresh({
            syncedVersion: syncedRef.current?.version ?? null,
            fetchedVersion: vault.version,
            savesPending: savesPendingRef.current,
            overlayOpen: overlayOpen(),
          });
        if (!vault.blob || !applies()) return;
        // A vault this key cannot open (another tab signed in to another account) throws here: nothing changes.
        const opened = await openVaultForDisplay(current.aesKey, vault.blob, shownDiaryRef.current.locale);
        await loadLocale(opened.diary.locale).catch(() => undefined);
        if (!applies()) return;
        if (opened.newerJson !== null) {
          // Saved by a newer build: on screen read-only, never saved back.
          backendRef.current = updateRequiredBackend(hostedVault, "diary");
          newerDiaryJsonRef.current = opened.newerJson;
          setDiaryNewer(true);
        }
        syncedRef.current = { diary: opened.diary, version: vault.version };
        setDiary(opened.diary);
        await keepCopy(vault.blob, vault.version);
      } catch {
        // The next return to the front, or the next save, tries again.
      } finally {
        refreshingRef.current = false;
      }
    },
    [keepCopy],
  );

  useEffect(() => {
    if (!wallet || storageMode !== "hosted" || offline) return;
    const refresh = () => {
      if (document.visibilityState === "hidden" || !navigator.onLine) return;
      void refreshHostedVault(wallet);
    };
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [offline, refreshHostedVault, storageMode, wallet]);

  // Opens the on-device diary with a typed or scanned phrase, for when Keystore
  // cannot: the app lock was canceled, a new fingerprint invalidated the key, or
  // the sealed phrase is gone. A wrong phrase fails to decrypt the file.
  const unlockDeviceWithPhrase = useCallback(
    async (mnemonic: string) => {
      const nextWallet = unlockWallet(mnemonic);
      const device = await loadDeviceStorage();
      const { blob } = await device.deviceBackend.load();
      if (!blob) throw new Error("The device diary is empty");
      // The phrase is right when it decrypts the file; reading it (a diary from
      // a newer build opens read-only) is hydrate's job.
      try {
        await decryptAesGcm(nextWallet.aesKey, blob.ciphertext, blob.nonce);
      } catch {
        throw new InvalidPhraseError();
      }
      try {
        await device.deviceVault.storePhrase({
          ...authPrompt(locale),
          phrase: nextWallet.mnemonic,
          requireAuth: appLockEnabled,
        });
      } catch {
        // The diary still opens. The next start asks for the phrase again.
      }
      await hydrate(nextWallet, locale, device.deviceBackend);
    },
    [appLockEnabled, hydrate, locale],
  );

  const createDeviceDiary = useCallback(
    async (nextWallet: Wallet) => {
      if (!IS_ANDROID_APP) throw new Error("On-device diaries are Android-only");
      // It deletes the hosted phrase kept on this device below.
      assertNoSavedSignIn();
      // One diary per install: a hosted restore still running must never open after this.
      cancelRestores();
      try {
        const device = await loadDeviceStorage();
        const status = await device.deviceVault.status();
        // One diary per install. Never replace one that exists.
        if (status.hasDiary) throw new Error("This device already has a diary");
        const created = await device.deviceBackend.save(
          await sealDiary(nextWallet.aesKey, emptyDiary(locale)),
          0,
          nextWallet.pubkeyHash,
        );
        if (!created.ok) throw new Error("This device already has a diary");
        deviceDiaryRef.current = true;
        await device.deviceVault.storePhrase({ ...authPrompt(locale), phrase: nextWallet.mnemonic, requireAuth: false });
        // A phrase left by a hosted session would make the next start sign in too.
        await device.hostedPhraseStore.clear().catch(() => undefined);
        await keepCopies(false);
        setAppLockAvailable(status.lockAvailable);
        setAppLockEnabled(false);
        // hydrate also gives up an email sign-up left waiting for its code.
        await hydrate(nextWallet, locale, device.deviceBackend);
      } catch (cause) {
        // Nothing opened: the automatic retries that were cancelled above start again.
        setRetryEpoch((epoch) => epoch + 1);
        throw cause;
      }
    },
    [assertNoSavedSignIn, cancelRestores, hydrate, keepCopies, locale],
  );

  const setAppLock = useCallback(
    async (enabled: boolean) => {
      if (!wallet || storageMode !== "device") throw new Error("No on-device diary is open");
      const device = await loadDeviceStorage();
      if (!enabled && appLockEnabled) {
        // Turning the lock off takes the same check as opening the diary: a phone
        // left unlocked with Ciclo open must not be enough.
        try {
          const { phrase } = await device.deviceVault.readPhrase(authPrompt(locale));
          if (phrase !== wallet.mnemonic) throw new Error("The sealed phrase does not open this diary");
        } catch (cause) {
          // A key that a screen-lock change invalidated (or a sealed phrase that is gone)
          // can never pass the check; the diary is open because its 12 words were typed.
          // A canceled or failed check stops here.
          if (!phraseKeyIsGone(cause)) throw cause;
        }
      }
      // Re-seals the phrase with the app-lock key (or back to the plain one).
      await device.deviceVault.storePhrase({ ...authPrompt(locale), phrase: wallet.mnemonic, requireAuth: enabled });
      setAppLockEnabled(enabled);
      await device.deviceVault.setSecureScreen({ enabled });
    },
    [appLockEnabled, locale, storageMode, wallet],
  );

  // Takes the key and the diary out of memory. Unlocking reads the phrase again.
  const lockDevice = useCallback(async () => {
    await enqueue(async () => {
      sessionGenRef.current += 1;
      syncedRef.current = null;
      backendRef.current = null;
      setStorageMode(null);
      setWallet(null);
      setDiary((current) => emptyDiary(current.locale));
      setDeviceLockReason(null);
      setDeviceLocked(true);
      // The lock screen covers it from here.
      setAppCovered(false);
    });
  }, [enqueue]);

  useEffect(() => {
    if (storageMode !== "device" || !appLockEnabled || !wallet) return;
    let hiddenAt: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        // Cover the diary now, in this event, so neither the recent-apps view nor the
        // first frame on return shows it (FLAG_SECURE blanks screenshots, not that frame).
        flushSync(() => setAppCovered(true));
        // Close it in the background too, while timers still run there.
        clearTimeout(timer);
        timer = setTimeout(() => void lockDevice(), APP_LOCK_GRACE_MS);
        return;
      }
      clearTimeout(timer);
      const expired = hiddenAt !== null && Date.now() - hiddenAt >= APP_LOCK_GRACE_MS;
      hiddenAt = null;
      // Past the grace time the lock screen replaces the cover (lockDevice lifts it).
      if (expired) void lockDevice();
      else setAppCovered(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [appLockEnabled, lockDevice, storageMode, wallet]);

  // Android: deletes the on-device diary while it is locked and cannot be opened
  // (the phrase is lost, the file is damaged). The lock screen asks for a typed word.
  const deleteLockedDeviceDiary = useCallback(
    () =>
      enqueue(async () => {
        if (!IS_ANDROID_APP || !deviceDiaryRef.current) throw new Error("No locked on-device diary");
        const device = await loadDeviceStorage();
        await device.deviceVault.clear();
        deviceDiaryRef.current = false;
        sessionGenRef.current += 1;
        syncedRef.current = null;
        backendRef.current = null;
        setDeviceLocked(false);
        setDeviceLockReason(null);
        setAppLockEnabled(false);
        await device.deviceVault.setSecureScreen({ enabled: false }).catch(() => undefined);
      }),
    [enqueue],
  );

  // Order matters: the device copy is deleted only once the host holds the
  // diary, so a failure at any step leaves at least one full copy. If this phrase
  // already has a hosted diary, both are combined like an import.
  const moveToHosted = useCallback(
    () =>
      enqueue(async () => {
        const synced = syncedRef.current;
        if (!wallet || storageMode !== "device" || !synced) throw new Error("No on-device diary is open");
        assertWritable(backendRef.current);
        const local = synced.diary;
        // The host refuses a vault over its size cap (413). Say so before anything
        // is created, rather than stopping half-way with an empty account.
        if ((await sealDiary(wallet.aesKey, local)).ciphertext.length > MAX_HOSTED_VAULT_CIPHERTEXT_LENGTH) {
          throw new VaultTooLargeError();
        }
        // The account is created with an empty diary: the first vault of a new
        // account is capped (MAX_INITIAL_VAULT_CIPHERTEXT_LENGTH) and a diary
        // kept on the phone for a year or two is larger. The real one is saved
        // on top of it right below, like any save; until then the device keeps it.
        const created = await loginWithWallet(wallet, await sealDiary(wallet.aesKey, emptyDiary(local.locale)), true);
        const remote = await hostedVault.load();
        // A new account (or one left empty by a move that stopped half-way) gets
        // the device diary whole, settings included. An account that already
        // holds entries is combined with this one like an import.
        let next = local;
        if (!created && remote.blob) {
          let remoteDiary: Diary;
          try {
            remoteDiary = await openVault(wallet.aesKey, remote.blob);
          } catch (cause) {
            // A newer build saved the hosted diary: merging here would lose what it added.
            if (cause instanceof NewerDiaryError) throw new UpdateRequiredError("diary");
            throw cause;
          }
          const holdsEntries =
            Object.keys(remoteDiary.days).length > 0 ||
            remoteDiary.periodStarts.length > 0 ||
            remoteDiary.customSymptoms.length > 0;
          if (holdsEntries) {
            // Entries are combined; the settings are the device diary's, the one
            // in use now (an account left by an earlier move may hold old ones).
            const merged = mergeDiaries(remoteDiary, local, local.locale);
            next = parseDiary({
              ...merged,
              locale: local.locale,
              poolOptIn: local.poolOptIn,
              poolContributorKey: local.poolContributorKey,
              poolLastSyncedAt: local.poolLastSyncedAt,
              favoriteSymptomIds: local.favoriteSymptomIds,
              forecastingEnabled: local.forecastingEnabled,
            });
          }
        }
        const sealed = await sealDiary(wallet.aesKey, next);
        // Combined with what the account already held, it may be over the cap now.
        if (sealed.ciphertext.length > MAX_HOSTED_VAULT_CIPHERTEXT_LENGTH) throw new VaultTooLargeError();
        // Names this wallet's account: if a late sign-in for another account replaced
        // the cookie meanwhile, the host refuses (AccountMismatchError) and nothing
        // is written or deleted.
        const saved = await hostedVault.save(sealed, remote.version, wallet.pubkeyHash);
        if (!saved.ok) throw new Error("The hosted diary changed during the move");
        const device = await loadDeviceStorage();
        // Keep the phrase for the hosted account (sealed in Keystore and read back)
        // before the device files go: if it failed afterwards, the next start would
        // need the 12 words typed. A failure here stops the move with nothing deleted.
        await device.hostedPhraseStore.writeVerified(wallet.mnemonic);
        try {
          // Native side: the diary file goes first and is checked gone; only then the device phrase.
          await device.deviceVault.clear();
        } catch (cause) {
          // Nothing switches: the device diary stays in charge. The phrase kept for the
          // host goes again, unless the device phrase is already gone: then it is the
          // only phrase kept on this phone (and the host has the diary).
          const after = await device.deviceVault.status().catch(() => null);
          if (after?.hasPhrase) await device.hostedPhraseStore.clear().catch(() => undefined);
          throw cause;
        }
        // The host holds the diary now. Switch to it with what is already in hand:
        // a network failure after this point must never leave the device backend
        // in charge of a file that is gone.
        deviceDiaryRef.current = false;
        sessionPersistRef.current = true;
        backendRef.current = hostedVault;
        syncedRef.current = { diary: next, version: saved.version };
        newerDiaryJsonRef.current = null;
        setStorageMode("hosted");
        setOffline(null);
        setCopySavedAt(null);
        setDiaryNewer(false);
        setDiary(next);
        setAppLockEnabled(false);
        await device.deviceVault.setSecureScreen({ enabled: false }).catch(() => undefined);
        await keepCopies(true);
        await keepCopy(sealed, saved.version);
      }),
    [enqueue, keepCopies, keepCopy, storageMode, wallet],
  );

  // The hosted account is deleted only once the device holds the host's latest
  // diary, and only at that version. See lib/client/move-to-device.ts for when
  // the device copy is removed again.
  const moveToDevice = useCallback(
    () =>
      enqueue(async () => {
        const synced = syncedRef.current;
        if (!IS_ANDROID_APP || !wallet || storageMode !== "hosted" || !synced) {
          throw new Error("No hosted diary is open");
        }
        // The move copies what the host has, then deletes the account: never from the offline copy.
        assertWritable(backendRef.current);
        const device = await loadDeviceStorage();
        const status = await device.deviceVault.status();
        if (status.hasDiary) throw new Error("This device already has a diary");
        // A session that expired while the app was open (401) signs in once and
        // asks again; it never counts as the host refusing the delete.
        const gen = sessionGenRef.current;
        const live = () => sessionGenRef.current === gen;
        const loadSession = sessionRetry(wallet, sessionPersistRef.current, live);
        const deleteSession = sessionRetry(wallet, sessionPersistRef.current, live);
        let result;
        try {
          result = await moveHostedDiaryToDevice({
            loadHosted: () => loadSession(() => hostedVault.load()),
            open: (blob) => openVault(wallet.aesKey, blob),
            seal: (next) => sealDiary(wallet.aesKey, next),
            writeDevice: async (blob) => (await device.deviceBackend.save(blob, 0, wallet.pubkeyHash)).ok,
            storePhrase: () =>
              device.deviceVault.storePhrase({
                ...authPrompt(synced.diary.locale),
                phrase: wallet.mnemonic,
                requireAuth: false,
              }),
            clearDevice: () => device.deviceVault.clear(),
            deleteHosted: async (baseVersion) => {
              // Right before the account goes, tell friends (best effort).
              if (FRIENDS_AVAILABLE) {
                const session = { api: retryingFriendsApi(deleteSession), account: wallet.pubkeyHash, friendsKey: wallet.friendsKey };
                await leaveFriends(session, todayInSavedZone()).catch(() => undefined);
              }
              return deleteSession((account) => deleteAccount(account, baseVersion));
            },
            probeHosted: async () => {
              await loginWithWallet(wallet, undefined, true, { isLive: live });
            },
          });
        } catch (cause) {
          // A newer build saved the hosted diary: show it read-only, ask for an update.
          if (cause instanceof NewerDiaryError) {
            await hydrate(wallet, synced.diary.locale, hostedVault);
            throw new UpdateRequiredError("diary");
          }
          throw cause;
        }
        await device.hostedPhraseStore.clear().catch(() => undefined);
        await keepCopies(false);
        clearLocalKits();
        deviceDiaryRef.current = true;
        setAppLockAvailable(status.lockAvailable);
        setAppLockEnabled(false);
        await hydrate(wallet, result.diary.locale, device.deviceBackend);
        return { hostedDeleted: result.hostedDeleted };
      }),
    [enqueue, hydrate, keepCopies, storageMode, wallet],
  );

  const unlock = useCallback(
    async (mnemonic: string, options?: UnlockOptions) => {
      if (deviceDiaryRef.current) {
        await unlockDeviceWithPhrase(mnemonic);
        return;
      }
      const persist = persistFlag(options);
      const nextWallet = unlockWallet(mnemonic);
      // It replaces the phrase kept on this device below.
      assertNoSavedSignIn(nextWallet.mnemonic);
      if (options?.create) {
        const seed = emptyDiary(locale);
        const sealed = await encryptAesGcm(nextWallet.aesKey, utf8ToBytes(JSON.stringify(seed)));
        await loginWithWallet(
          nextWallet,
          {
            ciphertext: sealed.ciphertext,
            nonce: sealed.nonce,
            schemaVersion: DIARY_SCHEMA_VERSION,
          },
          persist,
        );
      } else {
        await loginWithWallet(nextWallet, undefined, persist);
      }
      sessionPersistRef.current = persist;
      await (await phraseStore()).write(nextWallet.mnemonic, persist);
      await keepCopies(persist);
      // hydrate also gives up an email sign-up left waiting for its code.
      await hydrate(nextWallet, locale, hostedVault);
    },
    [assertNoSavedSignIn, hydrate, keepCopies, locale, unlockDeviceWithPhrase],
  );

  // The end of an email sign-up, once the host took the code: keep the kit and the
  // phrase, then open the diary. A failure to open it is SignupConfirmedError, so
  // the screen does not ask for a code again; the sign-up stays kept until it opens.
  const completeSignup = useCallback(
    async (pending: PendingEmailSignup, withSession: ReturnType<typeof sessionRetry>) => {
      saveLocalKit(pending.email, pending.kit);
      await (await phraseStore()).write(pending.wallet.mnemonic, pending.persist);
      await keepCopies(pending.persist);
      sessionPersistRef.current = pending.persist;
      try {
        const vault = await withSession(() => hostedVault.load());
        await hydrate(pending.wallet, locale, hostedVault, { preloaded: vault });
      } catch (cause) {
        if (cause instanceof UpdateRequiredError) throw cause;
        throw new SignupConfirmedError();
      }
      await dropPendingSignup();
    },
    [dropPendingSignup, hydrate, keepCopies, locale],
  );

  // The phrase whose sign-in did not open is already in memory; read the store
  // only otherwise. Throws when it cannot be read (Keystore failed), so the screen
  // says so instead of showing nothing.
  const readSavedPhrase = useCallback(async () => {
    const blocked = blockedPhraseRef.current;
    if (blocked && blocked !== UNREADABLE_PHRASE) return blocked;
    const { mnemonic } = await (await phraseStore()).read();
    if (!mnemonic) throw new Error("The saved phrase could not be read");
    return mnemonic;
  }, []);

  const forgetSavedSignIn = useCallback(async () => {
    // A retry still running must never open that account after this.
    cancelRestores();
    try {
      // Throws if the kept phrase may still be there: the screen keeps offering it.
      await (await phraseStore()).clear();
    } catch (cause) {
      // Still kept: the automatic retries go on.
      setRetryEpoch((epoch) => epoch + 1);
      throw cause;
    }
    blockedPhraseRef.current = null;
    await keepCopies(false);
    clearLocalKits();
    setRestoreUnreadable(false);
    setRestoreFailed(false);
    setRestoreNoAccount(false);
    // The session cookie of that account, if any. Best effort.
    endHostSession();
  }, [cancelRestores, endHostSession, keepCopies]);

  // A 401 / account-mismatch retry for a request made in the session open now, by
  // the wallet whose diary is open (`who`). A handler kept with another wallet, or
  // from a session that has ended (sign-out, lock, another account), sends nothing
  // ("Locked") and never signs that wallet in over the session open now.
  const liveSessionRetry = useCallback((who: Wallet) => {
    const gen = sessionGenRef.current;
    const live = () => sessionGenRef.current === gen && isOpenSessionWallet(sessionWalletRef.current, gen, who);
    const retry = sessionRetry(who, sessionPersistRef.current, live);
    return <T,>(run: (account: string) => Promise<T>): Promise<T> =>
      live() ? retry(run) : Promise.reject(new Error("Locked"));
  }, []);

  // Friends calls for the open wallet, each through a live session retry made
  // when it runs (so a call kept after a sign-out sends nothing).
  const friendsOpen = FRIENDS_AVAILABLE && wallet !== null && storageMode === "hosted";
  const friendsRun = useCallback<SessionRun>(
    (call) => (wallet ? liveSessionRetry(wallet)(call) : Promise.reject(new Error("Locked"))),
    [liveSessionRetry, wallet],
  );
  // Before the hosted account goes: tell friends and delete the friend book
  // and invites. Best effort: what is missed nobody can read, and expires.
  const leaveFriendsFirst = useCallback(
    async (who: Wallet) => {
      if (!FRIENDS_AVAILABLE) return;
      const session = {
        api: retryingFriendsApi((call) => liveSessionRetry(who)(call)),
        account: who.pubkeyHash,
        friendsKey: who.friendsKey,
      };
      await leaveFriends(session, todayInSavedZone()).catch(() => undefined);
    },
    [liveSessionRetry],
  );

  // A refusal from the host matters for a hosted diary (or before one opens),
  // never for an on-device diary.
  const updateRequired = diaryNewer || (serverOutdated && storageMode !== "device" && !deviceLocked);
  const readOnly = offline !== null || updateRequired;

  const value = useMemo<CicloContextValue>(
    () => ({
      ready,
      wallet,
      diary,
      locale,
      visualSeasons: VISUAL_SEASONS_AVAILABLE && visualSeasons,
      lunarPhasesEnabled,
      lunarPhasesVisible,
      weekStartsOn,
      timeZone,
      colorScheme,
      t,
      error,
      setError,
      restoreFailed,
      restoreNoAccount,
      restoreUnreadable,
      sessionEndPending,
      retryRestore,
      readSavedPhrase,
      forgetSavedSignIn,
      offline,
      copySavedAt,
      updateRequired,
      readOnly,
      storageMode,
      deviceLocked,
      deviceLockReason: deviceLockReasonState,
      deviceStatusFailed,
      deleteLockedDeviceDiary,
      appCovered,
      appLockAvailable,
      appLockEnabled,
      createDeviceDiary,
      setAppLock,
      moveToHosted,
      moveToDevice,
      setLocale: (nextLocale) => {
        localStorage.setItem(LOCALE_KEY, nextLocale);
        // Load the language first, so the screen changes in one step.
        return loadLocale(nextLocale)
          .catch(() => undefined)
          .then(async () => {
            // Read-only (offline copy, or an update needed) the language changes on screen only.
            if (wallet && !readOnly) {
              await persistDiary({ ...shownDiaryRef.current, locale: nextLocale });
            } else {
              setDiary((current) => ({ ...current, locale: nextLocale }));
            }
          });
      },
      setVisualSeasons: (enabled) => {
        localStorage.setItem(VISUAL_SEASONS_KEY, String(enabled));
        setVisualSeasonsState(enabled);
      },
      setLunarPhasesEnabled: (enabled) => {
        localStorage.setItem(LUNAR_PHASES_ENABLED_KEY, String(enabled));
        setLunarPhasesEnabledState(enabled);
      },
      setLunarPhasesVisible: (visible) => {
        localStorage.setItem(LUNAR_PHASES_VISIBLE_KEY, String(visible));
        setLunarPhasesVisibleState(visible);
      },
      setWeekStartsOn: (next) => {
        localStorage.setItem(WEEK_STARTS_ON_KEY, String(next));
        setWeekStartsOnState(next);
      },
      setTimeZone: (next) => {
        const parsed = parseTimeZoneSetting(next);
        localStorage.setItem(TIME_ZONE_KEY, parsed);
        setTimeZoneState(parsed);
      },
      setColorScheme: (scheme) => {
        localStorage.setItem(COLOR_SCHEME_KEY, scheme);
        setColorSchemeState(scheme);
      },
      startOnboarding: () => createWallet(),
      unlock,
      createEmailAccount: async (email, password, options) => {
        assertNoSavedSignIn();
        const persist = persistFlag(options);
        const normalized = normalizeEmail(email);
        // The code was already taken: only opening the diary is left (confirmEmailAccount).
        if (pendingSignup?.confirmed) throw new SignupConfirmedError();
        let nextWallet = pendingSignup?.wallet;
        let signupPersist = pendingSignup?.persist ?? persist;
        if (!nextWallet) {
          nextWallet = createWallet();
          signupPersist = persist;
          const seed: Diary = { ...emptyDiary(locale), recoveryEmailSet: true };
          const sealed = await encryptAesGcm(nextWallet.aesKey, utf8ToBytes(JSON.stringify(seed)));
          await loginWithWallet(
            nextWallet,
            {
              ciphertext: sealed.ciphertext,
              nonce: sealed.nonce,
              schemaVersion: DIARY_SCHEMA_VERSION,
            },
            persist,
          );
        }
        const kit = await wrapMnemonic(nextWallet.mnemonic, password);
        // The account exists from here on. Keep the sign-up (its phrase included)
        // until the diary opens: a retry, or an app closed while the person reads
        // the email, goes on with this account instead of leaving it unreachable.
        const pending: PendingEmailSignup = {
          wallet: nextWallet,
          email: normalized,
          kit,
          persist: signupPersist,
          confirmed: false,
        };
        setPendingSignup(pending);
        await writePendingSignup(pending);
        const withSession = sessionRetry(nextWallet, signupPersist);
        const result = await withSession((account) => postRecoveryKit(normalized, kit, locale, account));
        if (!result.pending) {
          const confirmed = { ...pending, confirmed: true };
          setPendingSignup(confirmed);
          await writePendingSignup(confirmed);
          await completeSignup(confirmed, withSession);
        }
      },
      pendingSignup: pendingSignup ? { email: pendingSignup.email, confirmed: pendingSignup.confirmed } : null,
      confirmEmailAccount: async (code) => {
        let pending = pendingSignup;
        if (!pending) throw new InvalidConfirmError();
        // After an app restart the session cookie may be gone: sign in once and retry.
        const withSession = sessionRetry(pending.wallet, pending.persist);
        if (!pending.confirmed) {
          await withSession((account) => confirmRecoveryCode(code, account));
          pending = { ...pending, confirmed: true };
          setPendingSignup(pending);
          await writePendingSignup(pending);
        }
        await completeSignup(pending, withSession);
      },
      resendEmailCode: async () => {
        const pending = pendingSignup;
        if (!pending) throw new InvalidConfirmError();
        const withSession = sessionRetry(pending.wallet, pending.persist);
        if (pending.confirmed) {
          await completeSignup(pending, withSession);
          return { confirmed: true };
        }
        const result = await withSession((account) => postRecoveryKit(pending.email, pending.kit, locale, account));
        if (result.pending) return { confirmed: false };
        // Already this account's verified address: an earlier code went through and its answer was lost.
        const confirmed = { ...pending, confirmed: true };
        setPendingSignup(confirmed);
        await writePendingSignup(confirmed);
        await completeSignup(confirmed, withSession);
        return { confirmed: true };
      },
      unlockWithPassword: async (email, password, options) => {
        const normalized = normalizeEmail(email);
        // Only a kit that does not open means "wrong email or password"; a cached
        // kit that does not open is retried with the host's (openKit). Once the kit
        // opens the password was right: a failure after that (no connection, a
        // timeout, an app build the host refuses) is reported as what it is,
        // except "no account", which keeps the old answer.
        const { mnemonic, kit } = await openKit(normalized, password);
        try {
          await unlock(mnemonic, { persist: persistFlag(options) });
        } catch (cause) {
          // A kit cached on this device for an account deleted since.
          if (cause instanceof AccountNotFoundError) throw new InvalidCredentialsError();
          throw cause;
        }
        // Kept on this device only once the host took the sign-in it opened.
        saveLocalKit(normalized, kit);
      },
      addEmailSignIn: async (email, password) => {
        if (!wallet || storageMode !== "hosted") throw new Error("No hosted diary is open");
        // It ends by saving the diary (recoveryEmailSet): check before mailing a code.
        assertWritable(backendRef.current);
        const normalized = normalizeEmail(email);
        const gen = sessionGenRef.current;
        const kit = await wrapMnemonic(wallet.mnemonic, password);
        const result = await liveSessionRetry(wallet)((account) =>
          postRecoveryKit(normalized, kit, locale, account),
        );
        // Signed out (or locked) meanwhile: nothing goes back onto this device.
        if (sessionGenRef.current !== gen) throw new Error("Locked");
        if (result.pending) {
          setPendingEmailSignIn({ email: normalized, kit });
          return { pending: true };
        }
        // Already this account's verified address: the new kit replaced the old one.
        saveLocalKit(normalized, kit);
        await persistDiary({ ...shownDiaryRef.current, recoveryEmailSet: true });
        return { pending: false };
      },
      pendingEmailSignIn: pendingEmailSignIn?.email ?? null,
      confirmEmailSignIn: async (code) => {
        if (!pendingEmailSignIn) throw new InvalidConfirmError();
        if (!wallet) throw new Error("Locked");
        const gen = sessionGenRef.current;
        await liveSessionRetry(wallet)((account) => confirmRecoveryCode(code, account));
        // Signed out (or locked) meanwhile: nothing goes back onto this device.
        if (sessionGenRef.current !== gen) throw new Error("Locked");
        saveLocalKit(pendingEmailSignIn.email, pendingEmailSignIn.kit);
        setPendingEmailSignIn(null);
        await persistDiary({ ...shownDiaryRef.current, recoveryEmailSet: true });
      },
      resendEmailSignInCode: async () => {
        if (!pendingEmailSignIn) throw new InvalidConfirmError();
        if (!wallet) throw new Error("Locked");
        await liveSessionRetry(wallet)((account) =>
          postRecoveryKit(pendingEmailSignIn.email, pendingEmailSignIn.kit, locale, account),
        );
      },
      cancelEmailSignIn: () => setPendingEmailSignIn(null),
      changePassword: async (email, currentPassword, nextPassword) => {
        if (!wallet) throw new Error("Locked");
        assertOnline(backendRef.current);
        const gen = sessionGenRef.current;
        const normalized = normalizeEmail(email);
        // A kit cached here from before a change made on another device does not
        // open with the new password: openKit then asks the host for its kit.
        const { mnemonic: recovered } = await openKit(normalized, currentPassword);
        if (recovered !== wallet.mnemonic) throw new InvalidCredentialsError();
        const nextKit = await wrapMnemonic(wallet.mnemonic, nextPassword);
        const result = await liveSessionRetry(wallet)((account) =>
          postRecoveryKit(normalized, nextKit, locale, account),
        );
        if (result.pending) throw new Error("Recovery kit was not saved");
        // Signed out (or locked) meanwhile: the host has the new kit, but this device keeps nothing.
        if (sessionGenRef.current !== gen) throw new Error("Locked");
        // Only once the host has it: otherwise this device would take a password nothing else knows.
        saveLocalKit(normalized, nextKit);
      },
      persistDiary,
      enablePoolOptIn: async () => {
        await persistDiary({ ...diary, poolOptIn: true });
      },
      disablePoolOptIn: async () => {
        await persistDiary({
          ...diary,
          poolOptIn: false,
        });
      },
      friendsRun: friendsOpen ? friendsRun : null,
      wipe: async () => {
        assertHostReachable(backendRef.current, serverOutdatedRef.current);
        // A retry of the start-up restore still running must never open the diary after this.
        cancelRestores();
        try {
          if (storageMode === "device") {
            const device = await loadDeviceStorage();
            await device.deviceVault.clear();
            deviceDiaryRef.current = false;
            setAppLockEnabled(false);
            await device.deviceVault.setSecureScreen({ enabled: false });
            await dropPendingSignup();
          } else {
            if (!wallet) throw new Error("Locked");
            // A session that expired while the app was open, or a cookie another
            // sign-in left (409 account-mismatch: nothing deleted), signs in once and
            // asks again. The delete names this wallet's account, never another.
            await leaveFriendsFirst(wallet);
            try {
              await liveSessionRetry(wallet)((account) => deleteAccount(account));
            } catch (cause) {
              // The sign-in after a 401 or an account-mismatch found no account for this
              // phrase: it is already gone, the same outcome as a 404 to the delete.
              if (!(cause instanceof AccountNotFoundError)) throw cause;
            }
            // The account is gone either way; a phrase left behind only meets "no account" on the next start.
            await (await phraseStore()).clear().catch(() => undefined);
            await keepCopies(false);
            clearLocalKits();
          }
        } catch (cause) {
          // Nothing was deleted: the automatic retries go on.
          setRetryEpoch((epoch) => epoch + 1);
          throw cause;
        }
        setPendingEmailSignIn(null);
        sessionGenRef.current += 1;
        syncedRef.current = null;
        backendRef.current = null;
        newerDiaryJsonRef.current = null;
        setStorageMode(null);
        setOffline(null);
        setCopySavedAt(null);
        setDiaryNewer(false);
        setWallet(null);
        setDiary(emptyDiary(locale));
      },
      signOut: async () => {
        // An on-device diary has no session to end. Settings offers deleting it instead.
        if (storageMode === "device") throw new Error("On-device diaries have no session");
        // What this device keeps goes first, with or without a connection: the
        // email and wrapped kits (a kit can be attacked offline), a sign-up left
        // waiting, then the kept phrase. Throws if that phrase may still be there:
        // signing out must forget it (the diary stays open, so it can be tried again).
        // A retry of the start-up restore still running must never open the
        // account again after this (the offline copy is when retries run).
        cancelRestores();
        clearLocalKits();
        await dropPendingSignup();
        try {
          await (await phraseStore()).clear();
        } catch (cause) {
          // Still signed in: the automatic retries go on.
          setRetryEpoch((epoch) => epoch + 1);
          throw cause;
        }
        // Without the phrase the copy cannot be opened; it goes all the same.
        await keepCopies(false);
        sessionGenRef.current += 1;
        blockedPhraseRef.current = null;
        setPendingEmailSignIn(null);
        syncedRef.current = null;
        backendRef.current = null;
        newerDiaryJsonRef.current = null;
        setStorageMode(null);
        setOffline(null);
        setCopySavedAt(null);
        setDiaryNewer(false);
        setWallet(null);
        setDiary(emptyDiary(locale));
        // The host session last, without waiting. Offline, Android clears the cookie
        // in its own jar; the web clears it on a later start or when the connection
        // comes back (retryPendingLogout), and says so (sessionEndPending).
        endHostSession();
      },
      diaryNewer,
      exportDiaryJson: () => newerDiaryJsonRef.current ?? diaryToJson(diary),
    }),
    [
      appCovered,
      appLockAvailable,
      appLockEnabled,
      assertNoSavedSignIn,
      cancelRestores,
      completeSignup,
      copySavedAt,
      createDeviceDiary,
      deleteLockedDeviceDiary,
      deviceLocked,
      deviceLockReasonState,
      deviceStatusFailed,
      diary,
      diaryNewer,
      dropPendingSignup,
      endHostSession,
      error,
      forgetSavedSignIn,
      friendsOpen,
      friendsRun,
      keepCopies,
      leaveFriendsFirst,
      liveSessionRetry,
      locale,
      moveToDevice,
      moveToHosted,
      offline,
      readSavedPhrase,
      setAppLock,
      writePendingSignup,
      storageMode,
      lunarPhasesEnabled,
      lunarPhasesVisible,
      weekStartsOn,
      timeZone,
      colorScheme,
      pendingSignup,
      pendingEmailSignIn,
      persistDiary,
      readOnly,
      ready,
      restoreFailed,
      restoreNoAccount,
      restoreUnreadable,
      retryRestore,
      sessionEndPending,
      t,
      unlock,
      updateRequired,
      visualSeasons,
      wallet,
    ],
  );

  return <CicloContext.Provider value={value}>{children}</CicloContext.Provider>;
}

export function useCiclo() {
  const ctx = useContext(CicloContext);
  if (!ctx) throw new Error("useCiclo must be used within CicloProvider");
  return ctx;
}

/**
 * Today's YYYY-MM-DD in the zone chosen in Settings (device zone by default).
 * Moves on at midnight in that zone and when the app comes back into view.
 */
export function useTodayIso(): string {
  const { timeZone } = useCiclo();
  return useTodayIn(resolveTimeZone(timeZone));
}

export {
  lastEmail,
  AccountNotFoundError,
  InvalidConfirmError,
  InvalidCredentialsError,
  MailNotConfiguredError,
  RateLimitedError,
};
