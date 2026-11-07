-- Wishly Postgres schema (Neon). Idempotent: safe to run on every deploy.
-- Mirrors the records in docs/DATA_MODEL.md; the file and DynamoDB adapters
-- store the same shapes.

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
  media_keys                    TEXT[] NOT NULL DEFAULT '{}',
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

CREATE INDEX IF NOT EXISTS wishes_owner_updated_idx
  ON wishes (owner_id, updated_at DESC);

-- One live contributor link per wish; revoked tokens are nulled out.
CREATE UNIQUE INDEX IF NOT EXISTS wishes_contributor_token_idx
  ON wishes (contributor_token)
  WHERE contributor_token IS NOT NULL;

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
  "order"           INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (wish_id, contribution_id)
);

CREATE INDEX IF NOT EXISTS contributions_wall_idx
  ON contributions (wish_id, status, "order");

CREATE TABLE IF NOT EXISTS replies (
  wish_id     TEXT NOT NULL REFERENCES wishes (wish_id) ON DELETE CASCADE,
  reply_id    TEXT NOT NULL,
  owner_id    TEXT NOT NULL,
  message     TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (wish_id, reply_id)
);

CREATE INDEX IF NOT EXISTS replies_owner_created_idx
  ON replies (owner_id, created_at DESC);
