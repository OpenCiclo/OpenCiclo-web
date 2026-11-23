# Run it yourself

Two local paths: **Next.js** for day-to-day UI work, and **Docker Compose** when you want the app + Postgres together. Both talk to Postgres. Neither needs a public tunnel.

Help at `/help` is public even when you are signed out.

## Next.js on your machine

You still need a database. A Neon branch, or the `db` service from Docker Compose, both work.

```bash
cd apps/web
cp .env.template .env.local
```

Fill in:

- `DATABASE_URL`
- `SESSION_SECRET`
- `EMAIL_LOOKUP_SECRET`
- `APP_URL=http://localhost:3000`

Then:

```bash
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

Open http://localhost:3000. Fast Refresh updates the UI without rebuilding an image.

## Docker Compose

The app needs two secrets that are not in the image or in `docker-compose.yml`. Create them once in a `.env` file next to `docker-compose.yml` (Compose reads it; git ignores it), from the repository root:

```bash
printf 'SESSION_SECRET=%s\nEMAIL_LOOKUP_SECRET=%s\n' "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" > .env
docker compose up --build
```

- App: http://localhost:3000
- Postgres: `postgres://openciclo:openciclo@localhost:5432/openciclo`
- Mailpit (signup codes): http://localhost:8025 — Compose sets `SMTP_HOST=mailpit`. Without SMTP or Resend, email signup returns 503.

**Upgrading an install that already has accounts:** earlier versions of `docker-compose.yml` set `SESSION_SECRET=local-dev-session-secret-change-me` and `EMAIL_LOOKUP_SECRET=local-dev-email-hmac-secret-change-me`. Put those same two values in `.env` instead of new ones. Ciclo finds an email sign-in by a fingerprint (HMAC) of the address made with `EMAIL_LOOKUP_SECRET`, so a new value makes every existing email sign-in fail, and a new `SESSION_SECRET` signs everyone out. Changing them later needs a planned migration.

Without the secrets the app container stops at once with a message. Starting only Postgres and Mailpit (`docker compose up -d db mailpit`, for `npm run dev`) needs no `.env`. The app runs as an unprivileged user.

Compose publishes every port on `127.0.0.1` only: the app, Postgres and Mailpit are reachable from this machine and nowhere else. That is enough for a browser on the same machine.

### Serving other people

Put a reverse proxy with TLS (Caddy, nginx, Traefik) in front of port 3000. It must **set** `X-Forwarded-For` to the address the request came from, replacing anything the client sent. Ciclo limits sign-ins, sign-ups and research uploads per address, and it reads the address from that header (Vercel sets it the same way). Without such a proxy, anyone could send a made-up address with each request and dodge the limits. Also change the Postgres password before the database holds real diaries, and set `APP_URL` to the public address.

If an old volume still uses the previous `oddy` database user:

```bash
docker compose down -v
docker compose up --build
```

That **wipes local Postgres**. Export diaries first if you care about them.

## Tests

```bash
cd apps/web
npm test
```

Python tests and forecast parity live at the repo root (`pytest`, `python scripts/generate_forecast_parity.py`). The TypeScript forecast must match the Python one.

## Production is still Vercel

Local Docker is for development and self-hosting. The documented production path is Vercel + Neon. See [Host on Vercel](/help/host-on-vercel).
