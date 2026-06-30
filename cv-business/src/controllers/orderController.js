/**
 * CVPro Studio — Order Controller
 * Handles service orders submitted by customers via kontak.html.
 * No product inventory, no orderItems — pure service business.
 */
const Response   = require('../utils/response');
const { withWhatsAppLink } = require('../utils/whatsapp');
const prisma = require('../config/database');
const path = require('path');
const fs   = require('fs');
const multer = require('multer');

// ── Ensure upload directories exist ─────────────────────────────
const uploadsDir  = path.join(process.cwd(), 'uploads');
const deliveryDir = path.join(uploadsDir, 'delivery');
if (!fs.existsSync(uploadsDir))  fs.mkdirSync(uploadsDir,  { recursive: true });
if (!fs.existsSync(deliveryDir)) fs.mkdirSync(deliveryDir, { recursive: true });

// ── Multer setup for payment proof uploads ───────────────────────
const proofStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'proof-' + unique + path.extname(file.originalname));
  },
});

const proofUpload = multer({
  storage: proofStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image or PDF files are allowed'));
  },
});

const uploadProof = proofUpload.single('proofImage');

// ── Multer setup for delivery files (PDF, DOCX, ZIP, etc.) ───────
const deliveryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, deliveryDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'delivery-' + unique + path.extname(file.originalname));
  },
});

const deliveryUpload = multer({
  storage: deliveryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    // Allow any reasonable document / image / archive
    const allowedExts = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|png|jpg|jpeg|gif|webp)$/i;
    if (allowedExts.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error('File type not allowed. Allowed: PDF, DOC, DOCX, XLS, ZIP, PNG, JPG'));
  },
});

// Field name MUST be "file" — matches FormData.append('file', ...)
const uploadDelivery = deliveryUpload.single('file');

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

      return Response.success(res, orders.map(o => withWhatsAppLink(o)), 'Orders retrieved successfully');
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
      return Response.success(res, withWhatsAppLink(order), 'Order retrieved successfully');
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
   * Also accepts revisionStatus to track revision workflow.
   */
  static async updateOrderStatus(req, res, next) {
    try {
      const { status, adminNotes, downloadUrl, downloadFiles, revisionStatus } = req.body;

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
      if (adminNotes    !== undefined) data.adminNotes    = adminNotes;
      if (downloadUrl   !== undefined) data.downloadUrl   = downloadUrl;
      if (revisionStatus !== undefined) data.revisionStatus = revisionStatus;
      if (downloadFiles !== undefined) data.downloadFiles = typeof downloadFiles === 'string'
        ? downloadFiles
        : JSON.stringify(downloadFiles);
      if (status === 'selesai') data.completedAt = new Date();

      const order = await prisma.order.update({
        where: { id: req.params.id },
        data,
      });

      return Response.success(res, withWhatsAppLink(order), 'Order status updated successfully');
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
        status, adminNotes, completedAt, downloadUrl, downloadFiles, revisionStatus,
      } = req.body;

      const data = {};
      if (serviceType    !== undefined) data.serviceType    = serviceType;
      if (pkg            !== undefined) data.package        = pkg;
      if (price          !== undefined) data.price          = parseInt(String(price).replace(/[^0-9]/g, '')) || 0;
      if (paymentMethod  !== undefined) data.paymentMethod  = paymentMethod;
      if (status         !== undefined) data.status         = status;
      if (adminNotes     !== undefined) data.adminNotes     = adminNotes;
      if (downloadUrl    !== undefined) data.downloadUrl    = downloadUrl;
      if (revisionStatus !== undefined) data.revisionStatus = revisionStatus;
      if (downloadFiles !== undefined) data.downloadFiles = typeof downloadFiles === 'string'
        ? downloadFiles : JSON.stringify(downloadFiles);
      if (completedAt !== undefined)   data.completedAt   = completedAt ? new Date(completedAt) : null;
      if (status === 'selesai' && !completedAt) data.completedAt = new Date();

      const order = await prisma.order.update({
        where: { id: req.params.id },
        data,
      });

      return Response.success(res, withWhatsAppLink(order), 'Order updated successfully');
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

  /**
   * POST /api/orders/:id/revision
   * Submit a revision request for an order.
   * PUBLIC — accessible by the order owner (customer token optional)
   * or any logged-in customer/admin.
   *
   * Body: { revisionMessage, revisionFileUrl? }
   *
   * - Maps revisionMessage → revisionNote field (same DB column, aliased)
   * - Sets revisionStatus = "requested"
   * - Sets order status   = "revisi" (signals admin that work is needed)
   * - Returns whatsappLink so frontend can offer direct WA escalation
   */
  static async submitOrderRevision(req, res, next) {
    try {
      const { id } = req.params;
      const { revisionMessage, revisionFileUrl } = req.body;

      if (!revisionMessage || String(revisionMessage).trim().length < 5) {
        return Response.error(res, 'revisionMessage wajib diisi (minimal 5 karakter)', 400);
      }

      // Verify order exists
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) return Response.error(res, 'Order not found', 404);

      // Only allow revision for active orders (not cancelled/rejected)
      const blocked = ['dibatalkan', 'ditolak'];
      if (blocked.includes(order.status)) {
        return Response.error(res, 'Revisi tidak bisa diajukan untuk pesanan yang sudah dibatalkan/ditolak', 400);
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          revisionNote:    String(revisionMessage).trim(),  // maps to existing DB column
          revisionStatus:  'requested',
          revisionFileUrl: revisionFileUrl || null,
          status:          'revisi',
        },
      });

      const { generateWhatsAppLink } = require('../utils/whatsapp');
      const waLink = generateWhatsAppLink(updatedOrder, updatedOrder.revisionNote);

      return Response.success(res, {
        orderId:        updatedOrder.id,
        revisionMessage: updatedOrder.revisionNote,
        revisionStatus:  updatedOrder.revisionStatus,
        whatsappLink:    waLink,
        order:           withWhatsAppLink(updatedOrder),
      }, 'Revision request submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/orders/:id/delivery
   * Upload delivery file (admin/staff).
   *
   * Accepts multipart/form-data with field "file" (actual file upload).
   * Optionally accepts "label" text field for the file label.
   * Also handles bulk save: "downloadFiles" JSON string (no actual file) for URL-only entries.
   *
   * On success:
   *   - Saves file to uploads/delivery/
   *   - Sets downloadUrl  = /uploads/delivery/<filename>
   *   - Sets downloadFiles = JSON array of { label, url }
   *   - Sets status       = "selesai"
   *   - Sets completedAt  = now
   */
  static async uploadDeliveryFile(req, res, next) {
    try {
      console.log('[delivery] POST /api/orders/' + req.params.id + '/delivery called');
      console.log('[delivery] req.file =', req.file ? req.file.originalname : 'none');
      console.log('[delivery] req.body =', req.body);

      // 1. Verify the order exists
      const order = await prisma.order.findUnique({ where: { id: req.params.id } });
      if (!order) {
        console.log('[delivery] Order not found:', req.params.id);
        return Response.error(res, 'Order not found', 404);
      }

      // 2. Determine file URL
      let primaryUrl  = null;
      let primaryName = null;

      if (req.file) {
        // Real file uploaded via multipart field "file"
        primaryUrl  = '/uploads/delivery/' + req.file.filename;
        primaryName = req.file.originalname;
        console.log('[delivery] File saved:', primaryUrl);
      }

      // 3. Build the final downloadFiles array
      //    Priority: if req.body.downloadFiles JSON array sent → use it (bulk URL save)
      //              else if real file → build single-entry array
      //              else → error
      let finalFiles = [];

      if (req.body && req.body.downloadFiles) {
        // Bulk save path: admin sent JSON array of { label, url } entries
        try {
          const parsed = JSON.parse(req.body.downloadFiles);
          if (Array.isArray(parsed) && parsed.length > 0) {
            finalFiles = parsed;
            primaryUrl = primaryUrl || parsed[0].url; // prefer uploaded file URL
            console.log('[delivery] Bulk save mode:', finalFiles.length, 'files');
          }
        } catch (e) {
          console.log('[delivery] Failed to parse downloadFiles JSON:', e.message);
        }
      }

      if (req.file) {
        // Prepend or append the uploaded file entry
        const label = (req.body && req.body.label && req.body.label.trim())
          ? req.body.label.trim()
          : primaryName;
        const uploadedEntry = { label, url: primaryUrl };

        // If this file isn't already in the array, add it
        const alreadyIn = finalFiles.some(f => f.url === primaryUrl);
        if (!alreadyIn) {
          finalFiles = [uploadedEntry, ...finalFiles];
        }
      }

      if (finalFiles.length === 0) {
        return Response.error(res, 'Tidak ada file yang diupload. Pilih file terlebih dahulu.', 400);
      }

      // 4. Persist to database — single atomic update
      const updated = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          downloadUrl:   primaryUrl,
          downloadFiles: JSON.stringify(finalFiles),
          status:        'selesai',
          completedAt:   new Date(),
        },
      });

      console.log('[delivery] Order updated. status=selesai, downloadUrl=', primaryUrl);

      return Response.success(res, {
        fileUrl:       primaryUrl,
        fileName:      primaryName,
        downloadFiles: finalFiles,
        order:         updated,
      }, 'File berhasil diupload dan pesanan ditandai selesai');
    } catch (error) {
      console.error('[delivery] Error:', error);
      next(error);
    }
  }
}

module.exports = { OrderController, uploadProof, uploadDelivery };
