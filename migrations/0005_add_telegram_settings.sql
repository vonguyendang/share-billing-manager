-- Migration: 0005_add_telegram_settings.sql
-- Description: Add Telegram bot configuration to admin_settings

ALTER TABLE admin_settings ADD COLUMN telegram_bot_token TEXT;
ALTER TABLE admin_settings ADD COLUMN telegram_chat_id TEXT;
ALTER TABLE admin_settings ADD COLUMN telegram_topic_id TEXT;
ALTER TABLE admin_settings ADD COLUMN telegram_notifications_enabled INTEGER DEFAULT 0;
