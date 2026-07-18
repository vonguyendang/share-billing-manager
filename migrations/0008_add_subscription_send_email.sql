-- Migration: 0008_add_subscription_send_email.sql
-- Description: Add send_email setting to subscriptions table

ALTER TABLE subscriptions ADD COLUMN send_email INTEGER DEFAULT 1;
