# Clinic Receptionist — Express Backend Plan

This plan outlines the architecture, routes, business logic, security policies, and deployment steps for the custom Node.js/Express.js backend server.

---

## 🏛️ Folder Structure (Phase 7)

We implement a clean controller-service-router pattern with input validation and middleware-driven security:

```txt
backend/
├── src/
│   ├── config/          # Supabase client, Google API config, WhatsApp credentials
│   ├── controllers/     # Incoming HTTP requests parsing and JSON routing
│   ├── db/              # SQL migrations, database seeders, direct DB helpers
│   ├── middleware/      # JWT auth, security, error handling, rate limiting
│   ├── routes/          # API endpoint routes declarations (/api/...)
│   ├── services/        # Business logic, Google Calendar integrations, slot algorithms
│   ├── utils/           # Time conversions, standard response formats, logging
│   ├── validators/      # JSON schemas & Express-validator rules for clients/bookings
│   └── app.js           # Express App initialization and server hookups
├── .env                 # Environment variables (gitignored)
├── package.json         # Dependency configuration
└── server.js            # Entrypoint listener
```

---

## ⚙️ Environment Variables (Phase 8)

Example of the secure `.env` file that must be loaded on the Render host:

```env
PORT=3001
NODE_ENV=production

# Supabase Configurations
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Google Calendar OAuth2 Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-key
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=1//0-refresh-token-from-oauth2-consent

# Security & WhatsApp Settings
JWT_SECRET=super_secret_64_character_hex_key_for_signing_tokens
WHATSAPP_TOKEN=EAAG...
WHATSAPP_PHONE_ID=1023456789...
```

---

## 🔌 Required Backend APIs (Phase 9)

### 👤 1. Client Endpoints
Used to sync CRM lists and handle client checks.

- **Create Client**
  - `POST /api/clients`
  - *Payload*: `{ "fullName": "Sarah Johnson", "phoneNumber": "+1234567890", "email": "sarah@gmail.com", "notes": "VIP Client" }`
- **Get All Clients**
  - `GET /api/clients`
  - *Query Filters*: `search`, `clientType`, `bookingSource`, `page`, `limit`
- **Update Client**
  - `PUT /api/clients/:id`
  - *Payload*: `{ "clientType": "regular", "notes": "Prefers gel extensions" }`
- **Client Details & History**
  - `GET /api/clients/:id`
  - *Returns*: Client profile plus their entire historical list of appointments.

### 📅 2. Appointment Endpoints
Manages bookings, reschedules, and cancellations.

- **Create Appointment**
  - `POST /api/appointments`
  - *Payload*: `{ "clientId": "uuid", "serviceName": "Manicure", "date": "2026-06-01", "time": "14:00:00", "paymentMethod": "cash" }`
- **Reschedule Appointment**
  - `PUT /api/appointments/:id/reschedule`
  - *Payload*: `{ "newDate": "2026-06-02", "newTime": "15:00:00" }`
- **Cancel Appointment**
  - `PUT /api/appointments/:id/cancel`
  - *Payload*: `{ "reason": "client requested" }`
- **Get Appointments**
  - `GET /api/appointments`
  - *Query Filters*: `startDate`, `endDate`, `status`, `paymentStatus`

### 📊 3. Dashboard Endpoints
Aggregates metrics for the CRM widgets.

- **Get Dashboard Stats**
  - `GET /api/dashboard/stats`
  - *Returns JSON*:
    ```json
    {
      "totalClients": 142,
      "totalAppointments": 425,
      "aiBookingsCount": 312,
      "manualBookingsCount": 85,
      "liveChatBookingsCount": 28,
      "totalRevenue": 14250.00,
      "pendingPaymentsCount": 18,
      "completedBookingsCount": 350
    }
    ```

---

## ⚡ Business Logic & Validation rules

### 1. Working Hours Validation (Phase 13.2)
Bookings are allowed only within these ranges:
- **Monday to Saturday**: 9:00 AM – 7:00 PM (09:00:00 to 19:00:00)
- **Sunday**: 10:00 AM – 5:00 PM (10:00:00 to 17:00:00)
- *Rejection Response*: Custom messaging informing the customer of standard hours.

### 2. Time Slot Validation & Anti-Double-Booking (Phase 13.1)
Before booking/rescheduling:
1. Query `appointments` to check if a booking exists on `appointment_date` at `appointment_time` (with `status` = 'scheduled' or 'rescheduled').
2. If the slot is taken, search for the next three available alternative slots (in 30-minute intervals) and return them:
   - *Example*: `{ "status": "conflict", "message": "3:00 PM is already booked.", "suggestions": ["3:30 PM", "4:00 PM", "4:30 PM"] }`

---

## 📅 Google Calendar & OAuth2 Integration (Phase 5)

The service layer handles Google Calendar events:

### Event Payload Parameters:
- **Title**: `Westhill Nails Appointment - [Client Name]`
- **Description**:
  ```text
  Client: Sarah Johnson
  Phone: +1234567890
  Service: Gel Manicure
  Payment: Card (paid)
  Notes: Prefers technician Lisa.
  Source: WhatsApp AI
  ```
- **Time**: Aligned with the `appointment_date` and calculated `end_time` (start_time + service duration).

### Data Synchronization:
1. Create/Update calendar event using Google Calendar API.
2. Retrieve Google `event.id`, `start.dateTime`, `end.dateTime`, and `status`.
3. Store this data in Supabase under `google_calendar_event_id` in the `appointments` table.
4. On reschedule or cancel, use `google_calendar_event_id` to update or delete the event.

---

## 🔒 Security Plan (Phase 14)

1. **JWT Authentication**: Middleware intercepts all `/api` routes (except health checks & webhooks). Header must provide: `Authorization: Bearer <token>`.
2. **Role-Based Access**: Restrict edit capabilities for clients and metrics strictly to authenticated accounts.
3. **Rate Limiting**: Express-rate-limit configured: max 100 requests per 15 minutes per IP.
4. **Input Validation**: Schema validation using `express-validator` to sanitize phone numbers, format ISO dates, and escape HTML characters.

---

## 🚀 Deployment Plan on Render (Phase 15)

1. **Create Web Service**: Connect your GitHub repository to Render.
2. **Environment Variables**: Populate all values from Phase 8 into Render's Environment panel.
3. **Build Settings**:
   - Build Command: `npm install && npm run build` (or `npm install` for vanilla Express)
   - Start Command: `node src/server.js`
4. **Uptime checks**: Set up active health endpoints `/api/health` returning `200 OK` for Render's active ping services.
