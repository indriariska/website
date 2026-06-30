/**
 * CVPro Studio — Order Controller
 * Handles service orders submitted by customers via kontak.html.
 * No product inventory, no orderItems — pure service business.
 */
const Response = require('../utils/response');
const prisma = require('../config/database');
const path = require('path');
const multer = require('multer');

// ── Multer setup for payment proof uploads ──────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'proof-' + unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image or PDF files are allowed'));
  },
});

// Export the multer middleware so orderRoutes.js can use it
const uploadProof = upload.single('proofImage');

// ── Controller ──────────────────────────────────────────────────
class OrderController {
  /**
   * GET /api/orders
   * List all orders (admin only). Supports ?status= filter.
   */
  static async getAllOrders(req, res, next) {
    try {
      const { status } = req.query;
      const where = {};
      if (status) where.status = status;

      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return Response.success(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/stats
   * Order statistics (admin only).
   */
  static async getOrdersStats(req, res, next) {
    try {
      const [total, pending, paid, processing, completed, cancelled] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'menunggu_verifikasi' } }),
        prisma.order.count({ where: { status: 'diproses' } }),
        prisma.order.count({ where: { status: 'diproses' } }),
        prisma.order.count({ where: { status: 'selesai' } }),
        prisma.order.count({ where: { status: 'ditolak' } }),
      ]);

      const orders = await prisma.order.findMany({ select: { price: true } });
      const totalRevenue = orders.reduce((sum, o) => sum + o.price, 0);

      return Response.success(res, {
        total, pending, paid, processing, completed, cancelled, totalRevenue,
      }, 'Order statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id
   * Single order detail (admin only).
   */
  static async getOrderById(req, res, next) {
    try {
      const order = await prisma.order.findUnique({ where: { id: req.params.id } });
      if (!order) return Response.error(res, 'Order not found', 404);
      return Response.success(res, order, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/orders
   * Create a new order from the customer order form.
   * Accepts multipart/form-data (with optional proofImage file)
   * OR application/json.
   */
  static async createOrder(req, res, next) {
    try {
      const {
        customerName,
        customerEmail,
        customerWhatsapp,
        serviceType,
        package: pkg,
        price,
        paymentMethod,
        message,
      } = req.body;

      // Basic required-field validation
      if (!customerName || !customerEmail || !customerWhatsapp || !serviceType || !paymentMethod) {
        return Response.error(res, 'Missing required fields: customerName, customerEmail, customerWhatsapp, serviceType, paymentMethod', 400);
      }

      const proofImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      // If a customer token is present in the header, link the order to that customer
      let customerId = null;
      try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const JWT = require('../utils/jwt');
          const decoded = JWT.verifyToken(authHeader.substring(7));
          if (decoded.type === 'customer') {
            customerId = decoded.id;
          }
        }
      } catch (_) { /* no customer token — guest order, that's fine */ }

      const order = await prisma.order.create({
        data: {
          customerId,
          customerName,
          customerEmail,
          customerWhatsapp,
          serviceType,
          package: pkg || null,
          price: parseInt(String(price).replace(/[^0-9]/g, '')) || 0,
          paymentMethod,
          proofImageUrl,
          message: message || null,
          status: 'menunggu_verifikasi',
        },
      });

      return Response.success(res, order, 'Order created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/orders/:id/status
   * Update order status (admin/staff).
   */
  static async updateOrderStatus(req, res, next) {
    try {
      const { status, adminNotes, downloadUrl, downloadFiles } = req.body;

      const validStatuses = [
        'menunggu_verifikasi',
        'verifikasi_pembayaran',
        'pembayaran_terverifikasi',
        'antrian',
        'diproses',
        'revisi',
        'selesai',
        'dibatalkan',
        'ditolak',
      ];
      if (!validStatuses.includes(status)) {
        return Response.error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      const data = { status };
      if (adminNotes   !== undefined) data.adminNotes   = adminNotes;
      if (downloadUrl  !== undefined) data.downloadUrl  = downloadUrl;
      if (downloadFiles !== undefined) data.downloadFiles = typeof downloadFiles === 'string'
        ? downloadFiles
        : JSON.stringify(downloadFiles);
      if (status === 'selesai') data.completedAt = new Date();

      const order = await prisma.order.update({
        where: { id: req.params.id },
        data,
      });

      return Response.success(res, order, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/orders/:id
   * Full update of an order (admin only — e.g. add notes, correct price).
   */
  static async updateOrder(req, res, next) {
    try {
      const {
        serviceType, package: pkg, price, paymentMethod,
        status, adminNotes, completedAt, downloadUrl, downloadFiles,
      } = req.body;

      const data = {};
      if (serviceType !== undefined)   data.serviceType   = serviceType;
      if (pkg !== undefined)           data.package       = pkg;
      if (price !== undefined)         data.price         = parseInt(String(price).replace(/[^0-9]/g, '')) || 0;
      if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;
      if (status !== undefined)        data.status        = status;
      if (adminNotes !== undefined)    data.adminNotes    = adminNotes;
      if (downloadUrl !== undefined)   data.downloadUrl   = downloadUrl;
      if (downloadFiles !== undefined) data.downloadFiles = typeof downloadFiles === 'string'
        ? downloadFiles : JSON.stringify(downloadFiles);
      if (completedAt !== undefined)   data.completedAt   = completedAt ? new Date(completedAt) : null;
      if (status === 'selesai' && !completedAt) data.completedAt = new Date();

      const order = await prisma.order.update({
        where: { id: req.params.id },
        data,
      });

      return Response.success(res, order, 'Order updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/orders/:id
   * Delete an order (admin only).
   */
  static async deleteOrder(req, res, next) {
    try {
      await prisma.order.delete({ where: { id: req.params.id } });
      return Response.success(res, null, 'Order deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { OrderController, uploadProof };
