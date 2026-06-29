const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, OrderController.getAllOrders);
router.get('/stats', auth, adminOnly, OrderController.getOrdersStats);
router.get('/:id', auth, adminOnly, OrderController.getOrderById);
router.post('/', auth, adminOnly, OrderController.createOrder);
router.put('/:id/status', auth, adminOnly, OrderController.updateOrderStatus);
router.delete('/:id', auth, adminOnly, OrderController.deleteOrder);

module.exports = router;
