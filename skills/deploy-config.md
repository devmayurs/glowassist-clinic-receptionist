# Deployment Configuration Standards — Clinic Receptionist

## Deployment Strategy

The project follows a two-phase deployment strategy:

1. **Current Phase**: Managed services (free-tier) for fast MVP delivery
2. **Future Phase**: Self-hosted VPS with Coolify for full control and lower long-term cost

---

# Current Phase — Managed Services (Free Tier)

## Frontend (Vercel)

### Deployment Flow
```txt
GitHub Push
   ↓
Vercel Auto Deploy
   ↓
Production Frontend URL
```

### Environment Variables
```env
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Steps
1. Push frontend code to GitHub
2. Login to Vercel
3. Import GitHub repository
4. Configure environment variables
5. Deploy — Vercel auto-builds and deploys

---

## Backend (Render)

### Deployment Flow
```txt
GitHub Push
   ↓
Render Auto Build
   ↓
Backend API Deployment
```

### Environment Variables
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=<64-char-secret>
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
OPENAI_API_KEY=sk-...
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Steps
1. Push backend code to GitHub
2. Create new Web Service in Render
3. Connect GitHub repository
4. Build command: `npm install && npm run build`
5. Start command: `npm run start`
6. Add environment variables
7. Deploy

---

## Database (Supabase)

### Responsibilities
- PostgreSQL database hosting
- Built-in authentication (Supabase Auth)
- REST APIs and Realtime support
- Row Level Security (RLS)
- File storage for documents, audio, images

### Environment Variables
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Security
- Enable Row Level Security on all tables
- Service Role Key used only on backend (never in frontend)
- Use Supabase Auth for authentication (not custom JWT)

---

## n8n (Render — Docker)

### Dockerfile
```dockerfile
FROM n8nio/n8n
EXPOSE 5678
```

### Environment Variables
```env
N8N_HOST=your-n8n.onrender.com
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://your-n8n.onrender.com
GENERIC_TIMEZONE=Asia/Kolkata
```

### Deployment Flow
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

# Future Phase — Self-Hosted (VPS + Coolify)

## Goal
Move entire infrastructure to self-hosted VPS for:
- Full control
- Lower long-term cost
- Better scalability
- No vendor lock-in

---

## Recommended VPS Providers
- Hetzner
- Hostinger VPS
- DigitalOcean
- Contabo

---

## Self-Hosted Stack

| Service | Technology |
|---|---|
| Infrastructure Manager | Coolify |
| Reverse Proxy | Traefik / Nginx |
| Frontend | Docker Container |
| Backend | Docker Container |
| n8n | Docker Container |
| Database | PostgreSQL (Supabase Self-Hosted or managed) |
| SSL | Let's Encrypt |

---

## Architecture
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

## Docker Compose Setup (Future)

### Production Compose (docker-compose.yml)
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
      - PORT=5000
    volumes:
      - ./backend/logs:/app/logs
    networks:
      - clinic-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    networks:
      - clinic-network
    depends_on:
      - backend

  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - GENERIC_TIMEZONE=Asia/Kolkata
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - WEBHOOK_URL=${N8N_WEBHOOK_URL}
    volumes:
      - n8n-data:/home/node/.n8n
      - ./n8n/workflows:/workflows
    networks:
      - clinic-network

networks:
  clinic-network:
    driver: bridge

volumes:
  n8n-data:
```

---

## Environment Management
- Production: `.env` file on server, permissions `600`
- Staging: `.env.staging` with staging-specific values
- Local: `.env.local` (gitignored)
- Example `.env.example`:
  ```env
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
  OPENAI_API_KEY=sk-...
  JWT_SECRET=<64-char-secret>
  CORS_ORIGIN=https://your-frontend.com
  N8N_USER=admin
  N8N_PASSWORD=secure_password
  N8N_ENCRYPTION_KEY=<64-char-key>
  N8N_WEBHOOK_URL=https://your-n8n-domain.com
  ```

---

## Secrets Handling
- Never commit secrets to git
- Use environment variables or Docker secrets for production
- Generate strong secrets: `openssl rand -hex 32` (64 char hex)
- Rotate secrets quarterly
- Store API keys in password manager, not in code
- n8n credentials stored in n8n credential store, not env vars

---

## Backup Strategy
- Database: Supabase automated backups (managed) or pg_dump for self-hosted
- n8n: Export workflows regularly, backup n8n data volume
- Code: GitHub repositories
- Retention: daily backups 7 days, weekly 4 weeks, monthly 1 year

---

## Monitoring Setup
| Purpose | Tool |
|---|---|
| Logs | Render Logs (current) / Docker logs (future) |
| Database Monitoring | Supabase Dashboard |
| Error Tracking | Sentry |
| Uptime Monitoring | UptimeRobot |

---

## Scaling Strategy

### Current Stage (Free Tier)
```
Frontend → Vercel
Backend → Render
Database → Supabase
Automation → n8n on Render
```

### Growth Stage
Upgrade to paid tiers if required.

### Production Scale Stage
Move to VPS + Coolify architecture.

---

## Rollback Strategy
- Keep last 3 Docker images tagged: `backend:latest`, `backend:v1.0.0`, `backend:v0.9.0`
- Rollback: `docker-compose down && docker-compose up -d backend:previous_tag`
- Database: Supabase provides point-in-time recovery
- n8n: Export workflows before changes, import previous version if needed

---

## CI/CD Pipeline

### Frontend (Vercel)
```txt
GitHub Push
   ↓
Vercel Auto Build
   ↓
Production Deploy
```

### Backend (Render)
```txt
GitHub Push
   ↓
Render Auto Build
   ↓
Backend Deploy
```

### n8n (Render Docker)
```txt
GitHub Push
   ↓
Docker Build
   ↓
Render Deploy
```
