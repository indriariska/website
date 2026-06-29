const Response = require('../utils/response');
const prisma = require('../config/database');

class OrderController {
  static async getAllOrders(req, res, next) {
    try {
      const { status } = req.query;

      const where = {};
      if (status) where.status = status;

      const orders = await prisma.order.findMany({
        where,
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return Response.success(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req, res, next) {
    try {
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        return Response.error(res, 'Order not found', 404);
      }

      return Response.success(res, order, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createOrder(req, res, next) {
    try {
      const { customerId, orderItems, paymentMethod } = req.body;

      let totalCost = 0;
      let totalPrice = 0;

      for (const item of orderItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return Response.error(res, `Product with id ${item.productId} not found`, 404);
        }

        totalCost += product.purchasePrice * item.quantity;
        totalPrice += product.sellingPrice * item.quantity;
      }

      const profit = totalPrice - totalCost;

      const order = await prisma.order.create({
        data: {
          customerId,
          totalPrice,
          totalCost,
          profit,
          paymentMethod,
          status: 'pending',
          orderItems: {
            create: orderItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return Response.success(res, order, 'Order created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return Response.success(res, order, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.order.delete({
        where: { id },
      });

      return Response.success(res, null, 'Order deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getOrdersStats(req, res, next) {
    try {
      const totalOrders = await prisma.order.count();
      const pendingOrders = await prisma.order.count({ where: { status: 'pending' } });
      const completedOrders = await prisma.order.count({ where: { status: 'completed' } });
      const cancelledOrders = await prisma.order.count({ where: { status: 'cancelled' } });

      const orders = await prisma.order.findMany();
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      const totalProfit = orders.reduce((sum, order) => sum + order.profit, 0);

      const stats = {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        totalProfit,
      };

      return Response.success(res, stats, 'Orders statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
