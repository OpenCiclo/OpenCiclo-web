// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState } from "react";

import {
  InvalidConfirmError,
  MailNotConfiguredError,
  RateLimitedError,
  useCiclo,
} from "@/lib/client/ciclo-context";
import { storeBrowserPassword } from "@/lib/client/credentials";
import { AccountMismatchError } from "@/lib/client/api";
import { UpdateRequiredError } from "@/lib/client/http";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Settings, hosted account with no email sign-in: adds one. Two steps, like the
 * email sign-up: the address and a password (which wraps the phrase here), then
 * the 6-digit code mailed to that address.
 */
export function AddEmailSignIn({ disabled, onDone }: { disabled: boolean; onDone: (message: string) => void }) {
  const { t, pendingEmailSignIn, addEmailSignIn, confirmEmailSignIn, resendEmailSignInCode, cancelEmailSignIn } =
    useCiclo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function messageFor(cause: unknown): string {
    if (cause instanceof MailNotConfiguredError) return t.mailNotConfigured;
    if (cause instanceof RateLimitedError) return t.tooManyEmailCodes;
    if (cause instanceof InvalidConfirmError) return t.verifyEmailInvalid;
    if (cause instanceof UpdateRequiredError) return t.updateNeededAction;
    if (cause instanceof AccountMismatchError) return t.accountMismatch;
    return t.errorGeneric;
  }

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  }

  async function finish(address: string) {
    await storeBrowserPassword(address, password);
    setPassword("");
    setConfirm("");
    setCode("");
    onDone(t.addEmailDone);
  }

  if (pendingEmailSignIn) {
    return (
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void run(async () => {
            const address = pendingEmailSignIn;
            await confirmEmailSignIn(code);
            await finish(address);
          });
        }}
      >
        <p className="text-sm text-muted-foreground">{t.verifyEmailBody.replace("{email}", pendingEmailSignIn)}</p>
        <Label htmlFor="add-email-code">{t.verifyEmailCode}</Label>
        <Input
          id="add-email-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={busy || disabled || code.length !== 6}>
          {t.next}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy || disabled}
            onClick={() =>
              void run(async () => {
                await resendEmailSignInCode();
                setError(t.codeSent);
              })
            }
          >
            {t.resendCode}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setCode("");
              setError(null);
              cancelEmailSignIn();
            }}
          >
            {t.changeEmail}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t.codeDelayedAddEmail}</p>
      </form>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (password.length < 8) {
          setError(t.passwordTooShort);
          return;
        }
        if (password !== confirm) {
          setError(t.passwordMismatch);
          return;
        }
        void run(async () => {
          const address = email.trim().toLowerCase();
          const { pending } = await addEmailSignIn(address, password);
          if (!pending) await finish(address);
        });
      }}
    >
      <p className="text-xs text-muted-foreground">{t.addEmailHint}</p>
      <Label htmlFor="add-email-address">{t.email}</Label>
      <Input
        id="add-email-address"
        name="username"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Label htmlFor="add-email-password">{t.password}</Label>
      <PasswordInput
        id="add-email-password"
        name="new-password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        showLabel={t.showPassword}
        hideLabel={t.hidePassword}
      />
      <Label htmlFor="add-email-confirm">{t.confirmPassword}</Label>
      <PasswordInput
        id="add-email-confirm"
        name="new-password-confirm"
        autoComplete="new-password"
        required
        minLength={8}
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        showLabel={t.showPassword}
        hideLabel={t.hidePassword}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={busy || disabled}>
        {busy ? "…" : t.addEmailSubmit}
      </Button>
    </form>
  );
}
