"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { IS_ANDROID_APP, PLAY_STORE_URL } from "@/lib/app-target";
import { useCiclo } from "@/lib/client/ciclo-context";
import { maskEmail } from "@/lib/client/kit-store";
import { BrandMark } from "@/components/brand-mark";
import { InstallPrompt } from "@/components/install-prompt";
import { PhraseQrCode } from "@/components/phrase-qr-code";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LanguageSelect } from "@/components/language-select";

export function WelcomeScreen() {
  const {
    t,
    restoreFailed,
    restoreNoAccount,
    restoreUnreadable,
    sessionEndPending,
    retryRestore,
    updateRequired,
    pendingSignup,
  } = useCiclo();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [retrying, setRetrying] = useState(false);
  // A phrase is kept on this device but its sign-in did not open. Creating an
  // account or signing in would replace that phrase, the only copy of it on a
  // phrase-only account, so those buttons wait until it is forgotten on purpose.
  const savedSignIn = restoreFailed || restoreNoAccount;

  return (
    <div className="flex flex-col gap-6 pt-8 desktop:pt-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 font-serif text-xl tracking-tight desktop:text-4xl">
          <BrandMark />
          {t.appName}
        </h1>
        {/* The desktop header has the language switch. */}
        <LanguageSelect compact className="desktop:hidden" />
      </div>
      {/* The host refused this build (426), at start or at a sign-in attempt. Retrying gets the same answer. */}
      {updateRequired ? (
        <Card role="alert" className="flex flex-col gap-3 border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-card-foreground">{t.updateTitle}</p>
          <p className="text-sm leading-6 text-muted-foreground">{t.updateSignInBody}</p>
          {IS_ANDROID_APP ? (
            <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className={buttonVariants()}>
              {t.updateOpenStore}
            </a>
          ) : (
            <Button type="button" onClick={() => window.location.reload()}>
              {t.updateReload}
            </Button>
          )}
        </Card>
      ) : restoreFailed ? (
        <Card role="alert" className="flex flex-col gap-3 border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-card-foreground">{t.restoreFailedTitle}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {restoreUnreadable ? t.restoreUnreadableBody : t.restoreFailedBody}
          </p>
          <Button
            type="button"
            disabled={retrying}
            onClick={async () => {
              setRetrying(true);
              try {
                await retryRestore();
              } finally {
                setRetrying(false);
              }
            }}
          >
            {retrying ? "…" : t.restoreRetry}
          </Button>
          {/* Keystore could not open the kept phrase: there is nothing to show until it can. */}
          <SavedSignInActions canShowPhrase={!restoreUnreadable} />
        </Card>
      ) : null}
      {/* Web: a sign-out could not reach the host, so its session cookie is still in this browser. */}
      {sessionEndPending && !savedSignIn ? (
        <Card className="p-4 text-sm leading-6 text-muted-foreground">{t.signOutPendingNote}</Card>
      ) : null}
      {/* No retry: asking again gets the same answer. */}
      {restoreNoAccount ? (
        <Card role="alert" className="flex flex-col gap-3 border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-card-foreground">{t.restoreNoAccountTitle}</p>
          <p className="text-sm leading-6 text-muted-foreground">{t.restoreNoAccountBody}</p>
          <SavedSignInActions canShowPhrase />
        </Card>
      ) : null}
      {/* An email sign-up left waiting for its code (the app was closed while the email was read). */}
      {pendingSignup && !savedSignIn ? (
        <Card className="flex flex-col gap-3 border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-card-foreground">{t.pendingSignupTitle}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {pendingSignup.confirmed
              ? t.signupConfirmedLoadFailed
              : t.pendingSignupBody.replace("{email}", maskEmail(pendingSignup.email))}
          </p>
          <Button type="button" onClick={() => router.push("/onboarding")}>
            {pendingSignup.confirmed ? t.next : t.pendingSignupContinue}
          </Button>
        </Card>
      ) : null}
      <div>
        <p className="text-lg text-muted-foreground desktop:text-xl">{t.tagline}</p>
        <p className="mt-3 text-sm text-muted-foreground">{t.welcomeCta}</p>
      </div>
      <Card className="border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
        {t.privacyBanner}
      </Card>
      {savedSignIn ? null : (
        <Card className="flex flex-col gap-3">
          <Button
            disabled={busy}
            onClick={() => {
              setBusy(true);
              router.push("/onboarding");
            }}
          >
            {t.createAccount}
          </Button>
          <Button variant="secondary" onClick={() => router.push("/unlock")}>
            {t.haveAccount}
          </Button>
        </Card>
      )}
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/privacy" className="underline">
          {t.privacyPolicy}
        </Link>
      </p>
      <InstallPrompt />
    </div>
  );
}

// Under the restore error: see the phrase kept on this device (to write it down),
// or forget it after an explicit confirmation. Only then do sign-up and sign-in come back.
function SavedSignInActions({ canShowPhrase }: { canShowPhrase: boolean }) {
  const { t, readSavedPhrase, forgetSavedSignIn } = useCiclo();
  const [phrase, setPhrase] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <>
      {canShowPhrase ? (
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            if (phrase) {
              setPhrase(null);
              return;
            }
            setFailed(false);
            try {
              setPhrase(await readSavedPhrase());
            } catch {
              // Never an empty answer: say it could not be read.
              setFailed(true);
            }
          }}
        >
          {phrase ? t.restoreHidePhrase : t.restoreShowPhrase}
        </Button>
      ) : null}
      {phrase ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-3">
          <ol className="grid w-full grid-cols-2 gap-2 text-sm">
            {phrase.split(" ").map((word, index) => (
              <li key={`${word}-${index}`} className="rounded-lg bg-secondary px-3 py-2">
                <span className="text-muted-foreground">{index + 1}.</span> {word}
              </li>
            ))}
          </ol>
          <PhraseQrCode mnemonic={phrase} label={t.backupQrLabel} />
        </div>
      ) : null}
      {confirming ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 p-3">
          <p className="text-sm leading-6 text-card-foreground">{t.restoreForgetConfirm}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" disabled={busy} onClick={() => setConfirming(false)}>
              {t.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setFailed(false);
                try {
                  await forgetSavedSignIn();
                } catch {
                  setFailed(true);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t.restoreForgetAction}
            </Button>
          </div>
        </div>
      ) : (
        <button type="button" className="text-left text-sm underline" onClick={() => setConfirming(true)}>
          {t.restoreForget}
        </button>
      )}
      {failed ? <p className="text-sm text-destructive">{t.errorGeneric}</p> : null}
    </>
  );
}
