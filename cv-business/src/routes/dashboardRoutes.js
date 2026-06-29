const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/stats', auth, adminOnly, DashboardController.getStats);

module.exports = router;
