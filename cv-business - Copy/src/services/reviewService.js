const prisma = require('../config/database');

class ReviewService {
  static async findReviewById(id) {
    return await prisma.review.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });
  }

  static async getApprovedReviewsByTemplate(templateId) {
    return await prisma.review.findMany({
      where: { templateId, isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = ReviewService;
