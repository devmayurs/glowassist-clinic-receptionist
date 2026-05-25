const express = require('express');
const bookingSessionController = require('../controllers/booking-session.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply JWT Authentication middleware to all booking session routes
router.use(authenticateToken);

// GET /api/booking-sessions/:phone - Get active booking session by phone number
router.get('/:phone', bookingSessionController.getSession);

// PUT /api/booking-sessions/:phone - Create or update a booking session
router.put('/:phone', bookingSessionController.upsertSession);

// DELETE /api/booking-sessions/:phone - Delete a booking session (cleanup)
router.delete('/:phone', bookingSessionController.deleteSession);

module.exports = router;
