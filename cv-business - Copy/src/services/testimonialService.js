const prisma = require('../config/database');

class TestimonialService {
  static async findTestimonialById(id) {
    return await prisma.testimonial.findUnique({
      where: { id },
    });
  }

  static async getActiveTestimonials() {
    return await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = TestimonialService;
