// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { databaseSsl, POOL_OPTIONS } from "./index";

const NEON =
  "postgresql://user:pass@ep-quiet-bird-123456-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

describe("database TLS", () => {
  it("verifies the certificate of any remote host, whatever the URL's sslmode says", () => {
    expect(databaseSsl(NEON, undefined)).toBe("verify-full");
    expect(databaseSsl("postgres://u:p@db.example.com:5432/app", undefined)).toBe("verify-full");
    expect(databaseSsl("postgres://u:p@db.example.com/app?sslmode=verify-full", undefined)).toBe("verify-full");
    expect(databaseSsl("postgres://u:p@db.example.com/app?sslmode=disable", undefined)).toBe("verify-full");
    // A host name that merely contains "localhost" is not local.
    expect(databaseSsl("postgres://u:p@localhost.example.com/app", undefined)).toBe("verify-full");
  });

  it("connects in plain text to this machine and to the docker-compose db service", () => {
    expect(databaseSsl("postgres://openciclo:openciclo@localhost:5432/openciclo", undefined)).toBe(false);
    expect(databaseSsl("postgres://u:p@127.0.0.1:5432/app", undefined)).toBe(false);
    expect(databaseSsl("postgres://u:p@[::1]:5432/app", undefined)).toBe(false);
    expect(databaseSsl("postgres://openciclo:openciclo@db:5432/openciclo", undefined)).toBe(false);
  });

  it("follows DATABASE_SSL when it is set", () => {
    expect(databaseSsl(NEON, "disable")).toBe(false);
    expect(databaseSsl(NEON, "require")).toBe("require");
    expect(databaseSsl("postgres://u:p@localhost/app", "verify-full")).toBe("verify-full");
    expect(databaseSsl(NEON, "something-else")).toBe("verify-full");
  });

  it("verifies when the URL cannot be read", () => {
    expect(databaseSsl("not a url", undefined)).toBe("verify-full");
  });

  it("keeps a small pool with timeouts", () => {
    expect(POOL_OPTIONS).toEqual({ max: 3, idle_timeout: 240, connect_timeout: 10 });
  });
});
