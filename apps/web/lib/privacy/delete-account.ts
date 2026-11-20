// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The public page /delete-account (web only), which Google Play asks for: how
// to delete an account and its data without reinstalling the app. Spanish and
// English; other UI languages read one of them (contentLocale), like /privacy.
// Keep it in step with Settings (button labels) and the privacy policy.

import { FRIENDS_AVAILABLE } from "@/lib/features";
import type { BaseLocale } from "@/lib/i18n";
import { PRIVACY_EMAIL } from "@/lib/marketing/copy";
import type { LegalDoc } from "@/lib/privacy/legal-doc";

export type DeleteAccountContext = { email: string | null };

export const DEFAULT_DELETE_ACCOUNT_CONTEXT: DeleteAccountContext = { email: PRIVACY_EMAIL };

export function deleteAccountGuide(
  lang: BaseLocale,
  context: DeleteAccountContext = DEFAULT_DELETE_ACCOUNT_CONTEXT,
): LegalDoc {
  return lang === "es" ? guideEs(context) : guideEn(context);
}

function guideEn({ email }: DeleteAccountContext): LegalDoc {
  return {
    title: "Delete your Ciclo account and data",
    intro: [
      {
        kind: "p",
        text: "You can delete your Ciclo account and everything linked to it at any time, on the web or in the Android app. You do not need to reinstall anything. Deleting cannot be undone, so if you want to keep your diary, export it first: Settings → **Export JSON** or **Export CSV**.",
      },
    ],
    sections: [
      {
        id: "web",
        title: "On the web",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              "Go to [openciclo.com/app](/app) and sign in with your email and password, or with your 12-word phrase.",
              "Open **Settings**.",
              "Choose **Delete account and diary** and confirm.",
            ],
          },
        ],
      },
      {
        id: "android",
        title: "In the Android app",
        blocks: [
          { kind: "p", text: "If your diary is in the Ciclo cloud:" },
          {
            kind: "list",
            ordered: true,
            items: [
              "Open Ciclo and sign in.",
              "Open **Settings**.",
              "Choose **Delete account and diary** and confirm. You need an internet connection.",
            ],
          },
          { kind: "p", text: "This deletes the account on our server and the copies on the phone, as on the web." },
        ],
      },
      {
        id: "device",
        title: "A diary kept only on your phone",
        blocks: [
          {
            kind: "p",
            text: "If you chose **Only on this device** in the Android app, your diary has never been on our servers, so there is no account to delete. It lives only in the app's private storage on your phone. To delete it, do one of these:",
          },
          {
            kind: "list",
            items: [
              "In Ciclo, open **Settings** and choose **Delete the diary on this device**.",
              "In your phone's settings, open Apps → Ciclo → Storage and clear the app's data.",
              "Uninstall Ciclo.",
            ],
          },
          { kind: "p", text: "Without an export, a deleted diary cannot be recovered by anyone." },
        ],
      },
      {
        id: "deleted",
        title: "What is deleted",
        blocks: [
          {
            kind: "list",
            items: [
              "Your encrypted diary.",
              "Your account key (the public key and its hash).",
              "Your email sign-in: the keyed hash of your email address, your password-locked phrase and any pending code.",
              "Your daily activity rows.",
              "On the device you delete from: the saved sign-in, the offline copy and the saved email sign-in details.",
            ],
          },
          { kind: "p", text: "This happens at once." },
        ],
      },
      {
        id: "kept",
        title: "What is not deleted",
        blocks: [
          {
            kind: "list",
            items: [
              "**Research pool rows** already uploaded, if you turned the pool on. They hold only cycle lengths and cannot be linked to your account, so we cannot find or delete them.",
              ...(FRIENDS_AVAILABLE
                ? [
                    "**Messages for friends** that your device could not delete first, if you used Friends. They are encrypted with keys only you and each friend hold and are not linked to your account; they expire within 7 weeks.",
                  ]
                : []),
              "**Abuse-protection records**: a keyed hash of your IP address (never the address itself), and for email sign-in and email codes a keyed hash of the email address. They are usually deleted about a day later, at the next automatic cleanup.",
              "**Sign-in challenges** that were never used. They expire after 5 minutes and are deleted at a later automatic cleanup.",
              "**Request logs** at our hosting provider, Vercel, kept for a short period that Vercel sets.",
              "**Backups** of the database, which hold your diary encrypted. Deleted data disappears from them as they expire or are replaced.",
              "**Email records** at our email provider, Resend, for the code emails it sent, kept for a limited time under its own terms.",
              "**An email sign-up you never confirmed.** That is a separate account, which cannot be opened, so this deletion does not reach it. Ask us to delete it: see “How to reach us” in the [privacy policy](/privacy#contact).",
              "**Your own files and other devices:** exports you saved, and the saved sign-in on other devices. Those devices will say that the account no longer exists; sign out there.",
            ],
          },
        ],
      },
      {
        id: "lost",
        title: "If you cannot sign in",
        blocks: [
          {
            kind: "p",
            text: "Ciclo cannot reset your password or your 12-word phrase, so nobody, including us, can sign in for you. If you lost both, the diary can no longer be opened by anyone.",
          },
          ...(email
            ? ([
                {
                  kind: "p",
                  text: `To have the account deleted anyway, write to [${email}](mailto:${email}) from the email address the account uses, with the subject “Delete my account”. We reply to that address to check that it is yours, and once you confirm, we delete any account that uses it, including one whose email sign-up was never confirmed. We answer within one month.`,
                },
                {
                  kind: "p",
                  text: "Accounts made with only a 12-word phrase have no email address linked. Without the phrase, we have no way to find them.",
                },
              ] as const)
            : []),
        ],
      },
      {
        id: "more",
        title: "More",
        blocks: [{ kind: "p", text: "What Ciclo stores and why: [Privacy policy](/privacy)." }],
      },
    ],
  };
}

function guideEs({ email }: DeleteAccountContext): LegalDoc {
  return {
    title: "Borrar tu cuenta de Ciclo y tus datos",
    intro: [
      {
        kind: "p",
        text: "Puedes borrar tu cuenta de Ciclo y todo lo vinculado a ella cuando quieras, en la web o en la app de Android. No hace falta reinstalar nada. El borrado no se puede deshacer, así que si quieres conservar tu diario, expórtalo antes: Ajustes → **Exportar JSON** o **Exportar CSV**.",
      },
    ],
    sections: [
      {
        id: "web",
        title: "En la web",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              "Ve a [openciclo.com/app](/app) y entra con tu correo y tu contraseña, o con tu frase de 12 palabras.",
              "Abre **Ajustes**.",
              "Elige **Borrar cuenta y diario** y confirma.",
            ],
          },
        ],
      },
      {
        id: "android",
        title: "En la app de Android",
        blocks: [
          { kind: "p", text: "Si tu diario está en la nube de Ciclo:" },
          {
            kind: "list",
            ordered: true,
            items: [
              "Abre Ciclo y entra.",
              "Abre **Ajustes**.",
              "Elige **Borrar cuenta y diario** y confirma. Necesitas conexión a internet.",
            ],
          },
          { kind: "p", text: "Así se borran la cuenta en nuestro servidor y las copias del móvil, igual que en la web." },
        ],
      },
      {
        id: "device",
        title: "Un diario guardado solo en tu móvil",
        blocks: [
          {
            kind: "p",
            text: "Si en la app de Android elegiste **Solo en este dispositivo**, tu diario nunca ha estado en nuestros servidores, así que no hay ninguna cuenta que borrar. Solo existe en el almacenamiento privado de la app en tu móvil. Para borrarlo, haz una de estas cosas:",
          },
          {
            kind: "list",
            items: [
              "En Ciclo, abre **Ajustes** y elige **Borrar diario de este dispositivo**.",
              "En los ajustes del móvil, abre Aplicaciones → Ciclo → Almacenamiento y borra los datos de la app.",
              "Desinstala Ciclo.",
            ],
          },
          { kind: "p", text: "Sin una exportación, nadie puede recuperar un diario borrado." },
        ],
      },
      {
        id: "deleted",
        title: "Qué se borra",
        blocks: [
          {
            kind: "list",
            items: [
              "Tu diario cifrado.",
              "La clave de tu cuenta (la clave pública y su hash).",
              "Tu acceso con correo: el hash con clave de tu dirección, tu frase cerrada con contraseña y cualquier código pendiente.",
              "Tus filas de actividad diaria.",
              "En el dispositivo desde el que borras: la sesión guardada, la copia sin conexión y los datos guardados del acceso con correo.",
            ],
          },
          { kind: "p", text: "Todo esto se borra en el acto." },
        ],
      },
      {
        id: "kept",
        title: "Qué no se borra",
        blocks: [
          {
            kind: "list",
            items: [
              "**Filas del pool de investigación** ya enviadas, si lo activaste. Solo contienen duraciones de ciclo y no se pueden vincular a tu cuenta, así que no podemos encontrarlas ni borrarlas.",
              ...(FRIENDS_AVAILABLE
                ? [
                    "**Mensajes para amigas** que tu dispositivo no pudo borrar antes, si usaste Amigas. Están cifrados con claves que solo tenéis tú y cada amiga y no están vinculados a tu cuenta; caducan en 7 semanas como mucho.",
                  ]
                : []),
              "**Registros de protección contra abusos**: un hash con clave de tu dirección IP (nunca la IP en sí) y, en el acceso con correo y los códigos por correo, un hash con clave del correo. Normalmente se borran al cabo de alrededor de un día, en la siguiente limpieza automática.",
              "**Desafíos de acceso** que no se usaron. Caducan a los 5 minutos y se borran en una limpieza automática posterior.",
              "**Registros de peticiones** en nuestro proveedor de alojamiento, Vercel, que los guarda un periodo breve que fija Vercel.",
              "**Copias de seguridad** de la base de datos, que guardan tu diario cifrado. Lo borrado desaparece de ellas cuando caducan o se sustituyen.",
              "**Registros de correo** en nuestro proveedor de correo, Resend, de los correos con código que envió, que guarda un tiempo limitado según sus propias condiciones.",
              "**Un alta con correo que nunca confirmaste.** Es otra cuenta, que no se puede abrir, así que este borrado no llega a ella. Pídenos que la borremos: mira «Cómo contactar» en la [política de privacidad](/privacy#contact).",
              "**Tus propios archivos y otros dispositivos:** las exportaciones que guardaste y la sesión guardada en otros dispositivos. Esos dispositivos dirán que la cuenta ya no existe; cierra sesión en ellos.",
            ],
          },
        ],
      },
      {
        id: "lost",
        title: "Si no puedes entrar",
        blocks: [
          {
            kind: "p",
            text: "Ciclo no puede restablecer tu contraseña ni tu frase de 12 palabras, así que nadie, ni nosotras, puede entrar por ti. Si perdiste las dos, ya nadie puede abrir el diario.",
          },
          ...(email
            ? ([
                {
                  kind: "p",
                  text: `Para que borremos la cuenta de todos modos, escribe a [${email}](mailto:${email}) desde la dirección de correo de la cuenta, con el asunto «Borrar mi cuenta». Te responderemos a esa dirección para comprobar que es tuya y, cuando lo confirmes, borraremos cualquier cuenta que la use, también una cuya alta con correo nunca se confirmó. Respondemos en el plazo de un mes.`,
                },
                {
                  kind: "p",
                  text: "Las cuentas creadas solo con una frase de 12 palabras no tienen ningún correo vinculado. Sin la frase, no tenemos forma de encontrarlas.",
                },
              ] as const)
            : []),
        ],
      },
      {
        id: "more",
        title: "Más",
        blocks: [{ kind: "p", text: "Qué guarda Ciclo y por qué: [Política de privacidad](/privacy)." }],
      },
    ],
  };
}
