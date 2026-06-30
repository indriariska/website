const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { auth, staffOrAdmin } = require('../middleware/auth');

// Both admin and staff can view dashboard stats
router.get('/stats', auth, staffOrAdmin, DashboardController.getStats);

module.exports = router;
