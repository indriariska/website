const Response = require('../utils/response');
const prisma = require('../config/database');

class DashboardController {
  static async getStats(req, res, next) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Total Orders
      const totalOrders = await prisma.order.count();

      // Orders Today
      const ordersToday = await prisma.order.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      });

      // Orders This Month
      const ordersThisMonth = await prisma.order.count({
        where: {
          createdAt: {
            gte: monthStart,
          },
        },
      });

      // Total Revenue
      const orders = await prisma.order.findMany();
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

      // Revenue Today
      const todayOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: today,
          },
        },
      });
      const revenueToday = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);

      // Monthly Revenue
      const monthOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: monthStart,
          },
        },
      });
      const monthlyRevenue = monthOrders.reduce((sum, order) => sum + order.totalPrice, 0);

      // Monthly Expenses
      const monthExpenses = await prisma.expense.findMany({
        where: {
          createdAt: {
            gte: monthStart,
          },
        },
      });
      const monthlyExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Gross Profit
      const grossProfit = orders.reduce((sum, order) => sum + order.profit, 0);

      // Net Profit (Monthly)
      const monthlyProfit = monthOrders.reduce((sum, order) => sum + order.profit, 0);
      const netProfit = monthlyProfit - monthlyExpenses;

      // Total Customers
      const totalCustomers = await prisma.customer.count();

      // Total Products
      const totalProducts = await prisma.product.count();

      // Low Stock Products (stock < 10)
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: {
            lt: 10,
          },
        },
        orderBy: {
          stock: 'asc',
        },
        take: 5,
      });

      // Latest Orders
      const latestOrders = await prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          customer: true,
        },
      });

      // Best Selling Products
      const orderItems = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      });

      const bestSellingProducts = await Promise.all(
        orderItems.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });
          const totalRevenue = await prisma.orderItem.aggregate({
            where: { productId: item.productId },
            _sum: { price: true },
          });
          return {
            ...product,
            totalSold: item._sum.quantity,
            totalRevenue: totalRevenue._sum.price || 0,
          };
        })
      );

      // Monthly Data for Charts (last 12 months)
      const monthlyRevenueData = [];
      const monthlyProfitData = [];
      const monthlyOrdersData = [];

      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthOrders = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: monthDate,
              lte: monthEnd,
            },
          },
        });

        const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        const monthProfit = monthOrders.reduce((sum, order) => sum + order.profit, 0);

        monthlyRevenueData.push(monthRevenue);
        monthlyProfitData.push(monthProfit);
        monthlyOrdersData.push(monthOrders.length);
      }

      const stats = {
        totalOrders,
        ordersToday,
        ordersThisMonth,
        totalRevenue,
        revenueToday,
        monthlyRevenue,
        monthlyExpenses,
        grossProfit,
        netProfit,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        latestOrders,
        bestSellingProducts,
        monthlyRevenueData,
        monthlyProfitData,
        monthlyOrdersData,
      };

      return Response.success(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
