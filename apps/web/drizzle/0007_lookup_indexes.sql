-- Indexes for lookups that scan whole tables today. No new columns, no data
-- changes, and no code depends on them: the app works the same before and
-- after this file is applied, only faster.
-- recovery_mailboxes(account_id): the console's operator check, and deleting
-- an account (ON DELETE CASCADE looks up the account's mailboxes).
-- account_activity_days(day): the console's daily counts read by day; the
-- primary key starts with account_id.

CREATE INDEX IF NOT EXISTS recovery_mailboxes_account_idx
  ON recovery_mailboxes (account_id);

CREATE INDEX IF NOT EXISTS account_activity_days_day_idx
  ON account_activity_days (day);
