const Response = require('../utils/response');
const prisma = require('../config/database');

class TemplateController {
  static async getAllTemplates(req, res, next) {
    try {
      const { type, category, package: pkg } = req.query;

      const where = {
        isActive: true,
      };

      if (type) where.type = type;
      if (category) where.category = category;
      if (pkg) where.package = pkg;

      const templates = await prisma.template.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return Response.success(res, templates, 'Templates retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTemplateById(req, res, next) {
    try {
      const { id } = req.params;

      const template = await prisma.template.findUnique({
        where: { id },
        include: {
          reviews: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!template) {
        return Response.error(res, 'Template not found', 404);
      }

      return Response.success(res, template, 'Template retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createTemplate(req, res, next) {
    try {
      const { title, description, type, category, package: pkg, price, features } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const template = await prisma.template.create({
        data: {
          title,
          description,
          type,
          category,
          package: pkg,
          price: parseInt(price),
          imageUrl,
          features: features ? JSON.parse(features) : [],
        },
      });

      return Response.success(res, template, 'Template created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, type, category, package: pkg, price, features, isActive } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

      const template = await prisma.template.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(type && { type }),
          ...(category && { category }),
          ...(pkg && { package: pkg }),
          ...(price && { price: parseInt(price) }),
          ...(imageUrl && { imageUrl }),
          ...(features && { features: JSON.parse(features) }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      return Response.success(res, template, 'Template updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTemplate(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.template.delete({
        where: { id },
      });

      return Response.success(res, null, 'Template deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TemplateController;
