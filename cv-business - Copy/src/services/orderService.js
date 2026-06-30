const prisma = require('../config/database');

class OrderService {
  static async findOrderById(id) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });
  }

  static async findOrderByOrderNumber(orderNumber) {
    return await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        template: true,
      },
    });
  }

  static async getOrdersByCustomerEmail(customerEmail) {
    return await prisma.order.findMany({
      where: { customerEmail },
      include: {
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = OrderService;
