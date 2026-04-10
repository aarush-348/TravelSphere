const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create a booking (mock payment)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { tourId, date, numberOfPeople } = req.body;

    // Validate tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    // Check group size
    if (numberOfPeople > tour.maxGroupSize) {
      return res.status(400).json({
        success: false,
        message: `Maximum group size is ${tour.maxGroupSize} people`
      });
    }

    // Calculate total price
    const totalPrice = tour.price * numberOfPeople;

    // Create booking (mock payment — automatically confirmed)
    const booking = await Booking.create({
      tour: tourId,
      user: req.user._id,
      date: new Date(date),
      numberOfPeople,
      totalPrice,
      status: 'confirmed'
    });

    // Populate tour info for response
    await booking.populate('tour', 'name location duration');

    res.status(201).json({
      success: true,
      message: `Booking confirmed! Your booking ID is ${booking.bookingId}`,
      data: booking
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/bookings/my
// @desc    Get current user's bookings
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('tour', 'name location imageUrl duration price')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings
// @access  Admin only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('tour', 'name location')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private (booking owner or admin)
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only owner or admin can cancel
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
