-- 009: notify-me signups and the sender's email on a wish.
--
-- Additive only: existing rows keep working, and owner_email stays null for
-- wishes created before this migration (no notification can be sent for them).

-- Sender's address, copied at creation for signed-in wishes so the one-off
-- "your wish was opened" note needs no Clerk lookup at read time.
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Notify-me captures from the pricing page. One row per address per source,
-- which is why (email, source) is unique.
CREATE TABLE IF NOT EXISTS notify_signups (
  email        TEXT PRIMARY KEY,
  source       TEXT NOT NULL DEFAULT 'pricing',
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notify_signups_created_idx
  ON notify_signups (created_at DESC);
