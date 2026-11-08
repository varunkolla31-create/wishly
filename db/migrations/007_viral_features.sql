-- 007: viral reveal features — milestone counter, secret scratch card, quiz gate.
--
-- All columns are nullable or defaulted, so existing wishes keep working.

ALTER TABLE wishes ADD COLUMN IF NOT EXISTS milestone_date TIMESTAMPTZ;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS milestone_label TEXT;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS secret_scratch_message TEXT;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS gift_voucher_code TEXT;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS quiz_question TEXT;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS quiz_options JSONB;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS quiz_answer_index INTEGER;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS quiz_wrong_toast TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'wishes'
      AND column_name = 'gate_mode'
  ) THEN
    ALTER TABLE wishes ADD COLUMN gate_mode TEXT NOT NULL DEFAULT 'password';
  END IF;
END $$;

ALTER TABLE wishes DROP CONSTRAINT IF EXISTS wishes_gate_mode_check;
ALTER TABLE wishes ADD CONSTRAINT wishes_gate_mode_check
  CHECK (gate_mode IN ('password', 'quiz', 'both'));
