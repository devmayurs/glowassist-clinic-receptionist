# Clinic Receptionist — Supabase Database Architecture Plan

This plan governs the data layer hosted on Supabase (PostgreSQL), specifying schemas, relations, indices, Row Level Security (RLS) policies, and implementation processes.

---

## 🏛️ Database Architecture & Schemas

### 1. `clients` Table (Customer Master Data)
Stores core details for all salon customers, whether first-time, regular, or VIP.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_number TEXT UNIQUE NOT NULL, -- Indexed for fast AI lookup
  email TEXT,
  client_type TEXT NOT NULL DEFAULT 'first_time', -- 'first_time', 'regular', 'vip'
  booking_source TEXT NOT NULL DEFAULT 'whatsapp_ai', -- 'whatsapp_ai', 'manual_crm', 'live_chat'
  total_bookings INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for phone number searches from n8n & backend
CREATE INDEX idx_clients_phone ON clients(phone_number);
```

### 2. `appointments` Table (Appointment Records)
Stores appointment details, including status, payments, and Google Calendar mapping keys.

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME WITHOUT TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'
  payment_method TEXT NOT NULL DEFAULT 'cash', -- 'cash', 'card', 'online', 'unpaid'
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'partial', 'paid', 'refunded'
  google_calendar_event_id TEXT, -- Google Event mapping
  booking_source TEXT NOT NULL DEFAULT 'whatsapp_ai', -- 'whatsapp_ai', 'manual_crm', 'live_chat'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for rescheduling lookups & Calendar Views
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_appointments_google_event ON appointments(google_calendar_event_id);
```

### 3. `crm_live_chats` Table (Conversation History)
Tracks CRM live chat sessions and routes messages between the CRM UI and AI nodes.

```sql
CREATE TABLE crm_live_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'whatsapp', -- 'whatsapp', 'live_chat'
  agent_type TEXT NOT NULL DEFAULT 'ai', -- 'ai', 'human_agent'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_live_chats_client ON crm_live_chats(client_id);
```

---

## ⭐️ Recommended Additional Tables (Phase 17)

To prevent hardcoding services or staff and to provide bulletproof audit logging, we implement these recommended schemas:

### 4. `services` Table
Stores salon nail/beauty spa services dynamically, along with pricing and expected durations.

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 5. `payments` Table
Maintains ledger transactions separately for audit and billing compliance.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 6. `staff` Table
Allows assignments of technicians/beauticians to appointments.

```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'technician',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Modify appointments to optionally support staff assignment:
-- ALTER TABLE appointments ADD COLUMN staff_id UUID REFERENCES staff(id) ON DELETE SET NULL;
```

### 7. `appointment_logs` Table
Audit logs representing all changes made to an appointment's status, capturing rescheduled histories.

```sql
CREATE TABLE appointment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL DEFAULT 'system', -- 'system', 'whatsapp_ai', 'admin_crm'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## 🔒 Security Plan (Row Level Security)

All tables must have Row Level Security enabled. We establish strict access parameters:

1. **Service Role Access (Backend/n8n)**:
   - Full permissions (SELECT, INSERT, UPDATE, DELETE) are granted only via the secure backend/n8n services using the `SUPABASE_SERVICE_ROLE_KEY`.
2. **Anonymous Access (Frontend CRM)**:
   - Anonymous access is strictly **disabled** (`anon` key does not allow public SELECT/INSERT without authorization).
3. **Authorized CRM Users**:
   - Authenticated CRM Admins/Staff gain read-write access to all tables using JWT authorization policies verified against their `auth.users` IDs.

### RLS Activation Commands Example:
```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_live_chats ENABLE ROW LEVEL SECURITY;

-- Backend Service Role Bypass is default for service_role key.
-- CRM staff policy example:
CREATE POLICY "CRM Admin Full Access" 
ON appointments 
TO authenticated 
USING (true) 
WITH CHECK (true);
```

---

## 🚀 Execution Steps

1. **Launch Supabase Console**: Open your project database settings.
2. **Execute Schema SQL**: Copy and run the combined table and index creation statements in the SQL Editor.
3. **Seed Initial Data**: Seed standard services into the `services` table (e.g., Manicure, Pedicure, Gel extensions) to enable initial AI lookup references.
4. **Deploy RLS Policies**: Execute the RLS policies in the editor to block unauthorized anonymous accesses.
