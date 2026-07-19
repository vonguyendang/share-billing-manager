-- Migration: 0010_add_admin_email_notifications.sql
-- Description: Add admin email notification settings

ALTER TABLE admin_settings ADD COLUMN admin_email_notifications_enabled INTEGER DEFAULT 0;
ALTER TABLE admin_settings ADD COLUMN admin_email_notification_to TEXT;
ALTER TABLE admin_settings ADD COLUMN admin_email_notification_cc TEXT;
ALTER TABLE admin_settings ADD COLUMN admin_email_notification_bcc TEXT;
