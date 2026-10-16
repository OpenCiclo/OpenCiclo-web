-- Optimistic concurrency for the encrypted diary.
-- Every successful PUT /api/vault adds 1. A client that saves on top of an
-- older version gets 409 and merges, instead of overwriting another device.
-- Additive: a constant default is metadata-only on Postgres 11+ (no table rewrite).
-- Apply before deploying code that reads the column.

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS vault_version INTEGER NOT NULL DEFAULT 0;
