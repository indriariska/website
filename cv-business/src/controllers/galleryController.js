const Response = require('../utils/response');
const prisma = require('../config/database');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

class GalleryController {
  static async getAllGallery(req, res, next) {
    try {
      const { category } = req.query;
      const where = { isActive: true };
      if (category) where.category = category;
      const gallery = await prisma.gallery.findMany({ where, orderBy: { createdAt: 'desc' } });
      return Response.success(res, gallery, 'Gallery retrieved successfully');
    } catch (error) { next(error); }
  }

  static async getGalleryById(req, res, next) {
    try {
      const item = await prisma.gallery.findUnique({ where: { id: req.params.id } });
      if (!item) return Response.error(res, 'Gallery item not found', 404);
      return Response.success(res, item, 'Gallery item retrieved successfully');
    } catch (error) { next(error); }
  }

  static async createGalleryItem(req, res, next) {
    try {
      const { title, description, category } = req.body;
      const imageUrl = (req.file && req.file.buffer)
        ? await uploadToCloudinary(req.file.buffer, 'cvpro-studio/gallery')
        : null;
      const item = await prisma.gallery.create({
        data: { title, description, imageUrl, category, isActive: true },
      });
      return Response.success(res, item, 'Gallery item created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateGalleryItem(req, res, next) {
    try {
      const { title, description, category, isActive } = req.body;
      const imageUrl = (req.file && req.file.buffer)
        ? await uploadToCloudinary(req.file.buffer, 'cvpro-studio/gallery')
        : undefined;
      const item = await prisma.gallery.update({
        where: { id: req.params.id },
        data: {
          ...(title       !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(category    !== undefined && { category }),
          ...(imageUrl    !== undefined && { imageUrl }),
          ...(isActive    !== undefined && { isActive }),
        },
      });
      return Response.success(res, item, 'Gallery item updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteGalleryItem(req, res, next) {
    try {
      await prisma.gallery.delete({ where: { id: req.params.id } });
      return Response.success(res, null, 'Gallery item deleted successfully');
    } catch (error) { next(error); }
  }
}

module.exports = GalleryController;
