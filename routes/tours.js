const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/tours
// @desc    Get all tours (with search, filter, sort)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = {};

    // Search by name or location (case-insensitive partial match)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { location: searchRegex },
        { description: searchRegex }
      ];
    }

    // Filter by location
    if (req.query.location) {
      query.location = new RegExp(req.query.location, 'i');
    }

    // Filter by max price
    if (req.query.maxPrice) {
      query.price = { $lte: Number(req.query.maxPrice) };
    }

    // Filter by min price
    if (req.query.minPrice) {
      query.price = { ...query.price, $gte: Number(req.query.minPrice) };
    }

    // Build sort
    let sortOption = { createdAt: -1 };
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { averageRating: -1 };
          break;
        case 'duration':
          sortOption = { duration: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const tours = await Tour.find(query).sort(sortOption);
    res.json({ success: true, count: tours.length, data: tours });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/tours/:id
// @desc    Get single tour
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }
    res.json({ success: true, data: tour });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/tours
// @desc    Create a tour
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({ success: true, data: tour });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/tours/:id
// @desc    Update a tour
// @access  Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }
    res.json({ success: true, data: tour });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/tours/:id
// @desc    Delete a tour
// @access  Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }
    res.json({ success: true, message: 'Tour deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
