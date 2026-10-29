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
Browser storage    — encrypted vault cache, wrapped kit, optional persisted mnemonic, “already contributed”
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
| Account enumeration by email | Learn that someone uses a cycle tracker | `/api/recovery/fetch` answers every email with 200 and a kit. Unknown or unverified emails get a decoy: a real-looking wrapped BIP39 phrase, deterministic per email, that no password opens. `/api/recovery/register` gives a taken email the same rate limit, status, and minimum response time as a new one, and sends the code after responding. The rate limit is per email for both routes. |
| Scripted abuse of public endpoints | Fill the database, spam code mails, poison the research pool | Per-IP limits stored as HMAC(IP) in `rate_limit_hits`: auth challenges, account creation, pool uploads, kit fetches, mailbox registration. Payload caps on the initial vault, nonces, and recovery kits. Stale bookkeeping (old hits and attempts, expired challenges) is pruned automatically. An optional Vercel WAF rule can add an edge limit on top. |
| Password manager | Phrase or password stored by the browser | Same as any site; user can decline; never sent to OpenCiclo as a login API |
| Wrapped kit in localStorage | Offline brute-force of the password | PBKDF2 600k; kit is still ciphertext |
| XSS | Script reads keys in memory | Strict CSP, no third-party scripts, no analytics |
| Persist unlock (`localStorage` mnemonic) | Device access or XSS can open the diary after the tab is closed | Off by unchecking “Keep me signed in”; sessionStorage only then; cleared on sign-out; documented in Help |
| Research join | Re-identify contributors | No `account_id` / pubkey on pool rows; no mapping table |
| Recovery mailbox | Email ↔ account link | Optional; HMAC lookup; documented as PII |
| Challenge replay | Stolen login | Short-lived nonces, one-use |
| Mistyped phrase on “I have an account” | A valid but wrong phrase opens a new empty diary that looks like data loss | Only a sign-up creates an account: `/api/auth/verify` without a first diary answers 404 `no-account` and creates nothing; the stored phrase is kept on startup |
| Guessable phrases (weak randomness, as in the Milk Sad and Trust Wallet incidents) | Phrases enumerated offline from `pubkey_hash` | 128 bits from `crypto.getRandomValues` (OS CSPRNG in browsers and Android WebView) via `@scure/bip39`; no userspace PRNG, no fallback: it throws if the API is missing. Reviewed 2026-10-29 |
| Compromised npm package in the client bundle | A dependency reads the phrase in memory or replaces the RNG | Few runtime dependencies; lockfile with integrity hashes; `npm ci` in CI and Docker; `@noble/*` and `@scure/*` published with SLSA provenance; no third-party scripts at runtime. Residual risk: see “Hardening backlog” |
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
| Lost or stolen unlocked phone (on-device mode) | Diary read on the device | Optional app lock: the Keystore key that seals the phrase needs a fingerprint or screen-lock check on every use; the diary leaves memory after 30 s in the background; `FLAG_SECURE` while the lock is on |
| File extraction (root, forensic copy) | Offline attack on the diary file | File is the same AES-256-GCM blob as the hosted vault; the phrase file is sealed by a non-exportable Keystore key (StrongBox when available) |
| Cloud backup or device transfer | Phrase or diary copied off the phone | `allowBackup="false"` and data extraction rules exclude all app data |
| Logcat | Phrase, emails, or vault bodies in system logs | Capacitor `loggingBehavior: "none"` in every build; the native plugin never logs |
| Wrong phrase on an on-device diary | Empty hosted account created by mistake | Phrase unlock opens the device file and never signs in to a host while an on-device diary exists |
| Damaged diary file | Next save overwrites it with an empty diary | Decoding throws instead of reading as empty; writes are atomic (`AtomicFile`) |
| Moving between device and host | Data loss half-way | The old copy is deleted only after the new one is saved; moving to the device rolls back if the account delete fails |
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

1. **`npm ci` on Vercel.** CI and the Dockerfile run `npm ci`. Vercel builds run its default `npm install` (the build log says "up to date in …"); the repo has no `vercel.json`. `npm ci` installs exactly the lockfile and refuses one that disagrees with `package.json`. Set the install command in `vercel.json` or the project settings.
2. **Exact versions for the crypto packages.** `apps/web/package.json` uses `^` for `@noble/ed25519`, `@noble/hashes` and `@scure/bip39`. Pin them, as `apps/mobile` already does, and read lockfile diffs for these packages in review.
3. **`npm audit signatures` in CI.** It checks registry signatures and provenance attestations of what was installed. It passed locally on 2026-10-29.
4. **Upgrade with a delay.** `@scure/bip39` 2.4.0, `@noble/hashes` 2.4.0 and `@noble/ed25519` 3.2.0 (August 2026) are hardening releases. Take new versions a week or so after release, not on day one.
5. **RNG self-check at startup (optional).** Check that `crypto.getRandomValues` is the native function and that two draws differ and are not all zero. It catches a broken or stubbed RNG, not a crafted one.
6. **Email accounts: stronger passwords.** An email account's phrase is as strong as its password against anyone who holds the wrapped kit or the database. The minimum is 8 characters with PBKDF2 at 600k iterations. A longer minimum or a strength meter would raise the floor.

## Out of scope (for now)

- Nation-state disk imaging of a powered-on machine
- Hardware keyloggers
- Compelled disclosure of a passphrase the user still remembers
- A compromised Android OS or Keystore implementation
