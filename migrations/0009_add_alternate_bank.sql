-- Migration: 0009_add_alternate_bank.sql
-- Description: Add fields for alternative bank support

ALTER TABLE admin_settings ADD COLUMN alt_bank_id TEXT;
ALTER TABLE admin_settings ADD COLUMN alt_bank_account_number TEXT;
ALTER TABLE admin_settings ADD COLUMN alt_bank_account_name TEXT;
