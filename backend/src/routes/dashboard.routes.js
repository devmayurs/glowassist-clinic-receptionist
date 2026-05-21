const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/dashboard/stats
 * Returns real-time KPI aggregations for the CRM dashboard.
 * Protected: requires valid JWT Bearer token.
 */
router.get('/stats', authenticateToken, getDashboardStats);

module.exports = router;
