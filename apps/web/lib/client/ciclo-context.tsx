"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { IS_ANDROID_APP } from "@/lib/app-target";
import { decryptAesGcm, encryptAesGcm } from "@/lib/crypto/aes";
import { bytesToUtf8, utf8ToBytes } from "@/lib/crypto/bytes";
import { InvalidPhraseError, createWallet, unlockWallet, type Wallet } from "@/lib/crypto/wallet";
import { UnsupportedKitError, unwrapMnemonic, wrapMnemonic, type WrappedKit } from "@/lib/crypto/wrap";
import {
  AccountNotFoundError,
  deleteAccount,
  hostedVault,
  loginWithWallet,
  logoutSession,
  type StorageMode,
  type VaultBackend,
  type VaultBlob,
} from "@/lib/client/api";
import { UpdateRequiredError, apiFetch, onUpdateRequired } from "@/lib/client/http";
import { moveHostedDiaryToDevice } from "@/lib/client/move-to-device";
import type { AuthPrompt } from "@/lib/device-vault";
import { OfflineError, offlineBackend, type HostedCopyStore } from "@/lib/hosted-copy";
import { diaryToJson, mergeDiaries } from "@/lib/diary-io";
import {
  InvalidConfirmError,
  InvalidCredentialsError,
  MailNotConfiguredError,
  RateLimitedError,
  clearLocalKits,
  fetchRemoteKit,
  lastEmail,
  loadLocalKit,
  normalizeEmail,
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
import { VISUAL_SEASONS_AVAILABLE } from "@/lib/features";
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
import { useTodayIn } from "@/lib/client/today";

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
  retryRestore: () => Promise<void>;
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
  /** Android 11+ with a fingerprint or screen lock: the app lock can be turned on. */
  appLockAvailable: boolean;
  appLockEnabled: boolean;
  createDeviceDiary: (wallet: Wallet) => Promise<void>;
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
  setLocale: (locale: Locale) => void;
  setVisualSeasons: (enabled: boolean) => void;
  setLunarPhasesEnabled: (enabled: boolean) => void;
  setLunarPhasesVisible: (visible: boolean) => void;
  setWeekStartsOn: (weekStartsOn: 0 | 1) => void;
  setTimeZone: (timeZone: TimeZoneSetting) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  startOnboarding: () => Wallet;
  unlock: (mnemonic: string, options?: UnlockOptions) => Promise<void>;
  createEmailAccount: (email: string, password: string, options?: PersistOptions) => Promise<void>;
  confirmEmailAccount: (code: string) => Promise<void>;
  resendEmailCode: () => Promise<void>;
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
  wipe: () => Promise<void>;
  signOut: () => Promise<void>;
  setError: (message: string | null) => void;
};

const CicloContext = createContext<CicloContextValue | null>(null);

type PendingEmailSignup = {
  wallet: Wallet;
  email: string;
  kit: WrappedKit;
  persist: boolean;
};

async function postRecoveryKit(email: string, kit: WrappedKit, locale: Locale): Promise<{ pending: boolean }> {
  const response = await apiFetch("/api/recovery/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, locale, ...kit }),
  });
  if (response.status === 503) throw new MailNotConfiguredError();
  if (response.status === 429) throw new RateLimitedError();
  if (!response.ok) throw new Error("Recovery kit was not saved");
  const payload = (await response.json()) as { pending?: boolean };
  return { pending: payload.pending !== false };
}

async function confirmRecoveryCode(code: string) {
  const response = await apiFetch("/api/recovery/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new InvalidConfirmError();
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
  const [pendingSignup, setPendingSignup] = useState<PendingEmailSignup | null>(null);
  const [pendingEmailSignIn, setPendingEmailSignIn] = useState<{ email: string; kit: WrappedKit } | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode | null>(null);
  const [deviceLocked, setDeviceLocked] = useState(false);
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

  const locale = diary.locale;
  // Spanish and English are always there; another language loads on first use.
  const t = useLocaleMessages(locale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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
  // One retry of the stored session at a time (the button, a reconnect, the app returning to the front).
  const retryRef = useRef<Promise<void> | null>(null);

  // Writes the offline copy after a load from or a save to the host. Best effort:
  // the host has the diary either way.
  const keepCopy = useCallback(async (blob: VaultBlob, version: number) => {
    if (!keepCopyRef.current) return;
    const store = await hostedCopyStore();
    await store?.write({ blob, version, savedAt: new Date().toISOString() }).catch(() => undefined);
  }, []);

  // Whether the open hosted diary keeps an offline copy. Without one, any copy
  // left on the device (another account, an earlier session) is deleted.
  const keepCopies = useCallback(async (keep: boolean) => {
    keepCopyRef.current = IS_ANDROID_APP && keep;
    if (keepCopyRef.current) return;
    const store = await hostedCopyStore().catch(() => null);
    await store?.clear().catch(() => undefined);
  }, []);

  // Saves `local` on top of the synced version. If another device saved first
  // (409), merges its edits in and tries again. Returns what was stored. If the
  // diary there was saved by a newer build, nothing is merged or saved: the
  // newer diary goes on screen read-only and this throws UpdateRequiredError.
  const saveMerged = useCallback(async (aesKey: Uint8Array, local: Diary): Promise<Diary> => {
    let synced = syncedRef.current;
    const backend = backendRef.current;
    if (!synced || !backend) throw new Error("Locked");
    let candidate = local;
    for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS; attempt += 1) {
      const blob = await sealDiary(aesKey, candidate);
      const result = await backend.save(blob, synced.version);
      if (result.ok) {
        syncedRef.current = { diary: candidate, version: result.version };
        if (backend === hostedVault) await keepCopy(blob, result.version);
        return candidate;
      }
      const opened = result.current.ciphertext
        ? await openVaultForDisplay(aesKey, result.current, candidate.locale)
        : { diary: emptyDiary(candidate.locale), newerJson: null };
      if (opened.newerJson !== null) {
        backendRef.current = updateRequiredBackend(backend, "diary");
        syncedRef.current = { diary: opened.diary, version: result.current.version };
        newerDiaryJsonRef.current = opened.newerJson;
        setDiaryNewer(true);
        setDiary(opened.diary);
        throw new UpdateRequiredError("diary");
      }
      const remote = opened.diary;
      candidate = mergeDiaryEdits(synced.diary, candidate, remote);
      synced = { diary: remote, version: result.current.version };
      syncedRef.current = synced;
    }
    throw new Error("Could not save: the diary keeps changing on another device");
  }, [keepCopy]);

  // Loads and decrypts the vault before touching state. The wallet is set only
  // once the real diary is in memory: an unlocked wallet next to an empty diary
  // would let the next save upload that empty diary over the real one.
  const hydrate = useCallback(
    async (
      nextWallet: Wallet,
      fallbackLocale: Locale,
      backend: VaultBackend,
      isCancelled: () => boolean = () => false,
    ) => {
      const vault = await backend.load();
      const { diary: loaded, newerJson } = vault.blob
        ? await openVaultForDisplay(nextWallet.aesKey, vault.blob, fallbackLocale)
        : { diary: emptyDiary(fallbackLocale), newerJson: null };
      const newer = newerJson !== null;
      // The diary may be in another language than the last one on this device.
      await loadLocale(loaded.locale).catch(() => undefined);
      if (isCancelled()) return;
      // A diary from a newer build, or a hosted one with a build the host refuses: read-only.
      const refused = serverOutdatedRef.current && backend.mode === "hosted";
      const usable = newer || refused ? updateRequiredBackend(backend, newer ? "diary" : "server") : backend;
      backendRef.current = usable;
      syncedRef.current = { diary: loaded, version: vault.version };
      newerDiaryJsonRef.current = newerJson;
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
      if (backend === hostedVault && vault.blob) await keepCopy(vault.blob, vault.version);
      if (!loaded.poolOptIn || usable.readOnlySince || usable.updateRequired) return;
      try {
        const withPool = await syncPoolIfDue(loaded);
        if (isCancelled() || withPool.poolLastSyncedAt === loaded.poolLastSyncedAt) return;
        const saved = await saveMerged(nextWallet.aesKey, withPool);
        if (!isCancelled()) setDiary(saved);
      } catch {
        // The pool is optional; the next save retries it.
      }
    },
    [keepCopy, saveMerged],
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
        await hydrate(nextWallet, fallbackLocale, offlineBackend(copy), isCancelled);
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
      await hydrate(unlockWallet(phrase), fallbackLocale, device.deviceBackend, isCancelled);
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
        return false;
      }
      setAppLockAvailable(status.lockAvailable);
      setAppLockEnabled(status.phraseNeedsAuth);
      if (!status.hasDiary) return false;
      deviceDiaryRef.current = true;
      if (status.phraseNeedsAuth) {
        void device.deviceVault.setSecureScreen({ enabled: true }).catch(() => undefined);
      }
      try {
        await openDeviceDiary(storedLocale, isCancelled);
      } catch {
        // Canceled app lock, invalidated key, or no sealed phrase. The phrase opens it.
        if (isCancelled()) return true;
        setWallet(null);
        setDiary(emptyDiary(storedLocale));
        setDeviceLocked(true);
      }
      return true;
    },
    [openDeviceDiary],
  );

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
      const store = await phraseStore();
      const unlockState = await store.read();
      if (!unlockState.mnemonic) {
        if (!isCancelled()) setDiary(emptyDiary(storedLocale));
        return;
      }
      let nextWallet: Wallet;
      try {
        nextWallet = unlockWallet(unlockState.mnemonic);
      } catch {
        await store.clear().catch(() => undefined);
        if (!isCancelled()) setDiary(emptyDiary(storedLocale));
        return;
      }
      // A phrase kept between starts is "Keep me signed in": the diary keeps an offline copy.
      keepCopyRef.current = IS_ANDROID_APP && unlockState.persist;
      try {
        await loginWithWallet(nextWallet, undefined, unlockState.persistCookie);
        await hydrate(nextWallet, storedLocale, hostedVault, isCancelled);
      } catch (cause) {
        if (isCancelled()) return;
        const noAccount = cause instanceof AccountNotFoundError;
        // No connection, or the host is down: the copy on this device opens read-only.
        // Never when the host has no account: a diary deleted elsewhere does not come back.
        if (!noAccount && keepCopyRef.current && (await openOfflineCopy(nextWallet, storedLocale, isCancelled))) {
          return;
        }
        if (isCancelled()) return;
        backendRef.current = null;
        syncedRef.current = null;
        newerDiaryJsonRef.current = null;
        setStorageMode(null);
        setOffline(null);
        setCopySavedAt(null);
        setDiaryNewer(false);
        setWallet(null);
        setDiary(emptyDiary(storedLocale));
        setRestoreNoAccount(noAccount);
        setRestoreFailed(!noAccount);
      }
    },
    [hydrate, openOfflineCopy, restoreDeviceDiary],
  );

  const retryRestore = useCallback(() => {
    retryRef.current ??= restoreStoredSession().finally(() => {
      retryRef.current = null;
    });
    return retryRef.current;
  }, [restoreStoredSession]);

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

  // While the offline copy is on screen, try the host again when the connection
  // comes back or the app returns to the front.
  useEffect(() => {
    if (!offline) return;
    const retry = () => {
      if (document.visibilityState === "hidden" || !navigator.onLine) return;
      void retryRestore();
    };
    window.addEventListener("online", retry);
    document.addEventListener("visibilitychange", retry);
    return () => {
      window.removeEventListener("online", retry);
      document.removeEventListener("visibilitychange", retry);
    };
  }, [offline, retryRestore]);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    migrateBrowserStorage();
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
  }, [restoreStoredSession]);

  const persistDiary = useCallback(
    (next: Diary) => {
      // The caller's edit is the change from what was on screen to `next`.
      const shown = shownDiaryRef.current;
      const run = async () => {
        if (!wallet || !syncedRef.current) throw new Error("Locked");
        assertWritable(backendRef.current);
        // Re-apply that edit on top of anything saved since the caller rendered.
        let local = mergeDiaryEdits(shown, parseDiary(next), syncedRef.current.diary);
        if (local.poolOptIn) {
          local = await syncPoolIfDue(local);
        }
        const saved = await saveMerged(wallet.aesKey, local);
        setDiary(saved);
        localStorage.setItem(LOCALE_KEY, saved.locale);
      };
      const queued = saveQueueRef.current.then(run, run);
      saveQueueRef.current = queued.catch(() => undefined);
      return queued;
    },
    [wallet, saveMerged],
  );

  // Runs `task` after any save in flight, and holds later saves until it ends.
  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const queued = saveQueueRef.current.then(task, task);
    saveQueueRef.current = queued.catch(() => undefined);
    return queued;
  }, []);

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
      const device = await loadDeviceStorage();
      const status = await device.deviceVault.status();
      // One diary per install. Never replace one that exists.
      if (status.hasDiary) throw new Error("This device already has a diary");
      const created = await device.deviceBackend.save(await sealDiary(nextWallet.aesKey, emptyDiary(locale)), 0);
      if (!created.ok) throw new Error("This device already has a diary");
      deviceDiaryRef.current = true;
      await device.deviceVault.storePhrase({ ...authPrompt(locale), phrase: nextWallet.mnemonic, requireAuth: false });
      // A phrase left by a hosted session would make the next start sign in too.
      await device.hostedPhraseStore.clear().catch(() => undefined);
      await keepCopies(false);
      setAppLockAvailable(status.lockAvailable);
      setAppLockEnabled(false);
      await hydrate(nextWallet, locale, device.deviceBackend);
    },
    [hydrate, keepCopies, locale],
  );

  const setAppLock = useCallback(
    async (enabled: boolean) => {
      if (!wallet || storageMode !== "device") throw new Error("No on-device diary is open");
      const device = await loadDeviceStorage();
      // Re-seals the phrase with the app-lock key (or back to the plain one).
      await device.deviceVault.storePhrase({ ...authPrompt(locale), phrase: wallet.mnemonic, requireAuth: enabled });
      setAppLockEnabled(enabled);
      await device.deviceVault.setSecureScreen({ enabled });
    },
    [locale, storageMode, wallet],
  );

  // Takes the key and the diary out of memory. Unlocking reads the phrase again.
  const lockDevice = useCallback(async () => {
    await enqueue(async () => {
      syncedRef.current = null;
      backendRef.current = null;
      setStorageMode(null);
      setWallet(null);
      setDiary((current) => emptyDiary(current.locale));
      setDeviceLocked(true);
    });
  }, [enqueue]);

  useEffect(() => {
    if (storageMode !== "device" || !appLockEnabled || !wallet) return;
    let hiddenAt: number | null = null;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      if (hiddenAt !== null && Date.now() - hiddenAt >= APP_LOCK_GRACE_MS) void lockDevice();
      hiddenAt = null;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [appLockEnabled, lockDevice, storageMode, wallet]);

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
        const saved = await hostedVault.save(sealed, remote.version);
        if (!saved.ok) throw new Error("The hosted diary changed during the move");
        const device = await loadDeviceStorage();
        await device.deviceVault.clear();
        // The host holds the diary now. Switch to it with what is already in hand:
        // a network failure after this point must never leave the device backend
        // in charge of a file that is gone.
        deviceDiaryRef.current = false;
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
        await device.hostedPhraseStore.write(wallet.mnemonic, true);
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
        let result;
        try {
          result = await moveHostedDiaryToDevice({
            loadHosted: () => hostedVault.load(),
            open: (blob) => openVault(wallet.aesKey, blob),
            seal: (next) => sealDiary(wallet.aesKey, next),
            writeDevice: async (blob) => (await device.deviceBackend.save(blob, 0)).ok,
            storePhrase: () =>
              device.deviceVault.storePhrase({
                ...authPrompt(synced.diary.locale),
                phrase: wallet.mnemonic,
                requireAuth: false,
              }),
            clearDevice: () => device.deviceVault.clear(),
            deleteHosted: (baseVersion) => deleteAccount(baseVersion),
            probeHosted: async () => {
              await loginWithWallet(wallet, undefined, true);
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
      await (await phraseStore()).write(nextWallet.mnemonic, persist);
      await keepCopies(persist);
      await hydrate(nextWallet, locale, hostedVault);
    },
    [hydrate, keepCopies, locale, unlockDeviceWithPhrase],
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
      retryRestore,
      offline,
      copySavedAt,
      updateRequired,
      readOnly,
      storageMode,
      deviceLocked,
      appLockAvailable,
      appLockEnabled,
      createDeviceDiary,
      setAppLock,
      moveToHosted,
      moveToDevice,
      setLocale: (nextLocale) => {
        localStorage.setItem(LOCALE_KEY, nextLocale);
        // Load the language first, so the screen changes in one step.
        void loadLocale(nextLocale)
          .catch(() => undefined)
          .then(() => {
            // Read-only (offline copy, or an update needed) the language changes on screen only.
            if (wallet && !readOnly) {
              void persistDiary({ ...shownDiaryRef.current, locale: nextLocale });
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
        const persist = persistFlag(options);
        const normalized = normalizeEmail(email);
        let nextWallet = pendingSignup?.wallet;
        if (!nextWallet) {
          nextWallet = createWallet();
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
        const result = await postRecoveryKit(normalized, kit, locale);
        if (!result.pending) {
          saveLocalKit(normalized, kit);
          await (await phraseStore()).write(nextWallet.mnemonic, persist);
          await keepCopies(persist);
          setPendingSignup(null);
          await hydrate(nextWallet, locale, hostedVault);
          return;
        }
        setPendingSignup({ wallet: nextWallet, email: normalized, kit, persist });
      },
      confirmEmailAccount: async (code) => {
        if (!pendingSignup) throw new InvalidConfirmError();
        await confirmRecoveryCode(code);
        saveLocalKit(pendingSignup.email, pendingSignup.kit);
        await (await phraseStore()).write(pendingSignup.wallet.mnemonic, pendingSignup.persist);
        await keepCopies(pendingSignup.persist);
        const nextWallet = pendingSignup.wallet;
        setPendingSignup(null);
        await hydrate(nextWallet, locale, hostedVault);
      },
      resendEmailCode: async () => {
        if (!pendingSignup) throw new InvalidConfirmError();
        await postRecoveryKit(pendingSignup.email, pendingSignup.kit, locale);
      },
      unlockWithPassword: async (email, password, options) => {
        const normalized = normalizeEmail(email);
        let kit = loadLocalKit(normalized);
        if (!kit) {
          kit = await fetchRemoteKit(normalized);
        }
        // Only a kit that does not open means "wrong email or password" (a decoy
        // never opens, so unknown emails look the same). A kit made by a newer
        // build with parameters this one does not take asks for an update (the
        // decoys follow the same parameters, so this says nothing about the
        // email). Once the kit opens the password was right: a failure after that
        // (no connection, a timeout, an app build the host refuses) is reported
        // as what it is, except "no account", which keeps the old answer.
        let mnemonic: string;
        try {
          mnemonic = await unwrapMnemonic(kit, password);
        } catch (cause) {
          if (cause instanceof UnsupportedKitError) throw new UpdateRequiredError("kit");
          throw new InvalidCredentialsError();
        }
        saveLocalKit(normalized, kit);
        try {
          await unlock(mnemonic, { persist: persistFlag(options) });
        } catch (cause) {
          // A kit cached on this device for an account deleted since.
          if (cause instanceof AccountNotFoundError) throw new InvalidCredentialsError();
          throw cause;
        }
      },
      addEmailSignIn: async (email, password) => {
        if (!wallet || storageMode !== "hosted") throw new Error("No hosted diary is open");
        // It ends by saving the diary (recoveryEmailSet): check before mailing a code.
        assertWritable(backendRef.current);
        const normalized = normalizeEmail(email);
        const kit = await wrapMnemonic(wallet.mnemonic, password);
        const result = await postRecoveryKit(normalized, kit, locale);
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
        await confirmRecoveryCode(code);
        saveLocalKit(pendingEmailSignIn.email, pendingEmailSignIn.kit);
        setPendingEmailSignIn(null);
        await persistDiary({ ...shownDiaryRef.current, recoveryEmailSet: true });
      },
      resendEmailSignInCode: async () => {
        if (!pendingEmailSignIn) throw new InvalidConfirmError();
        await postRecoveryKit(pendingEmailSignIn.email, pendingEmailSignIn.kit, locale);
      },
      cancelEmailSignIn: () => setPendingEmailSignIn(null),
      changePassword: async (email, currentPassword, nextPassword) => {
        if (!wallet) throw new Error("Locked");
        assertOnline(backendRef.current);
        const normalized = normalizeEmail(email);
        let kit = loadLocalKit(normalized);
        if (!kit) {
          kit = await fetchRemoteKit(normalized);
        }
        let recovered: string;
        try {
          recovered = await unwrapMnemonic(kit, currentPassword);
        } catch (cause) {
          if (cause instanceof UnsupportedKitError) throw new UpdateRequiredError("kit");
          throw new InvalidCredentialsError();
        }
        if (recovered !== wallet.mnemonic) throw new InvalidCredentialsError();
        const nextKit = await wrapMnemonic(wallet.mnemonic, nextPassword);
        const result = await postRecoveryKit(normalized, nextKit, locale);
        if (result.pending) throw new Error("Recovery kit was not saved");
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
      wipe: async () => {
        assertHostReachable(backendRef.current, serverOutdatedRef.current);
        if (storageMode === "device") {
          const device = await loadDeviceStorage();
          await device.deviceVault.clear();
          deviceDiaryRef.current = false;
          setAppLockEnabled(false);
          await device.deviceVault.setSecureScreen({ enabled: false });
        } else {
          await deleteAccount();
          // The account is gone either way; a phrase left behind only meets "no account" on the next start.
          await (await phraseStore()).clear().catch(() => undefined);
          await keepCopies(false);
          clearLocalKits();
        }
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
        assertHostReachable(backendRef.current, serverOutdatedRef.current);
        await logoutSession();
        // Throws if the kept phrase may still be there: signing out must forget it.
        await (await phraseStore()).clear();
        // Without the phrase the copy cannot be opened; it goes all the same.
        await keepCopies(false);
        syncedRef.current = null;
        backendRef.current = null;
        newerDiaryJsonRef.current = null;
        setStorageMode(null);
        setOffline(null);
        setCopySavedAt(null);
        setDiaryNewer(false);
        setWallet(null);
      },
      diaryNewer,
      exportDiaryJson: () => newerDiaryJsonRef.current ?? diaryToJson(diary),
    }),
    [
      appLockAvailable,
      appLockEnabled,
      copySavedAt,
      createDeviceDiary,
      deviceLocked,
      diary,
      diaryNewer,
      error,
      hydrate,
      keepCopies,
      locale,
      moveToDevice,
      moveToHosted,
      offline,
      setAppLock,
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
      retryRestore,
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
