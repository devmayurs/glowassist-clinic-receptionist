const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const clientRoutes = require('./routes/client.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// 0. Trust Proxy — required for Render, Vercel, Nginx, Cloudflare and any reverse proxy.
//    Without this, express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
//    '1' means trust exactly one hop (the Render/Nginx load balancer in front of us).
app.set('trust proxy', 1);

// 1. Security Middleware
app.use(helmet());

// 2. CORS configuration (allowing standard CRM dashboard port 3000/5173/etc, or wildcard in development)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
  process.env.N8N_URL,              // n8n server calling backend (set in .env)
  'https://n8n.zenithflow.in'       // hardcoded fallback for n8n production domain
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// 3. Rate Limiter (max 100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Apply rate limiter to all API endpoints
app.use('/api', apiLimiter);

// 4. Request Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Active Uptime Health Check (essential for Render active ping service)
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Clinic Receptionist Backend API is active and healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 6. Routes mount
app.use('/api/clients', clientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 7. Fallback for undefined routes (404 Handler)
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Resource not found: ${req.originalUrl}`
  });
});

// 8. Global Error Handler (500 Handler)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message || err);
  
  const statusCode = err.status || 500;
  const response = {
    status: 'error',
    message: err.message || 'An internal server error occurred'
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

module.exports = app;
