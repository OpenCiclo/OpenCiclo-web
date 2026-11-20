// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { isLocalDatabaseUrl } from "@/lib/db";

import { localTestDatabaseUrl } from "./test-db";

describe("database tests", () => {
  it("run against the local stack, in docker or on this machine", () => {
    for (const url of [
      "postgres://openciclo:openciclo@localhost:5432/openciclo",
      "postgres://u:p@127.0.0.1/app",
      "postgres://u:p@[::1]:5432/app",
      "postgres://openciclo:openciclo@db:5432/openciclo",
    ]) {
      expect(isLocalDatabaseUrl(url), url).toBe(true);
      expect(localTestDatabaseUrl(url)).toBe(url);
    }
  });

  it("refuse any other database, so a test can never write to production", () => {
    for (const url of [
      "postgresql://user:pass@ep-quiet-bird-123456-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
      "postgres://u:p@localhost.example.com/app",
      "postgres://u:p@10.0.0.5/app",
      "not a url",
    ]) {
      expect(isLocalDatabaseUrl(url), url).toBe(false);
      expect(() => localTestDatabaseUrl(url), url).toThrow(/only against a local Postgres/);
    }
  });

  it("skip when no database is configured", () => {
    expect(localTestDatabaseUrl("")).toBeUndefined();
  });
});
