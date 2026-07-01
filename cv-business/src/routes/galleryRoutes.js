const express = require('express');
const router = express.Router();
const GalleryController = require('../controllers/galleryController');
const { auth, adminOnly } = require('../middleware/auth');
const { upload } = require('../utils/cloudinaryUpload');

router.get('/', GalleryController.getAllGallery);
router.get('/:id', GalleryController.getGalleryById);
router.post('/', auth, adminOnly, upload.single('image'), GalleryController.createGalleryItem);
router.put('/:id', auth, adminOnly, upload.single('image'), GalleryController.updateGalleryItem);
router.delete('/:id', auth, adminOnly, GalleryController.deleteGalleryItem);

module.exports = router;
