const prisma = require('../config/database');

class SettingsService {
  static async findFirst() {
    return await prisma.setting.findFirst();
  }

  static async findById(id) {
    return await prisma.setting.findUnique({
      where: { id },
    });
  }
}

module.exports = SettingsService;
