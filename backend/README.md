# GlowAssist AI — Express.js Backend API Service

This is the secure Node.js & Express.js REST API service for **Lumière Med Spa** — GlowAssist AI Clinic Receptionist. It serves as the bridge between the n8n WhatsApp conversational flows, the Supabase database layer, and the Google Calendar work environment.

---

## ⚡ Key Features

* **Anti-Double-Booking Engine:** Validates new bookings and reschedules against existing scheduled slots. If taken, it searches forward in 30-minute intervals and returns the next 3 available slots.
* **Working Hours Verification:** Restricts appointments to salon operating hours: Monday-Saturday (9:00 AM – 7:00 PM) and Sunday (10:00 AM – 5:00 PM).
* **Two-Way Google Calendar Sync:** Inserts, reschedules, and cancels Google Calendar events. Stores the `google_calendar_event_id` in Supabase for state tracking.
* **JWT Access Security:** Protects routes using secure JWT access verification.
* **Fuzzy Filtering & Pagination:** Robust database queries using PostgreSQL ILIKE matching for clients, names, phone numbers, and statuses.

---

## 📂 Backend Directory Structure

```
backend/
├── src/
│   ├── config/          # Configurations (Supabase client & Google Calendar OAuth)
│   ├── controllers/     # Controller handlers (Clients, Appointments, Dashboard)
│   ├── middleware/      # Security, Error Handling, and JWT auth checking
│   ├── routes/          # REST Endpoint Route bindings (/api/...)
│   ├── services/        # Business Logic & Google Calendar syncing
│   ├── utils/           # Time slot formatting & working hours calculations
│   └── app.js           # Express App instantiation and middleware mounting
├── .env                 # Environment variables file (gitignored)
├── package.json         # Dependency configuration
└── server.js            # Entrypoint listener
```

---

## 🛠️ Step-by-Step Installation

### Step 1: Install Dependencies
Open your terminal inside the `backend` folder and install all npm modules:
```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables
Create a file named `.env` in the root of the `backend/` directory:
```bash
touch .env
```

Copy the following template and fill in your actual credentials:

```env
PORT=3001
NODE_ENV=development

# 1. Supabase Credentials
SUPABASE_URL=https://your-project-id.supabase.co
# service_role key is required to bypass RLS policies during server queries
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_jwt

# 2. Google Developer Console OAuth2 Credentials
# Get these by creating an OAuth 2.0 Web Application client in Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
# Extract this by completing the OAuth2 consent screen flow once
GOOGLE_REFRESH_TOKEN=1//0-your_long_lived_refresh_token
GOOGLE_CALENDAR_ID=primary

# 3. JWT Security Secret
# Generate a secure 64-character hex key (e.g. using 'openssl rand -hex 32')
JWT_SECRET=f3a8b2756d1e4c8520b7f6ea92437e15d86127e4e095a6b7d8c9e2b10a293c4e

# 4. CORS Allowed Origin
FRONTEND_URL=http://localhost:5173
```

### Step 3: Run the Server

#### For Development (with nodemon hot-reload):
```bash
npm run dev
```
*The server will watch for file changes and auto-restart.*

#### For Production:
```bash
npm start
```

You can verify the backend is healthy by visiting:
👉 **[http://localhost:3001/api/health](http://localhost:3001/api/health)**

---

## 🔌 API Reference Guide

All endpoints (except `/api/health`) require a valid JWT Bearer Token inside the request header:
`Authorization: Bearer <your_jwt_token>`

### 👤 1. Clients REST API

* **Create Client:** `POST /api/clients`
  * Body: `{ "fullName": "Sarah Johnson", "phoneNumber": "+1234567890", "email": "sarah@gmail.com", "notes": "Prefers Lisa" }`
* **Get All Clients (with search & page filters):** `GET /api/clients`
  * Query parameters: `search=Sarah`, `clientType=vip`, `bookingSource=whatsapp_ai`, `page=1`, `limit=10`
* **Get Client Detail & Historical Bookings:** `GET /api/clients/:id`
  * *Returns Client record joined with their complete list of past and upcoming appointments.*
* **Update Client Metadata:** `PUT /api/clients/:id`
  * Body: `{ "clientType": "vip", "notes": "VIP gel extension client" }`

---

### 📅 2. Appointments REST API

* **Create Booking:** `POST /api/appointments`
  * Body: `{ "clientId": "uuid", "serviceName": "Gel Manicure Deluxe", "appointmentDate": "2026-06-01", "appointmentTime": "14:00:00", "paymentMethod": "unpaid", "paymentStatus": "pending" }`
  * *Notes: If a conflict is detected, the API will reject the request with code 409 conflict and return `suggestions: ["14:30:00", "15:00:00", "15:30:00"]`.*
* **Reschedule Booking:** `PUT /api/appointments/:id/reschedule`
  * Body: `{ "newDate": "2026-06-02", "newTime": "15:00:00", "changedBy": "admin_crm" }`
* **Cancel Booking:** `PUT /api/appointments/:id/cancel`
  * Body: `{ "reason": "family event", "changedBy": "whatsapp_ai" }`
* **List Appointments (with date range & status filters):** `GET /api/appointments`
  * Query parameters: `startDate=2026-06-01`, `endDate=2026-06-30`, `status=scheduled`, `paymentStatus=pending`

---

### 📊 3. Dashboard KPI API

* **Get Real-Time KPI Stats:** `GET /api/dashboard/stats`
  * *Returns aggregated metrics including Total Revenue, AI/Manual booking ratios, pending payment counts, and the next 5 scheduled upcoming appointments joined with client details.*

---

## 🔒 Security & Middleware Details
1. **Helmet.js:** Mounts standard security HTTP response headers to block XSS and clickjacking attempts.
2. **CORS:** Restricts requests strictly to your production `FRONTEND_URL` origin (permits all local origins in development mode).
3. **Rate Limiting:** Protects resources from brute force attacks by limiting each IP address to a maximum of 100 requests per 15-minute window.
4. **Validation Middleware:** `express-validator` runs validation rules (E.164 phone formats, UUID keys, ISO dates) before forwarding payloads to controllers.
