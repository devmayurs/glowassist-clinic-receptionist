-- Clinic Receptionist — Supabase PostgreSQL Database Schema
-- Location: database/schema.sql

-- Enable UUID extension for automatic primary key generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. MASTER TABLES (Parent Tables)
-- =========================================================================

-- Clients Table: Stores customer profiles
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_number TEXT UNIQUE NOT NULL, -- Indexed for rapid WhatsApp lookups
  email TEXT,
  client_type TEXT NOT NULL DEFAULT 'first_time' CHECK (client_type IN ('first_time', 'regular', 'vip')),
  booking_source TEXT NOT NULL DEFAULT 'whatsapp_ai' CHECK (booking_source IN ('whatsapp_ai', 'manual_crm', 'live_chat')),
  total_bookings INTEGER DEFAULT 0 CHECK (total_bookings >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Services Table: Stores salon beauty & nail treatments dynamically
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Staff Table: Stores spa technicians & beauty specialists details
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'technician',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 2. TRANSACTIONS & BOOKINGS TABLES
-- =========================================================================

-- Appointments Table: Stores appointment bookings and Google Event sync keys
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME WITHOUT TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  payment_method TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_method IN ('cash', 'card', 'online', 'unpaid')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  google_calendar_event_id TEXT, -- Synced Google Calendar Event reference
  booking_source TEXT NOT NULL DEFAULT 'whatsapp_ai' CHECK (booking_source IN ('whatsapp_ai', 'manual_crm', 'live_chat')),
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL, -- Assigned technician (optional)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payments Table: Ledger transactions for audit and revenue analytics
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'online')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  stripe_payment_intent_id TEXT, -- Stripe Sync (optional future phase)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CRM Live Chats Table: Tracks chats routed between AI and human agents
CREATE TABLE IF NOT EXISTS crm_live_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'live_chat')),
  agent_type TEXT NOT NULL DEFAULT 'ai' CHECK (agent_type IN ('ai', 'human_agent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointment Logs Table: Audit history tracking statuses and reschedules
CREATE TABLE IF NOT EXISTS appointment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  previous_status TEXT CHECK (previous_status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show', NULL)),
  new_status TEXT NOT NULL CHECK (new_status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  changed_by TEXT NOT NULL DEFAULT 'system' CHECK (changed_by IN ('system', 'whatsapp_ai', 'admin_crm')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- =========================================================================

-- Speed up client lookup via WhatsApp phone trigger
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone_number);

-- Speed up reschedule overlaps and slot conflict checks
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_google_event ON appointments(google_calendar_event_id);

-- Speed up logs and live chat dashboard lookups
CREATE INDEX IF NOT EXISTS idx_live_chats_client ON crm_live_chats(client_id);
CREATE INDEX IF NOT EXISTS idx_logs_appointment ON appointment_logs(appointment_id);

-- =========================================================================
-- 4. SECURITY & ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables to prevent public anonymous bypass
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_live_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_logs ENABLE ROW LEVEL SECURITY;

-- 1. policy: Full bypass for service_role (Backend API / n8n workflows)
-- (Supabase automatically bypasses RLS for the 'service_role' key, no custom policies needed)

-- 2. policy: Authenticated staff (CRM users) have full CRUD permissions
CREATE POLICY "CRM Staff Full Access - Clients" ON clients
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "CRM Staff Full Access - Services" ON services
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "CRM Staff Full Access - Staff" ON staff
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "CRM Staff Full Access - Appointments" ON appointments
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "CRM Staff Full Access - Payments" ON payments
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "CRM Staff Full Access - Live Chats" ON crm_live_chats
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "CRM Staff Full Access - Logs" ON appointment_logs
  TO authenticated USING (true) WITH CHECK (true);

-- 3. policy: Public / Anonymous Read-Only Access strictly for Services (optional for client-side menu lookups)
CREATE POLICY "Public Read-Only Access - Active Services" ON services
  FOR SELECT TO anon USING (is_active = true);

-- =========================================================================
-- 5. SEED DATA SCRIPT
-- =========================================================================

-- Seed standard Nail Spa and aesthetic treatment services
INSERT INTO services (name, price, duration_minutes) VALUES
  ('Gel Manicure Deluxe', 45.00, 45),
  ('Luxury Pedicure', 60.00, 60),
  ('Full Gel Nail Extensions', 85.00, 75),
  ('Botox Aesthetic Session (Forehead)', 350.00, 30),
  ('Lip Dermal Filler Session', 480.00, 45)
ON CONFLICT (name) DO UPDATE 
SET price = EXCLUDED.price, 
    duration_minutes = EXCLUDED.duration_minutes;

-- Seed initial salon staff practitioners
INSERT INTO staff (full_name, role) VALUES
  ('Esthetician Maya', 'manicurist'),
  ('Beautician Lisa', 'nail_artist'),
  ('Dr. Reeves', 'aesthetic_physician')
ON CONFLICT DO NOTHING;
