# Host on Vercel

This is the intended way to run a public Ciclo instance. Vercel serves the Next.js app. Neon holds Postgres. The diary in that database is ciphertext. Period dates never sit in a readable column.

You need access to the OpenCiclo git repository. The Vercel project **root directory** must be `apps/web`. The rest of the repo (Python library, training data notes) is not deployed with the site.

## 1. Create the Vercel project

1. Import the repository.
2. Set **Root Directory** to `apps/web`.
3. Framework: Next.js. Build command and output can stay at the defaults from `package.json`.

## 2. Add Postgres

Provision **Neon** from the Vercel Marketplace (or point `DATABASE_URL` at any Postgres 16 you control).

Put the database and the app's functions in the same region: every page and API call waits for its queries. `apps/web/vercel.json` runs the functions in `fra1` (Frankfurt), next to the official instance's database. If your database is elsewhere, change `regions` there to the [Vercel region](https://vercel.com/docs/regions) nearest to it.

Every build reads the Learn articles saved in the console (the `learn_articles` table), because the landing and the Learn pages are built ahead of time. If the database cannot be reached, the build fails on purpose: building without it would show again any article you hid. To ship an urgent fix while the database is down, set the environment variable `LEARN_BUILD_WITHOUT_DB=1` for that one deployment. The build then uses only the articles shipped in the code and prints a warning. Console edits come back once the database is reachable again: within about an hour, or at once when you save any article in the console. Remove the variable afterwards.

On that database, run the SQL in:

- `apps/web/drizzle/0000_init.sql`
- `apps/web/drizzle/0001_pool_upsert.sql`
- `apps/web/drizzle/0002_learn_articles.sql`
- `apps/web/drizzle/0003_mailbox_pending.sql`
- `apps/web/drizzle/0004_account_activity.sql`
- `apps/web/drizzle/0005_vault_version.sql`
- `apps/web/drizzle/0006_rate_limit_hits.sql`
- `apps/web/drizzle/0007_lookup_indexes.sql`

Those files create accounts, ciphertext columns, sessions, the anonymous research pool, Learn CMS rows, and email confirmation pending. They do not create health columns. `0003` adds `verified_at` on existing mailboxes (set to `created_at`) so current accounts keep working. `0004` records one open (sign-in or app start) per account per UTC day so the console can count unique opens. It does not store email or diary contents. `0005` adds a version number to each diary, so a save made on top of an older copy (another device saved in between) is merged instead of overwriting it. `0006` adds a table of request counts per client, used to limit abuse of public endpoints. It stores keyed hashes (of the IP address, or of the account or email for per-account and per-address limits), never the values themselves, and the app deletes rows older than a day. `0007` adds two indexes (mailboxes by account, activity by day); nothing depends on them, so it can be applied before or after deploying.

### Change the schema of a live database

Once real people use the instance, treat every schema change as a production migration.

1. Take a Neon snapshot first: **Backup & restore** → **Create snapshot**. A snapshot is a saved copy of the branch you can restore later.
2. Apply only the new file, in one transaction, and stop at the first error:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f apps/web/drizzle/0008_example.sql
```

`-1` wraps the file in a single transaction. If any statement fails, nothing from that file is kept.

Migration files only add things, and are safe to run twice (`IF NOT EXISTS`). `npm test` rejects `DROP`, `TRUNCATE`, `DELETE`, `UPDATE`, `RENAME`, and `ALTER COLUMN` unless the statement is listed as reviewed in `lib/db/migrations.test.ts`.

Do not use `drizzle-kit push`. It compares `lib/db/schema.ts` with the live database and changes the database to match. That can drop indexes and constraints without asking.

## 3. Environment variables

Set these in Vercel (Production, and Preview if you use it):

- `DATABASE_URL` — Neon connection string. The app checks the database's TLS certificate (full verification) for any host that is not local; `DATABASE_SSL=disable` turns TLS off (local databases only) and `DATABASE_SSL=require` keeps TLS without the certificate check (a server with its own private CA).
- `SESSION_SECRET` — long random string. Signs the session cookie.
- `EMAIL_LOOKUP_SECRET` — long random string. Used to HMAC emails so the database is not a marketing list.
- `APP_URL` — the public origin, for example `https://your-app.vercel.app`. No trailing slash.

Email + password **signup** needs outbound mail. Vercel does not send mail itself.

- `RESEND_API_KEY` — [Resend](https://resend.com) API key (production).
- `MAIL_FROM` — for example `Ciclo <noreply@openciclo.com>`. Verify that domain in Resend and add the SPF, DKIM, and DMARC records Resend shows (Cloudflare or your DNS host).

Without Resend (or SMTP), creating an email account returns 503. Super private (12-word) signup does not send mail.

Day-to-day sign-in is still email + password. The inbox is opened **once** at signup, for the 6-digit code. There is no password-reset link.

Optional:

- `CONSOLE_EMAILS` — comma-separated operator emails for `/console`. Compared as HMAC against a **verified** mailbox.
- `MIN_ANDROID_VERSION_CODE` — the oldest Android app build (its `versionCode`) the API still serves. Older builds get a 426 and ask the person to update. Leave it unset unless you publish the Android app.

Do not put period dates, phrases, or AES keys in env vars or logs.

## 4. Check the deployment

Open `/` (sign-in), `/privacy`, and `/help`. Create a throwaway account and confirm a diary round-trip. If sign-in works and `/privacy` still says the host cannot read the diary, the instance is doing what this architecture expects.

## What you are not hosting

The Python package, mcPHASES CSV, and training scripts stay off Vercel. Installers of the library get aggregate parameters in `openciclo/artifacts/released_model.json`. They do not need those CSVs to forecast.
