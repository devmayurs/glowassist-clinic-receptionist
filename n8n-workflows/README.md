# GlowAssist AI — n8n Automation Workflows

This directory houses the importable n8n workflow canvas schemas that orchestrate the AI receptionist, conversational booking flows, and automated WhatsApp reminder crons.

---

## 📂 Available Workflows

The workflows are stored inside the `workflows/` directory:

1. **[`glowassist-receptionist-v2.json`](file:///d:/Mayur/n8n%20projects/clinic%20receptionist/n8n-workflows/workflows/glowassist-receptionist-v2.json):**
   * **Workflow Name:** `GlowAssist AI — Med Spa & Salon Receptionist (WhatsApp Booking V2)`
   * **Purpose:** Handles the real-time WhatsApp conversation trigger. Classifies user intents (inquiry, book, reschedule, cancel, check status), runs the conversational questionnaire to collect client info, checks time slot conflicts via the Express backend, creates Google Calendar events, and syncs appointment metadata.
2. **[`whatsapp-reminders-and-conv-logger.json`](file:///d:/Mayur/n8n%20projects/clinic%20receptionist/n8n-workflows/workflows/whatsapp-reminders-and-conv-logger.json):**
   * **Workflow Name:** `GlowAssist — WhatsApp Appointment Reminders & Conversation Logger`
   * **Purpose:** Runs independent schedule crons. Sends personalized WhatsApp reminder templates at the 24-hour and 2-hour thresholds, and runs a daily 3:00 AM cron to archive conversation logs to the database.

---

## 🛠️ Step-by-Step Workspace Import

### Step 1: Boot your n8n Instance
Start your local n8n server:
```bash
n8n start
```
*Navigate to your local dashboard: **http://localhost:5678**.*

### Step 2: Import the Workflow Files
For each of the two workflows:
1. Click the **Workflows** folder icon in the left-hand navigation sidebar.
2. Click **Add Workflow** or **Create a Workflow**.
3. In the top-right corner, click the **three dots menu (`...`)** and select **Import from File**.
4. Upload `glowassist-receptionist-v2.json` and `whatsapp-reminders-and-conv-logger.json` respectively.

---

## ⚙️ Required Credentials Configuration

Once imported, click into the nodes to configure your secure integration credentials:

1. **WhatsApp Business Cloud API:**
   * **Nodes:** `WhatsApp Trigger1`, `Send 24-Hour WhatsApp Reminder`, `Send 2-Hour WhatsApp Reminder`.
   * **Action:** Link your Facebook Developer WhatsApp accounts. Ensure the `phoneNumberId` fits your registered phone number ID.
2. **Google Gemini / OpenAI Chat Model:**
   * **Node:** `Google Gemini Chat Model` (or your preferred LLM provider).
   * **Action:** Provide your Gemini API keys (`GEMINI_API_KEY`) to enable the conversational AI.
3. **HTTP Requests Backend API:**
   * **Nodes:** `Fetch 24-Hour Appointments`, `Fetch 2-Hour Appointments`, `Log 24h Reminder Sent`, `Archive AI Conversation Log`.
   * **Action:** Configure these nodes to reference your backend variables.

---

## 🔑 n8n System Environment Variables

Configure these global environment keys inside your n8n runtime (e.g., Docker compose variables or Coolify host environment):

```env
# The URL pointing to your deployed Express backend API service
BACKEND_API_URL=https://your-backend-api-url.onrender.com

# A secure JWT Bearer Token generated using the backend's JWT_SECRET
# This token authorizes n8n requests against the secure Express REST controllers
BACKEND_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_signed_jwt_token
```

---

## 🔄 How the Questionnaire State Machine Works

Inside the booking workflow, the **Collect User Details Node** checks the client's conversation variables. If any of the following 8 fields are empty in the n8n state data, the AI is prompted to ask the client for that specific missing field:

1. **Full Name:** Customer's first and last name.
2. **Phone Number:** Customer's WhatsApp phone number.
3. **Service Name:** Dynamic beauty treatment selection.
4. **Preferred Date:** Aligns slots to YYYY-MM-DD.
5. **Preferred Time:** Checks slot conflict timing (HH:MM).
6. **Payment Method:** Standardizes billing preferences.
7. **Is Payment Completed?:** Syncs 'paid' vs 'pending'.
8. **Additional Notes:** Prefers specific technician or service instructions.
