-- 006: metadata cache and daily search quota for the YouTube music picker.

CREATE TABLE IF NOT EXISTS music_search_cache (
  cache_key   TEXT PRIMARY KEY,
  payload     JSONB NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS music_search_cache_expiry_idx
  ON music_search_cache (expires_at);

CREATE TABLE IF NOT EXISTS music_quota (
  quota_date    DATE PRIMARY KEY,
  search_count  INTEGER NOT NULL DEFAULT 0 CHECK (search_count >= 0),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
