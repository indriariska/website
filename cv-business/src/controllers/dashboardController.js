/**
 * CVPro Studio — Dashboard Controller
 * All statistics are derived from service Orders and Expenses.
 * No product / inventory logic.
 */
const Response = require('../utils/response');
const prisma = require('../config/database');

class DashboardController {
  static async getStats(req, res, next) {
    try {
      const now   = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // ── Order counts ────────────────────────────────────────
      const [
        totalOrders,
        pendingOrders,
        paidOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        ordersToday,
        ordersThisMonth,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'pending' } }),
        prisma.order.count({ where: { status: 'paid' } }),
        prisma.order.count({ where: { status: 'processing' } }),
        prisma.order.count({ where: { status: 'completed' } }),
        prisma.order.count({ where: { status: 'cancelled' } }),
        prisma.order.count({ where: { createdAt: { gte: today } } }),
        prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
      ]);

      // ── Revenue (all time) ───────────────────────────────────
      const allOrders = await prisma.order.findMany({
        select: { price: true, status: true },
      });
      const totalRevenue = allOrders.reduce((s, o) => s + o.price, 0);

      // ── Revenue today ────────────────────────────────────────
      const todayOrderRows = await prisma.order.findMany({
        where: { createdAt: { gte: today } },
        select: { price: true },
      });
      const revenueToday = todayOrderRows.reduce((s, o) => s + o.price, 0);

      // ── Revenue this month ───────────────────────────────────
      const monthOrderRows = await prisma.order.findMany({
        where: { createdAt: { gte: monthStart } },
        select: { price: true },
      });
      const monthlyRevenue = monthOrderRows.reduce((s, o) => s + o.price, 0);

      // ── Expenses this month ──────────────────────────────────
      const monthExpenseRows = await prisma.expense.findMany({
        where: { createdAt: { gte: monthStart } },
        select: { amount: true },
      });
      const monthlyExpenses = monthExpenseRows.reduce((s, e) => s + e.amount, 0);

      // ── Profit calculations ──────────────────────────────────
      // For a service business, revenue = gross profit (no COGS).
      // Net profit = revenue - operational expenses.
      const grossProfit    = totalRevenue;
      const monthlyProfit  = monthlyRevenue;
      const netProfit      = monthlyRevenue - monthlyExpenses;

      // ── Unique customers (by email) ──────────────────────────
      const uniqueEmails = await prisma.order.groupBy({
        by: ['customerEmail'],
      });
      const totalCustomers = uniqueEmails.length;

      // ── Latest 5 orders ──────────────────────────────────────
      const latestOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerName: true,
          serviceType: true,
          price: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
        },
      });

      // ── Top 5 services by order count ────────────────────────
      const serviceGroups = await prisma.order.groupBy({
        by: ['serviceType'],
        _count: { serviceType: true },
        _sum:   { price: true },
        orderBy: { _count: { serviceType: 'desc' } },
        take: 5,
      });

      const topServices = serviceGroups.map(g => ({
        serviceType:  g.serviceType,
        totalOrders:  g._count.serviceType,
        totalRevenue: g._sum.price || 0,
      }));

      // ── Monthly chart data (last 12 months) ─────────────────
      const monthlyRevenueData = [];
      const monthlyProfitData  = [];
      const monthlyOrdersData  = [];

      for (let i = 11; i >= 0; i--) {
        const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mEnd   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

        const mOrders = await prisma.order.findMany({
          where: { createdAt: { gte: mStart, lte: mEnd } },
          select: { price: true },
        });
        const mExpenses = await prisma.expense.findMany({
          where: { createdAt: { gte: mStart, lte: mEnd } },
          select: { amount: true },
        });

        const mRevenue  = mOrders.reduce((s, o) => s + o.price, 0);
        const mExpTotal = mExpenses.reduce((s, e) => s + e.amount, 0);
        const mProfit   = mRevenue - mExpTotal;

        monthlyRevenueData.push(mRevenue);
        monthlyProfitData.push(mProfit);
        monthlyOrdersData.push(mOrders.length);
      }

      // ── Response payload ─────────────────────────────────────
      return Response.success(res, {
        // Counts
        totalOrders,
        pendingOrders,
        paidOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        ordersToday,
        ordersThisMonth,
        totalCustomers,

        // Revenue / profit
        totalRevenue,
        revenueToday,
        monthlyRevenue,
        monthlyExpenses,
        grossProfit,
        monthlyProfit,
        netProfit,

        // Tables
        latestOrders,
        topServices,

        // Chart arrays (12 months, oldest → newest)
        monthlyRevenueData,
        monthlyProfitData,
        monthlyOrdersData,
      }, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
