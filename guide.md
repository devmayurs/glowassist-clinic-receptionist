# Clinic Receptionist — Step-by-Step Execution Guide

This guide contains pre-written, highly optimized developer prompts for each implementation step. When you are ready to execute a step, copy the prompt below and paste it directly into the chat!

---

## 🗂️ Table of Prompts
1. [Prompt 1: Supabase Database Setup](#-prompt-1-supabase-database-setup-step-1)
2. [Prompt 2: Express Backend APIs](#-prompt-2-express-backend-apis-step-2)
3. [Prompt 3: Google Calendar Integration](#-prompt-3-google-calendar-integration-step-3)
4. [Prompt 4: n8n Workflows Config JSON](#-prompt-4-n8n-workflows-config-json-step-4)
5. [Prompt 5: Frontend CRM Dashboard & Schedulers](#-prompt-5-frontend-crm-dashboard--schedulers-step-5)
6. [Prompt 6: Real-Time Stats & Dashboard Sync](#-prompt-6-real-time-stats--dashboard-sync-step-6)
7. [Prompt 7: Cron Reminders & Message Logging](#-prompt-7-cron-reminders--message-logging-step-7)

---

## 💾 Prompt 1: Supabase Database Setup (Step 1)

Copy and paste this prompt to execute the database schemas setup:

```text
Please execute Step 1 of the task.md: Database Schema Setup.
Based on the d:/Mayur/n8n projects/clinic receptionist/database/plan.md file, write the complete, ready-to-run SQL schema file in "database/schema.sql" that includes:
1. The "clients" table with its columns, indexes on phone_number, and seed constraints.
2. The "appointments" table with its references, Google Calendar event mappings, statuses, and indices.
3. The "crm_live_chats" table for CRM tracking.
4. The auxiliary tables: "services", "payments", "staff", and "appointment_logs".
5. Complete Row Level Security (RLS) policies for anonymized bypass and authenticated staff accesses.
6. A detailed SQL seed script inserting at least 5 standard salon services (e.g., Manicure, Pedicure, Gel extensions, Botox, Lip filler) with price and duration values.
Mark this step as complete in task.md once the files are written.
```

---

## 💻 Prompt 2: Express Backend APIs (Step 2)

Copy and paste this prompt to initialize the backend dependencies, Express app, routes, validations, and slots conflict algorithms:

```text
Please execute Step 2 of the task.md: Express Backend APIs.
Based on the backend/plan.md, implement the entire Express backend codebase:
1. Create "backend/package.json" and install express, cors, helmet, dotenv, @supabase/supabase-js, express-validator, express-rate-limit.
2. Create "backend/server.js" and "backend/src/app.js" setting up standard security middlewares, cors limits, and error handlers.
3. Implement "backend/src/config/supabase.js" using @supabase/supabase-js with secure env variables.
4. Implement "backend/src/middleware/auth.js" verifying JWT bearer tokens.
5. Create "backend/src/routes/client.routes.js" and "backend/src/controllers/client.controller.js" covering POST /api/clients, GET /api/clients, PUT /api/clients/:id, and GET /api/clients/:id (with history).
6. Create "backend/src/routes/appointment.routes.js" and "backend/src/controllers/appointment.controller.js" covering GET /api/appointments and POST /api/appointments.
7. Implement business logic:
   - "Working Hours check": Mon-Sat 9AM-7PM, Sun 10AM-5PM.
   - "Time Slot validation check": searches if date/time conflicts exist; if yes, searches next 3 available 30-min slots and returns them in suggestions array.
Add all necessary express-validator validations. Verify TypeScript is not required (as plans specifyapp.js and standard JS file structure). Mark items in task.md when finished!
```

---

## 🔑 Prompt 3: Google Calendar Integration (Step 3)

Copy and paste this prompt to set up Google Calendar service integration:

```text
Please execute Step 3 of the task.md: Google Calendar API Integration.
Based on backend/plan.md and global plan.md:
1. Implement "backend/src/config/google.js" handling Google OAuth2 Client configurations and Refresh Token exchanges.
2. Implement "backend/src/services/calendar.js" containing:
   - createEvent(appointmentData): formats appointment date, client name, service, notes, and booking source, pushes to Google Calendar via API, and returns calendar event metadata.
   - updateEvent(eventId, newDateTime): reschedules event.
   - cancelEvent(eventId): deletes event.
3. Integrate this service into the "POST /api/appointments", "PUT /api/appointments/:id/reschedule", and "PUT /api/appointments/:id/cancel" routes in the Express backend, ensuring the Google Event ID is cleanly synchronized into the Supabase database.
Mark task.md items when finished!
```

---

## 🔄 Prompt 4: n8n Workflows Config JSON (Step 4)

Copy and paste this prompt to configure n8n nodes:

```text
Please execute Step 4 of the task.md: n8n Workflow Configuration.
Based on n8n/plan.md and global plan.md, inspect existing workflow files under "n8n-workflows/workflows/glowassist-receptionist.json" and:
1. Design the "Intent Detection Node" prompt classification.
2. Write the JSON structure or JavaScript function configurations for the "Collect User Details Node" questionnaire state machine that checks which of the 8 required fields are missing and prompts the next question.
3. Configure the HTTP Request nodes calling the new client sync, appointment check, booking, rescheduling, and cancellation APIs.
4. Document the Google Calendar node mappings and metadata update actions.
Write these structures and updates into "n8n-workflows/workflows/" or create detailed workflow JSON snippets that I can import directly. Mark task.md items when completed!
```

---

## 🎨 Prompt 5: Frontend CRM Dashboard & Schedulers (Step 5)

Copy and paste this prompt to build the React CRM panels, client grids, FullCalendar pages, and modals:

```text
Please execute Step 5 of the task.md: Frontend CRM Pages.
Based on frontend/plan.md and global plan.md:
1. Create the Axios client configs in "frontend/src/api/" linking to process.env base URL and attaching JWT tokens.
2. Build the "Dashboard" view at "frontend/src/pages/Dashboard/Dashboard.tsx" with:
   - The 7 real-time KPI card widgets (Total Clients, Total Appointments, AI Bookings, Manual Bookings, Live Chat Bookings, Total Revenue, Pending Payments).
   - Booking source ratio pie charts.
3. Build the "Clients" view at "frontend/src/pages/Clients/Clients.tsx" containing search engines, filters, and Client History Modal details.
4. Build the "Appointments" view at "frontend/src/pages/Appointments/Appointments.tsx" containing toggleable FullCalendar scheduler, MUI DataGrid tables, reschedule control modals, and cancel confirmation modals.
Make sure all UI related components compile beautifully. Mark task.md items when finished!
```

---

## 📊 Prompt 6: Real-Time Stats & Dashboard Sync (Step 6)

Copy and paste this prompt to aggregate stats and link them to the CRM widgets:

```text
Please execute Step 6 of the task.md: Dashboard Metrics Integration.
Based on plans:
1. Implement the Express endpoint "GET /api/dashboard/stats" in the backend.
2. Write SQL aggregations using the Supabase client inside the backend service to calculate total clients, total appointments, total revenue, pending payments, and booking source ratios.
3. Update the frontend CRM Dashboard using TanStack Query / React Query to fetch data from "/api/dashboard/stats" and feed it to the card widgets, ensuring real-time statistics updates.
Mark task.md items when complete!
```

---

## ⏰ Prompt 7: Cron Reminders & Message Logging (Step 7)

Copy and paste this prompt to implement automated WhatsApp alerts and audit logs:

```text
Please execute Step 7 of the task.md: Automation & WhatsApp Reminders.
Based on n8n/plan.md and global plan.md:
1. Build the n8n scheduled Cron workflows to query upcoming appointments:
   - "24-Hour Reminder": runs daily, checks appointments exactly 24 hours away, and sends automated WhatsApp alert notifications.
   - "2-Hour Reminder": runs hourly, checks appointments 2 hours away, and sends alert notifications.
2. Create the "AI Conversation Logging" webhook node in n8n that POSTs WhatsApp message histories and bot transcripts directly to Supabase to keep audit logs.
Write these workflow node configurations or JSON scripts into the repository. Mark task.md items when finished!
```
