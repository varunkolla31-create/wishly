-- 001: core tables (wishes, contributions, replies)
--
-- Two jobs:
--   1. create the final shape on a fresh database;
--   2. converge a database created by the old `db:push`/schema.sql, where
--      media_keys was text[], contributions used "order", and two columns did
--      not exist yet.
-- Everything here is idempotent, so re-running is harmless.

CREATE TABLE IF NOT EXISTS wishes (
  wish_id                       TEXT PRIMARY KEY,
  owner_id                      TEXT NOT NULL,
  mode                          TEXT NOT NULL DEFAULT 'solo'
                                  CHECK (mode IN ('solo', 'group')),
  category                      TEXT NOT NULL,
  template_id                   TEXT NOT NULL,
  receiver_name                 TEXT NOT NULL DEFAULT '',
  title                         TEXT NOT NULL DEFAULT '',
  message                       TEXT NOT NULL DEFAULT '',
  media_keys                    JSONB NOT NULL DEFAULT '[]'::jsonb,
  music                         JSONB,
  -- Transitional: the current Wish type still carries musicId. Both columns
  -- exist so the parked music refactor needs no migration of its own.
  music_id                      TEXT,
  password_hash                 TEXT,
  password_hint                 TEXT,
  password_version              INTEGER NOT NULL DEFAULT 1,
  unlock_at                     TIMESTAMPTZ,
  status                        TEXT NOT NULL DEFAULT 'draft'
                                  CHECK (status IN ('draft', 'collecting', 'published', 'locked')),
  contributor_token             TEXT,
  contributor_token_revoked_at  TIMESTAMPTZ,
  views                         INTEGER NOT NULL DEFAULT 0,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Columns added after the first schema. No-ops on a fresh database.
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS music JSONB;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS password_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS contributor_token_revoked_at TIMESTAMPTZ;

-- media_keys moved from text[] to jsonb. information_schema reports ARRAY for
-- both text[] and varchar[], which is all the old schema could have used.
DO $$
DECLARE
  kind TEXT;
BEGIN
  SELECT c.data_type INTO kind
  FROM information_schema.columns c
  WHERE c.table_schema = current_schema()
    AND c.table_name = 'wishes'
    AND c.column_name = 'media_keys';

  IF kind = 'ARRAY' THEN
    ALTER TABLE wishes ALTER COLUMN media_keys DROP DEFAULT;
    ALTER TABLE wishes ALTER COLUMN media_keys TYPE JSONB USING to_jsonb(media_keys);
    ALTER TABLE wishes ALTER COLUMN media_keys SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS contributions (
  wish_id           TEXT NOT NULL REFERENCES wishes (wish_id) ON DELETE CASCADE,
  contribution_id   TEXT NOT NULL,
  contributor_name  TEXT NOT NULL,
  type              TEXT NOT NULL
                      CHECK (type IN ('photo', 'video', 'voice', 'text')),
  media_key         TEXT,
  "text"            TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'hidden')),
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (wish_id, contribution_id)
);

-- "order" is reserved in SQL and was renamed to sort_order.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'contributions'
      AND column_name = 'order'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'contributions'
      AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE contributions RENAME COLUMN "order" TO sort_order;
  END IF;
END $$;

ALTER TABLE contributions ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS replies (
  wish_id     TEXT NOT NULL REFERENCES wishes (wish_id) ON DELETE CASCADE,
  reply_id    TEXT NOT NULL,
  owner_id    TEXT NOT NULL,
  message     TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (wish_id, reply_id)
);

-- The replies inbox queries by owner.
ALTER TABLE replies ADD COLUMN IF NOT EXISTS owner_id TEXT NOT NULL DEFAULT '';

-- Dashboard list: newest-updated first, matching listByOwner on every adapter.
CREATE INDEX IF NOT EXISTS wishes_owner_updated_idx
  ON wishes (owner_id, updated_at DESC);

-- Sparse: only wishes with a live token appear in this index.
CREATE UNIQUE INDEX IF NOT EXISTS wishes_contributor_token_idx
  ON wishes (contributor_token)
  WHERE contributor_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS contributions_wall_idx
  ON contributions (wish_id, status, sort_order);

CREATE INDEX IF NOT EXISTS replies_owner_created_idx
  ON replies (owner_id, created_at DESC);
