-- Per-source request counts for public endpoints (abuse limits).
-- key_hash is an HMAC of the client IP, never the IP itself. No account id,
-- no email, no health data. The app deletes rows older than a day.
-- Additive. Apply before deploying code that reads the table.

CREATE TABLE IF NOT EXISTS rate_limit_hits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limit_hits_bucket_key_created_idx
  ON rate_limit_hits (bucket, key_hash, created_at);

CREATE INDEX IF NOT EXISTS rate_limit_hits_created_idx
  ON rate_limit_hits (created_at);
