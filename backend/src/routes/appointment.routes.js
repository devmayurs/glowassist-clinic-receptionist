const express = require('express');
const { body, param } = require('express-validator');
const appointmentController = require('../controllers/appointment.controller');
const { authenticateToken } = require('../middleware/auth');
const { parseAndNormalizeTime } = require('../utils/appointment.utils');

const router = express.Router();

// Apply JWT Authentication middleware to all appointment routes
router.use(authenticateToken);

// POST /api/appointments - Create Appointment (Validate working hours, conflicts, and create)
router.post(
  '/',
  [
    // Support checks for both camelCase and snake_case variants
    body('clientId')
      .optional()
      .isUUID()
      .withMessage('clientId must be a valid UUID'),
    body('client_id')
      .optional()
      .isUUID()
      .withMessage('client_id must be a valid UUID'),
    
    // Check that at least one of the IDs is present
    body().custom((value) => {
      const cid = value.clientId || value.client_id;
      if (!cid) {
        throw new Error('Client ID (clientId or client_id) is required');
      }
      return true;
    }),

    body('serviceName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('serviceName cannot be empty'),
    body('service_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('service_name cannot be empty'),

    body().custom((value) => {
      const sname = value.serviceName || value.service_name;
      if (!sname) {
        throw new Error('Service name (serviceName or service_name) is required');
      }
      return true;
    }),

    body('appointmentDate')
      .optional()
      .isISO8601()
      .withMessage('appointmentDate must be a valid ISO8601 date (YYYY-MM-DD)'),
    body('appointment_date')
      .optional()
      .isISO8601()
      .withMessage('appointment_date must be a valid ISO8601 date (YYYY-MM-DD)'),

    body().custom((value) => {
      const adate = value.appointmentDate || value.appointment_date;
      if (!adate) {
        throw new Error('Appointment date (appointmentDate or appointment_date) is required');
      }
      return true;
    }),

    body('appointmentTime')
      .optional()
      .customSanitizer(parseAndNormalizeTime)
      .matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
      .withMessage('appointmentTime must be in HH:MM or HH:MM:SS format'),
    body('appointment_time')
      .optional()
      .customSanitizer(parseAndNormalizeTime)
      .matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
      .withMessage('appointment_time must be in HH:MM or HH:MM:SS format'),

    body().custom((value) => {
      const atime = value.appointmentTime || value.appointment_time;
      if (!atime) {
        throw new Error('Appointment time (appointmentTime or appointment_time) is required');
      }
      return true;
    }),

    body('paymentMethod')
      .optional()
      .isIn(['cash', 'card', 'online', 'unpaid'])
      .withMessage('Invalid payment method'),
    body('payment_method')
      .optional()
      .isIn(['cash', 'card', 'online', 'unpaid'])
      .withMessage('Invalid payment_method'),

    body('paymentStatus')
      .optional()
      .isIn(['pending', 'partial', 'paid', 'refunded'])
      .withMessage('Invalid payment status'),
    body('payment_status')
      .optional()
      .isIn(['pending', 'partial', 'paid', 'refunded'])
      .withMessage('Invalid payment_status'),

    body('staffId')
      .optional({ nullable: true })
      .isUUID()
      .withMessage('staffId must be a valid UUID'),
    body('staff_id')
      .optional({ nullable: true })
      .isUUID()
      .withMessage('staff_id must be a valid UUID'),

    body('notes').optional().trim(),
    body('bookingSource')
      .optional()
      .isIn(['whatsapp_ai', 'manual_crm', 'live_chat', 'instagram'])
      .withMessage('bookingSource must be whatsapp_ai, manual_crm, live_chat, or instagram'),
    body('booking_source')
      .optional()
      .isIn(['whatsapp_ai', 'manual_crm', 'live_chat', 'instagram'])
      .withMessage('booking_source must be whatsapp_ai, manual_crm, live_chat, or instagram')
  ],
  appointmentController.createAppointment
);

// GET /api/appointments - Get all appointments with date range filters
router.get('/', appointmentController.getAppointments);

// PUT /api/appointments/:id/reschedule - Reschedule appointment date/time
router.put(
  '/:id/reschedule',
  [
    param('id').isUUID().withMessage('Invalid appointment ID format'),
    
    body('newDate')
      .optional()
      .isISO8601()
      .withMessage('newDate must be a valid ISO8601 date (YYYY-MM-DD)'),
    body('new_date')
      .optional()
      .isISO8601()
      .withMessage('new_date must be a valid ISO8601 date (YYYY-MM-DD)'),

    body().custom((value) => {
      const ndate = value.newDate || value.new_date;
      if (!ndate) {
        throw new Error('New date (newDate or new_date) is required');
      }
      return true;
    }),

    body('newTime')
      .optional()
      .customSanitizer(parseAndNormalizeTime)
      .matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
      .withMessage('newTime must be in HH:MM or HH:MM:SS format'),
    body('new_time')
      .optional()
      .customSanitizer(parseAndNormalizeTime)
      .matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
      .withMessage('new_time must be in HH:MM or HH:MM:SS format'),

    body().custom((value) => {
      const ntime = value.newTime || value.new_time;
      if (!ntime) {
        throw new Error('New time (newTime or new_time) is required');
      }
      return true;
    }),

    body('changedBy')
      .optional()
      .isIn(['system', 'whatsapp_ai', 'admin_crm'])
      .withMessage('Invalid changedBy values'),
    body('changed_by')
      .optional()
      .isIn(['system', 'whatsapp_ai', 'admin_crm'])
      .withMessage('Invalid changed_by values')
  ],
  appointmentController.rescheduleAppointment
);

// PUT /api/appointments/:id/cancel - Cancel appointment
router.put(
  '/:id/cancel',
  [
    param('id').isUUID().withMessage('Invalid appointment ID format'),
    body('reason').optional().trim(),
    body('changedBy')
      .optional()
      .isIn(['system', 'whatsapp_ai', 'admin_crm'])
      .withMessage('Invalid changedBy values'),
    body('changed_by')
      .optional()
      .isIn(['system', 'whatsapp_ai', 'admin_crm'])
      .withMessage('Invalid changed_by values')
  ],
  appointmentController.cancelAppointment
);

module.exports = router;
