# Self-host image (docker-compose.yml at the repo root builds it). It holds no
# secrets: pass SESSION_SECRET, EMAIL_LOOKUP_SECRET, DATABASE_URL and APP_URL
# at run time. .dockerignore keeps .env files and local builds out of the
# build context.

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# The server runs as the image's unprivileged `node` user. It owns the app
# folder because Next writes regenerated pages (ISR) under .next at run time.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/content ./content
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
# Refuse to start without the secrets rather than fail at the first sign-in.
CMD ["sh", "-c", "if [ -z \"$SESSION_SECRET\" ] || [ -z \"$EMAIL_LOOKUP_SECRET\" ]; then echo 'Set SESSION_SECRET and EMAIL_LOOKUP_SECRET (see docker-compose.yml).' >&2; exit 1; fi; exec node server.js"]
