# GlowAssist AI — React CRM Dashboard Frontend

This is the React + TypeScript + Vite + Zustand CRM administration dashboard for the Westhill Nails & Spa receptionist team. It connects to the Express.js API server to monitor and manage appointments, clients, and automated WhatsApp metrics.

---

## 🎨 Design System & Aesthetics

* **Material UI (MUI v5) Framework:** The styling is powered by a premium Material UI system utilizing a custom luxury theme configured in `src/styles/theme.ts`.
* **Luxury Color Scheme:** Built with a sophisticated color palette featuring **Luxury Rose (`#C9847A`)** and **Gold Accents (`#B8965A`)** set against soft ivory background surfaces for an upscale, premium spa experience.
* **Component-Driven Layouts:** Built with highly interactive, responsive, and tactile MUI components (`Card`, `Drawer`, `Dialog`, `Timeline`, etc.) featuring subtle micro-animations and smooth transitions.
* **Dynamic Analytics:** Real-time channel and treatment metrics represented via highly responsive Recharts elements.

---

## 📂 Frontend Directory Structure & Single Responsibility Principle (SRP)

The frontend codebase is decoupled according to the **Single Responsibility Principle (SRP)**:

```
frontend/
├── src/
│   ├── apis/            # Modularized HTTP clients pointing to global Axios interceptor
│   │   ├── axiosInstance.ts # Unified Axios setup with offline catch & JWT headers
│   │   ├── client.api.ts       # Client-related REST API requests
│   │   ├── appointment.api.ts  # Appointment scheduling REST API requests
│   │   └── dashboard.api.ts    # KPI & dashboard aggregation queries
│   ├── components/      # Common UI components & shared layouts
│   │   ├── layout/      # Sidebar, SidebarStats, Header, ChatPanel
│   │   └── ui/          # Toast banners, ModeToggle, CallBanner
│   ├── constants/       # App-wide configuration, operating hours, package listings
│   ├── hooks/           # Page-level search filters, drawers, and modal state hooks
│   │   ├── useDashboard.ts     # Real-time dashboard KPI hooks & fallbacks
│   │   ├── useClients.ts       # Clients CRM filtering, drawer toggles & API calls
│   │   ├── useAppointments.ts  # Calendars, rescheduling, & cancellation forms hook
│   │   └── useChat.ts          # Live Chat interactive simulator state hook
│   ├── pages/           # Lightweight coordinator containers (no inline APIs or state)
│   │   ├── AnalyticsPage.tsx   # Dashboard page shell (delegates to sub-components)
│   │   ├── ClientsPage.tsx     # Clients page shell (delegates to sub-components)
│   │   ├── AppointmentsPage.tsx # Appointments page shell (delegates to sub-components)
│   │   ├── CallLogsPage.tsx    # Phone call records registry
│   │   ├── PackagesPage.tsx    # Treatment promos & loyalty programs list
│   │   ├── Appointments/components/ # SRP sub-components for scheduling (Calendar, RescheduleDialog, etc.)
│   │   ├── Clients/components/      # SRP sub-components for Clients CRM (Filters, Table, HistoryDrawer)
│   │   └── Dashboard/components/    # SRP sub-components for analytics (Kpis, Charts, Upcoming List)
│   ├── services/        # Business logic rules (operating hours, promotional rules)
│   ├── store/           # Zustand global state management
│   ├── styles/          # Custom Material UI theme definition
│   ├── types/           # Core TypeScript Interfaces (Client, Appointment, KPI)
│   ├── utilities/       # Independent helper functions (date formats, currency formats)
│   ├── App.tsx          # Router mounter and MUI Theme provider wrap
│   ├── main.tsx         # DOM entrypoint
│   └── index.css        # Custom CSS animations and global scrollbar styles
├── .env                 # API URL configurations (gitignored)
├── package.json         # Front-end packages
└── vite.config.ts       # Vite bundler configurations
```

---

## 🛠️ Step-by-Step Installation

### Step 1: Install Dependencies
Open your terminal in the `frontend` folder and install the node packages:
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables
Create a file named `.env` in the root of the `frontend/` directory:
```bash
touch .env
```

Copy the following parameters and save the file:
```env
# URL where your Express Backend API is listening
VITE_API_BASE_URL=http://localhost:3001

# Webhook endpoint URL of your local or production n8n workflow trigger
VITE_N8N_WEBHOOK_URL=http://localhost:5678
```

### Step 3: Run the Development Server
```bash
npm run dev
```
*Open **http://localhost:5173** inside your web browser to view the live dashboard.*

---

## 📺 Dashboard Screen & Pages Breakdown

### 📊 1. Dashboard (`AnalyticsPage.tsx`)
* **KPI Metric Cards:**
  * **Total Clients:** Total count of profiles registered.
  * **Total Appointments:** Completed and scheduled slots count.
  * **AI Bookings:** Bookings automatically registered by n8n.
  * **Manual Bookings:** Bookings manually added by the salon staff.
  * **Live Chat Bookings:** Bookings handled by human agents over the chat interface.
  * **Total Revenue:** Sum of all service prices where the payment status is 'paid'.
  * **Pending Payments:** Count of upcoming slots marked as 'pending'.
* **Charts:** A **Recharts PieChart** representing booking channels (AI vs. Manual vs. Live Chat) and a **Recharts BarChart** demonstrating treatment trends.
* **Auto-Refresh:** Automatically refreshes all metrics every 60 seconds. Supports manual click-to-refresh.
* **Staging Fallback:** Falls back gracefully to derived data if the backend API is temporarily offline.

---

### 👥 2. Clients Page (`ClientsPage.tsx`)
* **Fuzzy Searches:** Rapid searches by client name or phone numbers.
* **Dropdown Filters:** Filter by Client Type (`first_time`, `regular`, `vip`) or Booking Source.
* **Slide-In History Modal:** Click any client's **View History** button to trigger a slide-in modal demonstrating their entire history of appointments (dates, prices, notes, and statuses) fetched from `/api/clients/:id`.

---

### 📅 3. Appointments Page (`AppointmentsPage.tsx`)
* **Calendar View:** Custom month-grid calendar displaying scheduled appointments. Color-coded by status. Click any slot to slide open the detail card.
* **Table View:** Grid list displaying all metadata columns. Hovering over a row displays action shortcut buttons.
* **Detail Card:** Sliding sidebar presenting extensive client parameters and notes.
* **Reschedule Dialog:** Opens a date-picker and time slot dropdown making a `PUT /api/appointments/:id/reschedule` call on submit.
* **Cancellation Dialog:** Form requiring a reason textarea before posting `PUT /api/appointments/:id/cancel` to update the database and calendar.

---

## ⚙️ Build & Bundle for Production

To create a highly optimized production asset bundle:
```bash
npm run build
```
Vite will run TypeScript checks and bundle the HTML, CSS, and JS assets into the **`dist/`** directory. You can preview this production build locally using:
```bash
npm run preview
```
