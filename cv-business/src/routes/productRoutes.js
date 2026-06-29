const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
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
  limits: { fileSize: 5 * 1024 * 1024 },
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

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', auth, adminOnly, upload.single('image'), ProductController.createProduct);
router.put('/:id', auth, adminOnly, upload.single('image'), ProductController.updateProduct);
router.delete('/:id', auth, adminOnly, ProductController.deleteProduct);

module.exports = router;
