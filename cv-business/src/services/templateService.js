const prisma = require('../config/database');

class TemplateService {
  static async findTemplateById(id) {
    return await prisma.template.findUnique({
      where: { id },
    });
  }

  static async getTemplatesByType(type) {
    return await prisma.template.findMany({
      where: { type, isActive: true },
    });
  }

  static async getTemplatesByCategory(category) {
    return await prisma.template.findMany({
      where: { category, isActive: true },
    });
  }
}

module.exports = TemplateService;
