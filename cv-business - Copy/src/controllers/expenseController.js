const Response = require('../utils/response');
const prisma = require('../config/database');

class ExpenseController {
  static async getAllExpenses(req, res, next) {
    try {
      const expenses = await prisma.expense.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return Response.success(res, expenses, 'Expenses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getExpenseById(req, res, next) {
    try {
      const { id } = req.params;

      const expense = await prisma.expense.findUnique({
        where: { id },
      });

      if (!expense) {
        return Response.error(res, 'Expense not found', 404);
      }

      return Response.success(res, expense, 'Expense retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createExpense(req, res, next) {
    try {
      const { title, amount, description } = req.body;

      const expense = await prisma.expense.create({
        data: {
          title,
          amount: parseInt(amount) || 0,
          description,
        },
      });

      return Response.success(res, expense, 'Expense created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateExpense(req, res, next) {
    try {
      const { id } = req.params;
      const { title, amount, description } = req.body;

      const expense = await prisma.expense.update({
        where: { id },
        data: {
          title,
          amount: parseInt(amount) || 0,
          description,
        },
      });

      return Response.success(res, expense, 'Expense updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteExpense(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.expense.delete({
        where: { id },
      });

      return Response.success(res, null, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ExpenseController;
