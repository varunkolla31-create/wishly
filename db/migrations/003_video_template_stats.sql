-- 003: aggregate engagement for the Canva video template gallery.
--
-- One row per template that has been liked, shared or used. Rows are created
-- lazily by the API via upsert, so the static catalog needs no seed pass.

CREATE TABLE IF NOT EXISTS video_template_stats (
  template_id    TEXT PRIMARY KEY,
  likes_count    INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  shares_count   INTEGER NOT NULL DEFAULT 0 CHECK (shares_count >= 0),
  uses_count     INTEGER NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Popular sort reads every row ordered by the computed score; keep it cheap.
CREATE INDEX IF NOT EXISTS video_template_stats_trending_idx
  ON video_template_stats (
    ((likes_count * 2) + (shares_count * 3) + uses_count) DESC
  );
