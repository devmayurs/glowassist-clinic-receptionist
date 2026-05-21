# GlowAssist — Production Deployment Reference

> Stack: React (Vite) · Express.js · Supabase (PostgreSQL) · n8n · Google Calendar
> Domain: zenithflow.in | Subdomains: fe.zenithflow.in · be.zenithflow.in · n8n.zenithflow.in

---

## TABLE OF CONTENTS

1. [Deployment Options](#deployment-options)
2. [Backend Environment Variables](#backend-environment-variables)
3. [Frontend Environment Variables](#frontend-environment-variables)
4. [n8n Environment Variables](#n8n-environment-variables)
5. [Google Calendar Setup](#google-calendar-setup)
6. [Supabase Database Setup](#supabase-database-setup)
7. [Option A — GCP VM Deployment](#option-a--gcp-vm-deployment)
8. [Option B — Render + Vercel Deployment](#option-b--render--vercel-deployment)
9. [Post-Deployment Verification](#post-deployment-verification)

---

## DEPLOYMENT OPTIONS

| Option | Frontend | Backend | Difficulty | Cost |
|--------|----------|---------|------------|------|
| A – GCP VM (same as n8n) | Nginx static files | PM2 + Nginx reverse proxy | Medium | Free (existing VM) |
| B – Render + Vercel | Vercel | Render Web Service | Easy | Free tier / $7/mo |

**Recommendation:** Use Option B (Render + Vercel) — no SSH needed, auto SSL, auto deploy on git push.

---

## BACKEND ENVIRONMENT VARIABLES

File: `backend/.env` (on server) or set in Render dashboard

```env
# ─── Server ───────────────────────────────────────────────────────────────────
PORT=3001
NODE_ENV=production

# ─── Supabase ─────────────────────────────────────────────────────────────────
SUPABASE_URL=https://ogjkuemmhtpkoghooyri.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key-from-dashboard>

# Use port 6543 (connection pooler) for production — avoids connection exhaustion
DATABASE_URL=postgresql://postgres:MK2018thatsit!@db.ogjkuemmhtpkoghooyri.supabase.co:6543/postgres?pgbouncer=true

# ─── JWT Authentication ────────────────────────────────────────────────────────
# IMPORTANT: Generate a fresh secret for production:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=f3a8b2756d1e4c8520b7f6ea92437e15d86127e4e095a6b7d8c9e2b10a293c4e

# ─── CORS — Frontend origin ───────────────────────────────────────────────────
FRONTEND_URL=https://fe.zenithflow.in
# If using Vercel before custom domain:
# FRONTEND_URL=https://glowassist.vercel.app

# Allow n8n to call the backend too
N8N_URL=https://n8n.zenithflow.in

# ─── Google Calendar OAuth2 ───────────────────────────────────────────────────
# See "Google Calendar Setup" section below for how to get these values
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=https://be.zenithflow.in/auth/google/callback
GOOGLE_REFRESH_TOKEN=<your-google-refresh-token>
```

---

## FRONTEND ENVIRONMENT VARIABLES

File: `frontend/.env.production` (committed to git — only public VITE_ vars, no secrets)

```env
# ─── Backend API ──────────────────────────────────────────────────────────────
VITE_API_BASE_URL=https://be.zenithflow.in
VITE_API_URL=https://be.zenithflow.in

# ─── n8n Webhook Base URL ─────────────────────────────────────────────────────
VITE_N8N_WEBHOOK_URL=https://n8n.zenithflow.in
```

> If you deploy backend to Render first (before custom domain), temporarily set:
> VITE_API_BASE_URL=https://glowassist-backend.onrender.com

---

## N8N ENVIRONMENT VARIABLES

Set these in `/home/<user>/.n8n/.env` on your GCP VM (or wherever n8n is running).

```env
# ─── n8n Server ───────────────────────────────────────────────────────────────
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.zenithflow.in/

# ─── Encryption Key ───────────────────────────────────────────────────────────
# Used to encrypt stored credentials. Generate ONCE and never change:
#   node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
N8N_ENCRYPTION_KEY=<your-48-char-hex-key>

# ─── n8n Database ─────────────────────────────────────────────────────────────
# Option A: Store workflows in Supabase Postgres (recommended — survives VM restarts)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=db.ogjkuemmhtpkoghooyri.supabase.co
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=MK2018thatsit!
DB_POSTGRESDB_SCHEMA=n8n
DB_POSTGRESDB_SSL_ENABLED=true

# Option B: SQLite (n8n default — stored on VM disk, lost if VM is recreated)
# DB_TYPE=sqlite

# ─── n8n Dashboard Auth ───────────────────────────────────────────────────────
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<strong-password-min-12-chars>

# ─── Execution Settings ───────────────────────────────────────────────────────
EXECUTIONS_PROCESS=main
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

# ─── Timezone (IST for India) ─────────────────────────────────────────────────
GENERIC_TIMEZONE=Asia/Kolkata

# ─── Backend API Reference (use in n8n HTTP Request nodes as {{ $env.BACKEND_API_URL }})
BACKEND_API_URL=https://be.zenithflow.in

# ─── WhatsApp Business API (if applicable) ────────────────────────────────────
# WHATSAPP_TOKEN=<your-meta-whatsapp-access-token>
# WHATSAPP_PHONE_NUMBER_ID=<your-phone-number-id>
# WHATSAPP_VERIFY_TOKEN=<your-custom-verify-token>
```

### Generate Backend JWT Token for n8n HTTP Request nodes

Run this in the backend folder on your local machine:

```bash
cd "d:\Mayur\n8n projects\clinic receptionist\backend"
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId: 'n8n-service', role: 'admin', email: 'n8n@glowassist.co' },
  'YOUR_JWT_SECRET_HERE',
  { expiresIn: '365d' }
);
console.log(token);
"
```

### Store the Token in n8n as a Credential (Best Practice)

1. n8n Dashboard → **Settings → Credentials → New Credential**
2. Type: **Header Auth**
3. Set:
   - Header Name: `Authorization`
   - Header Value: `Bearer <paste token here>`
4. In every HTTP Request node that calls the backend:
   - **Authentication → Header Auth → select your credential**

### Update n8n HTTP Request Nodes for Production

In any workflow that calls the Express backend, update the URL from:
- `http://localhost:3001/api/...` → `https://be.zenithflow.in/api/...`

---

## GOOGLE CALENDAR SETUP

The Google Calendar integration is **fully implemented** in the backend. Every appointment create/reschedule/cancel automatically syncs to Google Calendar. You just need to provide the 4 OAuth credentials.

### What the integration does:
| Backend Action | Google Calendar Effect |
|----------------|----------------------|
| POST /api/appointments | Creates calendar event with client name, phone, service, notes |
| PUT /api/appointments/:id/reschedule | Updates event start/end time (preserves duration) |
| PUT /api/appointments/:id/cancel | Deletes the calendar event |

> Note: If Google credentials are missing/wrong, appointments still save to Supabase — Google sync failure is non-blocking.

---

### Step 1 — Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click the project dropdown → **New Project**
3. Name: `GlowAssist` → Create
4. Go to **APIs & Services → Library**
5. Search **Google Calendar API** → click it → **Enable**

---

### Step 2 — Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. User Type: **External** → Create
3. Fill in:
   - App name: `GlowAssist CRM`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue** through all steps
5. On **Test users** step: click **Add Users** → add the Gmail account that owns your clinic calendar
6. Save

---

### Step 3 — Create OAuth2 Credentials

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
2. Application type: **Web application**
3. Name: `GlowAssist Backend`
4. Under **Authorized redirect URIs**, click Add URI and add both:
   ```
   http://localhost:3001/auth/google/callback
   https://be.zenithflow.in/auth/google/callback
   ```
5. Click **Create**
6. A popup shows your credentials — copy and save:
   - **Client ID** → this is your `GOOGLE_CLIENT_ID`
   - **Client Secret** → this is your `GOOGLE_CLIENT_SECRET`

---

### Step 4 — Get the Refresh Token (One-Time Setup)

Run this in your backend folder to generate the authorization URL:

```bash
cd "d:\Mayur\n8n projects\clinic receptionist\backend"

node -e "
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  'PASTE_YOUR_CLIENT_ID_HERE',
  'PASTE_YOUR_CLIENT_SECRET_HERE',
  'http://localhost:3001/auth/google/callback'
);
const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar']
});
console.log('\\nVisit this URL in your browser:');
console.log(url);
"
```

1. Copy the URL printed in terminal
2. Open it in a browser — **log in with the Google account that owns your clinic calendar**
3. Click Allow/Approve
4. The browser will redirect to `http://localhost:3001/auth/google/callback?code=XXXXX`
5. **Copy the `code` value** from the URL (everything after `code=` and before `&`)

Now exchange the code for the refresh token:

```bash
node -e "
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  'PASTE_YOUR_CLIENT_ID_HERE',
  'PASTE_YOUR_CLIENT_SECRET_HERE',
  'http://localhost:3001/auth/google/callback'
);
oauth2Client.getToken('PASTE_THE_CODE_HERE').then(r => {
  console.log('\\nYour GOOGLE_REFRESH_TOKEN:');
  console.log(r.tokens.refresh_token);
}).catch(e => console.error('Error:', e.message));
"
```

The printed value is your `GOOGLE_REFRESH_TOKEN`. Save it — you only do this once.

---

### Step 5 — Set the 4 Environment Variables

Add these to your backend `.env` (on GCP VM or Render dashboard):

```env
GOOGLE_CLIENT_ID=<from Step 3>
GOOGLE_CLIENT_SECRET=<from Step 3>
GOOGLE_REDIRECT_URI=https://be.zenithflow.in/auth/google/callback
GOOGLE_REFRESH_TOKEN=<from Step 4>
```

---

### Timezone Note

The calendar service is configured for **Asia/Kolkata (IST)**. A booking at 10:00 AM will appear as **10:00 AM IST** on your Google Calendar. This is already fixed in `backend/src/services/calendar.js`.

---

## SUPABASE DATABASE SETUP

### Step 1 — Run the Full Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ogjkuemmhtpkoghooyri
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `database/schema.sql` from this project and paste the entire file contents
5. Click **Run** (green button)

This creates all 7 tables, indexes, RLS policies, and seeds default data. Safe to run multiple times.

**Tables created:**

| Table | Purpose |
|-------|---------|
| `clients` | WhatsApp and CRM client profiles |
| `services` | Treatments with price and duration (used by Google Calendar) |
| `staff` | Technicians and practitioners |
| `appointments` | Bookings with Google Calendar event ID reference |
| `payments` | Payment ledger for revenue analytics |
| `crm_live_chats` | AI vs human agent chat routing tracker |
| `appointment_logs` | Full audit history of every status change |

---

### Step 2 — Run the Booking Source Migration

In **SQL Editor → New Query**, run:

```sql
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_booking_source_check;
ALTER TABLE clients ADD CONSTRAINT clients_booking_source_check
  CHECK (booking_source IN ('whatsapp_ai', 'manual_crm', 'live_chat', 'instagram'));

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_booking_source_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_booking_source_check
  CHECK (booking_source IN ('whatsapp_ai', 'manual_crm', 'live_chat', 'instagram'));
```

---

### Step 3 — Replace Demo Services with Your Real Services

In **SQL Editor → New Query**, run (adjust names, prices, durations to match your clinic):

```sql
-- Clear demo services first
DELETE FROM services;

-- Insert your real services
INSERT INTO services (name, price, duration_minutes) VALUES
  ('Gel Manicure', 45.00, 45),
  ('Luxury Pedicure', 60.00, 60),
  ('Nail Extensions', 85.00, 75),
  ('Nail Art', 30.00, 30),
  ('Waxing', 25.00, 20)
ON CONFLICT (name) DO UPDATE
  SET price = EXCLUDED.price,
      duration_minutes = EXCLUDED.duration_minutes;
```

> IMPORTANT: `duration_minutes` is used by Google Calendar to calculate the event end time. Set it correctly for each service.

---

### Step 4 — Replace Demo Staff with Your Real Staff

In **SQL Editor → New Query**, run:

```sql
-- Clear demo staff first
DELETE FROM staff;

-- Insert your real technicians
INSERT INTO staff (full_name, role) VALUES
  ('Technician Name 1', 'manicurist'),
  ('Technician Name 2', 'nail_artist')
ON CONFLICT DO NOTHING;
```

---

### Step 5 — Collect Your API Keys and Connection Strings

Go to **Settings → API** in the Supabase Dashboard:

| Variable | Where to find it | Value |
|----------|-----------------|-------|
| `SUPABASE_URL` | Settings → API → Project URL | `https://ogjkuemmhtpkoghooyri.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role key | Already in backend .env |
| `DATABASE_URL` (dev) | Settings → Database → Connection string → URI | port 5432 |
| `DATABASE_URL` (prod) | Settings → Database → Connection pooling → URI | port 6543 + `?pgbouncer=true` |

> NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend. It bypasses all RLS policies.

---

### Step 6 — Verify RLS is Active

Go to **Authentication → Policies** in the Supabase Dashboard.

You should see policies on all 7 tables:
- `service_role` key → bypasses RLS automatically (your backend uses this ✅)
- `anon` role → blocked from all sensitive tables ✅
- `authenticated` role → full CRUD (for future Supabase Auth users if needed)

---

### Step 7 — (Optional) Store n8n Workflows in Supabase

If you want n8n to store its own data (workflows, credentials, execution history) in Supabase instead of SQLite, create a dedicated schema:

```sql
CREATE SCHEMA IF NOT EXISTS n8n;
```

Then set the n8n DB env vars (see n8n section above) with `DB_POSTGRESDB_SCHEMA=n8n`.

This keeps n8n data separate from your app tables in the `public` schema.

---

## OPTION A — GCP VM DEPLOYMENT

### A1. DNS at Hostinger

Log in to https://hpanel.hostinger.com → Domains → zenithflow.in → DNS/Nameservers

Add two A records (same IP as your existing n8n VM):

| Type | Name | Points To | TTL |
|------|------|-----------|-----|
| A | `be` | `<YOUR_GCP_VM_EXTERNAL_IP>` | 300 |
| A | `fe` | `<YOUR_GCP_VM_EXTERNAL_IP>` | 300 |

Find VM IP: GCP Console → Compute Engine → VM Instances → External IP column.

Verify after 5-30 min:
```bash
nslookup be.zenithflow.in
nslookup fe.zenithflow.in
```

---

### A2. Prepare the VM

SSH into your VM:
```bash
ssh <user>@<GCP_VM_EXTERNAL_IP>
```

Install Node.js 20 and PM2 if not already installed:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
node -v   # confirm v20.x
```

---

### A3. Upload Your Code

**Option 1 — Clone from GitHub (recommended):**
```bash
cd /home/<user>
git clone https://github.com/<your-username>/glowassist-clinic-receptionist.git glowassist
```

**Option 2 — SCP from Windows (PowerShell):**
```powershell
scp -r "d:\Mayur\n8n projects\clinic receptionist\backend" <user>@<IP>:/home/<user>/glowassist/backend
scp -r "d:\Mayur\n8n projects\clinic receptionist\frontend" <user>@<IP>:/home/<user>/glowassist/frontend
```

---

### A4. Deploy Backend with PM2

```bash
cd /home/<user>/glowassist/backend
npm install --production
nano .env                     # paste backend env vars from top of this file
pm2 start server.js --name "glowassist-backend" --env production
pm2 save
pm2 startup                   # run the command it prints to enable auto-start on reboot
```

Verify:
```bash
pm2 status
curl http://localhost:3001/api/health
# Expected: {"status":"success","message":"Clinic Receptionist Backend API is active and healthy",...}
```

---

### A5. Build and Serve the Frontend

```bash
cd /home/<user>/glowassist/frontend
npm install
# .env.production is already committed to the repo with correct URLs
npm run build
# Creates /home/<user>/glowassist/frontend/dist/
```

---

### A6. Configure Nginx

**Backend server block:**
```bash
sudo nano /etc/nginx/sites-available/be.zenithflow.in
```
Paste:
```nginx
server {
    listen 80;
    server_name be.zenithflow.in;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Frontend server block:**
```bash
sudo nano /etc/nginx/sites-available/fe.zenithflow.in
```
Paste (replace `<user>` with your actual username):
```nginx
server {
    listen 80;
    server_name fe.zenithflow.in;

    root /home/<user>/glowassist/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/be.zenithflow.in /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/fe.zenithflow.in /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### A7. SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d be.zenithflow.in -d fe.zenithflow.in
# Choose option 2: Redirect HTTP to HTTPS
```

Certbot auto-renews. Verify:
```bash
curl https://be.zenithflow.in/api/health
```

---

### A8. GCP Firewall

Confirm ports 80 and 443 are open:
GCP Console → VPC Network → Firewall → check rules allow `tcp:80` and `tcp:443`.
(These should already be open since n8n works over HTTPS.)

---

### A9. Update Code After Deploy

```bash
cd /home/<user>/glowassist
git pull origin main

# Restart backend
cd backend && npm install --production && pm2 restart glowassist-backend

# Rebuild frontend
cd ../frontend && npm install && npm run build
# Nginx serves from dist/ automatically — no restart needed
```

---

## OPTION B — RENDER + VERCEL DEPLOYMENT

### B1. Deploy Backend to Render

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Name:** `glowassist-backend`
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free (cold starts after 15 min) or Starter $7/mo (always on)

4. Add Environment Variables in Render dashboard:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `SUPABASE_URL` | `https://ogjkuemmhtpkoghooyri.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `<your-supabase-service-role-key-from-dashboard>` |
| `DATABASE_URL` | `postgresql://postgres:MK2018thatsit!@db.ogjkuemmhtpkoghooyri.supabase.co:6543/postgres?pgbouncer=true` |
| `JWT_SECRET` | `<generate new 64-char hex>` |
| `FRONTEND_URL` | `https://fe.zenithflow.in` |
| `N8N_URL` | `https://n8n.zenithflow.in` |
| `GOOGLE_CLIENT_ID` | `<from Google Cloud Console>` |
| `GOOGLE_CLIENT_SECRET` | `<from Google Cloud Console>` |
| `GOOGLE_REDIRECT_URI` | `https://be.zenithflow.in/auth/google/callback` |
| `GOOGLE_REFRESH_TOKEN` | `<generated via token exchange>` |

5. Deploy → your backend URL: `https://glowassist-backend.onrender.com`

---

### B2. Add Custom Domain to Render (be.zenithflow.in)

1. Render → Your Service → Settings → Custom Domains → Add Domain: `be.zenithflow.in`
2. Render gives you a CNAME target (e.g., `glowassist-backend.onrender.com`)
3. Hostinger hPanel → DNS → Add:

| Type | Name | Points To | TTL |
|------|------|-----------|-----|
| CNAME | `be` | `glowassist-backend.onrender.com` | 300 |

SSL is automatic. Your backend: `https://be.zenithflow.in`

---

### B3. Deploy Frontend to Vercel

1. Go to https://vercel.com → Add New Project
2. Import your GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add Environment Variables in Vercel dashboard:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://be.zenithflow.in` |
| `VITE_API_URL` | `https://be.zenithflow.in` |
| `VITE_N8N_WEBHOOK_URL` | `https://n8n.zenithflow.in` |

5. Deploy → your frontend URL: `https://glowassist.vercel.app`

---

### B4. Add Custom Domain to Vercel (fe.zenithflow.in)

1. Vercel → Your Project → Settings → Domains → Add: `fe.zenithflow.in`
2. Vercel gives you a CNAME target (e.g., `cname.vercel-dns.com`)
3. Hostinger hPanel → DNS → Add:

| Type | Name | Points To | TTL |
|------|------|-----------|-----|
| CNAME | `fe` | `cname.vercel-dns.com` | 300 |

SSL is automatic. Your frontend: `https://fe.zenithflow.in`

---

### B5. Auto-Deploy on Git Push

With both services connected to GitHub:
- Push to `main` branch → Render auto-redeploys backend
- Push to `main` branch → Vercel auto-redeploys frontend

No manual steps needed for future updates.

---

## POST-DEPLOYMENT VERIFICATION

Run through this after every fresh deployment.

### 1. Backend Health Check
```bash
curl https://be.zenithflow.in/api/health
```
Expected:
```json
{"status":"success","message":"Clinic Receptionist Backend API is active and healthy","timestamp":"...","uptime":...}
```

### 2. CORS Check
```bash
curl -I \
  -H "Origin: https://fe.zenithflow.in" \
  -H "Authorization: Bearer <your-jwt>" \
  https://be.zenithflow.in/api/dashboard/summary
```
Should NOT return CORS error. Should return 200.

### 3. Frontend
- [ ] Open https://fe.zenithflow.in in browser
- [ ] Dashboard/login page loads correctly
- [ ] Client list loads (confirms API calls reaching be.zenithflow.in)
- [ ] Appointments list loads

### 4. Google Calendar
- [ ] Book a test appointment via the CRM frontend
- [ ] Open Google Calendar on the account used for OAuth
- [ ] Confirm the appointment event appeared at the correct IST time
- [ ] Reschedule it → confirm event time updated in Google Calendar
- [ ] Cancel it → confirm event deleted from Google Calendar

### 5. n8n Workflows
- [ ] Test a webhook trigger at https://n8n.zenithflow.in/webhook/...
- [ ] Check HTTP Request nodes in workflows return 200 from be.zenithflow.in
- [ ] Test end-to-end: WhatsApp message → n8n → backend → Supabase + Google Calendar

### 6. Supabase
- [ ] Dashboard → Table Editor → appointments table has a record from Step 4
- [ ] Dashboard → Table Editor → appointment_logs shows audit entry
- [ ] Dashboard → Logs → no repeated connection errors from backend

---

## QUICK REFERENCE — ENV VARS SUMMARY

### Backend (all required for production)
```
PORT                        = 3001
NODE_ENV                    = production
SUPABASE_URL                = https://ogjkuemmhtpkoghooyri.supabase.co
SUPABASE_SERVICE_ROLE_KEY   = <your-supabase-service-role-key-from-dashboard>
DATABASE_URL                = postgresql://...supabase.co:6543/postgres?pgbouncer=true
JWT_SECRET                  = <64-char hex>
FRONTEND_URL                = https://fe.zenithflow.in
N8N_URL                     = https://n8n.zenithflow.in
GOOGLE_CLIENT_ID            = <from Google Cloud Console>
GOOGLE_CLIENT_SECRET        = <from Google Cloud Console>
GOOGLE_REDIRECT_URI         = https://be.zenithflow.in/auth/google/callback
GOOGLE_REFRESH_TOKEN        = <from one-time token exchange>
```

### Frontend (public, safe to commit)
```
VITE_API_BASE_URL           = https://be.zenithflow.in
VITE_API_URL                = https://be.zenithflow.in
VITE_N8N_WEBHOOK_URL        = https://n8n.zenithflow.in
```

### n8n (on GCP VM)
```
N8N_HOST                    = 0.0.0.0
N8N_PORT                    = 5678
N8N_PROTOCOL                = https
WEBHOOK_URL                 = https://n8n.zenithflow.in/
N8N_ENCRYPTION_KEY          = <48-char hex — generate once, never change>
DB_TYPE                     = postgresdb
DB_POSTGRESDB_HOST          = db.ogjkuemmhtpkoghooyri.supabase.co
DB_POSTGRESDB_PORT          = 5432
DB_POSTGRESDB_DATABASE      = postgres
DB_POSTGRESDB_USER          = postgres
DB_POSTGRESDB_PASSWORD      = MK2018thatsit!
DB_POSTGRESDB_SCHEMA        = n8n
DB_POSTGRESDB_SSL_ENABLED   = true
N8N_BASIC_AUTH_ACTIVE       = true
N8N_BASIC_AUTH_USER         = admin
N8N_BASIC_AUTH_PASSWORD     = <strong password>
EXECUTIONS_PROCESS          = main
EXECUTIONS_DATA_SAVE_ON_ERROR = all
EXECUTIONS_DATA_SAVE_ON_SUCCESS = all
GENERIC_TIMEZONE            = Asia/Kolkata
BACKEND_API_URL             = https://be.zenithflow.in
```

---

*GlowAssist Clinic Receptionist — Production Reference | Updated May 2026*
