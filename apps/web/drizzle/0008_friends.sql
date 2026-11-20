-- Friends: share a cycle phase with close friends, sealed so the host cannot read it.
--
-- friend_books: one sealed blob per account that turned Friends on (the
-- friends, their pair keys, pending invites, the person's own name and note).
-- Sealed on the device with a key derived from the 12-word phrase; the host
-- never has it. The row's existence is the opt-in.
--
-- friend_boxes: sealed messages between two devices (an invite, the answer to
-- it, each friend's current status). Addressed by a hash of an id only the two
-- devices can derive. No account column and no write time on purpose: the
-- table must not say who wrote a box or who reads it. (Known residual: the
-- per-account rate_limit_hits row written just before a box write can link it
-- to its writer for about a day, never to its reader.) Every ciphertext has
-- the same length, so the kinds cannot be told apart. expires_at is rounded up
-- to a week. Never add an account column or a join table to accounts.
--
-- Additive. Nothing reads or writes these tables while FRIENDS_AVAILABLE is
-- false (routes answer 404, the cleanup skips them), so the code may deploy
-- first; apply this (after a Neon snapshot) before turning the flag on.

CREATE TABLE IF NOT EXISTS friend_books (
  account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  ciphertext TEXT NOT NULL CHECK (length(ciphertext) <= 43712),
  nonce TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS friend_boxes (
  box_hash TEXT PRIMARY KEY,
  write_hash TEXT NOT NULL,
  ciphertext TEXT NOT NULL CHECK (length(ciphertext) = 2752),
  nonce TEXT NOT NULL CHECK (length(nonce) = 16),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS friend_boxes_expires_idx
  ON friend_boxes (expires_at);
