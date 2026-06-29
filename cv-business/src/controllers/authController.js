const Response = require('../utils/response');
const Bcrypt = require('../utils/bcrypt');
const JWT = require('../utils/jwt');
const prisma = require('../config/database');

class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, name, role } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return Response.error(res, 'Email already registered', 409);
      }

      const hashedPassword = await Bcrypt.hash(password);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || 'admin',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      const token = JWT.generateToken({ id: user.id, email: user.email, role: user.role });

      return Response.success(res, { user, token }, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return Response.error(res, 'Invalid credentials', 401);
      }

      const isValidPassword = await Bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return Response.error(res, 'Invalid credentials', 401);
      }

      const token = JWT.generateToken({ id: user.id, email: user.email, role: user.role });

      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      return Response.success(res, { user: userData, token }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      return Response.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return Response.error(res, 'Password must be at least 6 characters', 400);
      }

      const hashedPassword = await Bcrypt.hash(newPassword);

      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword },
      });

      return Response.success(res, null, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
