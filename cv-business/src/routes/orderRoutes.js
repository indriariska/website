const express = require('express');
const router = express.Router();
const { OrderController, uploadProof, uploadDelivery } = require('../controllers/orderController');
const { auth, adminOnly, staffOrAdmin } = require('../middleware/auth');

// Public — customer website submits orders here
router.post('/', uploadProof, OrderController.createOrder);

// Public — customer can submit a revision request (also accepts customer JWT, no admin JWT needed)
router.post('/:id/revision', OrderController.submitOrderRevision);

// Staff + Admin: read orders and update status (operational)
router.get('/',              auth, staffOrAdmin, OrderController.getAllOrders);
router.get('/stats',         auth, staffOrAdmin, OrderController.getOrdersStats);
router.get('/:id',           auth, staffOrAdmin, OrderController.getOrderById);
router.put('/:id/status',    auth, staffOrAdmin, OrderController.updateOrderStatus);

// Staff + Admin: upload a delivery file (PDF, DOCX, ZIP, etc.) for an order
router.post('/:id/delivery', auth, staffOrAdmin, uploadDelivery, OrderController.uploadDeliveryFile);

// Admin only: full edit and delete
router.put('/:id',           auth, adminOnly,    OrderController.updateOrder);
router.delete('/:id',        auth, adminOnly,    OrderController.deleteOrder);

module.exports = router;
