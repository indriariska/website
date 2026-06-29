const prisma = require('../config/database');

class ExpenseService {
  static async findById(id) {
    return await prisma.expense.findUnique({
      where: { id },
    });
  }

  static async findAll() {
    return await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = ExpenseService;
