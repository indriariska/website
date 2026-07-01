const Response = require('../utils/response');
const prisma = require('../config/database');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

class TestimonialController {
  static async getAllTestimonials(req, res, next) {
    try {
      const testimonials = await prisma.testimonial.findMany({
        where: { isActive: true }, orderBy: { createdAt: 'desc' },
      });
      return Response.success(res, testimonials, 'Testimonials retrieved successfully');
    } catch (error) { next(error); }
  }

  static async getTestimonialById(req, res, next) {
    try {
      const testimonial = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
      if (!testimonial) return Response.error(res, 'Testimonial not found', 404);
      return Response.success(res, testimonial, 'Testimonial retrieved successfully');
    } catch (error) { next(error); }
  }

  static async createTestimonial(req, res, next) {
    try {
      const { name, job, text, rating } = req.body;
      const avatarUrl = (req.file && req.file.buffer)
        ? await uploadToCloudinary(req.file.buffer, 'cvpro-studio/testimonials')
        : null;
      const testimonial = await prisma.testimonial.create({
        data: { name, job, text, rating: parseInt(rating), avatarUrl, isActive: true },
      });
      return Response.success(res, testimonial, 'Testimonial created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateTestimonial(req, res, next) {
    try {
      const { name, job, text, rating, isActive } = req.body;
      const avatarUrl = (req.file && req.file.buffer)
        ? await uploadToCloudinary(req.file.buffer, 'cvpro-studio/testimonials')
        : undefined;
      const testimonial = await prisma.testimonial.update({
        where: { id: req.params.id },
        data: {
          ...(name     !== undefined && { name }),
          ...(job      !== undefined && { job }),
          ...(text     !== undefined && { text }),
          ...(rating   !== undefined && { rating: parseInt(rating) }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(isActive !== undefined && { isActive }),
        },
      });
      return Response.success(res, testimonial, 'Testimonial updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteTestimonial(req, res, next) {
    try {
      await prisma.testimonial.delete({ where: { id: req.params.id } });
      return Response.success(res, null, 'Testimonial deleted successfully');
    } catch (error) { next(error); }
  }
}

module.exports = TestimonialController;
