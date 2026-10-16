"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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
import { messages, type Locale } from "@/lib/i18n";
import { COLOR_SCHEME_KEY, parseColorScheme, type ColorScheme } from "@/lib/client/color-scheme";

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
  const response = await fetch("/api/recovery/register", {
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
  const response = await fetch("/api/recovery/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new InvalidConfirmError();
}

function persistFlag(options?: PersistOptions): boolean {
  return options?.persist !== false;
}

export function CicloProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [diary, setDiary] = useState<Diary>(emptyDiary("es"));
  const [visualSeasons, setVisualSeasonsState] = useState(false);
  const [lunarPhasesEnabled, setLunarPhasesEnabledState] = useState(true);
  const [lunarPhasesVisible, setLunarPhasesVisibleState] = useState(false);
  const [weekStartsOn, setWeekStartsOnState] = useState<0 | 1>(1);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("system");
  const [error, setError] = useState<string | null>(null);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [pendingSignup, setPendingSignup] = useState<PendingEmailSignup | null>(null);

  const locale = diary.locale;
  const t = messages[locale];

  // Loads and decrypts the vault before touching state. The wallet is set only
  // once the real diary is in memory: an unlocked wallet next to an empty diary
  // would let the next save upload that empty diary over the real one.
  const hydrate = useCallback(
    async (nextWallet: Wallet, fallbackLocale: Locale, isCancelled: () => boolean = () => false) => {
      const vault = await fetchVault();
      const loaded = vault?.ciphertext
        ? parseDiary(bytesToUtf8(await decryptAesGcm(nextWallet.aesKey, vault.ciphertext, vault.nonce)))
        : emptyDiary(fallbackLocale);
      if (isCancelled()) return;
      setDiary(loaded);
      setWallet(nextWallet);
      setRestoreFailed(false);
      if (!loaded.poolOptIn) return;
      try {
        const synced = await syncPoolIfDue(loaded);
        if (isCancelled() || synced.poolLastSyncedAt === loaded.poolLastSyncedAt) return;
        setDiary(synced);
        const sealed = await encryptAesGcm(nextWallet.aesKey, utf8ToBytes(JSON.stringify(synced)));
        await putVault(sealed.ciphertext, sealed.nonce, synced.schemaVersion);
      } catch {
        // The pool is optional; the next save retries it.
      }
    },
    [],
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
    async (next: Diary) => {
      if (!wallet) throw new Error("Locked");
      let normalized = parseDiary(next);
      if (normalized.poolOptIn) {
        normalized = await syncPoolIfDue(normalized);
      }
      const sealed = await encryptAesGcm(wallet.aesKey, utf8ToBytes(JSON.stringify(normalized)));
      await putVault(sealed.ciphertext, sealed.nonce, normalized.schemaVersion);
      setDiary(normalized);
      localStorage.setItem(LOCALE_KEY, normalized.locale);
    },
    [wallet],
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
        setWallet(null);
        setDiary(emptyDiary(locale));
      },
      signOut: async () => {
        await logoutSession();
        clearStoredMnemonic();
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

export {
  lastEmail,
  InvalidConfirmError,
  InvalidCredentialsError,
  MailNotConfiguredError,
  RateLimitedError,
};
