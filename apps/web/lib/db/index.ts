// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { ConfigError } from "@/lib/server/env";

import * as schema from "./schema";

// Hosts reached without TLS: this machine, and the `db` service of
// docker-compose.yml (Postgres in the next container, no certificate). Tests
// write only to a database on one of these hosts (lib/db/test-db.ts).
export const LOCAL_DATABASE_HOSTS: ReadonlySet<string> = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "db"]);

/** Whether a Postgres URL points at one of LOCAL_DATABASE_HOSTS. False when it cannot be read. */
export function isLocalDatabaseUrl(url: string): boolean {
  try {
    return LOCAL_DATABASE_HOSTS.has(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * TLS for the database connection. Default: verify-full (the certificate must
 * chain to a trusted CA and name the host), which Neon supports. Plain only
 * for a local host or with DATABASE_SSL=disable. DATABASE_SSL=require keeps
 * TLS but skips the certificate check, for a server with a private CA. The
 * URL's own sslmode is ignored, so `sslmode=require` no longer means "do not
 * check the certificate".
 */
export function databaseSsl(url: string, override = process.env.DATABASE_SSL): false | "require" | "verify-full" {
  if (override === "disable") return false;
  if (override === "require") return "require";
  if (override === "verify-full") return "verify-full";
  return isLocalDatabaseUrl(url) ? false : "verify-full";
}

// Serverless instances each keep a small pool: a slow query no longer blocks
// every other request of the instance, and an unreachable database fails in
// 10 s instead of 30. Idle connections stay open for 4 minutes, so a warm
// instance skips the TLS handshake between requests; Neon suspends its own
// compute after 5 idle minutes anyway.
export const POOL_OPTIONS = { max: 3, idle_timeout: 240, connect_timeout: 10 } as const;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new ConfigError("DATABASE_URL");
  }
  const client = postgres(url, {
    ...POOL_OPTIONS,
    ssl: databaseSsl(url),
  });
  return drizzle(client, { schema });
}

let cached: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!cached) cached = createDb();
  return cached;
}
