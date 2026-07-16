-- Migration: 0004_add_plan_slots.sql
-- Description: Add max_slots to plans table for capacity limitation

ALTER TABLE plans ADD COLUMN max_slots INTEGER DEFAULT 0;
