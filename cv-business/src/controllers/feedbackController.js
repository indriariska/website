/**
 * CVPro Studio — Feedback Controller
 * New module: Customer Feedback / Testimonials
 * Completely separate from existing order/revision/auth logic.
 */
const Response = require('../utils/response');
const prisma   = require('../config/database');

// ── helpers ──────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sanitizeTitle(s)   { return String(s || '').trim().slice(0, 120); }
function sanitizeMessage(s) { return String(s || '').trim().slice(0, 2000); }

// ── CUSTOMER endpoints ────────────────────────────────────────────

/**
 * GET /api/feedback/my
 * Returns only feedback belonging to the logged-in customer.
 */
async function getMyFeedback(req, res, next) {
  try {
    const items = await prisma.feedback.findMany({
      where: { customerId: req.customer.id },
      orderBy: { createdAt: 'desc' },
    });
    return Response.success(res, items, 'Feedback retrieved');
  } catch (err) { next(err); }
}

/**
 * GET /api/feedback/my/:id
 * Single feedback — must belong to this customer.
 */
async function getMyFeedbackById(req, res, next) {
  try {
    const item = await prisma.feedback.findFirst({
      where: { id: req.params.id, customerId: req.customer.id },
    });
    if (!item) return Response.error(res, 'Feedback not found', 404);
    return Response.success(res, item, 'Feedback retrieved');
  } catch (err) { next(err); }
}

/**
 * POST /api/feedback
 * Customer creates a new feedback entry.
 * Requires: at least 1 order linked to this customer.
 */
async function createFeedback(req, res, next) {
  try {
    // Guard: customer must have at least one order
    const orderCount = await prisma.order.count({
      where: { customerId: req.customer.id },
    });
    if (orderCount === 0) {
      return Response.error(
        res,
        'Feedback hanya tersedia untuk pelanggan yang telah melakukan pemesanan.',
        403
      );
    }

    const { title, message, rating, orderId } = req.body;

    if (!title || sanitizeTitle(title).length < 3) {
      return Response.error(res, 'Judul wajib diisi (min. 3 karakter)', 400);
    }
    if (!message || sanitizeMessage(message).length < 10) {
      return Response.error(res, 'Pesan wajib diisi (min. 10 karakter)', 400);
    }
    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return Response.error(res, 'Rating harus berupa angka 1–5', 400);
    }

    // If orderId provided, verify it belongs to this customer
    if (orderId) {
      const ord = await prisma.order.findFirst({
        where: { id: orderId, customerId: req.customer.id },
      });
      if (!ord) return Response.error(res, 'Order tidak ditemukan', 404);
    }

    const item = await prisma.feedback.create({
      data: {
        customerId: req.customer.id,
        orderId:    orderId || null,
        title:      sanitizeTitle(title),
        message:    sanitizeMessage(message),
        rating:     ratingNum,
        status:     'pending',
      },
    });

    return Response.success(res, item, 'Feedback berhasil dikirim', 201);
  } catch (err) { next(err); }
}

/**
 * GET /api/feedback/public
 * Public endpoint — returns only published feedback for the website landing page.
 * No auth required. Strips all private data (email, phone, token).
 */
async function getPublicFeedback(req, res, next) {
  try {
    const items = await prisma.feedback.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id:          true,
        title:       true,
        message:     true,
        rating:      true,
        adminReply:  true,
        publishedAt: true,
        customer: {
          select: { name: true },   // only name — no email/phone/password
        },
      },
    });

    // Flatten customer.name to top level for easy frontend use
    const safe = items.map(f => ({
      id:           f.id,
      title:        f.title,
      message:      f.message,
      rating:       f.rating,
      adminReply:   f.adminReply,
      publishedAt:  f.publishedAt,
      customerName: f.customer?.name || 'Pelanggan CVPro',
    }));

    return Response.success(res, safe, 'Public feedback retrieved');
  } catch (err) { next(err); }
}

/**
 * PUT /api/feedback/:id/publish
 * Admin: publish a feedback (isPublished=true, publishedAt=now).
 */
async function publishFeedback(req, res, next) {
  try {
    const existing = await prisma.feedback.findUnique({ where: { id: req.params.id } });
    if (!existing) return Response.error(res, 'Feedback not found', 404);

    const updated = await prisma.feedback.update({
      where: { id: req.params.id },
      data:  { isPublished: true, publishedAt: new Date() },
    });
    return Response.success(res, updated, 'Feedback berhasil dipublikasikan');
  } catch (err) { next(err); }
}

/**
 * PUT /api/feedback/:id/unpublish
 * Admin: cancel publication (isPublished=false, publishedAt=null).
 */
async function unpublishFeedback(req, res, next) {
  try {
    const existing = await prisma.feedback.findUnique({ where: { id: req.params.id } });
    if (!existing) return Response.error(res, 'Feedback not found', 404);

    const updated = await prisma.feedback.update({
      where: { id: req.params.id },
      data:  { isPublished: false, publishedAt: null },
    });
    return Response.success(res, updated, 'Publikasi dibatalkan');
  } catch (err) { next(err); }
}

// ── ADMIN endpoints ───────────────────────────────────────────────

/**
 * GET /api/feedback
 * Admin: list all feedback (newest first).
 */
async function getAllFeedback(req, res, next) {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const items = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    return Response.success(res, items, 'All feedback retrieved');
  } catch (err) { next(err); }
}

/**
 * GET /api/feedback/:id
 * Admin: single feedback detail.
 */
async function getFeedbackById(req, res, next) {
  try {
    const item = await prisma.feedback.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    if (!item) return Response.error(res, 'Feedback not found', 404);
    return Response.success(res, item, 'Feedback retrieved');
  } catch (err) { next(err); }
}

/**
 * PUT /api/feedback/:id/reply
 * Admin: save a reply. Sets status → "replied" automatically.
 */
async function replyFeedback(req, res, next) {
  try {
    const existing = await prisma.feedback.findUnique({ where: { id: req.params.id } });
    if (!existing) return Response.error(res, 'Feedback not found', 404);

    const { adminReply } = req.body;
    if (!adminReply || String(adminReply).trim().length < 1) {
      return Response.error(res, 'Balasan tidak boleh kosong', 400);
    }

    const updated = await prisma.feedback.update({
      where: { id: req.params.id },
      data: {
        adminReply: sanitizeMessage(adminReply),
        status:     'replied',
      },
    });
    return Response.success(res, updated, 'Balasan berhasil disimpan');
  } catch (err) { next(err); }
}

/**
 * PUT /api/feedback/:id/status
 * Admin: update status (pending | replied | closed).
 */
async function updateFeedbackStatus(req, res, next) {
  try {
    const existing = await prisma.feedback.findUnique({ where: { id: req.params.id } });
    if (!existing) return Response.error(res, 'Feedback not found', 404);

    const { status } = req.body;
    const valid = ['pending', 'replied', 'closed'];
    if (!valid.includes(status)) {
      return Response.error(res, `Status harus salah satu: ${valid.join(', ')}`, 400);
    }

    const updated = await prisma.feedback.update({
      where: { id: req.params.id },
      data:  { status },
    });
    return Response.success(res, updated, 'Status feedback diperbarui');
  } catch (err) { next(err); }
}

module.exports = {
  getMyFeedback,
  getMyFeedbackById,
  createFeedback,
  getPublicFeedback,
  publishFeedback,
  unpublishFeedback,
  getAllFeedback,
  getFeedbackById,
  replyFeedback,
  updateFeedbackStatus,
};
