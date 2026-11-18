-- 008: anonymous wishes, manage tokens, expiry and first-open tracking.
--
-- Every column is nullable, so existing wishes (including the signed-in ones
-- created before this migration) keep working unchanged.

-- SHA-256 of the manage token issued to a creator who published without
-- signing in. The raw token is never stored.
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS manage_token_hash TEXT;

-- Anonymous wishes expire; signed-in ones leave this null.
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Set when an anonymous wish is adopted by a signed-in account.
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- A single boolean-ish event, not a tracking history: the first time the
-- receiver opened the reveal. This is what backs the "your wish was opened"
-- notification and matches what the privacy page promises.
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;

-- Manage lookups are by hash, and the hash is unique per wish.
CREATE UNIQUE INDEX IF NOT EXISTS wishes_manage_token_hash_idx
  ON wishes (manage_token_hash)
  WHERE manage_token_hash IS NOT NULL;

-- Expiry sweeps scan this.
CREATE INDEX IF NOT EXISTS wishes_expires_at_idx
  ON wishes (expires_at)
  WHERE expires_at IS NOT NULL;
