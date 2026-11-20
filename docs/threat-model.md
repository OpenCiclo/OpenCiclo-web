# Threat model

OpenCiclo
Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
Apache License 2.0

This is a living document for the Python engine and the V1 web app. It is not a pentest report.

## Assets

- Period start dates (and optional future daily health observations)
- Forecasts (they reveal modeled cycle timing)
- BIP39 mnemonic, HKDF-derived AES key, Ed25519 signing seed
- Passphrase used to wrap the optional recovery kit (the user's account password on the email path)
- Wrapped kit cached in `localStorage` on a given browser
- Optional persisted mnemonic in `localStorage` when “keep signed in” is on
- Android on-device mode: `device-diary.json` (sealed blob) and `device-phrase.bin` (phrase sealed by a Keystore key) in the app's private storage, plus the Keystore keys
- Consent flags (recovery email / research pool)

## Trust boundaries

```text
Browser memory     — plaintext diary, keys, forecast
Browser storage    — wrapped kit, optional persisted mnemonic, “already contributed”
Android app files  — sealed phrases, on-device diary, offline copy of a hosted diary (all ciphertext)
User network       — ciphertext, signatures, email lookup fetch, optional length list
OpenCiclo host / Neon   — ciphertext, pubkey, HMAC(email), anonymous pool rows
```

## Python engine (library)

| Threat | Risk | Mitigation |
| --- | --- | --- |
| Caller logs `Forecast` or dates | Health in logs | Policy: library does not log; callers must not |
| Benchmark CSV in git | Simulated dates only | Synthetic data; never commit restricted CSVs |
| Dependency compromise | Supply chain | Pin via environment; few dependencies |
| Contributor adds telemetry | Silent collection | Review; no analytics SDKs |
| Tests using real personal data | Accidental commit | Synthetic fixtures only |

Process memory on a shared computer is still in scope for the user (shoulder surfing, disk snapshots of notebooks).

## V1 web app

| Threat | Risk | Mitigation |
| --- | --- | --- |
| Honest-but-curious host | Reads diary | AES-256-GCM in the browser; host stores ciphertext only |
| Email-as-reset | Host decrypts diary | Password-wrapped kit; email fetch returns ciphertext only; unwrap is client-side |
| Kit fetch by email | Offline password guessing | PBKDF2 600k; rate limit `/api/recovery/fetch`; generic errors |
| Account enumeration by email | Learn that someone uses a cycle tracker | `/api/recovery/fetch` answers every email with 200 and a kit. Unknown or unverified emails get a decoy: a real-looking wrapped BIP39 phrase, deterministic per email, that no password opens. `/api/recovery/register` gives a taken email the same rate limits, status, minimum response time and database writes as a new one (a pending confirmation whose code is never sent), so a later `/api/recovery/confirm` cannot tell them apart either; it sends the code after responding. Kit fetches are limited per IP only, the same for every email: a per-email limit would let anyone who knows an address lock its owner out of signing in on a new device. Code mails are limited per address, account, IP and host-wide. |
| Guessing the 6-digit email code | Verify an address that is not yours (and hold it), or reach the console through an operator address not yet registered | Five attempts per code, each claimed in one atomic `UPDATE` before the comparison, so parallel requests cannot share an attempt; codes expire after 15 minutes; per-IP and per-account limits on confirmation; code mails limited per address (3 an hour, 6 a day), so one address gets at most 30 guesses a day |
| Scripted abuse of public endpoints | Fill the database, spam code mails, poison the research pool | Atomic limits in `rate_limit_hits` (a transaction-level advisory lock per key), keyed by HMAC(IP) (an IPv6 address counts as its /64, so one client cannot rotate addresses), a keyed hash of the account or address, or a global key: auth challenges and signature checks (before any Ed25519 work), account creation (per day and per burst), pool uploads, kit fetches, code mails (per IP, account, address, and a host-wide spend cap of 1000 an hour that counts taken and new addresses alike; refusals by the address and host caps are logged as `RATE_LIMIT_REFUSED <bucket>` for alerting), code confirmations, and vault saves per account. Payload caps on the vault (512 KB of ciphertext), the initial vault, nonces, signatures, and recovery kits; a body without `Content-Type: application/json` is refused, and a body over its cap is cut off while it is read, with or without Content-Length. Stale bookkeeping (old hits and attempts, expired challenges and pending confirmations) is pruned automatically. An optional Vercel WAF rule can add an edge limit on top. |
| Server logs | Ciphertext, kits or HMACs copied into logs by a failing query | API errors are logged by error name and code only (`describeError`), never the message, which for a failed query holds its parameters; mail failures log the provider's error name, never the address or the code |
| Password manager | Phrase or password stored by the browser | Same as any site; user can decline; never sent to OpenCiclo as a login API |
| Wrapped kit in localStorage | Offline brute-force of the password | PBKDF2 600k; kit is still ciphertext |
| XSS | Script reads keys in memory, or the phrase kept by “Keep me signed in” | No third-party scripts, no analytics, no raw HTML from users (React escapes text; the Help renderer allows no HTML). The CSP allows scripts only from this origin (`script-src 'self' 'unsafe-inline'`), no `eval` in production, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, and `connect-src 'self'` (the Android app adds its API host), so injected code cannot load scripts from elsewhere or send data to another host with `fetch`. It is not a strict CSP: `'unsafe-inline'` stays because the App Router inlines its page data as scripts and the layouts inline two boot scripts. Nonces would make every page render per request and cannot work in the static Android export; hashes do not cover the per-page inline data. Residual risk: an injection point, if one appeared, could run inline script. Reviewed 2026-11-19 |
| Persist unlock (`localStorage` mnemonic, web) | Device access or XSS can open the diary after the tab is closed | Off by unchecking “Keep me signed in”; sessionStorage only then; cleared on sign-out; documented in Help. The Android app uses Keystore instead (below) |
| Research join | Re-identify contributors | No `account_id` / pubkey on pool rows; no mapping table |
| Friends: curious or breached host (experimental, on since 2026-11-20) | Reads what friends share, or learns who is friends with whom | Statuses, names and notes are sealed on the device with keys only the two friends hold (from S, a secret in the invite link's fragment that never reaches the host, and an ECDH exchange between the two devices). `friend_boxes` has no account column and no write time, every box has the same length, and `expires_at` is rounded up to a week; boxes are addressed and authorized by SHA-256 of an id and a token. The friend list is one sealed blob per account (`friend_books`). Residual risk: the host sees that an account uses Friends and when it makes requests, so someone watching live traffic, or holding a copy of the database taken within about a day of a write (see "linking boxes to accounts"), could tell which account writes which box, never who reads it. |
| Friends: invite link | Someone other than the intended friend uses the link, or someone who sees it later reads or forges the pair's statuses | The pair key mixes an ECDH P-256 exchange into the link secret: the inviter's key pair is made for the invite (private half only in its sealed book), the joiner's when accepting (private half used once). The link opens the invite and handshake boxes, which hold only public keys, so reading with the link (with any account, or with a copy of the database) never yields the pair key. The link also carries a fingerprint of the inviter's public key, and the invite box's write token comes from the inviter's private key, so a link holder cannot swap in their own key either. Whoever opens the link first gets in; a second person is refused (the handshake box's token comes from the pair key, and no other token ever takes over an address, expired or not). The joiner refuses an invite 7 days old or more; the inviter completes an answer written within those 7 days whenever it sees it, and tells a later answer that it ended. The inviter sees the joiner's name and can remove them. Residual risk: someone who gets the link before the friend opens it can be the one who accepts |
| Friends: a friend's broken or hostile app | Malformed messages, messages that pretend to be someone else's, or one friend making you drop another | Every message is parsed field by field and dropped when anything is off (`lib/friends/payload.ts`). Each direction has its own seal key and write token, so a friend cannot write in your name. A friend's id is pinned when the friendship starts; a status naming another id is ignored. Entries are never merged automatically on an id the other side declares (two cards for one person stay until the person removes one), so nobody can end a friendship by claiming a friend's id |
| Friends: devices with an old copy of the friend book | A phone left open writes "sharing" over a removal, a pause, or Friends turned off on another phone | Removing a friend and turning Friends off change the book first (turning off reads the host's book, so friends added elsewhere hear too); every refresh reads the host's book; after every publish the device reads the book again and writes "ended" again to a friend removed meanwhile (`publishStatus`); an ended friend is kept as ended and never written to |
| Friends: linking boxes to accounts | A copy of the database shows who wrote which box | Boxes have no account column or write time. Residual risk: a box write is preceded by per-account abuse-protection rows (`rate_limit_hits`, kept about a day), so a database copy taken within about a day of a write could link that box to the account that wrote it (by row order or transaction ids). It never shows who reads a box, so the friend graph stays hidden; the privacy policy says so |
| Friends: storage abuse | Free accounts fill the database with boxes nobody can attribute | Fixed-size ciphertext; per-account hourly and daily write limits; new addresses counted separately per account (60 a day) and host-wide (2000 a day, alerting); expired boxes pruned. Residual risk: a box's own writer can keep it alive by rewriting it, so the host-wide creation alert is the backstop |
| Recovery mailbox | Email ↔ account link | Optional; HMAC lookup; documented as PII |
| Challenge replay | Stolen login | Short-lived nonces, one-use |
| Copied session cookie | Overwrite the vault or delete the account for up to 30 days (it cannot decrypt the diary) | httpOnly, SameSite=Lax, Secure cookie; MAC compared in constant time; logout checks `Origin`. Sessions are stateless, so signing out cannot revoke a copied cookie: see “Hardening backlog” |
| Session cookie of another account (a late sign-in, another tab) | One account's encrypted diary saved over another account's vault, the wrong account deleted, or a recovery email attached to the wrong account | The cookie is one slot, filled by whichever sign-in lands last: in the Android app a sign-in that timed out still lands later (native HTTP ignores the cancel), two web tabs on two accounts share it, and a late sign-in can leave its cookie for a moment after a sign-out. Every request that changes an account (`PUT /api/vault`, `DELETE /api/account`, `POST /api/recovery/register` and `/confirm`) names the account the app means in `x-ciclo-account` (the public-key hash of the wallet whose diary is open). When it is not the session's account the host answers 409 `account-mismatch` before the account lookup, any rate limit, write, cookie change or mail; the answer is the same whatever the email. The app then signs in once with the wallet in memory and tries again; refused again, it says so and writes nothing. Residual risk: builds and tabs from before the header send none and keep the old behaviour until updated |
| Database connection | Credentials and ciphertext read or changed in transit | TLS with full certificate verification by default; plain only for local hosts or `DATABASE_SSL=disable` |
| Mistyped phrase on “I have an account” | A valid but wrong phrase opens a new empty diary that looks like data loss | Only a sign-up creates an account: `/api/auth/verify` without a first diary answers 404 `no-account` and creates nothing; the stored phrase is kept on startup |
| Guessable phrases (weak randomness, as in the Milk Sad and Trust Wallet incidents) | Phrases enumerated offline from `pubkey_hash` | 128 bits from `crypto.getRandomValues` (OS CSPRNG in browsers and Android WebView) via `@scure/bip39`; no userspace PRNG, no fallback: it throws if the API is missing. Reviewed 2026-10-29 |
| Compromised npm package in the client bundle | A dependency reads the phrase in memory or replaces the RNG | Few runtime dependencies; `@noble/ed25519`, `@noble/hashes` and `@scure/bip39` pinned to exact versions; lockfile with integrity hashes; `npm ci` in CI, Docker and Vercel builds (`apps/web/vercel.json`); CI runs `npm audit signatures` (registry signatures and provenance attestations of every installed package); `@noble/*` and `@scure/*` published with SLSA provenance; no third-party scripts at runtime. Residual risk: see “Hardening backlog” |
| Ciphertext blob theft | Offline attack on AES-GCM | 256-bit key from HKDF of BIP39 seed; rate-limit kit fetch |
| Shoulder surfing of mnemonic | Full account takeover | Show once; confirm; never re-display from the server |
| Photo or screencap of backup QR | Full account takeover | Same reveal toggle as the phrase; payload is not a URL; decode stays in the browser |
| Bundled consent | Forced research to get backup | Separate toggles; research is not a backup |
| Lost mnemonic + password | Permanent data loss | Honest UX; export/import offered while the device is unlocked |
| Utah mixed into prior | Silent cohort blending | `released_model.json` is mcPHASES-only; tests assert that |

## Android app

The app runs the web code in a WebView (Capacitor), so every row above still applies to hosted diaries. These rows cover what is new.

| Threat | Risk | Mitigation |
| --- | --- | --- |
| Lost or stolen unlocked phone (on-device mode) | Diary read on the device | Optional app lock: the Keystore key that seals the phrase needs a fingerprint or screen-lock check on every use; the diary leaves memory after 30 s in the background; the screen is covered while the app is hidden; turning the lock off needs the same check; `FLAG_SECURE` while the lock is on |
| File extraction (root, forensic copy) | Offline attack on the diary file | File is the same AES-256-GCM blob as the hosted vault; the phrase file is sealed by a non-exportable Keystore key (StrongBox when available) |
| Hosted account kept signed in | Phrase read from a copy of the app's files | Sealed by its own non-exportable Keystore key in `files/hosted-phrase.bin`, never in WebView storage; memory only when “Keep me signed in” is off; deleted on sign-out. A phrase stored by an older version is sealed on the next start, read back, then deleted from `localStorage` (WebView may keep the old bytes until it compacts). No fingerprint check: anyone using the unlocked phone can open the diary, as in a browser |
| Offline copy of a hosted diary | Diary read from a copy of the app's files; an old copy saved over newer edits | Only while “Keep me signed in” is on. `files/hosted-diary-copy.json` holds the same AES-256-GCM blob the host stores, and it opens only with the phrase sealed in Keystore. Read-only: its backend throws on every save, and moving to the device, password change, and account delete refuse while it is open (sign-out works, and deletes it). Never opened when the host answers “no account”. Deleted on sign-out, account delete, moving to the device, and a sign-in without “Keep me signed in”. Same exposure as signing in today: anyone using the unlocked phone can open it |
| Cloud backup or device transfer | Phrase or diary copied off the phone | `allowBackup="false"` and data extraction rules exclude all app data |
| Logcat | Phrase, emails, or vault bodies in system logs | Capacitor `loggingBehavior: "none"` in every build; the native plugin never logs |
| Wrong phrase on an on-device diary | Empty hosted account created by mistake | Phrase unlock opens the device file and never signs in to a host while an on-device diary exists |
| Damaged diary file | Next save overwrites it with an empty diary | Decoding throws instead of reading as empty; writes are atomic (`AtomicFile`) |
| Moving between device and host | Data loss half-way | The old copy is deleted only after the new one is saved. Moving to the device copies the host's latest diary and deletes the account only at that version; the device copy is removed again only if the host clearly refused the delete, never when its answer was lost |
| Old app build opens a newer diary | It drops what it does not know and saves the rest over the newer diary, for every device | Every new field or value bumps `DIARY_SCHEMA_VERSION`; an older build opens a newer diary read-only and asks for an update; the host never stores a save with an older format version than the one it holds; `MIN_ANDROID_VERSION_CODE` can retire old builds (426) |
| Hostile or broken recovery kit | A huge PBKDF2 count freezes the phone; a tiny one weakens the wrap | The client accepts only PBKDF2-SHA-256 with 100k–3M iterations from a kit |
| Plaintext export | Diary readable in the chosen share target | User-initiated only; cached export deleted on next export and on app start |
| Lost phone, no export (on-device mode) | Permanent data loss | Honest UX in onboarding and Settings; export through the share sheet |

## Cryptography (standard primitives only)

- BIP39 mnemonic via `@scure/bip39`
- HKDF-SHA-256 via `@noble/hashes`
- AES-256-GCM via WebCrypto
- Ed25519 challenge signatures via `@noble/ed25519`
- Recovery wrap: PBKDF2-SHA-256 (WebCrypto, 600_000 iterations) then AES-GCM
- Android on-device phrase seal: AES-256-GCM with an Android Keystore key (platform API, not our own crypto)

We will not invent a protocol. We will not use a “recovery email” that re-derives the AES key without a user secret.

## Hardening backlog (nice to have)

A review on 2026-10-29 found no advisory for `@scure/bip39` 2.3.0, `@noble/hashes` 2.3.0 or `@noble/ed25519` 3.1.0, no supply-chain incident touching them, and no weakness in `crypto.getRandomValues` on our platforms (browsers, Android 7+ WebView). Nothing here is urgent. Each item narrows the one residual risk, a compromised dependency in the client bundle, or a known weak spot.

Done on 2026-11-11: `npm ci` on Vercel (`apps/web/vercel.json`), exact versions for the three crypto packages, and `npm audit signatures` in CI. Done on 2026-11-19: exact versions for the other runtime packages that reach the client bundle (`jsqr`, `uqr`, `@zonneplan/suncalc`, `lucide-react`). In the Android app any script in the WebView can call the native plugin that returns the phrase, so a compromised package there would reach it.

1. **Upgrade with a delay.** `@scure/bip39` 2.4.0, `@noble/hashes` 2.4.0 and `@noble/ed25519` 3.2.0 (August 2026) are hardening releases. Take new versions a week or so after release, not on day one. The pins mean these packages change only in a reviewed commit: read their lockfile diff.
2. **RNG self-check at startup (optional).** Check that `crypto.getRandomValues` is the native function and that two draws differ and are not all zero. It catches a broken or stubbed RNG, not a crafted one.
3. **Email accounts: stronger passwords.** An email account's phrase is as strong as its password against anyone who holds the wrapped kit or the database. The minimum is 8 characters with PBKDF2 at 600k iterations. A longer minimum or a strength meter would raise the floor.
4. **Revocable sessions.** A per-account epoch counter inside the session token (bumped on sign-out everywhere and on account delete) would let a copied cookie be revoked; it needs a migration. A recent signature could also be required to delete the account.
5. **`__Host-` cookie prefix.** Renaming the session cookie to `__Host-ciclo_session` binds it to this exact host over https; the rename signs everyone out once, so it needs a transition (read both names for a while).
6. **HSTS for subdomains.** `Strict-Transport-Security` is sent without `includeSubDomains` or `preload` until every subdomain is known to serve https.

## Out of scope (for now)

- Nation-state disk imaging of a powered-on machine
- Hardware keyloggers
- Compelled disclosure of a passphrase the user still remembers
- A compromised Android OS or Keystore implementation
