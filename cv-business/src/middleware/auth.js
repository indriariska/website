const JWT = require('../utils/jwt');
const Response = require('../utils/response');
const prisma = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.error(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded = JWT.verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return Response.error(res, 'User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return Response.error(res, 'Invalid token', 401);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return Response.error(res, 'Access denied. Admin only.', 403);
  }
  next();
};

module.exports = { auth, adminOnly };
