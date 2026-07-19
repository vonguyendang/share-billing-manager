-- Migration: 0011_add_notification_language.sql
-- Description: Add columns for customer_language and admin_language to admin_settings

-- Use ALTER TABLE to add the columns if they don't exist.
-- Note: SQLite does not support IF NOT EXISTS in ALTER TABLE ADD COLUMN, so we rely on the schema tracking.

ALTER TABLE admin_settings ADD COLUMN customer_language TEXT DEFAULT 'vi';
ALTER TABLE admin_settings ADD COLUMN admin_language TEXT DEFAULT 'vi';
