const prisma = require('../config/database');

class GalleryService {
  static async findGalleryById(id) {
    return await prisma.gallery.findUnique({
      where: { id },
    });
  }

  static async getActiveGallery() {
    return await prisma.gallery.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = GalleryService;
