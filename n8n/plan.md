# Clinic Receptionist — n8n Workflow Plan

This plan governs the implementation and adjustments of nodes in the local/production n8n workflow engine.

---

## 🏛️ Existing Workflow Isolation (Phase 1)

> [!IMPORTANT]
> **Core Constraints**:
> - DO NOT modify the existing vector store integrations.
> - DO NOT touch general salon question-answering pipelines (pricing, general info, or service hours FAQs).
> - ONLY intercept the message path after a booking, rescheduling, checking, or cancellation intent is identified.

---

## 🔌 New Nodes to Add (Phase 11)

To support automated bookings, we insert these 5 core nodes/sub-flows into the existing n8n canvas:

### 1. Intent Detection Node (Phase 2)
An AI Prompt classification node placed at the entry of the message router.
- **Goal**: Read incoming WhatsApp text and determine user intent.
- **Intent Options**:
  - `general_inquiry` (routes immediately to existing Vector Store AI logic)
  - `book_appointment` (routes to Questionnaire flow)
  - `reschedule_appointment` (routes to Reschedule flow)
  - `check_appointment` (routes to Database status lookup flow)
  - `cancel_appointment` (routes to Cancellation flow)

### 2. Collect User Details Node (Phase 3)
A memory-based state machine that dynamically checks which fields are already collected in n8n memory.
- **Required Fields**:
  1. Full Name
  2. Phone Number
  3. Service Name
  4. Preferred Date
  5. Preferred Time
  6. Payment Method (`cash`, `card`, `online`)
  7. Is Payment Completed? (`pending`, `paid`)
  8. Additional Notes
- **Behavior**: AI sequentially asks the *first* missing field.
  - *Example*: If date/time is missing: *"Sure! I can help you schedule. Please provide your full name."*

### 3. HTTP Request Node (Backend API Link)
Direct HTTP interfaces connecting n8n to our Express backend.
- **Requests**:
  - `POST /api/clients`: Sync customer details.
  - `GET /api/appointments`: Check for existing future appointments by client phone number.
  - `POST /api/appointments`: Send validated payload to register a new slot.
  - `PUT /api/appointments/:id/reschedule`: Post updated time variables.
  - `PUT /api/appointments/:id/cancel`: Post cancellation requests.

### 4. Google Calendar Node (Phase 5)
Official n8n Google Calendar integration node.
- **Actions**:
  - **Create Event**: Invoked for new bookings. Sets title, details, start/end date, and timezone.
  - **Update Event**: Invoked for reschedules using the saved `google_calendar_event_id`.
  - **Cancel Event**: Deletes or updates the calendar event status to `cancelled`.
- **Target Parameters**:
  - Title: `Westhill Nails Appointment - [Sarah Johnson]`
  - Description: Formatted client name, phone number, service name, payment method, payment status, notes, and booking source.

### 5. Supabase Sync / API Confirmation Node
Once Google Calendar completes and returns details, n8n invokes our API helper to patch `google_calendar_event_id` and Google calendar parameters directly into the Supabase appointment record, ensuring state synchronization.

---

## ⚙️ Detailed Workflow Execution Flow (Phase 12)

```txt
Incoming WhatsApp Message
           ↓
    [Intent Detection]
      ├─► general_inquiry ───────► (Route to existing AI Agent & Vector Store)
      ├─► book_appointment ──────► [Questionnaire Flow]
      │                              ├─► Details Incomplete: Ask next question via WhatsApp
      │                              └─► Details Complete: [Check Existing Appointment]
      │                                    ├─► Exist Found: AI informs user, initiates [Reschedule logic]
      │                                    └─► None Found: [Create Appointment API]
      │                                          ↓
      │                                    [Google Calendar Event Create]
      │                                          ↓
      │                                    [Supabase API Metadata Sync]
      │                                          ↓
      │                                    [Send WhatsApp Confirmation Message]
      │
      ├─► reschedule_appointment ─► Ask new Date/Time ──► [Google Calendar Event Update] ──► [Supabase Sync] ──► WhatsApp Confirm
      │
      └─► cancel_appointment ────► Request cancel confirmation ──► [Google Calendar Cancel] ──► [Supabase Sync] ──► WhatsApp Confirm
```

---

## 💡 Important Automation Features (Phase 13)

### 1. Reschedule Conflict Detection (Phase 4)
If an existing future appointment is detected during a new booking attempt:
- AI immediately alerts the client: *"I found an existing appointment already scheduled for you. With this new update, your previous appointment will now be rescheduled to the newly selected date and time."*
- Updates previous record status to `rescheduled` in Supabase, then triggers the calendar update nodes.

### 2. Time Slot Suggestions
If slot validation returns a conflict (3:00 PM is taken), n8n parses the `suggestions` array from the API response and prompts:
- *"I'm sorry, 3:00 PM is already booked. Would you prefer 3:30 PM, 4:00 PM, or 4:30 PM instead?"*

### 3. Automated WhatsApp Reminders (Phase 13.3)
Add an independent workflow with a **CRON Trigger Node** running daily:
- **24-Hour Reminder**: Queries appointments scheduled 24 hours from now. Sends WhatsApp message: *"Hi [Name], this is a reminder for your [Service] appointment tomorrow at [Time]."*
- **2-Hour Reminder**: Queries appointments starting in 2 hours. Sends: *"See you soon! Your [Service] appointment is in 2 hours at [Time]."*

### 4. AI Conversation Logging (Phase 13.5)
After each message round, a webhook node POSTs raw message text, sender information, and AI replies into a PostgreSQL audit logs schema for auditing and dashboard metrics processing.

---

## 🚀 Local & Production Deployments

1. **Local Development**: Runs at `http://localhost:5678`. Workflows saved in `./n8n-workflows/workflows/`.
2. **Production Engine**: n8n deployed inside a Render Docker Web Service or a self-hosted VPS under Coolify.
3. **Webhook Callback**: Configure Meta WhatsApp API webhook to point to the secure n8n production hook path: `https://your-n8n.onrender.com/webhook/chat-message-webhook`.
