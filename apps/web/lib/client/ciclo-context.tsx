"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { apiUrl } from "@/lib/app-target";
import { decryptAesGcm, encryptAesGcm } from "@/lib/crypto/aes";
import { bytesToUtf8, utf8ToBytes } from "@/lib/crypto/bytes";
import { createWallet, unlockWallet, type Wallet } from "@/lib/crypto/wallet";
import { unwrapMnemonic, wrapMnemonic, type WrappedKit } from "@/lib/crypto/wrap";
import {
  deleteAccount,
  fetchVault,
  loginWithWallet,
  logoutSession,
  putVault,
  type VaultBlob,
} from "@/lib/client/api";
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
  clearStoredMnemonic,
  migrateBrowserStorage,
  parseLunarPhasesEnabled,
  parseLunarPhasesVisible,
  parseVisualSeasons,
  parseWeekStartsOn,
  readUnlockState,
  writeStoredMnemonic,
} from "@/lib/client/storage-migrate";
import { syncPoolIfDue } from "@/lib/pool-sync";
import { DIARY_SCHEMA_VERSION, emptyDiary, parseDiary, type Diary } from "@/lib/diary";
import { mergeDiaryEdits } from "@/lib/diary-merge";
import { messages, type Locale } from "@/lib/i18n";
import { COLOR_SCHEME_KEY, parseColorScheme, type ColorScheme } from "@/lib/client/color-scheme";
import {
  TIME_ZONE_AUTO,
  parseTimeZoneSetting,
  resolveTimeZone,
  todayIsoIn,
  type TimeZoneSetting,
} from "@/lib/time-zone";

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
  t: (typeof messages)["es"];
  error: string | null;
  /** The phrase kept on this device could not sign in (offline, server error). It is still stored. */
  restoreFailed: boolean;
  retryRestore: () => Promise<void>;
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
  const response = await fetch(apiUrl("/api/recovery/register"), {
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
  const response = await fetch(apiUrl("/api/recovery/confirm"), {
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

async function openVault(aesKey: Uint8Array, blob: VaultBlob): Promise<Diary> {
  return parseDiary(bytesToUtf8(await decryptAesGcm(aesKey, blob.ciphertext, blob.nonce)));
}

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
  const [pendingSignup, setPendingSignup] = useState<PendingEmailSignup | null>(null);

  const locale = diary.locale;
  const t = messages[locale];

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

  // Saves `local` on top of the synced version. If another device saved first
  // (409), merges its edits in and tries again. Returns what was stored.
  const saveMerged = useCallback(async (aesKey: Uint8Array, local: Diary): Promise<Diary> => {
    let synced = syncedRef.current;
    if (!synced) throw new Error("Locked");
    let candidate = local;
    for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS; attempt += 1) {
      const result = await putVault(await sealDiary(aesKey, candidate), synced.version);
      if (result.ok) {
        syncedRef.current = { diary: candidate, version: result.version };
        return candidate;
      }
      const remote = result.current.ciphertext
        ? await openVault(aesKey, result.current)
        : emptyDiary(candidate.locale);
      candidate = mergeDiaryEdits(synced.diary, candidate, remote);
      synced = { diary: remote, version: result.current.version };
      syncedRef.current = synced;
    }
    throw new Error("Could not save: the diary keeps changing on another device");
  }, []);

  // Loads and decrypts the vault before touching state. The wallet is set only
  // once the real diary is in memory: an unlocked wallet next to an empty diary
  // would let the next save upload that empty diary over the real one.
  const hydrate = useCallback(
    async (nextWallet: Wallet, fallbackLocale: Locale, isCancelled: () => boolean = () => false) => {
      const vault = await fetchVault();
      const loaded = vault.blob ? await openVault(nextWallet.aesKey, vault.blob) : emptyDiary(fallbackLocale);
      if (isCancelled()) return;
      syncedRef.current = { diary: loaded, version: vault.version };
      setDiary(loaded);
      setWallet(nextWallet);
      setRestoreFailed(false);
      if (!loaded.poolOptIn) return;
      try {
        const withPool = await syncPoolIfDue(loaded);
        if (isCancelled() || withPool.poolLastSyncedAt === loaded.poolLastSyncedAt) return;
        const saved = await saveMerged(nextWallet.aesKey, withPool);
        if (!isCancelled()) setDiary(saved);
      } catch {
        // The pool is optional; the next save retries it.
      }
    },
    [saveMerged],
  );

  // Signs in again with the phrase kept on this device. Only an unusable phrase
  // is forgotten. Network, server, or sign-in race failures keep it, so the
  // person can retry instead of losing access to a phrase-only diary.
  const restoreStoredSession = useCallback(
    async (isCancelled: () => boolean = () => false) => {
      const storedLocale = (localStorage.getItem(LOCALE_KEY) as Locale | null) ?? "es";
      const unlockState = readUnlockState();
      if (!unlockState.mnemonic) {
        if (!isCancelled()) setDiary(emptyDiary(storedLocale));
        return;
      }
      let nextWallet: Wallet;
      try {
        nextWallet = unlockWallet(unlockState.mnemonic);
      } catch {
        clearStoredMnemonic();
        if (!isCancelled()) setDiary(emptyDiary(storedLocale));
        return;
      }
      try {
        await loginWithWallet(nextWallet, undefined, unlockState.persistCookie);
        await hydrate(nextWallet, storedLocale, isCancelled);
      } catch {
        if (isCancelled()) return;
        setWallet(null);
        setDiary(emptyDiary(storedLocale));
        setRestoreFailed(true);
      }
    },
    [hydrate],
  );

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

  const unlock = useCallback(
    async (mnemonic: string, options?: UnlockOptions) => {
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
      writeStoredMnemonic(nextWallet.mnemonic, persist);
      await hydrate(nextWallet, locale);
    },
    [hydrate, locale],
  );

  const value = useMemo<CicloContextValue>(
    () => ({
      ready,
      wallet,
      diary,
      locale,
      visualSeasons,
      lunarPhasesEnabled,
      lunarPhasesVisible,
      weekStartsOn,
      timeZone,
      colorScheme,
      t,
      error,
      setError,
      restoreFailed,
      retryRestore: () => restoreStoredSession(),
      setLocale: (nextLocale) => {
        localStorage.setItem(LOCALE_KEY, nextLocale);
        if (wallet) {
          void persistDiary({ ...diary, locale: nextLocale });
        } else {
          setDiary({ ...diary, locale: nextLocale });
        }
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
          writeStoredMnemonic(nextWallet.mnemonic, persist);
          setPendingSignup(null);
          await hydrate(nextWallet, locale);
          return;
        }
        setPendingSignup({ wallet: nextWallet, email: normalized, kit, persist });
      },
      confirmEmailAccount: async (code) => {
        if (!pendingSignup) throw new InvalidConfirmError();
        await confirmRecoveryCode(code);
        saveLocalKit(pendingSignup.email, pendingSignup.kit);
        writeStoredMnemonic(pendingSignup.wallet.mnemonic, pendingSignup.persist);
        const nextWallet = pendingSignup.wallet;
        setPendingSignup(null);
        await hydrate(nextWallet, locale);
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
        try {
          const mnemonic = await unwrapMnemonic(kit, password);
          saveLocalKit(normalized, kit);
          await unlock(mnemonic, { persist: persistFlag(options) });
        } catch (cause) {
          if (cause instanceof InvalidCredentialsError) throw cause;
          throw new InvalidCredentialsError();
        }
      },
      changePassword: async (email, currentPassword, nextPassword) => {
        if (!wallet) throw new Error("Locked");
        const normalized = normalizeEmail(email);
        let kit = loadLocalKit(normalized);
        if (!kit) {
          kit = await fetchRemoteKit(normalized);
        }
        let recovered: string;
        try {
          recovered = await unwrapMnemonic(kit, currentPassword);
        } catch {
          throw new InvalidCredentialsError();
        }
        if (recovered !== wallet.mnemonic) throw new InvalidCredentialsError();
        const nextKit = await wrapMnemonic(wallet.mnemonic, nextPassword);
        saveLocalKit(normalized, nextKit);
        const result = await postRecoveryKit(normalized, nextKit, locale);
        if (result.pending) throw new Error("Recovery kit was not saved");
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
        await deleteAccount();
        clearStoredMnemonic();
        clearLocalKits();
        syncedRef.current = null;
        setWallet(null);
        setDiary(emptyDiary(locale));
      },
      signOut: async () => {
        await logoutSession();
        clearStoredMnemonic();
        syncedRef.current = null;
        setWallet(null);
      },
    }),
    [
      diary,
      error,
      hydrate,
      locale,
      lunarPhasesEnabled,
      lunarPhasesVisible,
      weekStartsOn,
      timeZone,
      colorScheme,
      pendingSignup,
      persistDiary,
      ready,
      restoreFailed,
      restoreStoredSession,
      t,
      unlock,
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

/** Today's YYYY-MM-DD in the zone chosen in Settings (device zone by default). */
export function useTodayIso(): string {
  const { timeZone } = useCiclo();
  return todayIsoIn(resolveTimeZone(timeZone));
}

export {
  lastEmail,
  InvalidConfirmError,
  InvalidCredentialsError,
  MailNotConfiguredError,
  RateLimitedError,
};
