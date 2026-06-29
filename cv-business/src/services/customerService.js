const prisma = require('../config/database');

class CustomerService {
  static async findById(id) {
    return await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });
  }

  static async findAll() {
    return await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findByPhone(phone) {
    return await prisma.customer.findFirst({
      where: { phone },
    });
  }
}

module.exports = CustomerService;
