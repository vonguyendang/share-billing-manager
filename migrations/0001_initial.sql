-- Migration: 0001_initial.sql
-- Description: Create initial tables for Share Billing Manager

-- DROP TABLE IF EXISTS email_logs;
-- DROP TABLE IF EXISTS payment_requests;
-- DROP TABLE IF EXISTS subscriptions;
-- DROP TABLE IF EXISTS members;
-- DROP TABLE IF EXISTS plans;
-- DROP TABLE IF EXISTS admin_settings;

CREATE TABLE admin_settings (
    id TEXT PRIMARY KEY, -- e.g., 'global'
    reminders_enabled INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    total_price REAL NOT NULL,
    renewal_cycle_months INTEGER DEFAULT 1,
    renewal_anchor_date TEXT,
    note TEXT,
    active INTEGER DEFAULT 1
);

CREATE TABLE members (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    note TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    next_due_date TEXT NOT NULL,
    amount_due REAL NOT NULL,
    billing_cycle_months INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'pending_payment'
    user_token TEXT NOT NULL UNIQUE,
    token_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    personal_note TEXT,
    FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE CASCADE
);

CREATE TABLE payment_requests (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    user_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE
);

-- Idempotency constraint: Prevent multiple pending payment requests for the same subscription
CREATE UNIQUE INDEX idx_payment_requests_pending ON payment_requests (subscription_id) WHERE status = 'pending';

CREATE TABLE email_logs (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL,
    email_type TEXT NOT NULL, -- '7_days', '3_days', '1_day', 'payment_submitted', 'payment_approved'
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    target_date TEXT NOT NULL, -- The due date this email refers to
    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE
);

-- Idempotency constraint: Prevent sending the same reminder type for the same target date multiple times
CREATE UNIQUE INDEX idx_email_logs_unique_reminder ON email_logs (subscription_id, email_type, target_date);

-- Insert default admin settings
INSERT INTO admin_settings (id, reminders_enabled) VALUES ('global', 1);