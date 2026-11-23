// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The privacy policy shown at /privacy. Spanish and English are the
// authoritative texts; other UI languages read one of them (contentLocale) with
// a "Spanish/English only for now" badge. It needs a legal review before the
// Google Play launch (docs/play/privacy-checklist.md).
//
// Keep it true to the code: when what the app stores, sends or keeps changes,
// change this text, its date, PRIVACY.md and docs/play/privacy-checklist.md in
// the same commit. The owner's details (controller, email) come from
// lib/marketing/copy.ts; the server region from vercel.json (lib/privacy/hosting.ts).

import { FRIENDS_AVAILABLE } from "@/lib/features";
import { formatIsoUtc } from "@/lib/format-date";
import type { BaseLocale } from "@/lib/i18n";
import { CONTROLLER, MARKETING_LINKS, PRIVACY_EMAIL, type Controller } from "@/lib/marketing/copy";
import { DATABASE_PLACE, FUNCTION_REGIONS, type HostingRegion } from "@/lib/privacy/hosting";
import type { LegalBlock, LegalDoc } from "@/lib/privacy/legal-doc";

/** The day this text last changed (YYYY-MM-DD). Change it with the text. */
export const PRIVACY_POLICY_UPDATED = "2026-11-23";

/**
 * What a diary can hold, in plain words. Keep it in step with
 * lib/symptoms/definitions.ts (built-in symptoms and categories) and the
 * sign-up consent (`signupConsentHosted` in lib/i18n.ts and the locales).
 */
export const DIARY_CONTENTS: Record<BaseLocale, string> = {
  en: "Everything you log: period dates and bleeding; cervical mucus and vaginal discharge; physical symptoms, such as cramps and other pain, nausea and digestion, hot flashes, urinary infections, vaginal itching or dryness; moods and mental health, such as anxiety, low mood, guilt or obsessive thoughts; sexual activity, protection, libido and orgasm; pregnancy and ovulation test results; with pregnancy mode, the dates of a pregnancy (what you dated it by, its due date and, if you log it, the day it ended and whether it ended in a birth); contraceptive pill intake and other medicines you add; illness or injury, alcohol, stress, exercise, meditation and travel; and the short notes you write.",
  es: "Todo lo que apuntas: fechas del periodo y sangrado; moco cervical y flujo vaginal; síntomas físicos, como cólicos y otros dolores, náuseas y digestión, sofocos, infecciones urinarias, picor o sequedad vaginal; estados de ánimo y salud mental, como ansiedad, ánimo bajo, culpa o pensamientos obsesivos; actividad sexual, protección, libido y orgasmo; resultados de tests de embarazo y de ovulación; con el modo embarazo, las fechas de un embarazo (con qué lo fechaste, la fecha probable de parto y, si lo apuntas, el día en que terminó y si terminó en un parto); tomas de la píldora anticonceptiva y otros medicamentos que añadas; enfermedad o lesión, alcohol, estrés, ejercicio, meditación y viajes; y las notas breves que escribes.",
};

export type PolicyContext = {
  controller: Controller | null;
  email: string | null;
  regions: HostingRegion[];
};

export const DEFAULT_POLICY_CONTEXT: PolicyContext = {
  controller: CONTROLLER,
  email: PRIVACY_EMAIL,
  regions: FUNCTION_REGIONS,
};

const POLICY_HISTORY = `${MARKETING_LINKS.github}/commits/main/apps/web/lib/privacy/policy.ts`;

export function privacyPolicy(lang: BaseLocale, context: PolicyContext = DEFAULT_POLICY_CONTEXT): LegalDoc {
  const updated = formatIsoUtc(PRIVACY_POLICY_UPDATED, lang, { day: "numeric", month: "long", year: "numeric" });
  return lang === "es" ? policyEs(context, updated) : policyEn(context, updated);
}

function places(regions: HostingRegion[], lang: BaseLocale): string {
  return regions.map((region) => region.place[lang]).join(lang === "es" ? " y " : " and ");
}

function policyEn(context: PolicyContext, updated: string): LegalDoc {
  const { controller, email } = context;
  const where = places(context.regions, "en");
  const allInEea = context.regions.every((region) => region.inEea);
  const contact = email ? `write to [${email}](mailto:${email})` : "use the [contact page](/contact)";
  const labels = { what: "What", why: "Why", basis: "Legal basis", kept: "How long" };
  const item = (title: string, what: string, why: string, basis: string, kept: string): LegalBlock => ({
    kind: "item",
    title,
    rows: [
      { label: labels.what, text: what },
      { label: labels.why, text: why },
      { label: labels.basis, text: basis },
      { label: labels.kept, text: kept },
    ],
  });

  return {
    title: "Privacy policy",
    updated: `Last updated: ${updated}`,
    intro: [
      {
        kind: "p",
        text: "Ciclo is a period diary with cycle forecasts. It runs on the web at openciclo.com and as an app for Android. This policy explains what personal data Ciclo handles, why, where it is kept, for how long, and how you can control it.",
      },
      {
        kind: "list",
        items: [
          "Your diary is **encrypted on your device** before it is saved. Our server keeps only the encrypted copy. We do not have the key, so we cannot read it.",
          "Forecasts, cycle phases and the estimated fertile window are **calculated on your device**. Your dates are not sent anywhere to be predicted.",
          "On Android you can keep the diary **only on your phone**. Then it never reaches us.",
          "**No ads, no analytics, no trackers.** We do not sell your data or share it for advertising.",
          "You can **export** your diary and **delete** your account at any time.",
        ],
      },
    ],
    sections: [
      {
        id: "controller",
        title: "Who is responsible",
        blocks: [
          controller
            ? {
                kind: "p",
                text: `The controller of your personal data, as the GDPR calls it, is **${controller.name}**, ${controller.address}.`,
              }
            : { kind: "p", text: "Ciclo is made by the OpenCiclo project." },
          {
            kind: "p",
            text: "This policy covers the Ciclo web app and the Ciclo app for Android. The open-source Python library openciclo runs on your own computer and sends nothing to us.",
          },
        ],
      },
      {
        id: "contact",
        title: "How to reach us",
        blocks: [
          email
            ? {
                kind: "p",
                text: `For questions about your privacy or this policy, or to use your rights, write to [${email}](mailto:${email}).`,
              }
            : {
                kind: "p",
                text: "For questions about your privacy or this policy, or to use your rights, use the [contact page](/contact). Please do not write health details there: messages on it are public.",
              },
        ],
      },
      {
        id: "data",
        title: "What we handle, why, and on what legal basis",
        blocks: [
          {
            kind: "p",
            text: "Under the GDPR, every use of personal data needs a purpose and a legal basis. These are all the personal data the hosted app handles. If you keep your diary only on your Android phone, none of this reaches us, except the research pool if you turn it on: see “Data that stays on your device”.",
          },
          item(
            "Your diary (encrypted)",
            `${DIARY_CONTENTS.en} Also the settings saved inside the diary (language, whether forecasts show, favourite and custom symptoms, your research pool choice). This is health data and data about your sex life, which the GDPR protects specially (article 9). Your device encrypts it with AES-256-GCM before sending it. The server stores the encrypted copy, a version number and when it last changed.`,
            "To keep your diary and let you open it on your devices.",
            "Your explicit consent (GDPR articles 6(1)(a) and 9(2)(a)). Before a new diary is created, Ciclo asks for it with a box you tick; the app keeps no record of that tick. You can withdraw your consent at any time by deleting your account. That does not make earlier processing unlawful.",
            "Until you delete your account.",
          ),
          item(
            "Account key",
            "A public key made from your 12-word phrase, and a hash of it. It identifies your account, like an address, but it cannot open your diary. We also keep when the account was created. To sign in, your device signs a one-time challenge, which expires after 5 minutes.",
            "To know which diary is yours, and to sign you in without a password ever reaching us.",
            "Needed to provide the account you asked for (GDPR article 6(1)(b)).",
            "Until you delete your account. Challenges expire after 5 minutes and are deleted at a later automatic cleanup.",
          ),
          item(
            "Email sign-in (only if you choose email and password)",
            "Your email address reaches our server when you create the account, sign in on a device that does not have your locked phrase yet, change your password, or add an email sign-in. The server uses it in memory, to send you a 6-digit code through our email provider or to find your account, and does not store it in our database. We store a keyed hash (HMAC) of the address, which lets us recognise it when you type it but from which we cannot read the address, and your 12-word phrase locked with your password. Only your password can unlock it, on your device; we cannot. Until you enter the code, we keep a pending entry with the keyed hash, the locked phrase and a hash of the code. The code is valid for 15 minutes.",
            "To let you sign in on any device with your email and password, and to check that the address is yours.",
            "Needed to provide the account you asked for (GDPR article 6(1)(b)).",
            "Until you delete your account. A pending entry is removed when you enter the code, ask for a new one, or delete the account. If you start an email sign-up and never enter the code, the account (with an empty encrypted diary) and its pending entry stay on the server, and you cannot delete them from the app: see “Deleting your account”.",
          ),
          item(
            "Sign-in cookie",
            "One cookie, ciclo_session, holding a signed reference to your account key and an expiry date. Ciclo sets no other cookies and no tracking cookies.",
            "To keep you signed in while you use the app.",
            "Needed to provide the service (GDPR article 6(1)(b)). It is strictly necessary, so it needs no cookie consent.",
            "Right after you create an account, Ciclo keeps you signed in on that device and the cookie lasts 30 days. When you sign in later, it lasts 30 days if you tick “Keep me signed in”, otherwise until you close the browser or the app. Signing out deletes it.",
          ),
          item(
            "Protection against abuse",
            "A keyed hash (HMAC) of your IP address, never the address itself, with the time and the kind of request: sign-in challenge, account creation, email code, email sign-in, research upload. For email codes and email sign-in we also keep the keyed hash of the email address.",
            "To stop automated abuse, such as scripts that fill the database, send mass email or guess codes.",
            "Our legitimate interest in keeping Ciclo secure and available (GDPR article 6(1)(f)).",
            "Usually about a day: older records are deleted at the next automatic cleanup.",
          ),
          item(
            "Daily activity count",
            "For each day (in UTC) on which an account signs in, one row with the account's internal number and the date. Nothing else: no time, no place, no device.",
            "To count how many people use Ciclo each day, so we can run the service and plan its capacity. We only look at totals.",
            "Our legitimate interest in running and planning the service (GDPR article 6(1)(f)). You can object; see “Your rights”.",
            "Until you delete your account.",
          ),
          item(
            "Technical data at our host",
            "When your device connects, our hosting provider, Vercel, receives your IP address and standard request details (time, page or address requested, browser type) in order to answer, and keeps short logs. Ciclo never writes diary contents, email addresses, phrases or passwords to logs.",
            "To deliver the website and the app's requests to the server, and to keep them secure.",
            "Our legitimate interest in running a secure service (GDPR article 6(1)(f)).",
            "A short period set by Vercel.",
          ),
          item(
            "Research pool (optional, off by default)",
            "Only if you turn it on in Settings: the lengths of your completed cycles, as whole numbers of days (for example 28 or 30). No dates, symptoms, notes, email address or account key. Ciclo uploads them at most once a month, with a random identifier kept inside your encrypted diary so that each upload replaces the previous one. The server stores a hash of that identifier, the lengths and the time of the upload. Nothing in the pool records your account, so we cannot tell which row is yours.",
            "To build an open, combined set of cycle lengths that may later help improve the open-source forecast model. The published model does not use it today.",
            "Your explicit consent (GDPR articles 6(1)(a) and 9(2)(a)), given with the two boxes in Settings. Turn it off at any time to stop future uploads.",
            "Rows already uploaded stay in the pool; no end date has been set. Because they cannot be linked to your account, we cannot find or delete them when you delete your account or ask us to. Settings says so before you agree.",
          ),
          ...(FRIENDS_AVAILABLE
            ? [
                item(
                  "Friends (optional, off by default)",
                  "Only if you turn on Friends and add friends with an invite. Your friend list (the names and keys of your friends, your pending invites, the name your friends see, your note and your sharing choices) is encrypted on your device and stored as one blob linked to your account. For each friend, your device also stores a message for them: your name, your current phase and the estimated dates of your current cycle (its start, the expected next start and the expected length of a period), whether to show your cycle day and expected period, and your note. It is encrypted with a key only your two phones can work out, from the invite link and a key exchange between them; that key never reaches us. These messages are stored with no account, all with the same size, and with an expiry date rounded to a week. Symptoms, diary notes, past cycles and pregnancies are never shared. We cannot read any of it, or see who your friends are; we can see that your account uses Friends and when your device makes requests, and for about a day after a message is written our abuse-protection records could show which account wrote it, though not who reads it.",
                  "To show you and your friends each other's cycle phase, as you asked.",
                  "Your explicit consent (GDPR articles 6(1)(a) and 9(2)(a)), given with the box on the Friends screen. Turn Friends off or remove a friend at any time.",
                  "Your friend list: until you turn Friends off or delete your account. Messages to friends: until you remove the friend or turn Friends off, and otherwise they expire 7 weeks at most after your device last wrote them. A friend's device keeps showing what it last received until then.",
                ),
              ]
            : []),
        ],
      },
      {
        id: "device",
        title: "Data that stays on your device",
        blocks: [
          { kind: "p", text: "This data is stored on your phone or computer. We never receive it." },
          {
            kind: "list",
            items: [
              "**Staying signed in:** right after you create an account, Ciclo keeps you signed in on that device. When you sign in later, it does so only if you tick “Keep me signed in”.",
              "**Browser storage (web):** display settings (appearance, week start, time zone, moon phases, language); the email address you last signed in with and your password-locked phrase, so you can sign in faster, until you sign out; and your 12-word phrase, in the tab's session storage until you close the tab and, while you stay signed in, in the browser's local storage until you sign out.",
              "**Android app:** the app's web view keeps the same display settings, last email address and password-locked phrase until you sign out. While you stay signed in, your 12-word phrase is sealed with a key held by Android Keystore, which cannot be copied out of the phone, and a diary in the Ciclo cloud keeps an encrypted offline copy on the phone so you can read it without a connection; signing out deletes both. Otherwise the phrase stays in the app's memory only and there is no offline copy.",
              "**Only on this device (Android):** the encrypted diary and its phrase, sealed by Android Keystore and, if you turn on the app lock, behind your fingerprint or screen lock. The diary is never sent to us. If you lose or reset the phone without an export, the diary is gone.",
              "**No cloud backups:** the Android app keeps all its data out of Android backups.",
              "**Camera:** Ciclo asks for the camera only when you choose to scan the QR code of your 12-word phrase. The picture is read on your device to find the code and is never stored or sent.",
              "**Exports:** the JSON and CSV files you export are not encrypted. You decide where they go; keep them safe.",
            ],
          },
        ],
      },
      {
        id: "processors",
        title: "Who handles data for us",
        blocks: [
          { kind: "p", text: "We use these service providers. They handle data only to provide their service to us:" },
          {
            kind: "list",
            items: [
              `**Vercel** (Vercel Inc., United States) hosts the website and runs Ciclo's server code. That code runs in ${where}. Vercel's global network may receive your connection at a location near you.`,
              `**Neon** (United States) hosts the database, on Amazon Web Services in ${DATABASE_PLACE.en}. The stored data described above lives there.`,
              "**Resend** (United States) sends the email with your 6-digit code. It receives your email address and the message.",
            ],
          },
          {
            kind: "p",
            text: "**Google** distributes the Android app through Google Play. Google is not one of our service providers for this: it is responsible for what Google Play collects, under its own privacy policy. Ciclo includes no Google analytics or advertising code.",
          },
          {
            kind: "p",
            text: "We do not sell your data or give it to anyone else, unless the law obliges us, for example with a court order. Even then, we cannot hand over what is inside your diary: we cannot decrypt it.",
          },
        ],
      },
      {
        id: "transfers",
        title: "Data outside the European Union",
        blocks: [
          allInEea
            ? {
                kind: "p",
                text: `The database is in ${DATABASE_PLACE.en} and the server code runs in ${where}, both inside the EU. Vercel, Neon and Resend are companies based in the United States, and some data, such as email delivery or Vercel's global network, may be handled outside the European Economic Area.`,
              }
            : {
                kind: "p",
                text: `The database is in ${DATABASE_PLACE.en}, inside the EU. The server code that answers your requests runs in ${where}, so what your device sends and receives, including your encrypted diary, passes through there. Vercel, Neon and Resend are companies based in the United States.`,
              },
          {
            kind: "p",
            text: "When personal data leaves the European Economic Area, we rely on the safeguards the GDPR provides, such as the European Commission's standard contractual clauses, or the EU–US Data Privacy Framework for providers certified under it. Your diary stays encrypted the whole way, and none of these providers has the key.",
          },
        ],
      },
      {
        id: "retention",
        title: "How long we keep data",
        blocks: [
          {
            kind: "list",
            items: [
              "Your diary, account key, email sign-in and daily activity rows: until you delete your account.",
              "An email sign-up that was never confirmed (an account with an empty diary and a pending entry): until it is deleted on request. There is no automatic cleanup.",
              "Sign-in challenges expire after 5 minutes; abuse-protection records are kept for usually about a day. Both are deleted at the next automatic cleanup after that.",
              "Research pool rows: see “Research pool” above; they cannot be deleted by account.",
              ...(FRIENDS_AVAILABLE
                ? [
                    "Friends: your friend list until you turn Friends off or delete your account; messages to friends expire 7 weeks at most after they were last written, sooner when you remove the friend.",
                  ]
                : []),
              "Backups: our database provider keeps a short restore history, and we may keep backup copies to recover from failures. Deleted data disappears from them as they expire or are replaced. Backups hold your diary encrypted, as it is stored.",
            ],
          },
        ],
      },
      {
        id: "deletion",
        title: "Deleting your account",
        blocks: [
          {
            kind: "p",
            text: "You can delete your account and all data linked to it at any time, without reinstalling anything: sign in on the web or in the app, open Settings and choose **Delete account and diary**. Your encrypted diary, account key, email sign-in and daily activity rows are deleted at once.",
          },
          ...(FRIENDS_AVAILABLE
            ? [
                {
                  kind: "p" as const,
                  text: "With Friends on, the app first tells your friends and deletes your friend list and invites. Messages your device left for friends are not linked to your account, so if they cannot be deleted then (no connection, an older app version), nobody can read them and they expire within 7 weeks.",
                },
              ]
            : []),
          {
            kind: "p",
            text: "A diary kept only on your Android phone never reaches us: delete it in the app's Settings, clear the app's data, or uninstall the app.",
          },
          {
            kind: "p",
            text: "If you started creating an account with your email but never entered the code, that account cannot be opened or deleted from the app. Ask us to delete it (see “How to reach us”).",
          },
          {
            kind: "p",
            text: "Step-by-step instructions, including what to do if you cannot sign in: [Delete your account](/delete-account).",
          },
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        blocks: [
          {
            kind: "p",
            text: "Under the GDPR you can ask to access your data, correct it, delete it, receive it in a portable format, restrict how it is used, and object to uses based on our legitimate interest. You can withdraw any consent at any time.",
          },
          {
            kind: "list",
            items: [
              "**Access and portability:** Settings → Export JSON or Export CSV gives you your whole diary.",
              "**Correction:** edit any day in the app.",
              "**Deletion:** Settings → Delete account and diary.",
              "**Withdrawing consent:** delete your account, or turn off the research pool.",
            ],
          },
          {
            kind: "p",
            text: `For anything else, ${contact}. We do not keep email addresses and cannot read your diary, so we may ask you to show that the account is yours. We answer within one month.`,
          },
          {
            kind: "p",
            text: "You can also complain to a data protection authority, in particular in the EU country where you live or work. In Spain this is the Agencia Española de Protección de Datos ([aepd.es](https://www.aepd.es)).",
          },
        ],
      },
      {
        id: "security",
        title: "Security",
        blocks: [
          {
            kind: "p",
            text: "Your diary is encrypted on your device with AES-256-GCM, using a key that comes from your 12-word phrase. Signing in proves that you hold that phrase with a digital signature, so neither the phrase nor your password is ever sent to us in readable form. All connections use HTTPS. The code is open source, so anyone can check how this works. No system is perfectly secure: if a breach puts your data at risk, we will tell you and the authorities as the law requires.",
          },
        ],
      },
      {
        id: "children",
        title: "Children",
        blocks: [
          {
            kind: "p",
            text: "Ciclo is not directed at children. Learn includes articles about puberty. In the EU, a child under the age of digital consent in their country (between 13 and 16, depending on the country) needs a parent or guardian to agree before using services like this one. A parent or guardian who finds that their child created an account without that agreement can delete it from Settings together with the child, or contact us.",
          },
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        blocks: [
          {
            kind: "p",
            text: `When this policy changes, the date at the top changes too. If a change affects how your data is used, we will say so in the app or on the website before it applies. Every earlier version is public in [Ciclo's code repository](${POLICY_HISTORY}).`,
          },
        ],
      },
    ],
  };
}

function policyEs(context: PolicyContext, updated: string): LegalDoc {
  const { controller, email } = context;
  const where = places(context.regions, "es");
  const allInEea = context.regions.every((region) => region.inEea);
  const contact = email ? `escribe a [${email}](mailto:${email})` : "usa la [página de contacto](/contact)";
  const labels = { what: "Qué", why: "Para qué", basis: "Base legal", kept: "Cuánto tiempo" };
  const item = (title: string, what: string, why: string, basis: string, kept: string): LegalBlock => ({
    kind: "item",
    title,
    rows: [
      { label: labels.what, text: what },
      { label: labels.why, text: why },
      { label: labels.basis, text: basis },
      { label: labels.kept, text: kept },
    ],
  });

  return {
    title: "Política de privacidad",
    updated: `Última actualización: ${updated}`,
    intro: [
      {
        kind: "p",
        text: "Ciclo es un diario del periodo con pronósticos del ciclo. Funciona en la web, en openciclo.com, y como app para Android. Esta política explica qué datos personales trata Ciclo, para qué, dónde se guardan, cuánto tiempo y cómo puedes controlarlos.",
      },
      {
        kind: "list",
        items: [
          "Tu diario se **cifra en tu dispositivo** antes de guardarse. Nuestro servidor solo guarda la copia cifrada. No tenemos la clave, así que no podemos leerlo.",
          "Los pronósticos, las fases del ciclo y la ventana fértil estimada se **calculan en tu dispositivo**. Tus fechas no se envían a ningún sitio para hacer predicciones.",
          "En Android puedes guardar el diario **solo en tu móvil**. Así nunca nos llega.",
          "**Sin anuncios, sin analítica, sin rastreadores.** No vendemos tus datos ni los compartimos para publicidad.",
          "Puedes **exportar** tu diario y **borrar** tu cuenta cuando quieras.",
        ],
      },
    ],
    sections: [
      {
        id: "controller",
        title: "Quién es responsable",
        blocks: [
          controller
            ? {
                kind: "p",
                text: `El responsable del tratamiento de tus datos personales, como lo llama el RGPD, es **${controller.name}**, ${controller.address}.`,
              }
            : { kind: "p", text: "Ciclo lo hace el proyecto OpenCiclo." },
          {
            kind: "p",
            text: "Esta política cubre la app web de Ciclo y la app de Ciclo para Android. La biblioteca de Python openciclo, de código abierto, funciona en tu propio ordenador y no nos envía nada.",
          },
        ],
      },
      {
        id: "contact",
        title: "Cómo contactar",
        blocks: [
          email
            ? {
                kind: "p",
                text: `Para preguntas sobre tu privacidad o esta política, o para ejercer tus derechos, escribe a [${email}](mailto:${email}).`,
              }
            : {
                kind: "p",
                text: "Para preguntas sobre tu privacidad o esta política, o para ejercer tus derechos, usa la [página de contacto](/contact). No escribas datos de salud allí: los mensajes son públicos.",
              },
        ],
      },
      {
        id: "data",
        title: "Qué tratamos, para qué y con qué base legal",
        blocks: [
          {
            kind: "p",
            text: "El RGPD exige que cada uso de datos personales tenga una finalidad y una base legal. Estos son todos los datos personales que trata la app alojada. Si guardas el diario solo en tu móvil Android, nada de esto nos llega, salvo el pool de investigación si lo activas: mira «Datos que se quedan en tu dispositivo».",
          },
          item(
            "Tu diario (cifrado)",
            `${DIARY_CONTENTS.es} También los ajustes guardados dentro del diario (idioma, si se muestran los pronósticos, síntomas favoritos y personalizados, tu elección sobre el pool de investigación). Son datos de salud y datos sobre tu vida sexual, que el RGPD protege de forma especial (artículo 9). Tu dispositivo los cifra con AES-256-GCM antes de enviarlos. El servidor guarda la copia cifrada, un número de versión y la fecha del último cambio.`,
            "Para guardar tu diario y que puedas abrirlo en tus dispositivos.",
            "Tu consentimiento explícito (artículos 6.1.a y 9.2.a del RGPD). Antes de crear un diario nuevo, Ciclo te lo pide con una casilla que marcas; la app no guarda ningún registro de esa casilla. Puedes retirar tu consentimiento cuando quieras borrando tu cuenta. Retirarlo no vuelve ilícito el tratamiento anterior.",
            "Hasta que borres tu cuenta.",
          ),
          item(
            "Clave de la cuenta",
            "Una clave pública generada a partir de tu frase de 12 palabras, y un hash de ella. Identifica tu cuenta, como una dirección, pero no puede abrir tu diario. También guardamos cuándo se creó la cuenta. Para entrar, tu dispositivo firma un desafío de un solo uso, que caduca a los 5 minutos.",
            "Para saber qué diario es el tuyo y dejarte entrar sin que ninguna contraseña nos llegue nunca.",
            "Es necesario para darte la cuenta que pediste (artículo 6.1.b del RGPD).",
            "Hasta que borres tu cuenta. Los desafíos caducan a los 5 minutos y se borran en una limpieza automática posterior.",
          ),
          item(
            "Acceso con correo (solo si eliges correo y contraseña)",
            "Tu dirección de correo llega a nuestro servidor cuando creas la cuenta, entras desde un dispositivo que aún no tiene tu frase cerrada, cambias la contraseña o añades un acceso con correo. El servidor la usa en memoria, para enviarte un código de 6 cifras a través de nuestro proveedor de correo o para encontrar tu cuenta, y no la guarda en nuestra base de datos. Guardamos un hash con clave (HMAC) de la dirección, que nos permite reconocerla cuando la escribes pero del que no podemos leer la dirección, y tu frase de 12 palabras cerrada con tu contraseña. Solo tu contraseña puede abrirla, en tu dispositivo; nosotras no. Hasta que escribes el código, guardamos una entrada pendiente con el hash con clave, la frase cerrada y un hash del código. El código vale 15 minutos.",
            "Para que puedas entrar desde cualquier dispositivo con tu correo y tu contraseña, y para comprobar que la dirección es tuya.",
            "Es necesario para darte la cuenta que pediste (artículo 6.1.b del RGPD).",
            "Hasta que borres tu cuenta. La entrada pendiente desaparece cuando escribes el código, pides otro o borras la cuenta. Si empiezas un alta con correo y nunca escribes el código, la cuenta (con un diario cifrado vacío) y su entrada pendiente se quedan en el servidor, y no puedes borrarlas desde la app: mira «Borrar tu cuenta».",
          ),
          item(
            "Cookie de sesión",
            "Una cookie, ciclo_session, con una referencia firmada a la clave de tu cuenta y una fecha de caducidad. Ciclo no pone ninguna otra cookie ni cookies de seguimiento.",
            "Para mantener tu sesión abierta mientras usas la app.",
            "Es necesaria para prestar el servicio (artículo 6.1.b del RGPD). Es estrictamente necesaria, así que no requiere consentimiento de cookies.",
            "Justo después de crear una cuenta, Ciclo mantiene tu sesión iniciada en ese dispositivo y la cookie dura 30 días. Cuando entras más adelante, dura 30 días si marcas «Mantener la sesión iniciada»; si no, hasta que cierras el navegador o la app. Cerrar sesión la borra.",
          ),
          item(
            "Protección contra abusos",
            "Un hash con clave (HMAC) de tu dirección IP, nunca la IP en sí, con la hora y el tipo de petición: desafío de acceso, creación de cuenta, código por correo, acceso con correo, envío al pool de investigación. En los códigos por correo y el acceso con correo guardamos también el hash con clave del correo.",
            "Para frenar abusos automáticos, como scripts que llenan la base de datos, envían correo masivo o intentan adivinar códigos.",
            "Nuestro interés legítimo en mantener Ciclo seguro y disponible (artículo 6.1.f del RGPD).",
            "Normalmente alrededor de un día: los registros más antiguos se borran en la siguiente limpieza automática.",
          ),
          item(
            "Recuento de actividad diaria",
            "Por cada día (en UTC) en que una cuenta inicia sesión, una fila con el número interno de la cuenta y la fecha. Nada más: ni hora, ni lugar, ni dispositivo.",
            "Para contar cuántas personas usan Ciclo cada día, y así mantener el servicio y planificar su capacidad. Solo miramos totales.",
            "Nuestro interés legítimo en mantener y planificar el servicio (artículo 6.1.f del RGPD). Puedes oponerte; mira «Tus derechos».",
            "Hasta que borres tu cuenta.",
          ),
          item(
            "Datos técnicos en nuestro proveedor de alojamiento",
            "Cuando tu dispositivo se conecta, nuestro proveedor de alojamiento, Vercel, recibe tu dirección IP y los datos habituales de la petición (hora, página o dirección pedida, tipo de navegador) para responder, y guarda registros breves. Ciclo nunca escribe en los registros el contenido del diario, direcciones de correo, frases ni contraseñas.",
            "Para servir la web y las peticiones de la app al servidor, y mantenerlas seguras.",
            "Nuestro interés legítimo en ofrecer un servicio seguro (artículo 6.1.f del RGPD).",
            "Un periodo breve que fija Vercel.",
          ),
          item(
            "Pool de investigación (opcional, desactivado por defecto)",
            "Solo si lo activas en Ajustes: las duraciones de tus ciclos completos, en días enteros (por ejemplo 28 o 30). Ni fechas, ni síntomas, ni notas, ni correo, ni la clave de tu cuenta. Ciclo las envía como mucho una vez al mes, con un identificador aleatorio guardado dentro de tu diario cifrado para que cada envío sustituya al anterior. El servidor guarda un hash de ese identificador, las duraciones y la hora del envío. Nada en el pool registra tu cuenta, así que no podemos saber qué fila es la tuya.",
            "Para reunir un conjunto abierto de duraciones de ciclo que más adelante pueda ayudar a mejorar el modelo de pronóstico de código abierto. Hoy el modelo publicado no lo usa.",
            "Tu consentimiento explícito (artículos 6.1.a y 9.2.a del RGPD), que das con las dos casillas de Ajustes. Desactívalo cuando quieras para que no se envíe nada más.",
            "Las filas ya enviadas se quedan en el pool; no se ha fijado una fecha de fin. Como no se pueden vincular a tu cuenta, no podemos encontrarlas ni borrarlas cuando borras la cuenta o nos lo pides. Ajustes lo avisa antes de que aceptes.",
          ),
          ...(FRIENDS_AVAILABLE
            ? [
                item(
                  "Amigas (opcional, desactivado por defecto)",
                  "Solo si activas Amigas y añades amigas con una invitación. Tu lista de amigas (los nombres y claves de tus amigas, tus invitaciones pendientes, el nombre que ven tus amigas, tu nota y lo que eliges compartir) se cifra en tu dispositivo y se guarda como un único bloque vinculado a tu cuenta. Para cada amiga, tu dispositivo guarda además un mensaje para ella: tu nombre, tu fase actual y las fechas estimadas de tu ciclo actual (su inicio, el próximo inicio esperado y la duración esperada del periodo), si mostrar tu día del ciclo y tu periodo esperado, y tu nota. Se cifra con una clave que solo pueden calcular vuestros dos teléfonos, a partir del enlace de invitación y de un intercambio de claves entre ellos; esa clave nunca nos llega. Estos mensajes se guardan sin cuenta, todos del mismo tamaño y con una fecha de caducidad redondeada a la semana. Nunca se comparten síntomas, notas del diario, ciclos pasados ni embarazos. No podemos leer nada de esto ni saber quiénes son tus amigas; sí vemos que tu cuenta usa Amigas y cuándo hace peticiones tu dispositivo, y durante alrededor de un día después de escribir un mensaje nuestros registros de protección contra abusos podrían mostrar qué cuenta lo escribió, aunque no quién lo lee.",
                  "Para mostraros a ti y a tus amigas la fase del ciclo de cada una, como pediste.",
                  "Tu consentimiento explícito (artículos 6.1.a y 9.2.a del RGPD), que das con la casilla de la pantalla Amigas. Desactiva Amigas o quita a una amiga cuando quieras.",
                  "Tu lista de amigas: hasta que desactives Amigas o borres tu cuenta. Los mensajes para amigas: hasta que quites a la amiga o desactives Amigas y, si no, caducan como mucho 7 semanas después de que tu dispositivo los escribiera por última vez. Hasta entonces, el dispositivo de tu amiga sigue mostrando lo último que recibió.",
                ),
              ]
            : []),
        ],
      },
      {
        id: "device",
        title: "Datos que se quedan en tu dispositivo",
        blocks: [
          { kind: "p", text: "Estos datos se guardan en tu móvil o tu ordenador. Nunca nos llegan." },
          {
            kind: "list",
            items: [
              "**Sesión iniciada:** justo después de crear una cuenta, Ciclo mantiene tu sesión iniciada en ese dispositivo. Cuando entras más adelante, solo lo hace si marcas «Mantener la sesión iniciada».",
              "**Almacenamiento del navegador (web):** ajustes de pantalla (apariencia, inicio de semana, zona horaria, fases lunares, idioma); el último correo con el que entraste y tu frase cerrada con contraseña, para entrar más rápido, hasta que cierres sesión; y tu frase de 12 palabras, en el almacenamiento de la pestaña hasta que la cierras y, mientras tu sesión siga iniciada, en el almacenamiento local del navegador hasta que cierres sesión.",
              "**App de Android:** la vista web de la app guarda los mismos ajustes de pantalla, el último correo y la frase cerrada con contraseña hasta que cierres sesión. Mientras tu sesión siga iniciada, tu frase de 12 palabras se sella con una clave de Android Keystore, que no se puede sacar del móvil, y un diario en la nube de Ciclo guarda una copia cifrada en el móvil para que puedas leerlo sin conexión; cerrar sesión borra las dos. Si no, la frase solo está en la memoria de la app y no hay copia sin conexión.",
              "**Solo en este dispositivo (Android):** el diario cifrado y su frase, sellada por Android Keystore y, si activas el bloqueo de la app, protegida con tu huella o el bloqueo de pantalla. El diario nunca se nos envía. Si pierdes o restableces el móvil sin una exportación, el diario se pierde.",
              "**Sin copias en la nube:** la app de Android deja todos sus datos fuera de las copias de seguridad de Android.",
              "**Cámara:** Ciclo solo pide la cámara si eliges escanear el código QR de tu frase de 12 palabras. La imagen se lee en tu dispositivo para encontrar el código y nunca se guarda ni se envía.",
              "**Exportaciones:** los archivos JSON y CSV que exportas no van cifrados. Tú decides adónde van; guárdalos bien.",
            ],
          },
        ],
      },
      {
        id: "processors",
        title: "Quién trata datos por nosotras",
        blocks: [
          { kind: "p", text: "Usamos estos proveedores. Solo tratan datos para prestarnos su servicio:" },
          {
            kind: "list",
            items: [
              `**Vercel** (Vercel Inc., Estados Unidos) aloja la web y ejecuta el código de servidor de Ciclo. Ese código funciona en ${where}. La red global de Vercel puede recibir tu conexión en un punto cercano a ti.`,
              `**Neon** (Estados Unidos) aloja la base de datos, en Amazon Web Services, en ${DATABASE_PLACE.es}. Ahí están los datos guardados que se describen arriba.`,
              "**Resend** (Estados Unidos) envía el correo con tu código de 6 cifras. Recibe tu dirección y el mensaje.",
            ],
          },
          {
            kind: "p",
            text: "**Google** distribuye la app de Android a través de Google Play. Para esto Google no es proveedor nuestro: responde de lo que recoge Google Play, según su propia política de privacidad. Ciclo no incluye código de analítica ni de publicidad de Google.",
          },
          {
            kind: "p",
            text: "No vendemos tus datos ni se los damos a nadie más, salvo que la ley nos obligue, por ejemplo con una orden judicial. Incluso entonces no podemos entregar lo que hay dentro de tu diario: no podemos descifrarlo.",
          },
        ],
      },
      {
        id: "transfers",
        title: "Datos fuera de la Unión Europea",
        blocks: [
          allInEea
            ? {
                kind: "p",
                text: `La base de datos está en ${DATABASE_PLACE.es} y el código de servidor funciona en ${where}, ambos dentro de la UE. Vercel, Neon y Resend son empresas con sede en Estados Unidos, y algunos datos, como el envío de correo o la red global de Vercel, pueden tratarse fuera del Espacio Económico Europeo.`,
              }
            : {
                kind: "p",
                text: `La base de datos está en ${DATABASE_PLACE.es}, dentro de la UE. El código de servidor que responde a tus peticiones funciona en ${where}, así que lo que tu dispositivo envía y recibe, incluido tu diario cifrado, pasa por allí. Vercel, Neon y Resend son empresas con sede en Estados Unidos.`,
              },
          {
            kind: "p",
            text: "Cuando hay datos personales que salen del Espacio Económico Europeo, nos apoyamos en las garantías que prevé el RGPD, como las cláusulas contractuales tipo de la Comisión Europea o el Marco de Privacidad de Datos UE-EE. UU. para los proveedores certificados. Tu diario va cifrado todo el camino y ninguno de estos proveedores tiene la clave.",
          },
        ],
      },
      {
        id: "retention",
        title: "Cuánto tiempo guardamos los datos",
        blocks: [
          {
            kind: "list",
            items: [
              "Tu diario, la clave de la cuenta, el acceso con correo y las filas de actividad diaria: hasta que borres tu cuenta.",
              "Un alta con correo que nunca se confirmó (una cuenta con el diario vacío y una entrada pendiente): hasta que se borra a petición. No hay limpieza automática.",
              "Los desafíos de acceso caducan a los 5 minutos; los registros de protección contra abusos se guardan normalmente alrededor de un día. Los dos se borran en la siguiente limpieza automática.",
              "Filas del pool de investigación: mira «Pool de investigación» arriba; no se pueden borrar por cuenta.",
              ...(FRIENDS_AVAILABLE
                ? [
                    "Amigas: tu lista de amigas hasta que desactives Amigas o borres tu cuenta; los mensajes para amigas caducan como mucho 7 semanas después de su última escritura, antes si quitas a la amiga.",
                  ]
                : []),
              "Copias de seguridad: nuestro proveedor de base de datos guarda un historial breve para restaurar, y podemos guardar copias para recuperarnos de fallos. Lo borrado desaparece de ellas cuando caducan o se sustituyen. Las copias guardan tu diario cifrado, tal como está almacenado.",
            ],
          },
        ],
      },
      {
        id: "deletion",
        title: "Borrar tu cuenta",
        blocks: [
          {
            kind: "p",
            text: "Puedes borrar tu cuenta y todos los datos vinculados a ella cuando quieras, sin reinstalar nada: entra en la web o en la app, abre Ajustes y elige **Borrar cuenta y diario**. Tu diario cifrado, la clave de la cuenta, el acceso con correo y las filas de actividad diaria se borran en el acto.",
          },
          ...(FRIENDS_AVAILABLE
            ? [
                {
                  kind: "p" as const,
                  text: "Con Amigas activado, la app primero avisa a tus amigas y borra tu lista de amigas y tus invitaciones. Los mensajes que tu dispositivo dejó para tus amigas no están vinculados a tu cuenta; si no se pueden borrar en ese momento (sin conexión, una versión antigua de la app), nadie puede leerlos y caducan en 7 semanas como mucho.",
                },
              ]
            : []),
          {
            kind: "p",
            text: "Un diario guardado solo en tu móvil Android nunca nos llega: bórralo en los Ajustes de la app, borra los datos de la app o desinstálala.",
          },
          {
            kind: "p",
            text: "Si empezaste a crear una cuenta con tu correo y nunca escribiste el código, esa cuenta no se puede abrir ni borrar desde la app. Pídenos que la borremos (mira «Cómo contactar»).",
          },
          {
            kind: "p",
            text: "Instrucciones paso a paso, también para cuando no puedes entrar: [Borrar tu cuenta](/delete-account).",
          },
        ],
      },
      {
        id: "rights",
        title: "Tus derechos",
        blocks: [
          {
            kind: "p",
            text: "Según el RGPD puedes pedir acceder a tus datos, corregirlos, borrarlos, recibirlos en un formato portable, limitar su uso y oponerte a los usos basados en nuestro interés legítimo. Puedes retirar cualquier consentimiento cuando quieras.",
          },
          {
            kind: "list",
            items: [
              "**Acceso y portabilidad:** Ajustes → Exportar JSON o Exportar CSV te da todo tu diario.",
              "**Rectificación:** edita cualquier día en la app.",
              "**Supresión:** Ajustes → Borrar cuenta y diario.",
              "**Retirar el consentimiento:** borra tu cuenta o desactiva el pool de investigación.",
            ],
          },
          {
            kind: "p",
            text: `Para todo lo demás, ${contact}. No guardamos direcciones de correo y no podemos leer tu diario, así que puede que te pidamos que muestres que la cuenta es tuya. Respondemos en el plazo de un mes.`,
          },
          {
            kind: "p",
            text: "También puedes reclamar ante una autoridad de protección de datos, en particular la del país de la UE donde vives o trabajas. En España es la Agencia Española de Protección de Datos ([aepd.es](https://www.aepd.es)).",
          },
        ],
      },
      {
        id: "security",
        title: "Seguridad",
        blocks: [
          {
            kind: "p",
            text: "Tu diario se cifra en tu dispositivo con AES-256-GCM, con una clave que sale de tu frase de 12 palabras. Para entrar, demuestras con una firma digital que tienes esa frase, así que ni la frase ni tu contraseña nos llegan nunca en claro. Todas las conexiones usan HTTPS. El código es abierto: cualquiera puede comprobar cómo funciona. Ningún sistema es perfectamente seguro: si una brecha pone en riesgo tus datos, te avisaremos a ti y a las autoridades como exige la ley.",
          },
        ],
      },
      {
        id: "children",
        title: "Menores",
        blocks: [
          {
            kind: "p",
            text: "Ciclo no está dirigido a menores. Aprender incluye artículos sobre la pubertad. En la UE, quien no ha cumplido la edad de consentimiento digital de su país (entre 13 y 16 años, según el país) necesita que su madre, padre o tutor lo acepte antes de usar servicios como este. Si eres madre, padre o tutor y descubres que tu hija o hijo creó una cuenta sin ese permiso, podéis borrarla juntos desde Ajustes, o puedes contactarnos.",
          },
        ],
      },
      {
        id: "changes",
        title: "Cambios en esta política",
        blocks: [
          {
            kind: "p",
            text: `Cuando esta política cambie, cambiará también la fecha de arriba. Si un cambio afecta a cómo se usan tus datos, lo diremos en la app o en la web antes de que se aplique. Todas las versiones anteriores son públicas en el [repositorio de código de Ciclo](${POLICY_HISTORY}).`,
          },
        ],
      },
    ],
  };
}
