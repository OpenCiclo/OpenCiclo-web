# Ciclo web app (OpenCiclo V1)

**Ciclo** — web client for OpenCiclo
Built by Emma Flora Harbison & Luis Rey Sánchez
Copyright © 2026
Apache License 2.0

Mobile-first Next.js app. Period dates and daily logs (flow, cervical mucus, symptoms, short day notes ≤200 characters) are encrypted in the browser (AES-256-GCM) before they are stored. Four tabs: **Calendar**, **Patterns**, **Learn**, **Settings**. Note history lives at `/diary` (linked from Patterns), not as a fifth tab. Two sign-in modes: **email + password** (recommended) or **super private** (12-word phrase). Email never decrypts the diary; sign-in on a new device fetches the wrapped kit automatically. Forecasting is a TypeScript port of the Python shrinkage + discrete Laplace path. The host never receives dates, symptoms, or notes in the clear. The anonymous pool still sends cycle lengths only.

Ciclo provides cycle forecasts. Forecasts can be wrong. Ciclo is not a medical device, diagnosis system, or contraceptive method.

**Learn** (in the tab bar) is health education. **Help** (`/help`) is documentation of the app: hosting, encryption, and what the UI means. Help is public English and does not require sign-in.

There is **no** Clerk, Auth0, or analytics SDK.

## Host on Vercel (intended production path)

1. Create a Vercel project with **root directory** `apps/web`.
2. Provision **Neon** Postgres (Vercel Marketplace) and set `DATABASE_URL`.
3. Run every file in `apps/web/drizzle/` on that database, in order (`0000_init.sql` through `0009_feedback.sql`). Never use `drizzle-kit push`; see *Host on Vercel* → *Change the schema of a live database*.
4. Set `SESSION_SECRET` and `EMAIL_LOOKUP_SECRET` to long random strings.
5. Set `APP_URL` to the production URL (for example `https://your-app.vercel.app`).
6. For email signup: `RESEND_API_KEY` and `MAIL_FROM`, plus the DNS records Resend asks for. Day-to-day sign-in does not use inbox links; creating the account sends a 6-digit code once. Without mail, email signup returns 503.

Copy `apps/web/.env.template` to `.env.local` for local Next.js. Do not commit secrets. Plain-language walkthrough: Help article *Host on Vercel* (`/help/host-on-vercel`).

## Local Next.js (without Docker)

You still need Postgres. Neon’s local/dev branch, or Docker Compose `db` only, both work.

```bash
cd apps/web
cp .env.template .env.local
# fill DATABASE_URL, SESSION_SECRET, EMAIL_LOOKUP_SECRET, APP_URL=http://localhost:3000
npx dotenv -e .env.local -- psql "$DATABASE_URL" -f drizzle/0000_init.sql
npx dotenv -e .env.local -- psql "$DATABASE_URL" -f drizzle/0001_pool_upsert.sql
npx dotenv -e .env.local -- psql "$DATABASE_URL" -f drizzle/0002_learn_articles.sql
npx dotenv -e .env.local -- psql "$DATABASE_URL" -f drizzle/0003_mailbox_pending.sql
npx dotenv -e .env.local -- psql "$DATABASE_URL" -f drizzle/0004_account_activity.sql
npx dotenv -e .env.local -- psql "$DATABASE_URL" -f drizzle/0005_vault_version.sql
npx dotenv -e .env.local -- psql "$DATABASE_URL" -f drizzle/0006_rate_limit_hits.sql
npx dotenv -e .env.local -- psql "$DATABASE_URL" -f drizzle/0007_lookup_indexes.sql
npx dotenv -e .env.local -- psql "$DATABASE_URL" -f drizzle/0008_friends.sql
npx dotenv -e .env.local -- psql "$DATABASE_URL" -f drizzle/0009_feedback.sql
npm run dev
```

App: http://localhost:3000 — Help: http://localhost:3000/help

## Self-host (Docker)

From the repository root, create the app's two secrets once (Compose reads `.env` next to `docker-compose.yml`; git ignores it), then start everything:

```bash
printf 'SESSION_SECRET=%s\nEMAIL_LOOKUP_SECRET=%s\n' "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" > .env
docker compose up --build
```

- App: http://localhost:3000
- Postgres: `postgres://openciclo:openciclo@localhost:5432/openciclo`

**Upgrading an install that already has accounts:** earlier versions of `docker-compose.yml` set `SESSION_SECRET=local-dev-session-secret-change-me` and `EMAIL_LOOKUP_SECRET=local-dev-email-hmac-secret-change-me`. Put those same two values in `.env` instead of generating new ones. A new `EMAIL_LOOKUP_SECRET` breaks every email sign-in (the host finds a mailbox by an HMAC of the address made with that secret), and a new `SESSION_SECRET` signs everyone out. Changing them later needs a planned migration, not a new value.

The image holds no secrets and runs as an unprivileged user; the app container refuses to start without both secrets. `docker compose up -d db mailpit` (database and mail only, for `npm run dev`) needs no `.env`. Every port is published on `127.0.0.1` only. To serve other people, put a reverse proxy with TLS in front of port 3000 that **sets** `X-Forwarded-For` to the client's address (overwriting what the client sent): the abuse limits count requests per address from that header, so without such a proxy a client can pick its own address. Change the Postgres password before the database holds real diaries.

If you previously ran Docker with the old `oddy` database user, reset the volume once:

```bash
docker compose down -v
docker compose up --build
```

## Tests

```bash
cd apps/web
npm test
```

The tests run in the America/New_York time zone (set in `vitest.config.mts`), so a date shown a day early west of UTC fails here instead of on someone's phone. To try another zone, run `TZ=Pacific/Kiritimati npx vitest run`. Git Bash on Windows does not pass `TZ` to Node: use `TEST_TZ=Pacific/Kiritimati npx vitest run` there, or `$env:TZ` in PowerShell. A misspelt zone stops the run instead of quietly testing in UTC.

Parity vectors come from `python scripts/generate_forecast_parity.py` at the repo root. The TypeScript engine must match Python. Do not mix Utah/Creighton into `released_model.json`.

## Studies

- Published prior: Bull et al. 2019, https://doi.org/10.1038/s41746-019-0152-7, and Li et al. 2023 (Apple Women's Health Study), https://doi.org/10.1038/s41746-023-00848-1
- mcPHASES (Canada, hyperparameter selection and validation): https://physionet.org/content/mcphases/1.0.0/
- Utah/Creighton (validation only): https://doi.org/10.7278/S50d-4gxs-s4hj

## Product Help

English articles for operators and curious users: [`content/help/`](content/help/). Served at `/help`. Index for GitHub readers: [docs/kb/](../../docs/kb/README.md).
