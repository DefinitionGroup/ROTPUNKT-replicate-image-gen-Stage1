-- Adds user ownership to images and enables RLS policies
-- Safe to run multiple times

ALTER TABLE images
  ADD COLUMN IF NOT EXISTS user_id TEXT;

CREATE INDEX IF NOT EXISTS images_user_id_idx
  ON images (user_id);

ALTER TABLE images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "images_select_own" ON images;
DROP POLICY IF EXISTS "images_insert_own" ON images;

CREATE POLICY "images_select_own" ON images
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "images_insert_own" ON images
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional hardening once all rows have user_id set
-- ALTER TABLE images ALTER COLUMN user_id SET NOT NULL;
