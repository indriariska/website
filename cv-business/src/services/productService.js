const prisma = require('../config/database');

class ProductService {
  static async findById(id) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });
  }

  static async findAll(category = null) {
    const where = category ? { category } : {};
    return await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findByCategory(category) {
    return await prisma.product.findMany({
      where: { category },
    });
  }
}

module.exports = ProductService;
