-- 002: persisted unlock attempt ledger
--
-- Backs the per-wish unlock limiter so a serverless deployment cannot bypass it
-- by hitting a different instance. Only a salted hash of the IP is stored.

CREATE TABLE IF NOT EXISTS unlock_attempts (
  wish_id       TEXT NOT NULL,
  ip_hash       TEXT NOT NULL,
  attempts      INTEGER NOT NULL DEFAULT 0,
  strikes       INTEGER NOT NULL DEFAULT 0,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_until  TIMESTAMPTZ,
  PRIMARY KEY (wish_id, ip_hash)
);

-- Lets a cleanup job sweep expired rows cheaply.
CREATE INDEX IF NOT EXISTS unlock_attempts_locked_idx
  ON unlock_attempts (locked_until);
