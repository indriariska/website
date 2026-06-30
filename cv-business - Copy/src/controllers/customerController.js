const Response = require('../utils/response');
const prisma = require('../config/database');

class CustomerController {
  static async getAllCustomers(req, res, next) {
    try {
      const customers = await prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          orders: {
            select: {
              id: true,
              totalPrice: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      return Response.success(res, customers, 'Customers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req, res, next) {
    try {
      const { id } = req.params;

      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              orderItems: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (!customer) {
        return Response.error(res, 'Customer not found', 404);
      }

      return Response.success(res, customer, 'Customer retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req, res, next) {
    try {
      const { name, phone, address } = req.body;

      const customer = await prisma.customer.create({
        data: {
          name,
          phone,
          address,
        },
      });

      return Response.success(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const { name, phone, address } = req.body;

      const customer = await prisma.customer.update({
        where: { id },
        data: {
          name,
          phone,
          address,
        },
      });

      return Response.success(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCustomer(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.customer.delete({
        where: { id },
      });

      return Response.success(res, null, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CustomerController;
