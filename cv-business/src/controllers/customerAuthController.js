/**
 * CVPro Studio — Customer Auth Controller
 * Handles customer registration, login, profile, update.
 * Reuses existing Bcrypt, JWT, Response utilities.
 */
const Response = require('../utils/response');
const Bcrypt   = require('../utils/bcrypt');
const JWT      = require('../utils/jwt');
const prisma   = require('../config/database');

class CustomerAuthController {

  // POST /api/customer/register
  static async register(req, res, next) {
    try {
      const { name, email, phone, password } = req.body;

      if (!name || !email || !password) {
        return Response.error(res, 'Name, email and password are required', 400);
      }
      if (password.length < 6) {
        return Response.error(res, 'Password must be at least 6 characters', 400);
      }

      const existing = await prisma.customer.findUnique({ where: { email } });
      if (existing) {
        return Response.error(res, 'Email already registered', 409);
      }

      const hashed = await Bcrypt.hash(password);
      const customer = await prisma.customer.create({
        data: { name, email, phone: phone || null, password: hashed },
        select: { id: true, name: true, email: true, phone: true, createdAt: true },
      });

      const token = JWT.generateToken({ id: customer.id, email: customer.email, type: 'customer' });

      return Response.success(res, { customer, token }, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/customer/login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return Response.error(res, 'Email and password are required', 400);
      }

      const customer = await prisma.customer.findUnique({ where: { email } });
      if (!customer) {
        return Response.error(res, 'Invalid credentials', 401);
      }

      const valid = await Bcrypt.compare(password, customer.password);
      if (!valid) {
        return Response.error(res, 'Invalid credentials', 401);
      }

      const token = JWT.generateToken({ id: customer.id, email: customer.email, type: 'customer' });

      const { password: _, ...customerData } = customer;
      return Response.success(res, { customer: customerData, token }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  // POST /api/customer/logout  (stateless JWT — client just discards token)
  static async logout(req, res) {
    return Response.success(res, null, 'Logged out successfully');
  }

  // GET /api/customer/profile
  static async getProfile(req, res, next) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: req.customer.id },
        select: { id: true, name: true, email: true, phone: true, createdAt: true },
      });
      if (!customer) return Response.error(res, 'Customer not found', 404);
      return Response.success(res, customer, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/customer/profile  — edit name, phone, password
  static async updateProfile(req, res, next) {
    try {
      const { name, phone, password } = req.body;
      const data = {};
      if (name)     data.name  = name;
      if (phone)    data.phone = phone;
      if (password) {
        if (password.length < 6) return Response.error(res, 'Password must be at least 6 characters', 400);
        data.password = await Bcrypt.hash(password);
      }

      const customer = await prisma.customer.update({
        where: { id: req.customer.id },
        data,
        select: { id: true, name: true, email: true, phone: true, updatedAt: true },
      });

      return Response.success(res, customer, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/customer/orders  — only this customer's orders
  static async getMyOrders(req, res, next) {
    try {
      const orders = await prisma.order.findMany({
        where: { customerId: req.customer.id },
        orderBy: { createdAt: 'desc' },
      });
      return Response.success(res, orders, 'Orders retrieved');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/customer/orders/:id  — single order (must belong to this customer)
  static async getMyOrderById(req, res, next) {
    try {
      const order = await prisma.order.findFirst({
        where: { id: req.params.id, customerId: req.customer.id },
      });
      if (!order) return Response.error(res, 'Order not found', 404);
      return Response.success(res, order, 'Order retrieved');
    } catch (error) {
      next(error);
    }
  }

  // POST /api/customer/orders/:id/revision
  // Customer submits a revision request (text + optional file URL already uploaded)
  static async submitRevision(req, res, next) {
    try {
      const order = await prisma.order.findFirst({
        where: { id: req.params.id, customerId: req.customer.id },
      });
      if (!order) return Response.error(res, 'Order not found', 404);

      // Only allow revision if status is diproses, revisi, or selesai
      const allowedStatuses = ['diproses', 'revisi', 'selesai', 'pembayaran_terverifikasi', 'antrian'];
      if (!allowedStatuses.includes(order.status)) {
        return Response.error(res, 'Revision can only be submitted for orders in process', 400);
      }

      const { revisionNote, revisionFileUrl } = req.body;
      if (!revisionNote || revisionNote.trim().length < 5) {
        return Response.error(res, 'Revision note must be at least 5 characters', 400);
      }

      const updated = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          revisionNote:    revisionNote.trim(),
          revisionFileUrl: revisionFileUrl || null,
          revisionStatus:  'requested',
          status:          'revisi',
        },
      });

      const { generateWhatsAppLink } = require('../utils/whatsapp');
      const whatsappLink = generateWhatsAppLink(updated, updated.revisionNote);

      return Response.success(res, {
        ...updated,
        revisionMessage: updated.revisionNote, // aliased for spec compatibility
        whatsappLink,
      }, 'Revision submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /api/customer/orders/:id/upload-revision-file
  // Upload a file for revision (reuses existing multer from orderController)
  static async uploadRevisionFile(req, res, next) {
    try {
      const order = await prisma.order.findFirst({
        where: { id: req.params.id, customerId: req.customer.id },
      });
      if (!order) return Response.error(res, 'Order not found', 404);

      const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
      if (!fileUrl) return Response.error(res, 'No file uploaded', 400);

      return Response.success(res, { fileUrl }, 'File uploaded');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/customer/dashboard  — stats for this customer
  static async getDashboard(req, res, next) {
    try {
      const [
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        latestOrder,
      ] = await Promise.all([
        prisma.order.count({ where: { customerId: req.customer.id } }),
        prisma.order.count({ where: { customerId: req.customer.id,
          status: { in: ['menunggu_verifikasi', 'verifikasi_pembayaran'] } } }),
        prisma.order.count({ where: { customerId: req.customer.id,
          status: { in: ['pembayaran_terverifikasi', 'antrian', 'diproses', 'revisi'] } } }),
        prisma.order.count({ where: { customerId: req.customer.id, status: 'selesai' } }),
        prisma.order.findFirst({
          where: { customerId: req.customer.id },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      // inProgressOrders = pending + processing (for backwards compatibility)
      const inProgressOrders = pendingOrders + processingOrders;

      const customer = await prisma.customer.findUnique({
        where: { id: req.customer.id },
        select: { id: true, name: true, email: true, phone: true },
      });

      return Response.success(res, {
        customer,
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        inProgressOrders,
        latestOrder,
      }, 'Dashboard retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CustomerAuthController;
