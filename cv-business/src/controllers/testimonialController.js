const Response = require('../utils/response');
const prisma = require('../config/database');

class TestimonialController {
  static async getAllTestimonials(req, res, next) {
    try {
      const testimonials = await prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      return Response.success(res, testimonials, 'Testimonials retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTestimonialById(req, res, next) {
    try {
      const { id } = req.params;

      const testimonial = await prisma.testimonial.findUnique({
        where: { id },
      });

      if (!testimonial) {
        return Response.error(res, 'Testimonial not found', 404);
      }

      return Response.success(res, testimonial, 'Testimonial retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createTestimonial(req, res, next) {
    try {
      const { name, job, text, rating } = req.body;
      const avatarUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const testimonial = await prisma.testimonial.create({
        data: {
          name,
          job,
          text,
          rating: parseInt(rating),
          avatarUrl,
          isActive: true,
        },
      });

      return Response.success(res, testimonial, 'Testimonial created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTestimonial(req, res, next) {
    try {
      const { id } = req.params;
      const { name, job, text, rating, isActive } = req.body;
      const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

      const testimonial = await prisma.testimonial.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(job && { job }),
          ...(text && { text }),
          ...(rating && { rating: parseInt(rating) }),
          ...(avatarUrl && { avatarUrl }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      return Response.success(res, testimonial, 'Testimonial updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTestimonial(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.testimonial.delete({
        where: { id },
      });

      return Response.success(res, null, 'Testimonial deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TestimonialController;
