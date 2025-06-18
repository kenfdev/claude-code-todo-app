-- Check if column exists before adding
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- This migration will fail if run twice, which is expected behavior
-- The deployment process should track which migrations have been applied
ALTER TABLE `todos` ADD `notes` text;