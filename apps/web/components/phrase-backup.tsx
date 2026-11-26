// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState } from "react";

import { PhraseQrCode } from "@/components/phrase-qr-code";
import type { SaveOutcome } from "@/components/save-file-dialog";
import { Button } from "@/components/ui/button";
import { copyPhrase } from "@/lib/client/phrase-clipboard";
import type { Messages } from "@/lib/i18n";

/** The name of the phrase backup file, the same wherever it is saved from. */
export const PHRASE_FILE = "ciclo-recovery-phrase.txt";

/**
 * The 12-word phrase to keep: the words in order, its QR code, and two ways to
 * take it away (copy, save as a file). The sign-up shows it once; Settings
 * shows it again behind "Show the phrase". `onSave` is the screen's own
 * `useSaveFile`, so the Android app asks where the file should go.
 */
export function PhraseBackup({
  mnemonic,
  t,
  onSave,
}: {
  mnemonic: string;
  t: Messages;
  onSave: (filename: string, body: string, type: string) => Promise<SaveOutcome>;
}) {
  // Per phrase: a new one starts as not copied.
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);
  const words = mnemonic.split(" ");
  return (
    <div className="flex flex-col gap-3">
      <ol className="grid grid-cols-2 gap-2 text-sm">
        {words.map((word, index) => (
          <li key={`${word}-${index}`} className="rounded-lg bg-secondary px-3 py-2">
            <span className="text-muted-foreground">{index + 1}.</span> {word}
          </li>
        ))}
      </ol>
      <div className="flex flex-col items-center gap-2 py-1">
        <PhraseQrCode mnemonic={mnemonic} label={t.backupQrLabel} />
        <p className="text-center text-xs text-muted-foreground">{t.backupQrHint}</p>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={async () => {
            // Marked sensitive in the app, and cleared from the clipboard a minute later.
            // "Copied" only once it is: a browser may refuse the clipboard.
            try {
              await copyPhrase(mnemonic);
              setCopiedPhrase(mnemonic);
            } catch {
              setCopiedPhrase(null);
            }
          }}
        >
          {copiedPhrase === mnemonic ? t.copied : t.copy}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => void onSave(PHRASE_FILE, mnemonic, "text/plain").catch(() => undefined)}
        >
          {t.download}
        </Button>
      </div>
    </div>
  );
}
