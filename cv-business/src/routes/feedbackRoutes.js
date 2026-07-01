/**
 * CVPro Studio — Feedback Routes
 * New module — does NOT touch any existing route.
 *
 * Public endpoint:   /api/feedback/public  (no auth)
 * Customer endpoints:/api/feedback/my      (customerAuth)
 * Admin endpoints:   /api/feedback         (auth + staffOrAdmin)
 */
const express  = require('express');
const router   = express.Router();
const fb       = require('../controllers/feedbackController');
const { customerAuth }         = require('../middleware/customerAuth');
const { auth, staffOrAdmin }   = require('../middleware/auth');

// ── Public — no auth required ────────────────────────────────────
router.get( '/public',          fb.getPublicFeedback);

// ── Customer (logged-in customer only) ───────────────────────────
router.get( '/my',     customerAuth, fb.getMyFeedback);
router.get( '/my/:id', customerAuth, fb.getMyFeedbackById);
router.post('/',       customerAuth, fb.createFeedback);

// ── Admin / Staff ─────────────────────────────────────────────────
router.get( '/',              auth, staffOrAdmin, fb.getAllFeedback);
router.get( '/:id',           auth, staffOrAdmin, fb.getFeedbackById);
router.put( '/:id/reply',     auth, staffOrAdmin, fb.replyFeedback);
router.put( '/:id/status',    auth, staffOrAdmin, fb.updateFeedbackStatus);
router.put( '/:id/publish',   auth, staffOrAdmin, fb.publishFeedback);
router.put( '/:id/unpublish', auth, staffOrAdmin, fb.unpublishFeedback);

module.exports = router;
