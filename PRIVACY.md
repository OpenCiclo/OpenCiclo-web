# Privacy

OpenCiclo
Built by Emma Flora Harbison & Luis Rey Sánchez
Copyright © 2026
Apache License 2.0

This page is for people using Ciclo, not only for engineers. It summarizes the privacy policy.

The policy itself is the page `/privacy` in the web app and in the Android app. Its Spanish and English texts are the authoritative ones; the source is [`apps/web/lib/privacy/policy.ts`](apps/web/lib/privacy/policy.ts). If this file and the policy ever disagree, the policy wins, and the difference is a bug to fix. How to delete an account, step by step: `/delete-account`.

## The short version

**Everything in your diary is encrypted on your device before it is stored:** period dates and bleeding, mucus and discharge, symptoms (including urinary and vaginal ones), moods and mental health, sexual activity, pregnancy and ovulation test results, contraceptive pill intake and other medicines, illness, alcohol, exercise, travel, and your notes. The server stores only the encrypted copy and cannot read it. Forecasts, phases and the estimated fertile window are calculated on your device. There are no ads, no analytics, no trackers, and no exception trackers.

Ciclo provides cycle **forecasts**. Forecasts can be wrong. Ciclo is not a medical device, a diagnosis, or a contraceptive method. You can hide forecasts in Settings; your logs and completed-cycle statistics stay on the device.

## Consent

Ciclo asks for consent separately for each of these, and each is optional:

1. **Your diary.** Before a new diary is created (email and password, 12-word phrase, or "Only on this device" on Android), Ciclo shows what it stores and where, and asks you to tick "I agree"; the policy opens over the same screen. Diary data is health data and data about your sex life, so the legal basis is your explicit consent (GDPR articles 6(1)(a) and 9(2)(a)). Without the tick you cannot create a diary. The tick is not recorded anywhere: not in the diary, not on the server. You withdraw consent by deleting your account.
2. **The anonymous research pool.** Off by default. You turn it on in Settings, with two boxes. It sends cycle lengths only (see below). Turning it off stops future uploads.
3. **Friends** (experimental, since 20 November 2026). Off by default. You turn it on with a box on the Friends screen, then invite friends with a one-time link. Turning it off tells your friends and deletes your friend list.

The sign-up step is new. People who created their diary before it existed never saw it and are not asked now; whether to ask them, and whether to keep a record of consent, are open questions for the legal review (docs/play/privacy-checklist.md).

## How a diary gets stored

1. You sign in with email + password, or with a 12-word phrase.
2. Your device derives an encryption key (from the phrase; on the email path the password wraps that phrase).
3. The diary is encrypted with AES-256-GCM. That encrypted blob is what Postgres stores.
4. Forecasts run on your device. Period dates are not sent to a forecast API.

On Android you can also choose **Only on this device**: no account, no server. The diary is encrypted on the phone and never sent to us.

## Identity (email + password, or a 12-word phrase)

Ciclo does not use Clerk or Auth0. You can create an account in two ways. In both cases the diary is encrypted on your device; the host stores ciphertext only.

- **Email and password (the simple path).** The app still generates a 12-word secret in the background. Your password wraps that secret. Email cannot decrypt the diary by itself. Your browser can save the password like any other site.
- **Super private mode (12 words, no email).** You keep the phrase. We cannot show it again if you lose it. You can save it in the browser's password manager.

The server knows a public key derived from the secret (like an address), not the phrase or your password. Login is a signature of a short-lived challenge, proving you still hold the key. **Ciclo cannot reset your password or phrase.** That is intentional, so nobody, including us, can read your diary on the server.

On the email path, **creating** the account sends a 6-digit code to that inbox once. That proves the address is yours. It does not reset the password or open the diary. Signing in on a new device uses the same email and password. If the device does not have your wrapped key yet, the app downloads the **encrypted** kit automatically (rate-limited). Your password unwraps it locally.

## What the server stores

In a Neon Postgres database in Frankfurt, Germany (or your own Postgres if you self-host):

| What | Why | Kept |
| --- | --- | --- |
| **Encrypted diary**: AES-256-GCM ciphertext, a version number, when it last changed. Everything you log stays inside it (see the short version), with the diary settings. Postgres has no health columns. | Keep your diary and open it on your devices | Until you delete the account |
| **Account key**: the public key and its hash, when the account was created. Sign-in challenges (expire after 5 minutes, deleted at a later cleanup). | Know which diary is yours; sign in without a password reaching us | Until you delete the account |
| **Email sign-in** (email accounts only): an HMAC of the email (never the address) and your phrase wrapped with your password. Until you confirm the code, a pending entry with the email HMAC, the wrapped phrase and the hashed code. | Sign in on any device; check the address is yours | Until you delete the account. A sign-up whose code was never entered leaves an account (empty diary) and its pending entry that the app cannot delete; they go only on request |
| **Sign-in cookie** `ciclo_session`: a signed reference to your account key. No other cookies. | Keep you signed in | 30 days right after you create an account, and when you sign in with "Keep me signed in"; otherwise until the browser or app closes. Sign-out deletes it |
| **Abuse protection**: an HMAC of your IP address (never the IP), with time and kind of request; for email codes and email sign-in also the email HMAC | Stop scripts from flooding the service | Usually about a day: deleted at the next automatic cleanup |
| **Daily activity**: one row per account per UTC day it signs in (account id + date). The console shows counts only. | Count daily users, plan capacity | Until you delete the account |
| **Research pool** (only if you opt in): whole-number cycle lengths, a hash of a random pool key that lives inside your encrypted diary, and the upload time. No dates, symptoms, notes, email, or account key. No link to your account. | An open, combined set of cycle lengths for the forecast model, later | Stays after you delete the account; we cannot find "your" rows |
| **Friends** (experimental; only if you turn it on): your friend list as one encrypted blob linked to your account; for each friend, an encrypted message with your name, your current phase inputs (current cycle start, expected next start, bleed length), your display choices and your note. Messages are sealed with a key only your two phones can work out (from the invite link's fragment and a key exchange between the phones; it never reaches us), carry no account, all have the same size, and expire. For about a day after a message is written, the abuse-protection records (a keyed hash of the account, with the time) could show which account wrote it, never who reads it. No symptoms, diary notes or past cycles. | Let you and the friends you invite see each other's cycle phase | Friend list: until you turn Friends off or delete the account. Messages: until you remove the friend or turn Friends off, at most about 7 weeks after the last write |

The plaintext email reaches the server when you create the account, sign in on a device that does not have your wrapped phrase yet, change your password, or add an email sign-in. It is used in memory (to send the code or find the account) and never stored in Postgres. Our host, Vercel, also sees your IP address and ordinary request details to answer requests, and keeps short logs. Ciclo never logs diary contents, emails, phrases, or passwords.

## What stays on your device

- **Staying signed in:** right after you create an account, Ciclo keeps you signed in on that device (there is no box for it at sign-up). When you sign in later, only with "Keep me signed in".
- **Browser storage (web):** display settings; the last email you signed in with and your password-wrapped phrase, until you sign out; and your 12-word phrase, in the tab's session storage until you close the tab and, while you stay signed in, in local storage until you sign out.
- **Android:** the app's WebView storage keeps the same display settings, last email and password-wrapped phrase until you sign out. While you stay signed in, the phrase is sealed by Android Keystore and an encrypted offline copy of a hosted diary lets you read it without a connection; sign-out deletes both. Otherwise the phrase stays in memory and there is no offline copy. "Only on this device" keeps the encrypted diary and its Keystore-sealed phrase in the app's private storage. Android backups skip all of this.
- **Camera:** used only to scan the QR code of your phrase. Frames are read on the device and never stored or sent.
- **Exports:** JSON and CSV files you export are not encrypted.

## Service providers

- **Vercel** (United States) hosts the site and runs the server code. The region is set in `apps/web/vercel.json`, and the policy names it from there.
- **Neon** (United States) hosts the database on AWS in Frankfurt, Germany.
- **Resend** (United States) sends the 6-digit code email.

Google distributes the Android app through Google Play. It is not one of Ciclo's processors: Google is responsible for what Google Play collects, under its own policy. Ciclo includes no Google analytics or advertising code.

When data leaves the European Economic Area, the policy relies on the safeguards the GDPR allows (standard contractual clauses, or the EU–US Data Privacy Framework for certified providers). The diary stays encrypted the whole way.

## Deletion and export

You can export JSON or CSV **on your device** after decrypting, import that backup into the same or a new account (this restores diary data, not the old cryptographic identity), and delete your account at any time: Settings → **Delete account and diary**. That deletes your encrypted diary, account key, email sign-in, and daily activity rows at once. `/delete-account` has the steps for the web, the Android app, a diary kept only on the phone, and lost credentials.

Research rows that were already uploaded cannot be deleted by us on request, because nothing links them to your account. That limitation is shown before you contribute.

If you started an email sign-up and never entered the code, the account it created (with an empty diary) cannot be opened or deleted from the app. Ask for it to be deleted; `/delete-account` explains how.

## Your rights

Under the GDPR you can access, correct, delete, and export your data, restrict or object to processing based on legitimate interest, and withdraw consent. Most of this is in the app (Export, edit any day, Delete account, turn off the pool). For anything else, see "How to reach us" in the policy. You can also complain to a data protection authority, such as the AEPD in Spain.

## The Python library

The `openciclo` package still runs offline. It receives the dates you pass in and returns a forecast in memory. You do not need the web app to forecast.

## What we will not do

- Sell your health data
- Require a cloud account for the Python library
- Quietly add advertising or third-party trackers
- Use email as a backdoor to decrypt your diary
- Treat a day you did not open the app as proof that your period did not happen
- Mix Utah/Creighton data into the published prior in `released_model.json`

Engineers: see [docs/privacy.md](docs/privacy.md), [docs/threat-model.md](docs/threat-model.md), and, for the Google Play launch, [docs/play/privacy-checklist.md](docs/play/privacy-checklist.md).
