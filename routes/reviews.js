const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Tour = require('../models/Tour');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/reviews/:tourId
// @desc    Get all reviews for a tour
// @access  Public
router.get('/:tourId', async (req, res) => {
  try {
    const reviews = await Review.find({ tour: req.params.tourId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/reviews/:tourId
// @desc    Create a review for a tour
// @access  Private (authenticated users)
router.post('/:tourId', protect, async (req, res) => {
  try {
    // Check if tour exists
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    // Check if user already reviewed this tour
    const existingReview = await Review.findOne({
      tour: req.params.tourId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this tour' });
    }

    const review = await Review.create({
      tour: req.params.tourId,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    });

    // Populate user name for the response
    await review.populate('user', 'name');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (review owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only owner or admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
