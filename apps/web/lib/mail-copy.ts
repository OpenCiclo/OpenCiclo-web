// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The text of the 6-digit code email (lib/server/mailbox-email.ts lays it out).
// Spanish and English here; other languages in lib/locales/<tag>.ts.

export type MailCopy = {
  subject: string;
  /**
   * Plain paragraphs. The first one ends with `{code}`, the 6-digit code; the
   * HTML version shows the code large below it.
   */
  paragraphs: string[];
};

export const esMail: MailCopy = {
  subject: "Tu código de confirmación de OpenCiclo",
  paragraphs: [
    "Tu código para confirmar que este email es tuyo: {code}",
    "Caduca en 15 minutos.",
    "Este mensaje solo comprueba que la dirección es tuya antes de guardarla en tu cuenta. No abre el diario.",
    "No usamos este email para rastrearte, para publicidad ni para medir cómo usas Ciclo. El código no es un enlace y no inicia sesión.",
    "Si olvidas la contraseña, no se puede recuperar. Este email no la resetea ni te la envía. Si además pierdes la frase de 12 palabras, el diario no se puede abrir. Es así a propósito: ni siquiera nosotras podemos leerlo.",
    "Si no has pedido este código en OpenCiclo, puedes ignorar este mensaje.",
  ],
};

export const enMail: MailCopy = {
  subject: "Your OpenCiclo confirmation code",
  paragraphs: [
    "Your code to confirm this email is yours: {code}",
    "It expires in 15 minutes.",
    "This message only checks that the address is yours before it is saved to your account. It does not open the diary.",
    "We do not use this email to track you, for advertising, or to measure how you use Ciclo. The code is not a link and it does not sign you in.",
    "If you forget the password, it cannot be recovered. This email cannot reset it or send it to you. If you also lose the 12-word phrase, the diary cannot be opened. That is on purpose: not even we can read it.",
    "If you did not ask OpenCiclo for this code, you can ignore this message.",
  ],
};
