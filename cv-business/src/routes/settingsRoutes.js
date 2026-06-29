const express = require('express');
const router  = express.Router();
const SettingsController = require('../controllers/settingsController');
const { auth, adminOnly } = require('../middleware/auth');
const multer  = require('multer');
const path    = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// Public — customer site reads settings (payment info, contact)
router.get('/', SettingsController.getSettings);

// Admin-only update (optional logo upload)
router.put('/', auth, adminOnly, upload.single('logo'), SettingsController.updateSettings);

module.exports = router;
