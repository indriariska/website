const express = require('express');
const router = express.Router();
const { OrderController, uploadProof } = require('../controllers/orderController');
const { auth, adminOnly } = require('../middleware/auth');

// Public — customer website submits orders here
router.post('/', uploadProof, OrderController.createOrder);

// Admin-protected
router.get('/',        auth, adminOnly, OrderController.getAllOrders);
router.get('/stats',   auth, adminOnly, OrderController.getOrdersStats);
router.get('/:id',     auth, adminOnly, OrderController.getOrderById);
router.put('/:id/status', auth, adminOnly, OrderController.updateOrderStatus);
router.put('/:id',     auth, adminOnly, OrderController.updateOrder);
router.delete('/:id',  auth, adminOnly, OrderController.deleteOrder);

module.exports = router;
