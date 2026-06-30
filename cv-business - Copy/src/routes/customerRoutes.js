/**
 * CVPro Studio — Customer Routes
 * All routes under /api/customer
 */
const express                = require('express');
const router                 = express.Router();
const CustomerAuthController = require('../controllers/customerAuthController');
const { customerAuth }       = require('../middleware/customerAuth');
// Reuse the existing multer setup from orderController
const { uploadProof }        = require('../controllers/orderController');

// ── Public ────────────────────────────────────────────────────────
router.post('/register', CustomerAuthController.register);
router.post('/login',    CustomerAuthController.login);
router.post('/logout',   CustomerAuthController.logout);

// ── Protected — customer must be logged in ────────────────────────
router.get('/profile',   customerAuth, CustomerAuthController.getProfile);
router.put('/profile',   customerAuth, CustomerAuthController.updateProfile);
router.get('/dashboard', customerAuth, CustomerAuthController.getDashboard);
router.get('/orders',    customerAuth, CustomerAuthController.getMyOrders);
router.get('/orders/:id',customerAuth, CustomerAuthController.getMyOrderById);

// Revision: submit revision request (JSON body: revisionNote, revisionFileUrl)
router.post('/orders/:id/revision',
  customerAuth,
  CustomerAuthController.submitRevision
);

// Revision file upload (multipart, reuses existing multer — field name: proofImage)
router.post('/orders/:id/revision-file',
  customerAuth,
  uploadProof,
  CustomerAuthController.uploadRevisionFile
);

module.exports = router;
