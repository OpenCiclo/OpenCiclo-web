-- Feedback sent from Settings ("Send feedback"): a type, the text, and an
-- optional email the person typed so the team can answer.
--
-- Anonymous on purpose: no account id, no pubkey, no IP (the rate limit keeps
-- only its usual keyed hash, rate_limit_hits). The text and the email are
-- plain text, not sealed like the diary; the form says so. The operator
-- console lists the rows and can delete them; the app deletes rows older
-- than 12 months.
-- Additive. Apply before deploying code that writes the table.

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  kind TEXT NOT NULL CHECK (kind IN ('problem', 'idea', 'other')),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  contact_email TEXT CHECK (contact_email IS NULL OR char_length(contact_email) <= 254),
  platform TEXT NOT NULL CHECK (platform IN ('web', 'android')),
  app_version TEXT CHECK (app_version IS NULL OR char_length(app_version) <= 40),
  locale TEXT CHECK (locale IS NULL OR char_length(locale) <= 16)
);

CREATE INDEX IF NOT EXISTS feedback_created_idx ON feedback (created_at);
