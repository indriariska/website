const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', ReviewController.getAllReviews);
router.get('/:id', ReviewController.getReviewById);
router.post('/', ReviewController.createReview);
router.put('/:id/approve', auth, adminOnly, ReviewController.approveReview);
router.put('/:id/reject', auth, adminOnly, ReviewController.rejectReview);
router.delete('/:id', auth, adminOnly, ReviewController.deleteReview);

module.exports = router;
