# Deployment Plan Documentation

## Project Infrastructure Overview

This project follows a modern cloud-based deployment architecture using free-tier services for frontend hosting, backend hosting, database management, automation workflows, and future self-hosting scalability.

---

# Technology Stack

| Layer | Technology | Hosting Platform |
|---|---|---|
| Frontend | React + TypeScript + Vite | Vercel |
| Backend | Node.js + Express + TypeScript | Render |
| Database | PostgreSQL | Supabase |
| Authentication | Supabase Auth | Supabase |
| Automation Workflows | n8n | Render |
| Future Infrastructure | Docker + VPS + Coolify | Self Hosted |

---

# System Architecture

```txt
Users
   ↓
Frontend (Vercel)
   ↓
Backend API (Render)
   ↓
Supabase Database

n8n (Render)
   ↓
External Services / AI APIs / Automation
```

---

# Frontend Deployment Plan

## Technology

- React
- TypeScript
- Vite

## Hosting Platform

- Vercel

## Why Vercel

- Best platform for React and Vite applications
- Free SSL certificates
- Automatic GitHub deployments
- Global CDN
- Fast build and deployment process
- Easy environment variable management

---

# Frontend Deployment Flow

```txt
GitHub Push
   ↓
Vercel Auto Deploy
   ↓
Production Frontend URL
```

---

# Frontend Environment Variables

```env
VITE_API_BASE_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

# Frontend Recommended Folder Structure

```txt
frontend/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   └── App.tsx
├── .env
├── vite.config.ts
└── package.json
```

---

# Frontend Deployment Steps

## Step 1

Push frontend project to GitHub.

---

## Step 2

Login to Vercel.

---

## Step 3

Import GitHub repository.

---

## Step 4

Configure environment variables.

---

## Step 5

Deploy application.

---

# Backend Deployment Plan

## Technology

- Node.js
- Express.js
- TypeScript

## Hosting Platform

- Render

## Why Render

- Supports persistent backend servers
- Easy Node.js deployment
- Supports Docker containers
- Free tier available
- Simple CI/CD integration
- Easy environment management

---

# Backend Deployment Flow

```txt
GitHub Push
   ↓
Render Auto Build
   ↓
Backend API Deployment
```

---

# Backend Environment Variables

```env
PORT=
NODE_ENV=
JWT_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
CORS_ORIGIN=
```

---

# Backend Recommended Folder Structure

```txt
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── validations/
│   └── app.ts
├── .env
├── tsconfig.json
└── package.json
```

---

# Backend API Structure

```txt
/api/auth
/api/users
/api/leads
/api/workflows
/api/ai
/api/webhooks
/api/notifications
```

---

# Backend Deployment Steps

## Step 1

Push backend project to GitHub.

---

## Step 2

Create new Web Service in Render.

---

## Step 3

Connect GitHub repository.

---

## Step 4

Configure build command.

```bash
npm install && npm run build
```

---

## Step 5

Configure start command.

```bash
npm run start
```

---

## Step 6

Add environment variables.

---

## Step 7

Deploy backend service.

---

# Database Setup Plan

## Database Provider

- Supabase

## Database Type

- PostgreSQL

---

# Why Supabase

- Free PostgreSQL hosting
- Built-in authentication
- REST APIs
- Realtime support
- Row Level Security
- File storage
- Easy React integration

---

# Supabase Responsibilities

## Authentication

- Login
- Signup
- Session handling
- Password reset

---

## Database Storage

- User data
- CRM records
- Leads
- Automation logs
- AI response logs
- Workflow data

---

## File Storage

- Documents
- Audio files
- Images
- Attachments

---

# Supabase Environment Variables

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

# Supabase Security Plan

## Enable Row Level Security

- Protect tables
- Restrict unauthorized access

---

## Use Service Role Key Only On Backend

- Never expose service role key to frontend

---

# n8n Deployment Plan

## Technology

- n8n Workflow Automation

## Hosting Platform

- Render

## Deployment Method

- Docker Deployment

---

# Why Use n8n

- Visual workflow automation
- API integrations
- AI automation
- Webhook support
- CRM automation
- WhatsApp/email workflows

---

# n8n Responsibilities

## AI Workflows

- OpenAI integrations
- AI receptionist flows
- Lead qualification
- Automated replies

---

## CRM Automation

- Lead creation
- Notifications
- Pipeline management

---

## External Integrations

- Twilio
- Gmail
- Slack
- WhatsApp
- Google Sheets

---

# n8n Dockerfile

```dockerfile
FROM n8nio/n8n

EXPOSE 5678
```

---

# n8n Environment Variables

```env
N8N_HOST=
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=
GENERIC_TIMEZONE=Asia/Kolkata
```

---

# n8n Recommended Folder Structure

```txt
n8n/
├── workflows/
├── credentials/
├── docker/
├── backups/
└── README.md
```

---

# n8n Deployment Flow

```txt
GitHub Push
   ↓
Docker Build
   ↓
Render Deployment
   ↓
Webhook Ready
```

---

# GitHub Repository Structure

```txt
project-root/
├── frontend/
├── backend/
├── n8n/
├── docs/
├── docker/
├── scripts/
└── README.md
```

---

# CI/CD Pipeline Plan

## Frontend CI/CD

```txt
GitHub Push
   ↓
Vercel Auto Build
   ↓
Production Deploy
```

---

## Backend CI/CD

```txt
GitHub Push
   ↓
Render Auto Build
   ↓
Backend Deploy
```

---

## n8n CI/CD

```txt
GitHub Push
   ↓
Docker Build
   ↓
Render Deploy
```

---

# Local Development Setup

## Frontend

```txt
http://localhost:5173
```

---

## Backend

```txt
http://localhost:5000
```

---

## n8n

```txt
http://localhost:5678
```

---

# Local Development Architecture

```txt
Frontend
   ↓
Backend API
   ↓
Supabase

n8n
   ↓
External Services
```

---

# Security Plan

## Frontend Security

- HTTPS only
- Public keys only
- Secure API communication

---

## Backend Security

- JWT authentication
- Request validation
- Rate limiting
- Helmet security
- CORS protection

---

## Database Security

- Row Level Security
- Secure credentials
- Backup management

---

## n8n Security

- Protected webhooks
- Authentication enabled
- Environment-based secrets

---

# Monitoring Plan

| Purpose | Tool |
|---|---|
| Logs | Render Logs |
| Database Monitoring | Supabase Dashboard |
| Error Tracking | Sentry |
| Uptime Monitoring | UptimeRobot |

---

# Backup Strategy

## Database Backup

- Supabase automated backups

---

## Workflow Backup

- Export n8n workflows regularly

---

## Code Backup

- GitHub repositories

---

# Future Self-Hosted Infrastructure Plan

## Goal

Move entire infrastructure to self-hosted VPS for:

- Full control
- Lower long-term cost
- Better scalability
- No vendor lock-in

---

# Future Self-Hosted Stack

| Service | Technology |
|---|---|
| Infrastructure Manager | Coolify |
| Reverse Proxy | Traefik / Nginx |
| Frontend | Docker Container |
| Backend | Docker Container |
| n8n | Docker Container |
| Database | PostgreSQL |
| SSL | Let's Encrypt |

---

# Future VPS Providers

## Recommended Providers

- Hetzner
- Hostinger VPS
- DigitalOcean
- Contabo

---

# Future Self-Hosted Architecture

```txt
Internet
   ↓
Coolify VPS
   ↓
Frontend Container
Backend Container
n8n Container
PostgreSQL Container
```

---

# Dockerization Plan

## Frontend

- Docker support planned

---

## Backend

- Node.js Docker container

---

## n8n

- Official Docker image

---

## Database

- PostgreSQL Docker container

---

# Scaling Strategy

## Current Stage

Use free-tier infrastructure.

```txt
Frontend → Vercel
Backend → Render
Database → Supabase
Automation → n8n on Render
```

---

## Growth Stage

Upgrade to paid tiers if required.

---

## Production Scale Stage

Move to VPS + Coolify architecture.

---

# Production Environment Variables Checklist

## Frontend

```env
VITE_API_BASE_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Backend

```env
PORT=
NODE_ENV=production
JWT_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
CORS_ORIGIN=
```

---

## n8n

```env
N8N_HOST=
WEBHOOK_URL=
N8N_PROTOCOL=https
GENERIC_TIMEZONE=Asia/Kolkata
```

---

# Recommended Initial Setup Order

## Phase 1

Setup GitHub repositories.

---

## Phase 2

Deploy frontend to Vercel.

---

## Phase 3

Deploy backend to Render.

---

## Phase 4

Configure Supabase database.

---

## Phase 5

Connect frontend + backend + Supabase.

---

## Phase 6

Deploy n8n to Render.

---

## Phase 7

Create automation workflows.

---

## Phase 8

Setup monitoring and backups.

---

# Final Recommended Architecture

```txt
Frontend:
Vercel

Backend:
Render

Database:
Supabase

Automation:
n8n on Render

Future Infrastructure:
Coolify + VPS
```

---

# Conclusion

This deployment architecture is optimized for:

- Free-tier startup deployment
- React frontend scalability
- Node.js backend hosting
- Workflow automation
- AI integrations
- Future self-hosting migration

The current stack allows fast MVP development with minimal DevOps complexity while keeping future scalability options open using Coolify and VPS infrastructure.
