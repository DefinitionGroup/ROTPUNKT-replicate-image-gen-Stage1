-- Backfill helper for legacy images
-- Replace PLACEHOLDER_USER_ID with a real Clerk user id (e.g., user_123)
-- This will assign all legacy images to that user so they remain visible under RLS.

-- Example:
-- UPDATE images SET user_id = 'user_123' WHERE user_id IS NULL;

UPDATE images
SET user_id = 'PLACEHOLDER_USER_ID'
WHERE user_id IS NULL;

-- Optional: verify backfill
-- SELECT COUNT(*) FROM images WHERE user_id IS NULL;
