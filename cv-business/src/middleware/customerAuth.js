/**
 * CVPro Studio — Customer Auth Middleware
 * Verifies JWT token for customer accounts.
 * Reuses existing JWT utility.
 */
const JWT      = require('../utils/jwt');
const Response = require('../utils/response');
const prisma   = require('../config/database');

const customerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.error(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded = JWT.verifyToken(token);

    // Ensure token belongs to a customer, not an admin
    if (decoded.type !== 'customer') {
      return Response.error(res, 'Invalid token type', 401);
    }

    const customer = await prisma.customer.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, phone: true },
    });

    if (!customer) {
      return Response.error(res, 'Customer not found', 401);
    }

    req.customer = customer;
    next();
  } catch (error) {
    return Response.error(res, 'Invalid token', 401);
  }
};

module.exports = { customerAuth };
