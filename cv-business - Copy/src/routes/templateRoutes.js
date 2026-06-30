const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/templateController');
const { auth, adminOnly } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5242880 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

router.get('/', TemplateController.getAllTemplates);
router.get('/:id', TemplateController.getTemplateById);
router.post('/', auth, adminOnly, upload.single('image'), TemplateController.createTemplate);
router.put('/:id', auth, adminOnly, upload.single('image'), TemplateController.updateTemplate);
router.delete('/:id', auth, adminOnly, TemplateController.deleteTemplate);

module.exports = router;
