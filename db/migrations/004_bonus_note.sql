-- 004: optional scratch-to-reveal bonus note (a hidden message or gift code).

ALTER TABLE wishes ADD COLUMN IF NOT EXISTS bonus_note TEXT;
