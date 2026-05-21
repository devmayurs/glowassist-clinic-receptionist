const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { archiveConversations } = require('../controllers/appointment.controller');

const router = express.Router();

// Apply JWT Authentication middleware to all conversation routes
router.use(authenticateToken);

// POST /api/conversations/archive - Archive conversation logs for a given date
// Called by the n8n daily 3AM cron job.
router.post(
  '/archive',
  [
    body('date')
      .notEmpty()
      .withMessage('date is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('date must be in YYYY-MM-DD format'),
    body('source')
      .optional()
      .isIn(['whatsapp_ai', 'live_chat'])
      .withMessage('source must be whatsapp_ai or live_chat'),
    body('archivedBy').optional().trim()
  ],
  archiveConversations
);

module.exports = router;
