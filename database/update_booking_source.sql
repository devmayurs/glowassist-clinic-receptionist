-- GlowAssist Clinic Receptionist — Supabase PostgreSQL Database Constraint Update Migration
-- Run this query in your Supabase SQL Editor if you are updating an existing database setup.

-- 1. Drop existing CHECK constraints on booking_source columns if they exist
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_booking_source_check;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_booking_source_check;

-- 2. Re-create CHECK constraints containing all permitted booking sources: 'whatsapp_ai', 'manual_crm', 'live_chat', and 'instagram'
ALTER TABLE clients ADD CONSTRAINT clients_booking_source_check 
  CHECK (booking_source IN ('whatsapp_ai', 'manual_crm', 'live_chat', 'instagram'));

ALTER TABLE appointments ADD CONSTRAINT appointments_booking_source_check 
  CHECK (booking_source IN ('whatsapp_ai', 'manual_crm', 'live_chat', 'instagram'));

-- Note: The schema.sql has also been updated with these changes so any new setups will have them automatically!
