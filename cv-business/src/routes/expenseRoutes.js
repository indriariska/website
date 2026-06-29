const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');
const { auth, adminOnly, staffOrAdmin } = require('../middleware/auth');

// Staff + Admin: read expenses
router.get('/',      auth, staffOrAdmin, ExpenseController.getAllExpenses);
router.get('/:id',   auth, staffOrAdmin, ExpenseController.getExpenseById);

// Admin only: create, edit, delete
router.post('/',     auth, adminOnly,    ExpenseController.createExpense);
router.put('/:id',   auth, adminOnly,    ExpenseController.updateExpense);
router.delete('/:id',auth, adminOnly,    ExpenseController.deleteExpense);

module.exports = router;
