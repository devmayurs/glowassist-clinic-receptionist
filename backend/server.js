const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  const isDev = process.env.NODE_ENV !== 'production';
  console.log(`=========================================`);
  console.log(`Clinic Receptionist Express Backend Server`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Listening on Port: ${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
  if (isDev) {
    console.log(`-----------------------------------------`);
    console.log(`DEVELOPMENT AUTHENTICATION ACTIVE:`);
    console.log(`Static Token: development-token-glowassist`);
    console.log(`Use Header  : Authorization: Bearer development-token-glowassist`);
    console.log(`-----------------------------------------`);
  }
  console.log(`=========================================`);
});

// Handle uncaught exceptions and unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('CRITICAL UNHANDLED REJECTION:', err.message || err);
  if (err.stack) console.error(err.stack);
  // Graceful shutdown
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION:', err.message || err);
  if (err.stack) console.error(err.stack);
  // Graceful shutdown
  server.close(() => {
    process.exit(1);
  });
});
