const express = require('express');
const router = express.Router();
const { OrderController, uploadProof } = require('../controllers/orderController');
const { auth, adminOnly, staffOrAdmin } = require('../middleware/auth');

// Public — customer website submits orders here
router.post('/', uploadProof, OrderController.createOrder);

// Staff + Admin: read orders and update status (operational)
router.get('/',              auth, staffOrAdmin, OrderController.getAllOrders);
router.get('/stats',         auth, staffOrAdmin, OrderController.getOrdersStats);
router.get('/:id',           auth, staffOrAdmin, OrderController.getOrderById);
router.put('/:id/status',    auth, staffOrAdmin, OrderController.updateOrderStatus);

// Admin only: full edit and delete
router.put('/:id',           auth, adminOnly,    OrderController.updateOrder);
router.delete('/:id',        auth, adminOnly,    OrderController.deleteOrder);

module.exports = router;
