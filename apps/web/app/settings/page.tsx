"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { IS_ANDROID_APP, apiHostLabel } from "@/lib/app-target";
import { AccountMismatchError, VaultChangedError, VaultTooLargeError } from "@/lib/client/api";
import { InvalidCredentialsError, useCiclo } from "@/lib/client/ciclo-context";
import { UpdateRequiredError } from "@/lib/client/http";
import { lastEmail } from "@/lib/client/kit-store";
import { storeBrowserPassword } from "@/lib/client/credentials";
import { NewerDiaryError } from "@/lib/diary";
import {
  diaryToCsv,
  importsPregnanciesByDefault,
  mergeDiaries,
  parseImportedFile,
  previewImport,
} from "@/lib/diary-io";
import { FRIENDS_AVAILABLE, VISUAL_SEASONS_AVAILABLE } from "@/lib/features";
import { useFriendsTabChoice } from "@/lib/client/friends-tab";
import { AppShell } from "@/components/app-shell";
import { AddEmailSignIn } from "@/components/add-email-sign-in";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { useSaveFile } from "@/components/save-file-dialog";
import { PregnancySettings } from "@/components/pregnancy/pregnancy-settings";
import { InstallPrompt } from "@/components/install-prompt";
import { LanguageSelect } from "@/components/language-select";
import { OfflineNotice } from "@/components/offline-notice";
import { UpdateNotice } from "@/components/update-notice";
import { PhraseBackup } from "@/components/phrase-backup";
import { SavePhraseForm } from "@/components/save-phrase-form";
import { SettingsAbout } from "@/components/settings-about";
import { FeedbackCard } from "@/components/feedback-card";
import { TimeZoneSelect } from "@/components/time-zone-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, PasswordInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function SettingsDisclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="mt-4 flex flex-col gap-3 rounded-3xl">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left font-medium"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <ChevronDown className={cn("size-5 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? children : null}
    </Card>
  );
}

// Where a message shows: next to the action it is about, not at the end of a long page.
type MessageArea = "preferences" | "storage" | "password" | "backup" | "phrase" | "research" | "account";

const SWITCH_CLASS =
  "h-7 w-12 shrink-0 cursor-pointer appearance-none rounded-full bg-muted-foreground/30 p-1 transition-colors before:block before:size-5 before:rounded-full before:bg-white before:shadow-sm before:transition-transform checked:bg-primary checked:before:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function SettingsPage() {
  const {
    t,
    locale,
    visualSeasons,
    setVisualSeasons,
    lunarPhasesEnabled,
    setLunarPhasesEnabled,
    weekStartsOn,
    setWeekStartsOn,
    temperatureUnit,
    setTemperatureUnit,
    colorScheme,
    setColorScheme,
    diary,
    wallet,
    enablePoolOptIn,
    disablePoolOptIn,
    persistDiary,
    wipe,
    signOut,
    changePassword,
    storageMode,
    appLockAvailable,
    appLockEnabled,
    setAppLock,
    moveToHosted,
    moveToDevice,
    offline,
    readOnly,
    diaryNewer,
    exportDiaryJson,
    setLocale,
  } = useCiclo();
  const onDevice = storageMode === "device";
  // `readOnly`: the offline copy is open (Android), or this build must be updated
  // to save the diary. Either way what saves the diary is off. Deleting the account
  // only needs the host, so only the offline copy stops it; signing out works offline.
  const offlineCopy = offline !== null;
  const [storageBusy, setStorageBusy] = useState(false);
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(() => lastEmail());
  const [browserPassword, setBrowserPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [researchOk, setResearchOk] = useState(false);
  const [message, setMessage] = useState<{ area: MessageArea; text: string } | null>(null);
  const [showPhrase, setShowPhrase] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Android 11+ (the app lock needs it). Asked from the device when an on-device diary is open.
  const [lockSupported, setLockSupported] = useState(true);
  const [confirm, confirmDialog] = useConfirmDialog();
  const [saveFile, saveFileDialog] = useSaveFile(t);
  const [friendsTabVisible, setFriendsTabVisible] = useFriendsTabChoice();
  // The diary says whether this account has an email sign-in. The last email
  // typed on this device does not: it outlives sign-out and other accounts.
  const canChangePassword = !onDevice && diary.recoveryEmailSet;

  useEffect(() => {
    if (!IS_ANDROID_APP || !onDevice) return;
    let cancelled = false;
    void import("@/lib/client/device-storage")
      .then(({ deviceVault }) => deviceVault.status())
      .then((status) => {
        if (!cancelled) setLockSupported(status.lockSupported !== false);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [onDevice]);

  // `null` clears that area's message only.
  function say(area: MessageArea, text: string | null) {
    setMessage((current) => (text !== null ? { area, text } : current?.area === area ? null : current));
  }

  function notice(area: MessageArea) {
    return message?.area === area ? (
      <p role="status" className="text-sm">
        {message.text}
      </p>
    ) : null;
  }

  function errorText(cause: unknown) {
    if (cause instanceof UpdateRequiredError) return t.updateNeededAction;
    // The session on this device was another account's, even after signing in again: nothing was written.
    if (cause instanceof AccountMismatchError) return t.accountMismatch;
    return t.errorGeneric;
  }

  // `action` may return the message to show when it is done.
  async function runStorageAction(action: () => Promise<string | void>) {
    setStorageBusy(true);
    say("storage", null);
    try {
      const done = await action();
      if (done) say("storage", done);
    } catch (cause) {
      say(
        "storage",
        cause instanceof VaultChangedError
          ? t.moveChangedElsewhere
          : cause instanceof VaultTooLargeError
            ? t.vaultTooLarge
            : errorText(cause),
      );
    } finally {
      setStorageBusy(false);
    }
  }

  async function exportFile(filename: string, body: () => string, type: string) {
    try {
      // In the Android app the file went where she chose, with nothing else on screen to say so.
      const outcome = await saveFile(filename, body, type);
      say("backup", outcome === "saved" ? t.exportSaved : null);
    } catch {
      say("backup", t.errorGeneric);
    }
  }
  const [importPreview, setImportPreview] = useState<{
    days: number;
    starts: number;
    pregnancies: number;
    /** Whether the file's pregnancies come too (her choice, lib/diary-io.ts). */
    withPregnancies: boolean;
    raw: string;
  } | null>(
    null,
  );

  if (!wallet) {
    return (
      <AppShell>
        <p>{t.unlockTitle}</p>
      </AppShell>
    );
  }

  return (
    <AppShell size="wide">
      {/* Same size and font as the section titles on Patterns ("Forecast"). */}
      <h1 className="mb-3 font-serif text-xl text-foreground desktop:mb-8 desktop:text-4xl desktop:tracking-tight">{t.settings}</h1>
      <UpdateNotice className="mb-4" />
      <OfflineNotice className="mb-4" />
      {/* What cannot be undone comes first: no reset of the phrase or password, or no copy off this phone. */}
      <Card className="mb-4 rounded-3xl border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground desktop:mb-6">
        {onDevice ? t.deviceStorageHint : t.noResetHint}
      </Card>
      {/* Desktop: preferences on the left; storage, backup, research and the account on the right. */}
      <div className="desktop:grid desktop:grid-cols-2 desktop:items-start desktop:gap-6">
      <div>
      <Card className="flex flex-col gap-3 rounded-3xl">
        <div>
          <p className="text-sm font-semibold text-card-foreground">{t.language}</p>
          <LanguageSelect
            className="mt-2"
            onSelect={async (next) => {
              say("preferences", null);
              try {
                // Resolves once the diary saved the new language (on screen only while read-only).
                await setLocale(next);
              } catch (cause) {
                say("preferences", errorText(cause));
              }
            }}
          />
        </div>
        <label
          htmlFor="visual-seasons"
          hidden={!VISUAL_SEASONS_AVAILABLE}
          className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-muted/60 p-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-card-foreground">{t.visualSeasons}</p>
            <p id="visual-seasons-hint" className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {t.visualSeasonsHint}
            </p>
          </div>
          <input
            id="visual-seasons"
            type="checkbox"
            role="switch"
            aria-describedby="visual-seasons-hint"
            checked={visualSeasons}
            onChange={(event) => setVisualSeasons(event.target.checked)}
            className="h-7 w-12 shrink-0 cursor-pointer appearance-none rounded-full bg-muted-foreground/30 p-1 transition-colors before:block before:size-5 before:rounded-full before:bg-white before:shadow-sm before:transition-transform checked:bg-primary checked:before:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </label>
        <label
          htmlFor="forecasting-enabled"
          className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-muted/60 p-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-card-foreground">{t.forecastingEnabled}</p>
            <p id="forecasting-enabled-hint" className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {t.forecastingEnabledHint}
            </p>
          </div>
          <input
            id="forecasting-enabled"
            type="checkbox"
            role="switch"
            aria-describedby="forecasting-enabled-hint"
            checked={diary.forecastingEnabled !== false}
            disabled={readOnly}
            onChange={(event) => {
              say("preferences", null);
              persistDiary({ ...diary, forecastingEnabled: event.target.checked }).catch((cause) => {
                say("preferences", errorText(cause));
              });
            }}
            className={SWITCH_CLASS}
          />
        </label>
        <label
          htmlFor="lunar-phases"
          className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-muted/60 p-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-card-foreground">{t.lunarPhases}</p>
            <p id="lunar-phases-hint" className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {t.lunarPhasesHint}
            </p>
          </div>
          <input
            id="lunar-phases"
            type="checkbox"
            role="switch"
            aria-describedby="lunar-phases-hint"
            checked={lunarPhasesEnabled}
            onChange={(event) => setLunarPhasesEnabled(event.target.checked)}
            className="h-7 w-12 shrink-0 cursor-pointer appearance-none rounded-full bg-muted-foreground/30 p-1 transition-colors before:block before:size-5 before:rounded-full before:bg-white before:shadow-sm before:transition-transform checked:bg-primary checked:before:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </label>
        <PregnancySettings />
        {FRIENDS_AVAILABLE && storageMode === "hosted" ? (
          <label
            htmlFor="friends-tab"
            className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-muted/60 p-3"
          >
            <p className="text-sm font-semibold text-card-foreground">{t.friendsTabSetting}</p>
            <input
              id="friends-tab"
              type="checkbox"
              role="switch"
              checked={friendsTabVisible}
              onChange={(event) => setFriendsTabVisible(event.target.checked)}
              className={SWITCH_CLASS}
            />
          </label>
        ) : null}
        <div>
          <p className="text-sm font-semibold text-card-foreground">{t.weekStartsOn}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={weekStartsOn === 1 ? "default" : "outline"}
              onClick={() => setWeekStartsOn(1)}
            >
              {t.weekStartsMonday}
            </Button>
            <Button
              type="button"
              variant={weekStartsOn === 0 ? "default" : "outline"}
              onClick={() => setWeekStartsOn(0)}
            >
              {t.weekStartsSunday}
            </Button>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground">{t.temperatureUnitLabel}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={temperatureUnit === "c" ? "default" : "outline"}
              onClick={() => setTemperatureUnit("c")}
            >
              {t.temperatureCelsius}
            </Button>
            <Button
              type="button"
              variant={temperatureUnit === "f" ? "default" : "outline"}
              onClick={() => setTemperatureUnit("f")}
            >
              {t.temperatureFahrenheit}
            </Button>
          </div>
        </div>
        {/* A language or forecast change that could not be saved says so here, by its control. */}
        {notice("preferences")}
        <TimeZoneSelect />
        <div>
          <p className="text-sm font-semibold text-card-foreground">{t.colorScheme}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={colorScheme === "light" ? "default" : "outline"}
              onClick={() => setColorScheme("light")}
            >
              {t.colorSchemeLight}
            </Button>
            <Button
              type="button"
              variant={colorScheme === "dark" ? "default" : "outline"}
              onClick={() => setColorScheme("dark")}
            >
              {t.colorSchemeDark}
            </Button>
            <Button
              type="button"
              variant={colorScheme === "system" ? "default" : "outline"}
              onClick={() => setColorScheme("system")}
            >
              {t.colorSchemeSystem}
            </Button>
          </div>
        </div>
        <p className="break-all text-xs text-muted-foreground">
          {t.address}: {wallet.pubkeyHash}
        </p>
      </Card>
      <InstallPrompt mode="settings" />
      </div>
      {/* Desktop: the column's first card lines up with the preferences card. */}
      <div className="desktop:[&>:first-child]:mt-0">
      {IS_ANDROID_APP ? (
        <SettingsDisclosure title={t.storageTitle}>
          {/* The current place is the selected option; picking the other one moves the diary. */}
          <select
            id="storage-mode"
            aria-label={t.storageTitle}
            aria-describedby="storage-mode-hint"
            value={onDevice ? "device" : "hosted"}
            disabled={storageBusy || deleting || readOnly}
            onChange={async (event) => {
              // The select stays on the current place until the move is confirmed and done.
              if (event.target.value === "hosted" && onDevice) {
                const confirmed = await confirm({
                  message: t.moveToHostedConfirm,
                  confirmLabel: t.next,
                  cancelLabel: t.cancel,
                });
                if (!confirmed) return;
                void runStorageAction(async () => {
                  await moveToHosted();
                  return t.moveToHostedDone;
                });
              } else if (event.target.value === "device" && !onDevice) {
                const confirmed = await confirm({
                  message: t.moveToDeviceConfirm,
                  confirmLabel: t.next,
                  cancelLabel: t.cancel,
                  destructive: true,
                });
                if (!confirmed) return;
                void runStorageAction(async () => {
                  const { hostedDeleted } = await moveToDevice();
                  return hostedDeleted === "confirmed"
                    ? t.moveToDeviceDone
                    : t.moveToDeviceUnconfirmed.replace("{site}", apiHostLabel());
                });
              }
            }}
            className="flex min-h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-base disabled:opacity-50 md:text-sm"
          >
            <option value="hosted">{t.storageOptionHosted}</option>
            <option value="device">{t.storageOptionDevice}</option>
          </select>
          <p id="storage-mode-hint" className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-card-foreground">
              {t.storageIfYouChoose.replace("{option}", onDevice ? t.storageOptionHosted : t.storageOptionDevice)}
            </span>{" "}
            {onDevice ? t.moveToHostedHint : t.moveToDeviceHint}
          </p>
          {onDevice ? (
            <label
              htmlFor="app-lock"
              className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-muted/60 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-card-foreground">{t.appLock}</p>
                <p id="app-lock-hint" className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {appLockAvailable || appLockEnabled
                    ? t.appLockHint
                    : lockSupported
                      ? t.appLockUnavailable
                      : t.appLockNeedsAndroid11}
                </p>
              </div>
              <input
                id="app-lock"
                type="checkbox"
                role="switch"
                aria-describedby="app-lock-hint"
                checked={appLockEnabled}
                disabled={storageBusy || deleting || (!appLockAvailable && !appLockEnabled)}
                onChange={(event) => {
                  const enabled = event.target.checked;
                  void runStorageAction(() => setAppLock(enabled));
                }}
                className={SWITCH_CLASS}
              />
            </label>
          ) : null}
          {notice("storage")}
        </SettingsDisclosure>
      ) : null}
      {canChangePassword ? (
        <SettingsDisclosure title={t.changePassword}>
          <p className="text-xs text-muted-foreground">{t.changePasswordHint}</p>
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (nextPassword.length < 8) {
                say("password", t.passwordTooShort);
                return;
              }
              if (nextPassword !== confirmPassword) {
                say("password", t.passwordMismatch);
                return;
              }
              setPasswordBusy(true);
              void changePassword(email, currentPassword, nextPassword)
                .then(async () => {
                  await storeBrowserPassword(email.trim().toLowerCase(), nextPassword);
                  setCurrentPassword("");
                  setNextPassword("");
                  setConfirmPassword("");
                  say("password", t.changePasswordOk);
                })
                .catch((cause) => {
                  say("password", cause instanceof InvalidCredentialsError ? t.invalidCredentials : errorText(cause));
                })
                .finally(() => {
                  setPasswordBusy(false);
                });
            }}
          >
            <Label htmlFor="settings-change-email">{t.email}</Label>
            <Input
              id="settings-change-email"
              name="username"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Label htmlFor="settings-current-password">{t.currentPassword}</Label>
            <PasswordInput
              id="settings-current-password"
              name="current-password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              showLabel={t.showPassword}
              hideLabel={t.hidePassword}
            />
            <Label htmlFor="settings-new-password">{t.newPassword}</Label>
            <PasswordInput
              id="settings-new-password"
              name="new-password"
              autoComplete="new-password"
              required
              minLength={8}
              value={nextPassword}
              onChange={(event) => setNextPassword(event.target.value)}
              showLabel={t.showPassword}
              hideLabel={t.hidePassword}
            />
            <Label htmlFor="settings-confirm-password">{t.confirmPassword}</Label>
            <PasswordInput
              id="settings-confirm-password"
              name="new-password-confirm"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              showLabel={t.showPassword}
              hideLabel={t.hidePassword}
            />
            <Button type="submit" disabled={passwordBusy || readOnly}>
              {t.changePassword}
            </Button>
          </form>
        </SettingsDisclosure>
      ) : onDevice ? null : (
        // A hosted account with no email sign-in: a phrase account, or one moved back from this device.
        <SettingsDisclosure title={t.addEmailTitle}>
          <AddEmailSignIn disabled={readOnly} onDone={(text) => say("password", text)} />
        </SettingsDisclosure>
      )}
      {/* Outside the section: adding an email swaps it for Change password, which starts closed. */}
      {message?.area === "password" ? <p role="status" className="mt-3 text-sm">{message.text}</p> : null}
      <SettingsDisclosure title={t.backupTitle}>
        {/* A diary from a newer build exports as stored (exportDiaryJson): nothing this
            build cannot read is lost. CSV can only hold what this build reads, so it is off then. */}
        <Button
          variant="outline"
          onClick={() => void exportFile("ciclo-diary.json", exportDiaryJson, "application/json")}
        >
          {t.exportJson}
        </Button>
        <Button
          variant="outline"
          disabled={diaryNewer}
          onClick={() => void exportFile("ciclo-diary.csv", () => diaryToCsv(diary), "text/csv")}
        >
          {t.exportCsv}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.csv,application/json,text/csv,text/plain"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            try {
              const raw = await file.text();
              const incoming = parseImportedFile(raw);
              const preview = previewImport(incoming, diary);
              setImportPreview({ ...preview, withPregnancies: importsPregnanciesByDefault(diary), raw });
              say("backup", null);
            } catch (cause) {
              setImportPreview(null);
              say("backup", cause instanceof NewerDiaryError ? t.importNewerFile : t.importInvalid);
            }
          }}
        />
        <Button type="button" variant="outline" disabled={readOnly} onClick={() => fileRef.current?.click()}>
          {t.importData}
        </Button>
        <p className="text-xs text-muted-foreground">{t.importHint}</p>
        {importPreview ? (
          <>
            <p className="text-sm">
              {t.importPreview
                .replace("{days}", String(importPreview.days))
                .replace("{starts}", String(importPreview.starts))}
            </p>
            {importPreview.pregnancies > 0 ? (
              <label className="flex cursor-pointer items-start gap-2 text-sm text-card-foreground">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={importPreview.withPregnancies}
                  onChange={(event) => setImportPreview({ ...importPreview, withPregnancies: event.target.checked })}
                />
                {t.importPregnancies.replace("{count}", String(importPreview.pregnancies))}
              </label>
            ) : null}
            <Button
              disabled={readOnly}
              onClick={async () => {
                try {
                  const incoming = parseImportedFile(importPreview.raw);
                  await persistDiary(
                    mergeDiaries(diary, incoming, locale, { pregnancies: importPreview.withPregnancies }),
                  );
                  setImportPreview(null);
                  say("backup", t.importOk);
                } catch (cause) {
                  say(
                    "backup",
                    cause instanceof NewerDiaryError
                      ? t.importNewerFile
                      : cause instanceof UpdateRequiredError
                        ? t.updateNeededAction
                        : cause instanceof VaultTooLargeError
                          ? t.vaultTooLarge
                          : cause instanceof AccountMismatchError
                            ? t.accountMismatch
                            : t.importInvalid,
                  );
                }
              }}
            >
              {t.importConfirm}
            </Button>
          </>
        ) : null}
        {notice("backup")}
      </SettingsDisclosure>
      {/* In the app there is no browser to save to: the section is the phrase itself (words, QR, copy, save). */}
      <SettingsDisclosure title={IS_ANDROID_APP ? t.onboardingTitle : t.saveInBrowser}>
        {onDevice || IS_ANDROID_APP ? null : (
          <form
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              if (email && browserPassword) {
                await storeBrowserPassword(email.trim().toLowerCase(), browserPassword);
                say("phrase", t.savedInBrowser);
              }
            }}
          >
            <Label htmlFor="settings-email">{t.email}</Label>
            <Input
              id="settings-email"
              name="username"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Label htmlFor="settings-browser-password">{t.password}</Label>
            <PasswordInput
              id="settings-browser-password"
              name="password"
              autoComplete="current-password"
              value={browserPassword}
              onChange={(event) => setBrowserPassword(event.target.value)}
              showLabel={t.showPassword}
              hideLabel={t.hidePassword}
            />
            <Button type="submit">{t.saveInBrowser}</Button>
          </form>
        )}
        <SavePhraseForm mnemonic={wallet.mnemonic} t={t} />
        <button type="button" className="text-left text-sm underline" onClick={() => setShowPhrase((v) => !v)}>
          {showPhrase ? t.hideBackupPhrase : t.showBackupPhrase}
        </button>
        {/* Behind the button: the words open the diary, so they are not on screen until asked for. */}
        {showPhrase ? <PhraseBackup mnemonic={wallet.mnemonic} t={t} onSave={saveFile} /> : null}
        {notice("phrase")}
      </SettingsDisclosure>
      <SettingsDisclosure title={t.researchTitle}>
        <p className="text-sm text-muted-foreground">{t.researchBenefit}</p>
        <p className="text-sm text-muted-foreground">{t.researchBody}</p>
        <p className="text-sm text-muted-foreground">{t.researchMonthly}</p>
        {diary.poolOptIn ? (
          <>
            <p className="text-sm">{t.poolOptInActive}</p>
            {diary.poolLastSyncedAt ? (
              <p className="text-sm text-muted-foreground">
                {t.poolLastSync.replace(
                  "{date}",
                  new Intl.DateTimeFormat(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(`${diary.poolLastSyncedAt}T00:00:00Z`)),
                )}
              </p>
            ) : null}
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked
                disabled={readOnly}
                onChange={async () => {
                  try {
                    await disablePoolOptIn();
                    setResearchOk(false);
                  } catch (cause) {
                    say("research", errorText(cause));
                  }
                }}
              />
              {t.poolOptInLabel}
            </label>
          </>
        ) : (
          <>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={researchOk}
                onChange={(event) => setResearchOk(event.target.checked)}
              />
              {t.researchConsent}
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={false}
                disabled={!researchOk || readOnly}
                onChange={async (event) => {
                  if (!event.target.checked) return;
                  try {
                    await enablePoolOptIn();
                  } catch (cause) {
                    say(
                      "research",
                      cause instanceof UpdateRequiredError
                        ? t.updateNeededAction
                        : cause instanceof AccountMismatchError
                          ? t.accountMismatch
                          : t.poolNeedCycle,
                    );
                    event.target.checked = false;
                  }
                }}
              />
              {t.poolOptInLabel}
            </label>
          </>
        )}
        {notice("research")}
      </SettingsDisclosure>
      {/* Privacy, Help and the licenses open over Settings, with the version under them. */}
      <FeedbackCard />
      <SettingsAbout />
      <Card className="mt-4 flex flex-col gap-3 rounded-3xl">
        {onDevice ? null : (
          <Button
            variant="outline"
            // Works offline too: it forgets this device's copy and ends the session when it can.
            disabled={deleting}
            onClick={() => {
              say("account", null);
              signOut()
                .then(() => router.push("/app"))
                .catch(() => say("account", t.errorGeneric));
            }}
          >
            {t.logout}
          </Button>
        )}
        <Button
          variant="destructive"
          disabled={storageBusy || deleting || offlineCopy}
          aria-busy={deleting}
          onClick={async () => {
            const confirmed = await confirm({
              message: onDevice ? t.deleteDeviceConfirm : t.deleteConfirm,
              confirmLabel: t.deleteAction,
              cancelLabel: t.cancel,
              destructive: true,
            });
            if (!confirmed) return;
            setDeleting(true);
            say("account", null);
            try {
              await wipe();
              router.push("/app");
            } catch (cause) {
              say("account", cause instanceof AccountMismatchError ? t.accountMismatch : t.errorGeneric);
            } finally {
              setDeleting(false);
            }
          }}
        >
          {deleting ? t.deleting : onDevice ? t.deleteDeviceDiary : t.deleteAccount}
        </Button>
        {notice("account")}
      </Card>
      </div>
      </div>
      {confirmDialog}
      {saveFileDialog}
    </AppShell>
  );
}
