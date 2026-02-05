-- Finalize the migration once all rows have a user_id
-- This will enforce non-null user_id at the DB level

ALTER TABLE images
  ALTER COLUMN user_id SET NOT NULL;
