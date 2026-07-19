-- Migration: 0007_add_new_features.sql
-- Description: Add fields for VietQR, user self-cancel, and create expenses table

ALTER TABLE admin_settings ADD COLUMN bank_id TEXT;
ALTER TABLE admin_settings ADD COLUMN bank_account_number TEXT;
ALTER TABLE admin_settings ADD COLUMN bank_account_name TEXT;
ALTER TABLE admin_settings ADD COLUMN allow_user_cancel INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    expense_date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
