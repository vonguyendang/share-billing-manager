-- Migration: 0006_add_previous_due_date.sql
-- Description: Add previous_due_date to payment_requests for undo functionality

ALTER TABLE payment_requests ADD COLUMN previous_due_date TEXT;
