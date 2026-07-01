const express = require('express');
const router = express.Router();
const TestimonialController = require('../controllers/testimonialController');
const { auth, adminOnly } = require('../middleware/auth');
const { upload } = require('../utils/cloudinaryUpload');

router.get('/', TestimonialController.getAllTestimonials);
router.get('/:id', TestimonialController.getTestimonialById);
router.post('/', auth, adminOnly, upload.single('avatar'), TestimonialController.createTestimonial);
router.put('/:id', auth, adminOnly, upload.single('avatar'), TestimonialController.updateTestimonial);
router.delete('/:id', auth, adminOnly, TestimonialController.deleteTestimonial);

module.exports = router;
