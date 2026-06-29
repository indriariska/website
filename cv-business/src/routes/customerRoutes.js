const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, CustomerController.getAllCustomers);
router.get('/:id', auth, adminOnly, CustomerController.getCustomerById);
router.post('/', auth, adminOnly, CustomerController.createCustomer);
router.put('/:id', auth, adminOnly, CustomerController.updateCustomer);
router.delete('/:id', auth, adminOnly, CustomerController.deleteCustomer);

module.exports = router;
