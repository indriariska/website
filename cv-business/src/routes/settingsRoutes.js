const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', SettingsController.getSettings);
router.put('/', auth, adminOnly, SettingsController.updateSettings);

module.exports = router;
