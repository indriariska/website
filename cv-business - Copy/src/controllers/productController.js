const Response = require('../utils/response');
const prisma = require('../config/database');

class ProductController {
  static async getAllProducts(req, res, next) {
    try {
      const { category } = req.query;
      
      const where = category ? { category } : {};

      const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return Response.success(res, products, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          orderItems: {
            include: {
              order: {
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        return Response.error(res, 'Product not found', 404);
      }

      return Response.success(res, product, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req, res, next) {
    try {
      const { name, description, category, image, stock, purchasePrice, sellingPrice } = req.body;

      const product = await prisma.product.create({
        data: {
          name,
          description,
          category,
          image,
          stock: parseInt(stock) || 0,
          purchasePrice: parseInt(purchasePrice) || 0,
          sellingPrice: parseInt(sellingPrice) || 0,
        },
      });

      return Response.success(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, category, image, stock, purchasePrice, sellingPrice } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          description,
          category,
          image,
          stock: parseInt(stock) || 0,
          purchasePrice: parseInt(purchasePrice) || 0,
          sellingPrice: parseInt(sellingPrice) || 0,
        },
      });

      return Response.success(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.product.delete({
        where: { id },
      });

      return Response.success(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
