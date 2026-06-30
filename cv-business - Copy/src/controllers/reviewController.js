const Response = require('../utils/response');
const prisma = require('../config/database');

class ReviewController {
  static async getAllReviews(req, res, next) {
    try {
      const { templateId, isApproved } = req.query;

      const where = {};
      if (templateId) where.templateId = templateId;
      if (isApproved !== undefined) where.isApproved = isApproved === 'true';

      const reviews = await prisma.review.findMany({
        where,
        include: {
          template: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return Response.success(res, reviews, 'Reviews retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getReviewById(req, res, next) {
    try {
      const { id } = req.params;

      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          template: true,
        },
      });

      if (!review) {
        return Response.error(res, 'Review not found', 404);
      }

      return Response.success(res, review, 'Review retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req, res, next) {
    try {
      const { templateId, reviewerName, reviewerJob, rating, text } = req.body;

      const review = await prisma.review.create({
        data: {
          templateId,
          reviewerName,
          reviewerJob,
          rating: parseInt(rating),
          text,
          isApproved: false,
        },
      });

      return Response.success(res, review, 'Review created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async approveReview(req, res, next) {
    try {
      const { id } = req.params;

      const review = await prisma.review.update({
        where: { id },
        data: { isApproved: true },
        include: {
          template: true,
        },
      });

      return Response.success(res, review, 'Review approved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async rejectReview(req, res, next) {
    try {
      const { id } = req.params;

      const review = await prisma.review.update({
        where: { id },
        data: { isApproved: false },
        include: {
          template: true,
        },
      });

      return Response.success(res, review, 'Review rejected successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteReview(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.review.delete({
        where: { id },
      });

      return Response.success(res, null, 'Review deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;
