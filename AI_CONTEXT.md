# GlowAssist AI Clinic Receptionist — Project Context for AI Assistants

> **Purpose:** Pass this file as context to any AI assistant working on this codebase. It describes the full project architecture, what was changed, what was newly added, and the current production state.
> **Last Updated:** 2026-05-21
> **Clinic:** Lumière Med Spa

---

## 1. Project Overview

**GlowAssist** is a WhatsApp AI receptionist + CRM system for **Lumière Med Spa**.  
It lets clients book, reschedule, and cancel appointments over WhatsApp using an AI chatbot powered by Gemini, while the clinic team manages everything via a React dashboard.

### Tech Stack
| Layer | Technology |
|---|---|
| WhatsApp Automation | n8n (self-hosted at `https://n8n.zenithflow.in`) |
| AI Engine | Google Gemini (via n8n AI Agent node) |
| Backend API | Node.js + Express.js (deployed on Render at `https://be.zenithflow.in`) |
| Database | Supabase (PostgreSQL with pgBouncer) |
| Frontend Dashboard | React + TypeScript + Vite (deployed at `https://fe.zenithflow.in`) |
| Calendar Sync | Google Calendar API (OAuth2) |
| WhatsApp API | Meta Cloud API (Business Account ID: `969984912295396`, Phone Number ID: `1093698253829228`) |

---

## 2. Repository Structure

```
clinic receptionist/
├── backend/                          # Express.js API server
│   ├── src/
│   │   ├── app.js                    # Express app setup, CORS, middleware, route mounts
│   │   ├── server.js                 # Entry point — listens on PORT
│   │   ├── config/
│   │   │   ├── supabase.js           # Supabase client initialization
│   │   │   └── google.js             # Google OAuth2 + Calendar client
│   │   ├── controllers/
│   │   │   ├── appointment.controller.js   # All appointment logic (6 functions)
│   │   │   ├── client.controller.js        # Client CRUD
│   │   │   └── dashboard.controller.js     # KPI stats aggregation
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT Bearer token verification
│   │   ├── routes/
│   │   │   ├── appointment.routes.js # Appointment endpoints (5 routes)
│   │   │   ├── client.routes.js      # Client endpoints
│   │   │   ├── conversation.routes.js  # ★ NEW — /api/conversations/archive
│   │   │   └── dashboard.routes.js   # Dashboard stats
│   │   ├── services/
│   │   │   └── calendar.js           # Google Calendar CRUD (create/update/cancel events)
│   │   └── utils/
│   │       └── appointment.utils.js  # Working hours check, time normalization, conflict suggestions
│   ├── .env                          # Production environment variables (gitignored)
│   └── package.json
│
├── frontend/                         # React + TypeScript CRM Dashboard
│   ├── src/
│   │   ├── constants/app.constants.ts  # Clinic info, service list, status labels, enums
│   │   ├── data/mock.ts              # Seed/mock data for testing
│   │   └── ...
│   ├── .env                          # Development env (localhost URLs)
│   └── .env.production               # Production env (zenithflow.in URLs)
│
├── n8n-workflows/
│   ├── workflows/
│   │   ├── glowassist-receptionist-v2.json      # ★ ACTIVE — Main WhatsApp AI receptionist
│   │   ├── whatsapp-reminders-and-conv-logger.json  # ★ ACTIVE — Reminder cron + archive
│   │   └── whatsapp-ai-booking-integration.json     # ⚠️ DEPRECATED — Old v1 workflow (ignore)
│   └── .env                          # n8n environment variables (used as $env.VAR in nodes)
│
└── database/
    └── schema.sql                    # Full Supabase PostgreSQL schema + seed data
```

---

## 3. Clinic Business Information (Lumière Med Spa)

```
Clinic Name : Lumière Med Spa
Phone       : (555) 784-2301
Address     : 45 Blossom Avenue, Suite 200
Hours       : Mon–Sat 9:00 AM – 7:00 PM | Sunday 10:00 AM – 5:00 PM
```

### Services (from `database/schema.sql` seed + `frontend/src/constants/app.constants.ts`)
| Service | Price | Duration |
|---|---|---|
| Gel Manicure Deluxe | $45 | 45 min |
| Luxury Pedicure | $60 | 60 min |
| Full Gel Nail Extensions | $85 | 75 min |
| Botox Aesthetic Session (Forehead) | $350 | 30 min |
| Lip Dermal Filler Session | $480 | 45 min |

### Staff (from `database/schema.sql` seed)
- **Esthetician Maya** — Manicure & nail specialist
- **Beautician Lisa** — Nail art specialist
- **Dr. Reeves** — Aesthetic physician (Botox & fillers)

---

## 4. Backend API — Complete Route Map

**Base URL (Production):** `https://be.zenithflow.in`  
**Authentication:** All routes except `/api/health` require `Authorization: Bearer <JWT_TOKEN>`

### Health
| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | No auth. Returns uptime + timestamp. |

### Clients (`/api/clients`)
| Method | Path | Controller | Notes |
|---|---|---|---|
| POST | `/api/clients` | `createClient` | Create or upsert client by phone number |
| GET | `/api/clients` | `getClients` | With search, clientType, bookingSource, page, limit filters |
| GET | `/api/clients/:id` | `getClientById` | Returns client + all their appointments |
| PUT | `/api/clients/:id` | `updateClient` | Update clientType, notes, etc. |

### Appointments (`/api/appointments`)
| Method | Path | Controller | Notes |
|---|---|---|---|
| POST | `/api/appointments` | `createAppointment` | Working hours + conflict check + Google Calendar sync |
| GET | `/api/appointments` | `getAppointments` | Filters: startDate, endDate, status, paymentStatus, clientId |
| PUT | `/api/appointments/:id/reschedule` | `rescheduleAppointment` | Conflict check + Google Calendar update |
| PUT | `/api/appointments/:id/cancel` | `cancelAppointment` | Google Calendar delete + audit log |
| POST | `/api/appointments/:id/log` | `logReminderSent` | ★ NEW — records WhatsApp reminder dispatch to `appointment_logs` |

### Conversations (`/api/conversations`) — ★ NEW FILE
| Method | Path | Controller | Notes |
|---|---|---|---|
| POST | `/api/conversations/archive` | `archiveConversations` | ★ NEW — archives `crm_live_chats` records for a given date |

### Dashboard (`/api/dashboard`)
| Method | Path | Controller | Notes |
|---|---|---|---|
| GET | `/api/dashboard/stats` | `getDashboardStats` | Revenue, booking ratios, next 5 appointments |

---

## 5. Database Schema — Key Tables

```sql
-- Core tables
clients            (id, full_name, phone_number, email, client_type, booking_source, total_bookings, notes, created_at)
appointments       (id, client_id, service_name, appointment_date, appointment_time, status, payment_method, payment_status, staff_id, booking_source, notes, google_calendar_event_id, created_at)
appointment_logs   (id, appointment_id, previous_status, new_status, changed_by, notes, created_at)
services           (id, name, price, duration_minutes, category, is_active)
staff              (id, full_name, specialization, is_active)
crm_live_chats     (id, client_id, source, agent_type, session_id, messages, created_at, updated_at)
```

### Enum Values (validated by backend)
```
appointment.status         : 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
appointment.payment_status : 'pending' | 'partial' | 'paid' | 'refunded'
appointment.payment_method : 'cash' | 'card' | 'online' | 'unpaid'
appointment.booking_source : 'whatsapp_ai' | 'manual_crm' | 'live_chat' | 'instagram'
clients.client_type        : 'first_time' | 'regular' | 'vip'
appointment_logs.changed_by: 'system' | 'whatsapp_ai' | 'admin_crm'
```

---

## 6. n8n Workflows — Active Files

### `glowassist-receptionist-v2.json` ← ACTIVE (use this)
- **Trigger:** WhatsApp Webhook (Meta Cloud API)
- **Flow:** Message received → Check if text → AI Agent OR Booking flow
- **AI Agent:** Gemini model, `Services Info Tool` (vector store), `Conversation Memory` (session per phone number)
- **Booking Flow:** Collect user details state machine → create/find client → create appointment → WhatsApp confirmation
- **Cancel Flow:** Find appointment by phone → call PUT `/api/appointments/:id/cancel` → WhatsApp confirmation
- **Status Flow:** Find appointment by phone → WhatsApp reply with status

**Internal keys:**
- Memory key: `whatsapp-lumiere-medspa`
- Session key pattern: `whatsapp-lumiere-{{phone_number}}`

**State machine fields collected:**
```javascript
session = {
  fullName: string,
  serviceName: string,
  preferredDate: string,   // YYYY-MM-DD
  preferredTime: string,   // HH:MM or HH:MM:SS
  paymentMethod: string,   // defaults to 'cash'
  paymentStatus: string    // defaults to 'pending'
}
```

### `whatsapp-reminders-and-conv-logger.json` ← ACTIVE
- **24h Reminder Cron:** Runs daily, fetches tomorrow's `scheduled`+`rescheduled` appointments, sends WhatsApp reminder, logs via `POST /api/appointments/:id/log`
- **2h Reminder Cron:** Runs daily, fetches appointments due in 2 hours, sends WhatsApp reminder, logs via `POST /api/appointments/:id/log`
- **Archive Cron (3AM daily):** Calls `POST /api/conversations/archive` with yesterday's date

### `whatsapp-ai-booking-integration.json` ← DEPRECATED
⚠️ Old v1 prototype. Contains hardcoded Westhill Nails branding. **Do not import this into n8n.**

---

## 7. What Was Changed (vs Original Codebase)

### 7.1 Backend — MODIFIED FILES

#### `backend/src/app.js`
- **Added import:** `const conversationRoutes = require('./routes/conversation.routes');`
- **Added mount:** `app.use('/api/conversations', conversationRoutes);`

#### `backend/src/controllers/appointment.controller.js`
- **Added function:** `logReminderSent` — handles `POST /api/appointments/:id/log`, inserts into `appointment_logs` without changing status
- **Added function:** `archiveConversations` — handles `POST /api/conversations/archive`, queries `crm_live_chats` for a given date range
- **Updated exports:** Added both new functions to `module.exports`

#### `backend/src/routes/appointment.routes.js`
- **Added route:** `POST /:id/log` → `appointmentController.logReminderSent`

#### `backend/src/services/calendar.js`
- **Changed** Google Calendar event summary: `"Westhill Nails Appointment - ${clientName}"` → `"Lumière Med Spa — ${serviceName} (${clientName})"`

#### `backend/README.md`
- Updated description from Westhill Nails & Spa → Lumière Med Spa

### 7.2 Backend — NEW FILES

#### `backend/src/routes/conversation.routes.js` ← ★ NEW
- Exposes `POST /api/conversations/archive`
- Validates `date` (YYYY-MM-DD), `source`, `archivedBy` body fields
- Protected by JWT `authenticateToken`

### 7.3 n8n Workflows — MODIFIED

#### `glowassist-receptionist-v2.json`
| What | Old Value | New Value |
|---|---|---|
| AI system prompt | Westhill Nails & Spa (Canada) | Lumière Med Spa (full services, prices, address, staff) |
| Services Info Tool description | Westhill Nails | Lumière Med Spa |
| Memory key | `whatsapp-westhill-nails` | `whatsapp-lumiere-medspa` |
| Session key | `whatsapp-westhill-{{from}}` | `whatsapp-lumiere-{{from}}` |
| Non-text reply message | Westhill branding + westhillnails.ca | Lumière Med Spa + (555) 784-2301 |
| Collect User Details prompts | Generic text, no prices | Real services with prices ($45–$480) |
| Reply Confirm Booking message | Westhill address, static payment | Lumière address, dynamic payment from session |
| API Trigger Cancel URL | `https://your-express-backend.onrender.com/api/...` | `={{$env.BACKEND_API_URL}}/api/...` |
| Reply Cancel Confirm | Westhill branding | Lumière Med Spa branding |
| Reply Status Info | Westhill branding | Lumière Med Spa + address |
| Reply Cancel Missing | Westhill branding | Lumière Med Spa branding |

#### `whatsapp-reminders-and-conv-logger.json`
| What | Old Value | New Value |
|---|---|---|
| 24h reminder message | Westhill Nails & Spa | Lumière Med Spa + 📍 45 Blossom Avenue, Suite 200 |
| 2h reminder message | Westhill Nails & Spa + generic location | Lumière Med Spa + real address |

### 7.4 Environment Files — UPDATED

| File | Status | Changes |
|---|---|---|
| `backend/.env` | Updated | DATABASE_URL (pgbouncer port 6543), NODE_ENV=production, all Google OAuth, N8N_URL, FRONTEND_URL |
| `backend/src/.env` | Updated | Mirror of backend/.env (was empty template before) |
| `frontend/.env.production` | Updated | Clean production: VITE_API_BASE_URL, VITE_N8N_WEBHOOK_URL |
| `n8n-workflows/.env` | Updated | BACKEND_API_URL, all OAuth, JWT, Supabase, all production URLs |
| Root `.env` | Updated | Full production stack + Gemini AI keys |

---

## 8. Environment Variables Reference

### Backend (Render)
```env
PORT=3001
NODE_ENV=production
DATABASE_URL="postgresql://postgres:<password>@db.<project>.supabase.co:6543/postgres?pgbouncer=true"
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
JWT_SECRET=<64-char-hex-secret>
FRONTEND_URL=https://fe.zenithflow.in
N8N_URL=https://n8n.zenithflow.in
GOOGLE_CLIENT_ID=<google_oauth_client_id>
GOOGLE_CLIENT_SECRET=<google_oauth_client_secret>
GOOGLE_REDIRECT_URI=https://be.zenithflow.in/auth/google/callback
GOOGLE_REFRESH_TOKEN=<google_refresh_token>
```

> ⚠️ `PORT` on Render is auto-injected. Setting it to 3001 in .env is fine since Render overrides it.

### n8n (Settings → Environment Variables)
```env
BACKEND_API_URL=https://be.zenithflow.in
BACKEND_JWT_TOKEN=<jwt_signed_with_JWT_SECRET_expires_365d>
```

> Generate BACKEND_JWT_TOKEN:
> ```bash
> node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({sub:'n8n-service',role:'service'}, '<JWT_SECRET>', {expiresIn:'365d'}))"
> ```

### Frontend (Vite build env)
```env
VITE_API_BASE_URL=https://be.zenithflow.in
VITE_API_URL=https://be.zenithflow.in
VITE_N8N_WEBHOOK_URL=https://n8n.zenithflow.in
```

---

## 9. Authentication Flow (n8n → Backend)

```
n8n HTTP Request Node
  → Header: Authorization: Bearer $env.BACKEND_JWT_TOKEN
  → Backend middleware/auth.js
  → jwt.verify(token, JWT_SECRET)
  → If valid: req.user = { sub: 'n8n-service', role: 'service' }
  → Route handler runs
```

**Development bypass:** Token `development-token-glowassist` is accepted when `NODE_ENV !== 'production'`.

---

## 10. WhatsApp Integration

| Parameter | Value |
|---|---|
| Phone Number ID | `1093698253829228` |
| WhatsApp Business Account ID | `969984912295396` |
| Webhook (n8n) | `https://n8n.zenithflow.in/webhook/<id>` |
| Meta App Verify Token | Set in Meta Developer Console |

---

## 11. Working Hours Logic (backend/src/utils/appointment.utils.js)

```
Monday–Saturday : 9:00 AM – 7:00 PM  (09:00–19:00 = 540–1140 minutes)
Sunday           : 10:00 AM – 5:00 PM (10:00–17:00 = 600–1020 minutes)
```

Conflict resolution: If a slot is taken, `getAvailableSuggestions` searches forward in 30-min intervals and returns the next 3 available slots within working hours.

---

## 12. Deployment URLs

| Service | URL |
|---|---|
| Backend API | `https://be.zenithflow.in` |
| Frontend CRM | `https://fe.zenithflow.in` |
| n8n Instance | `https://n8n.zenithflow.in` |
| Supabase | `https://ogjkuemmhtpkoghooyri.supabase.co` |

---

## 13. Known Issues / Notes

1. **`BACKEND_JWT_TOKEN` must be manually generated** and added to n8n environment variables. See Section 8.
2. **`walk_in` booking source** exists in `frontend/src/constants/app.constants.ts` BOOKING_SOURCE_LABELS but is absent from DB CHECK constraint — display-only, not breaking.
3. **`whatsapp-ai-booking-integration.json`** is the old deprecated workflow. Do not use it. The active workflow is `glowassist-receptionist-v2.json`.
4. **Google Calendar events** are created in the timezone `Asia/Kolkata (IST)`. If the clinic moves timezones, update `calendar.js`.
5. **Supabase connection uses pgBouncer** (port `6543`). Do not use port `5432` in production as it bypasses the connection pool.
