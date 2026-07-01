const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/templateController');
const { auth, adminOnly } = require('../middleware/auth');
const { upload } = require('../utils/cloudinaryUpload');

router.get('/', TemplateController.getAllTemplates);
router.get('/:id', TemplateController.getTemplateById);
router.post('/', auth, adminOnly, upload.single('image'), TemplateController.createTemplate);
router.put('/:id', auth, adminOnly, upload.single('image'), TemplateController.updateTemplate);
router.delete('/:id', auth, adminOnly, TemplateController.deleteTemplate);

module.exports = router;
