const express = require('express');
const router = express.Router();
const GalleryController = require('../controllers/galleryController');
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

router.get('/', GalleryController.getAllGallery);
router.get('/:id', GalleryController.getGalleryById);
router.post('/', auth, adminOnly, upload.single('image'), GalleryController.createGalleryItem);
router.put('/:id', auth, adminOnly, upload.single('image'), GalleryController.updateGalleryItem);
router.delete('/:id', auth, adminOnly, GalleryController.deleteGalleryItem);

module.exports = router;
