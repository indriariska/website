const express = require('express');
const router  = express.Router();
const SettingsController = require('../controllers/settingsController');
const { auth, adminOnly } = require('../middleware/auth');
const { upload } = require('../utils/cloudinaryUpload');

// Public — customer site reads settings (payment info, contact)
router.get('/', SettingsController.getSettings);

// Admin-only update (optional logo upload via Cloudinary)
router.put('/', auth, adminOnly, upload.single('logo'), SettingsController.updateSettings);

module.exports = router;
