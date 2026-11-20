"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { IS_ANDROID_APP } from "@/lib/app-target";
import { type Wallet } from "@/lib/crypto/wallet";
import { useBackStep } from "@/lib/client/android-back";
import { goBack, returnTo } from "@/lib/client/back-navigation";
import { storeBrowserPassword } from "@/lib/client/credentials";
import { copyPhrase } from "@/lib/client/phrase-clipboard";
import { HttpError } from "@/lib/client/api";
import { UpdateRequiredError } from "@/lib/client/http";
import { saveFile } from "@/lib/client/save-file";
import {
  InvalidConfirmError,
  MailNotConfiguredError,
  RateLimitedError,
  useCiclo,
} from "@/lib/client/ciclo-context";
import { maskEmail } from "@/lib/client/kit-store";
import { gatedSignupMethod, type SignupMethod } from "@/lib/client/signup-consent";
import { PolicyDialog } from "@/components/policy-dialog";
import { AppShell } from "@/components/app-shell";
import { UpdateNotice, updateErrorMessage } from "@/components/update-notice";
import { PhraseQrCode } from "@/components/phrase-qr-code";
import { SavePhraseForm } from "@/components/save-phrase-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, PasswordInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// "device": Android only. Same phrase steps as "phrase", but the diary stays on the phone.
type Method = "choose" | "email" | "phrase" | "device";

export default function OnboardingPage() {
  const {
    t,
    startOnboarding,
    unlock,
    createDeviceDiary,
    createEmailAccount,
    confirmEmailAccount,
    resendEmailCode,
  } = useCiclo();
  const router = useRouter();
  const [method, setMethod] = useState<Method>("choose");
  // The sign-up consent. Kept in this page only, so existing users are never asked.
  const [consented, setConsented] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const closePolicy = useCallback(() => setPolicyOpen(false), []);
  const consentHintId = useId();
  const consentHint = consented ? undefined : consentHintId;
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"show" | "confirm">("show");
  const [emailPhase, setEmailPhase] = useState<"form" | "code">("form");
  const [code, setCode] = useState("");
  const [guess, setGuess] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkIndex = useMemo(() => (wallet ? 2 : 0), [wallet]);
  // The app can also keep the diary on the phone, with no account.
  const tooManySignupsMessage = IS_ANDROID_APP ? `${t.tooManySignups} ${t.tooManySignupsDevice}` : t.tooManySignups;

  // Every way to create a diary goes through the consent gate.
  function startSignup(next: SignupMethod) {
    const allowed = gatedSignupMethod(next, consented);
    if (allowed) setMethod(allowed);
  }

  function generate() {
    setWallet(startOnboarding());
    setStep("show");
    setError(null);
  }

  async function finishPhrase(event: React.FormEvent) {
    event.preventDefault();
    if (!wallet) return;
    const words = wallet.mnemonic.split(" ");
    if (guess.trim().toLowerCase() !== words[checkIndex]) {
      setError(t.wordMismatch);
      return;
    }
    try {
      setBusy(true);
      if (method === "device") {
        await createDeviceDiary(wallet);
      } else {
        await unlock(wallet.mnemonic, { create: true, persist: true });
      }
      returnTo(router, "/app");
    } catch (cause) {
      // Never show a raw error message: it is English and meant for developers.
      setError(
        cause instanceof UpdateRequiredError
          ? updateErrorMessage(cause, t)
          : cause instanceof HttpError && cause.status === 429
            ? tooManySignupsMessage
            : t.errorGeneric,
      );
    } finally {
      setBusy(false);
    }
  }

  async function finishEmail(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError(t.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(t.passwordMismatch);
      return;
    }
    try {
      setBusy(true);
      setError(null);
      await createEmailAccount(email, password, { persist: true });
      await storeBrowserPassword(email.trim().toLowerCase(), password);
      setEmailPhase("code");
      setCode("");
    } catch (cause) {
      if (cause instanceof MailNotConfiguredError) setError(t.mailNotConfigured);
      else if (cause instanceof RateLimitedError) setError(t.tooManyEmailCodes);
      // A 429 from creating the account itself (the per-network sign-up limit).
      else if (cause instanceof HttpError && cause.status === 429) setError(tooManySignupsMessage);
      else if (cause instanceof UpdateRequiredError) setError(updateErrorMessage(cause, t));
      else setError(t.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function finishEmailCode(event: React.FormEvent) {
    event.preventDefault();
    try {
      setBusy(true);
      setError(null);
      await confirmEmailAccount(code);
      returnTo(router, "/app");
    } catch (cause) {
      if (cause instanceof InvalidConfirmError) setError(t.verifyEmailInvalid);
      else if (cause instanceof UpdateRequiredError) setError(updateErrorMessage(cause, t));
      else setError(t.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    try {
      setBusy(true);
      setError(null);
      await resendEmailCode();
      setError(t.codeSent);
    } catch (cause) {
      if (cause instanceof MailNotConfiguredError) setError(t.mailNotConfigured);
      else if (cause instanceof RateLimitedError) setError(t.tooManyEmailCodes);
      else if (cause instanceof UpdateRequiredError) setError(updateErrorMessage(cause, t));
      else setError(t.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  // One step back inside the page. The Back link and the Android back button share it.
  function stepBack() {
    if (method === "email" && emailPhase === "code") {
      setEmailPhase("form");
      setCode("");
      setError(null);
      return;
    }
    setMethod("choose");
    setWallet(null);
    setEmailPhase("form");
    setCode("");
    setError(null);
  }
  useBackStep(method === "choose" ? null : stepBack);

  const words = wallet?.mnemonic.split(" ") ?? [];

  return (
    <AppShell>
      <button
        type="button"
        className="mb-4 text-sm underline"
        onClick={method === "choose" ? () => goBack(router) : stepBack}
      >
        {t.back}
      </button>
      {/* An on-device diary needs no host: a host refusing this build does not matter there. */}
      {method === "device" ? null : <UpdateNotice className="mb-4" />}

      {method === "choose" ? (
        <>
          <h1 className="text-2xl font-semibold">{t.createAccount}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.chooseModeIntro}</p>
          {/* What is stored and where, and an explicit yes, before any diary exists (all three ways). Not saved anywhere. */}
          <Card className="mt-4 flex flex-col gap-3 border-primary/20 bg-primary/5 p-4 text-sm leading-6">
            <h2 className="font-semibold text-card-foreground">{t.signupConsentTitle}</h2>
            <p className="text-muted-foreground">{t.signupConsentHosted}</p>
            {IS_ANDROID_APP ? <p className="text-muted-foreground">{t.signupConsentDevice}</p> : null}
            <label className="flex items-start gap-2 font-medium text-card-foreground">
              <input
                type="checkbox"
                className="mt-1.5"
                checked={consented}
                onChange={(event) => setConsented(event.target.checked)}
              />
              <span>{t.signupConsentAgree}</span>
            </label>
            {/* Opens over this screen, so the tick survives reading the policy. */}
            <button
              type="button"
              className="self-start font-medium text-primary underline"
              onClick={() => setPolicyOpen(true)}
            >
              {t.privacyPolicy}
            </button>
            {consented ? null : (
              <p id={consentHintId} className="text-xs text-muted-foreground">
                {t.signupConsentRequired}
              </p>
            )}
          </Card>
          {policyOpen ? <PolicyDialog onClose={closePolicy} /> : null}
          <div className="mt-6 flex flex-col gap-3">
            <Card className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-medium text-primary">{t.recommended}</p>
                <h2 className="mt-1 font-medium">{t.createWithEmail}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.createWithEmailHint}</p>
              </div>
              <Button disabled={!consented} aria-describedby={consentHint} onClick={() => startSignup("email")}>
                {t.createWithEmail}
              </Button>
            </Card>
            <Card className="flex flex-col gap-3">
              <div>
                <h2 className="font-medium">{t.superPrivateMode}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.superPrivateHint}</p>
              </div>
              <Button
                variant="outline"
                disabled={!consented}
                aria-describedby={consentHint}
                onClick={() => startSignup("phrase")}
              >
                {t.superPrivateMode}
              </Button>
            </Card>
            {IS_ANDROID_APP ? (
              <Card className="flex flex-col gap-3">
                <div>
                  <h2 className="font-medium">{t.deviceMode}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t.deviceModeHint}</p>
                </div>
                <Button
                  variant="outline"
                  disabled={!consented}
                  aria-describedby={consentHint}
                  onClick={() => startSignup("device")}
                >
                  {t.deviceMode}
                </Button>
              </Card>
            ) : null}
          </div>
        </>
      ) : null}

      {method === "email" && emailPhase === "form" ? (
        <>
          <h1 className="text-2xl font-semibold">{t.emailAccountTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.emailAccountBody}</p>
          <Card className="mt-4">
            <form className="flex flex-col gap-3" onSubmit={(event) => void finishEmail(event)}>
              <Label htmlFor="ciclo-email">{t.email}</Label>
              <Input
                id="ciclo-email"
                name="username"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Label htmlFor="ciclo-password">{t.password}</Label>
              <PasswordInput
                id="ciclo-password"
                name="new-password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                showLabel={t.showPassword}
                hideLabel={t.hidePassword}
              />
              <Label htmlFor="ciclo-confirm">{t.confirmPassword}</Label>
              <PasswordInput
                id="ciclo-confirm"
                name="new-password-confirm"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                showLabel={t.showPassword}
                hideLabel={t.hidePassword}
              />
              <p className="text-xs text-muted-foreground">{t.passwordHint}</p>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={busy}>
                {t.createAccount}
              </Button>
            </form>
          </Card>
        </>
      ) : null}

      {method === "email" && emailPhase === "code" ? (
        <>
          <h1 className="text-2xl font-semibold">{t.verifyEmailTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.verifyEmailBody.replace("{email}", maskEmail(email))}
          </p>
          <Card className="mt-4">
            <form className="flex flex-col gap-3" onSubmit={(event) => void finishEmailCode(event)}>
              <Label htmlFor="ciclo-email-code">{t.verifyEmailCode}</Label>
              <Input
                id="ciclo-email-code"
                name="one-time-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                minLength={6}
                maxLength={6}
                pattern="[0-9]{6}"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              {error ? (
                <p
                  className={
                    error === t.codeSent ? "text-sm text-muted-foreground" : "text-sm text-destructive"
                  }
                >
                  {error}
                </p>
              ) : null}
              <Button type="submit" disabled={busy || code.length !== 6}>
                {t.next}
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => void resend()}>
                {t.resendCode}
              </Button>
              <p className="text-xs text-muted-foreground">{t.codeDelayedSignup}</p>
              <button
                type="button"
                className="text-sm underline"
                onClick={() => {
                  setEmailPhase("form");
                  setCode("");
                  setError(null);
                }}
              >
                {t.changeEmail}
              </button>
            </form>
          </Card>
        </>
      ) : null}

      {method === "phrase" || method === "device" ? (
        <>
          <h1 className="text-2xl font-semibold">{method === "device" ? t.deviceMode : t.superPrivateMode}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {method === "device" ? t.deviceModeBody : t.onboardingBody}
          </p>
          {!wallet ? (
            <Button className="mt-6 w-full" onClick={generate}>
              {t.createWallet}
            </Button>
          ) : null}
          {wallet && step === "show" ? (
            <Card className="mt-6 flex flex-col gap-3">
              <ol className="grid grid-cols-2 gap-2 text-sm">
                {words.map((word, index) => (
                  <li key={`${word}-${index}`} className="rounded-lg bg-secondary px-3 py-2">
                    <span className="text-muted-foreground">{index + 1}.</span> {word}
                  </li>
                ))}
              </ol>
              <div className="flex flex-col items-center gap-2 py-1">
                <PhraseQrCode mnemonic={wallet.mnemonic} label={t.backupQrLabel} />
                <p className="text-center text-xs text-muted-foreground">{t.backupQrHint}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={async () => {
                    // Marked sensitive in the app, and cleared from the clipboard a minute later.
                    await copyPhrase(wallet.mnemonic);
                    setCopied(true);
                  }}
                >
                  {copied ? t.copied : t.copy}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => void saveFile("ciclo-recovery-phrase.txt", wallet.mnemonic, "text/plain")}
                >
                  {t.download}
                </Button>
              </div>
              <SavePhraseForm key={wallet.mnemonic} mnemonic={wallet.mnemonic} t={t} />
              <Button type="button" onClick={() => setStep("confirm")}>
                {t.next}
              </Button>
            </Card>
          ) : null}
          {wallet && step === "confirm" ? (
            <Card className="mt-6">
              <form className="flex flex-col gap-3" onSubmit={(event) => void finishPhrase(event)}>
                <h2 className="font-medium">{t.confirmTitle}</h2>
                <Label htmlFor="ciclo-word">
                  {t.confirmWord} {checkIndex + 1}
                </Label>
                <Input
                  id="ciclo-word"
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" disabled={busy}>
                  {t.next}
                </Button>
              </form>
            </Card>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}
