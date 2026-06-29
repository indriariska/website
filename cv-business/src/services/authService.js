const prisma = require('../config/database');

class AuthService {
  static async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  static async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }
}

module.exports = AuthService;
