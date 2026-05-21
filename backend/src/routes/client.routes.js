const express = require('express');
const { body, param } = require('express-validator');
const clientController = require('../controllers/client.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply JWT Authentication middleware to all client routes
router.use(authenticateToken);

// POST /api/clients - Create Client
router.post(
  '/',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phoneNumber')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Phone number must be a valid E.164 format (e.g. +1234567890)'),
    body('email')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address'),
    body('clientType')
      .optional()
      .isIn(['first_time', 'regular', 'vip'])
      .withMessage('Client type must be first_time, regular, or vip'),
    body('bookingSource')
      .optional()
      .isIn(['whatsapp_ai', 'manual_crm', 'live_chat'])
      .withMessage('Booking source must be whatsapp_ai, manual_crm, or live_chat'),
    body('notes').optional().trim()
  ],
  clientController.createClient
);

// GET /api/clients - Get All Clients
router.get('/', clientController.getClients);

// GET /api/clients/:id - Client details with history logs
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid client ID format')],
  clientController.getClientById
);

// PUT /api/clients/:id - Update Client parameters
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid client ID format'),
    body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
    body('email')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address'),
    body('clientType')
      .optional()
      .isIn(['first_time', 'regular', 'vip'])
      .withMessage('Client type must be first_time, regular, or vip'),
    body('bookingSource')
      .optional()
      .isIn(['whatsapp_ai', 'manual_crm', 'live_chat'])
      .withMessage('Booking source must be whatsapp_ai, manual_crm, or live_chat'),
    body('notes').optional().trim()
  ],
  clientController.updateClient
);

module.exports = router;
