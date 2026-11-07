-- 005: native 3D memory reels replace the retired external video catalog.
--
-- Adds the per-wish reel template and removes the retired engagement table.

ALTER TABLE wishes ADD COLUMN IF NOT EXISTS reel_template_id TEXT;
DROP TABLE IF EXISTS video_template_stats;
