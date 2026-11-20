# Privacy checklist for the Google Play launch

Status: **needs legal review.** This is an engineering checklist, not legal advice. The privacy policy at `/privacy` (source: `apps/web/lib/privacy/policy.ts`, Spanish and English authoritative) also **needs legal review** before the launch, and so does the store listing in [listing.md](listing.md).

Written from the code on 2026-11-19. When what the app stores, sends or keeps changes, update this file, the policy and [PRIVACY.md](../../PRIVACY.md) in the same commit. `apps/web/lib/privacy/policy.test.ts` fails when a database table, or a column of a table holding personal data, is added until someone has checked it against the policy.

## For the legal review

Questions the engineering side cannot answer. Each needs a lawyer's view before the launch.

1. **The policy and the listing texts** as a whole (`/privacy`, `/delete-account`, [listing.md](listing.md)).
2. **Proof of consent (GDPR art. 7(1)).** The sign-up asks for an explicit yes with a box, but the tick is not recorded anywhere (not in the diary, not on the server). Is that enough, or must consent be recorded (and how, without linking health data to an identity)?
3. **Existing accounts.** Everyone who created a diary before the sign-up step existed never ticked the box and is not asked now. Do they need to be asked (in the app, at their next sign-in)?
4. **Account metadata as health data.** The email HMAC, the daily activity rows, the abuse-protection records and the very existence of an account in a period tracker: does any of it count as health data that needs an art. 9 condition of its own, beyond the legal bases in the data map?
5. **Transfer mechanisms.** None is verified (see the processors table): Data Privacy Framework certification, standard contractual clauses, transfer impact assessment.
6. **Data protection officer** (art. 37(1)(c)) and a **DPIA** (art. 35; outline below).
7. **Unconfirmed email sign-ups.** They leave an account with an empty encrypted diary, an activity row and a pending entry (email HMAC, password-wrapped phrase) that the person cannot delete from the app; the policy says they are deleted on request. Is a retention limit needed (an automatic cleanup is an owner decision)?
8. **Staying signed in.** Creating an account always keeps the person signed in on that device (phrase in browser storage or Android Keystore, 30-day cookie, Android offline copy), with no box at sign-up, while signing in later asks. The policy describes this; whether sign-up should offer the choice is a product decision.

## Values the owner still has to provide

Each one is set in one place and fills every page that needs it. While a value is missing, the pages leave the sentence out; nothing shows a placeholder.

| Value | Set it in | Fills | Decision |
| --- | --- | --- | --- |
| Controller: legal name and postal address | `CONTROLLER` in `apps/web/lib/marketing/copy.ts` | `/privacy`, "Who is responsible" (now: "Ciclo is made by the OpenCiclo project") | Personal or organisation Play account |
| Privacy email | `PRIVACY_EMAIL` in `apps/web/lib/marketing/copy.ts` | `/privacy` "How to reach us" and "Your rights" (now: the contact page); `/delete-account` request for people who lost their credentials (now: hidden) | P4 |
| Public developer email | Play Console store settings | Store listing | P4 |
| Contact page | `apps/web/app/(marketing)/contact/` and the `contact` copy in `lib/marketing/copy.ts` + locales | Still sends people to public GitHub issues; not wired to `PRIVACY_EMAIL` | P4 |
| Research pool retention | `apps/web/lib/privacy/policy.ts`, "Research pool" item | Now: "no end date has been set" | P8 (or remove the item if the pool is hidden) |
| Backup retention | `apps/web/lib/privacy/policy.ts`, "How long we keep data" | Now: "a short restore history ... as they expire or are replaced", no number | Backup plan |
| Children section | `apps/web/lib/privacy/policy.ts`, "Children" | Now: not directed at children; the EU age of digital consent | P12 |
| Supervisory authority | `apps/web/lib/privacy/policy.ts`, "Your rights" | Now names the AEPD (Spain) as an example | Where the controller is established |
| Data protection officer | Not in the policy | GDPR art. 37(1)(c): large-scale special-category data as a core activity may require one | Legal advice |
| US health data policy | Not written | Washington's My Health My Data Act needs a separate policy linked from the home page | P11 |
| Staying signed in at sign-up | `apps/web/app/onboarding/page.tsx` (`persist: true` for every way to sign up) | The policy says sign-up always keeps people signed in | Product: add a "Keep me signed in" box to sign-up, as on `/unlock`? |
| Cleanup of unconfirmed email sign-ups | Server (no code yet) | The policy says they stay until deleted on request | Owner |

The function region needs no value: the policy reads it from `apps/web/vercel.json` (`apps/web/lib/privacy/hosting.ts`). A region without a place name there fails `hosting.test.ts`.

## Data map

Hosted app (Neon Postgres in Frankfurt, reached through Vercel functions):

| Item | Where stored | Encrypted? | Purpose | Legal basis | Retention |
| --- | --- | --- | --- | --- | --- |
| Diary: period dates, flow, cervical mucus, symptoms, moods, sexual activity, libido, notes, diary settings (language, forecasts on/off, favourite and custom symptoms, pool choice and pool key) | `accounts.ciphertext`, `nonce`; also `schema_version`, `vault_version`, `created_at`, `updated_at` | Yes. AES-256-GCM on the device; the server has no key | Store and sync the diary | Explicit consent, art. 6(1)(a) and 9(2)(a): sign-up checkbox | Until the account is deleted |
| Public key and its hash | `accounts.pubkey`, `accounts.pubkey_hash` | No (a public key) | Identify the account, verify sign-in signatures | Contract, art. 6(1)(b) | Until the account is deleted |
| Sign-in challenges | `auth_challenges`: key hash, nonce, expiry | No | One-time sign-in challenge | Art. 6(1)(b) | Expire after 5 minutes; deleted at a later cleanup (expired rows of the same key at the next challenge, all expired rows on about 1 rate-limited request in 50). Not deleted with the account |
| Email sign-in | `recovery_mailboxes`: HMAC of the email, password-wrapped phrase, `verified_at` | Email: keyed HMAC (`EMAIL_LOOKUP_SECRET`), never plaintext. Phrase: PBKDF2-SHA-256 + AES-GCM under the user's password | Sign in with email and password | Art. 6(1)(b) | Until the account is deleted (cascade) |
| Pending email code | `mailbox_pending`: email HMAC, wrapped phrase, hashed code, expiry, attempts | As above; the code is hashed | Prove the inbox is the user's | Art. 6(1)(b) | Until confirmed, replaced by a new request, or the account is deleted. The code is valid 15 minutes. If the code is never entered, the row and its account (empty encrypted diary, one activity row) stay, and the person cannot delete them from the app: deleted only on request |
| Email address in clear | Request memory only, on sign-up, sign-in on a device without the wrapped phrase (`/api/recovery/fetch`), password change and adding an email sign-in; sent to Resend when a code is mailed | TLS in transit | Send the 6-digit code; find the account | Art. 6(1)(b) | Not stored by Ciclo. Resend keeps its own logs (check the period) |
| Session cookie `ciclo_session` | Browser, or the Android app's native cookie jar | Signed (HMAC), not encrypted: key hash + expiry | Keep the person signed in | Art. 6(1)(b); strictly necessary under ePrivacy | 30 days after any sign-up (always `persist: true`) and after a sign-in with "Keep me signed in"; otherwise the browser or app session |
| Abuse limits | `rate_limit_hits`: bucket, HMAC of IP, time | Keyed HMAC of the IP | Stop scripted abuse | Legitimate interest, art. 6(1)(f) | Usually about a day: rows older than a day are deleted at the next cleanup, which runs on about 1 rate-limited request in 50. Not deleted with the account |
| Email route attempts | `recovery_attempts`: email HMAC, IP HMAC, time | Keyed HMACs | Limit email sign-in and code requests | Art. 6(1)(f) | Same cleanup as above. Not deleted with the account |
| Daily activity | `account_activity_days`: account id, UTC date | No | Count daily active accounts (console shows totals) | Art. 6(1)(f) | Until the account is deleted (cascade) |
| Research pool (opt-in, off by default) | `research_contributions`: random `pool_id`, SHA-256 of a contributor key kept inside the encrypted diary, cycle lengths, created/updated time | Key hashed; lengths in clear | Open dataset for the forecast model (not used yet) | Explicit consent, art. 6(1)(a) and 9(2)(a): two boxes in Settings | No end date. Not linked to the account, so not deleted with it. **Today nothing is uploaded**: the contributor key is only created inside the upload that requires it (P8), so the table is empty. `DELETE /api/research/contribute` (by contributor key) exists but no client calls it |
| Request logs | Vercel | n/a | Deliver and secure requests | Art. 6(1)(f) | Vercel's log retention for the plan. Not deleted with the account |
| Friend list (Friends, built but off: `FRIENDS_AVAILABLE`) | `friend_books`: account id, sealed blob (friends' names and pair keys, pending invites, own name, note, sharing choices), nonce, version, `updated_at` | Yes. AES-256-GCM with a key from the phrase (`friendsKey`); the server has no key | Let a person share their cycle phase with friends they invite | Explicit consent, art. 6(1)(a) and 9(2)(a): box on the Friends screen | Until Friends is turned off or the account is deleted (cascade) |
| Messages between friends (Friends, off as above) | `friend_boxes`: hash of the box id, hash of the write token, sealed message, nonce, `expires_at` (rounded up to a week). No account column, no write time; every ciphertext the same length | Yes. AES-256-GCM with a key only the two friends hold (from a secret in the invite link's fragment); the server has no key | Carry each person's status (name, phase inputs: current cycle start, expected next start, bleed length; display choices; note) to a friend, and the one-time invite and its answer | Explicit consent, as above | Invites 7 days, used invites 30 days, statuses about 45 days after the last write (each rounded up to a week), sooner when the friend is removed or Friends is turned off. Not linked to the account, so not deleted by the account cascade: the app deletes what it can first |
| Learn articles | `learn_articles` | n/a | Operator-written content, not personal data | n/a | n/a |
| `recovery_tokens` | Legacy table; no code writes it | n/a | None | n/a | Removal tracked separately |

On the device only (Ciclo never receives these):

| Item | Where | Protection | Notes |
| --- | --- | --- | --- |
| Display settings, time zone, language | Browser `localStorage` | None needed | The language is also inside the encrypted diary |
| Last email used, password-wrapped kits | Browser `localStorage`, and the Android app's WebView storage (`ciclo.lastEmail`, `ciclo.kits`) | Kits are wrapped with the password | Speeds up sign-in. Kept until sign-out (another change makes sign-out clear them) |
| 12-word phrase (web) | `sessionStorage` until the tab closes, always; also `localStorage` while signed in (always after sign-up; after a sign-in only with "Keep me signed in") | Browser storage only | Removed on sign-out |
| 12-word phrase (Android) | `files/hosted-phrase.bin` while signed in (always after sign-up; after a sign-in only with "Keep me signed in"); otherwise memory only | Sealed by an Android Keystore key | Never in WebView storage |
| Offline copy of a hosted diary (Android) | `files/hosted-diary-copy.json`, only while signed in as above | Same AES-GCM blob as the server's | Deleted on sign-out, account deletion, and any sign-in without staying signed in |
| "Only on this device" diary and phrase (Android) | `files/device-diary.json`, `files/device-phrase.bin` | Diary AES-GCM; phrase sealed by Keystore, optionally behind biometrics or screen lock | Never sent; only the research pool, if turned on, uploads cycle lengths |
| Camera frames (phrase QR scanner) | Memory | Decoded on the device | Never stored or sent |
| Exports (JSON, CSV) | Where the person saves them | Not encrypted | The app warns about this |

Android app data is excluded from Android backups (`allowBackup="false"`, `data_extraction_rules.xml`).

## Processors and their contracts (GDPR art. 28)

The status of every contract is **unknown**: the owner must check each one and keep a copy.

| Provider | Role | Personal data | Where | Data processing agreement | Transfer mechanism |
| --- | --- | --- | --- | --- | --- |
| Vercel Inc. (US) | Hosting, server functions, request logs | Every request: IP address, the encrypted diary, HMACs, cookie | Functions: no `regions` in `apps/web/vercel.json` today, so Vercel's default `iad1` (Washington, D.C.). Moving them to `fra1` (Frankfurt) is in progress in another change. Edge network: global | Unknown. Check that Vercel's DPA covers the current plan | Unknown. Check the EU–US Data Privacy Framework list, or the SCCs in the DPA |
| Neon (US) | Postgres database | All stored data in the map above | AWS eu-central-1 (Frankfurt) | Unknown | Unknown (US company; remote access and support) |
| Resend (US) | Sends the 6-digit code email | Email address, message | Unknown: check the sending region of the domain in Resend | Unknown | Unknown |
| Google (Play) | Distributes the app | What Google Play collects on its own | n/a | Google acts as an independent controller under its own terms | n/a |

Also check: the legal entity name of each provider for the record of processing, and sub-processor lists.

## International transfers

- Today the server functions run in the United States (`iad1`), so the data each request carries, including the encrypted diary, the HMACs and the IP address, is processed there. The database is in the EU.
- Once the functions run in `fra1`, processing happens in the EU. Transfers that remain: US-based providers (support and remote access), Vercel's global edge network, and Resend if it sends from outside the EEA.
- For each provider, record the mechanism (adequacy through the Data Privacy Framework, or standard contractual clauses) and, if relying on clauses, a transfer impact assessment.
- The policy's transfer paragraph adapts to the region in `vercel.json`; the processor list and the safeguards sentence do not, so revisit them if a provider changes.

## Record of processing activities (art. 30)

Start from the data map above. Add the controller's identity and contact, the DPO if one is appointed, the categories of people (users of the web and Android apps), and a general description of the security measures (below).

## Data protection impact assessment (art. 35): outline

A DPIA is very likely required: large-scale processing of health data and data about sex life with a new technology. Outline:

1. **Description.** Purposes; data (map above); flows: device → Vercel functions → Neon, and email → Resend; retention; recipients and processors; the Android app and its on-device mode.
2. **Necessity and proportionality.** Data minimization by design: end-to-end encryption, HMAC instead of email addresses, no health columns, forecasts on the device, an on-device mode with no server, no analytics or ad SDKs, short-lived abuse records. Legal bases per item. Transparency: the policy and the sign-up disclosure. Rights: export, edit, delete in the app; `/delete-account`.
3. **Risks to people**, each with likelihood, severity and measures:
   - Disclosure of diary contents after a server or provider breach. Measure: the server holds only ciphertext and no keys.
   - What metadata reveals: that an account exists, when it signs in (activity days), when the diary changes, its size. Measures: minimal columns; consider a retention limit for activity days.
   - Linking an email address to an account if the HMAC secret leaks. Measures: secret management and rotation plan.
   - Losing access means losing the diary (no password reset, by design). Measures: clear warnings, export.
   - Shared or lost devices: a phrase kept on a device, unencrypted exports. Measures: Keystore on Android, app lock, sign-out, export warnings.
   - Re-identification from research pool lengths. Measures: lengths only, no account link, opt-in.
   - Requests from authorities for data about a person's cycle or sexual activity. Measures: the host cannot decrypt; keep metadata minimal; a documented response process.
   - Children using the app (see P12).
   - Processors and transfers (above).
4. **Measures and residual risk.** List the accepted residual risks and who signed off. If a high risk remains, consult the supervisory authority before launch (art. 36).
5. **Review.** Repeat when the processing changes (new data, new provider, the research pool used for training, a new region).

## Security measures (summary for the record and the DPIA)

- Diary encrypted on the device with AES-256-GCM; keys derived from a BIP39 phrase with HKDF; sign-in by Ed25519 signature over a one-time challenge.
- Email path: the phrase is wrapped with the password (PBKDF2-SHA-256, AES-GCM); the server never unwraps it and stores only an HMAC of the email.
- No plaintext health data in the database; no diary contents, emails, phrases or passwords in logs.
- HTTPS everywhere; httpOnly SameSite=Lax session cookie; security headers (CSP, frame denial).
- Android: phrase sealed by Keystore; optional app lock (fingerprint or screen lock), which also blocks screenshots; app data out of backups.
- Open source, so the measures can be checked.

## Play Console items that depend on this checklist

- Privacy policy URL: `https://www.openciclo.com/privacy?lang=en` (Spanish listing: `?lang=es`). The `lang` parameter only picks the language shown; it is never saved.
- Data safety form: fill it from the data map. Check Play's current definitions of "collected" and "shared" (including how it treats data that is encrypted end to end) before answering; if the research pool stays (P8), declare it.
- Account deletion URL: `https://www.openciclo.com/delete-account?lang=en` (Spanish: `?lang=es`).
- Health apps declaration and the target audience (P12).
