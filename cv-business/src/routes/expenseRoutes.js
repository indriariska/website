const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, ExpenseController.getAllExpenses);
router.get('/:id', auth, adminOnly, ExpenseController.getExpenseById);
router.post('/', auth, adminOnly, ExpenseController.createExpense);
router.put('/:id', auth, adminOnly, ExpenseController.updateExpense);
router.delete('/:id', auth, adminOnly, ExpenseController.deleteExpense);

module.exports = router;
