# Clinic Receptionist — Frontend CRM Plan

This plan governs the React + TypeScript CRM dashboard frontend application for the salon management staff.

---

## 🎨 Technology Stack (Phase 10)

- **Framework**: React 18 + Vite (for fast local development and optimized bundle outputs)
- **Language**: TypeScript (strict type checking enabled)
- **UI Library**: Material UI (MUI) v5 (for modern widgets, tables, and calendars)
- **Data Fetching**: React Query / TanStack Query v5 (caching, auto-refreshing, and optimistic updates)
- **State Management**: Redux Toolkit (for global UI states, auth tokens, and search parameters)

---

## 🏛️ Folder Structure (Phase 7)

```txt
frontend/
├── public/
├── src/
│   ├── api/             # Axios client configurations and API fetch declarations
│   ├── assets/          # Static logos, icons, and landing images
│   ├── components/      # Common UI elements (Buttons, Inputs, Dialogs, Cards)
│   ├── hooks/           # Custom React hooks (useAuth, useAppointments, etc.)
│   ├── layouts/         # Shared Page layouts (Sidebar, Header, MainContainer)
│   ├── pages/           # Screen views:
│   │   ├── Dashboard/   # KPI metrics, grids, chart elements
│   │   ├── Clients/     # Customer list, history logs, search bars
│   │   └── Appointments/# Calendar, table grids, scheduler controls
│   ├── routes/          # Public, protected page routing definitions
│   ├── store/           # Redux slices, selectors, and middleware
│   ├── styles/          # Material UI custom theme configuration overrides
│   ├── types/           # TS Interfaces (Client, Appointment, Payment)
│   ├── utils/           # Time formatters, currency conversions
│   ├── App.tsx          # Router wraps, Redux providers, Query Client wraps
│   └── main.tsx         # Virtual DOM entrypoint
├── .env                 # Environment variables
├── vite.config.ts       # Vite config and plugins
└── package.json         # Libraries list
```

---

## ⚙️ Environment Variables (Phase 8)

Create a secure `.env` file at the root of `frontend/`:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 📺 CRM Pages & Core Widgets (Phase 10)

### 📊 1. Dashboard Page
Serves as the main analytics control panel.

#### Real-Time KPI Cards (Widgets)
- **Total Clients**: Aggregated customer count.
- **Total Appointments**: Completed and upcoming appointments.
- **AI Bookings**: Count of bookings automatically created by n8n.
- **Manual Bookings**: Booking logs manually set up by receptionist.
- **Live Chat Bookings**: Bookings secured via human agents over chat.
- **Total Revenue**: Aggregate sum of all 'paid' appointment prices.
- **Pending Payments**: Count of scheduled/completed bookings with 'pending' status.

#### visual Chart Grids
- **Booking Source Ratio**: Visual pie chart comparing WhatsApp AI vs. Live Chat vs. Manual entries.
- **Upcoming Schedule Overview**: Compact list of the next 5 upcoming appointments.

---

### 👥 2. Clients Page
Allows management and lookup of master customer profiles.

#### Interface Elements
- **Search Engine**: Fuzzy search by Client Name or Phone Number.
- **Category Filters**: Dropdowns for Client Type (`first_time`, `regular`, `vip`) and Booking Source.
- **Data Table (MUI DataGrid)**:
  - Columns: Name, Phone, Email, Client Type, Source, Total Bookings, Notes.
  - Action Button: **"View History"** opens a modal display showing all historical appointments (dates, services, payments, notes) for that specific client.

---

### 📅 3. Appointments Page
Serves as the main calendar scheduler interface.

#### Layout Selector Tabs
- **Calendar View**: Interactive calendar (using `@fullcalendar/react` or MUI Calendar) showing scheduled slots. Clicking an event displays client details and opens rescheduling controls.
- **Table View**: Comprehensive list format of all appointments.

#### Functional Filter Bars
- **Status Filters**: Tabs or checkboxes to filter by `scheduled`, `completed`, `cancelled`, `rescheduled`, `no_show`.
- **Payment Filters**: Dropdown filters for `pending`, `partial`, `paid`, `refunded`.

#### Operational Trigger Modals
- **Reschedule Dialog**: Date and time selector making a `PUT /api/appointments/:id/reschedule` call.
- **Cancel Dialog**: Cancel status update sending a `PUT /api/appointments/:id/cancel` call. Shows a text input to record the cancellation reason.

---

## 🔒 Security & API Integration Plan

1. **JWT Handshake**: On login, CRM retrieves a JWT token from backend. The token is stored securely in state and attached to all outgoing requests as: `Headers: { Authorization: Bearer <token> }`.
2. **Access Security**: Secure route redirects: if token expires, user is immediately redirected to `/login`.
3. **Data Sanitization**: Material UI widgets automatically escape html parameters to prevent XSS issues in input descriptions.

---

## 🚀 Deployment Plan on Vercel (Phase 15)

1. **Repository Setup**: Push the frontend directory as part of your Git repo.
2. **Vercel Settings**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Configure Variables**: Input `VITE_API_BASE_URL` pointing to your live Render backend URL.
4. **Instant CI/CD**: Every push to the `main` branch will trigger an auto-deployment on Vercel.
