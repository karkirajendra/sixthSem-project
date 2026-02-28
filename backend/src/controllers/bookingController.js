import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

// Helper to recalculate and update property availability based on active bookings
const updatePropertyAvailability = async (propertyId) => {
  const now = new Date();

  const activeBookings = await Booking.countDocuments({
    property: propertyId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { checkOut: { $gte: now } },
      { checkOut: { $exists: false } },
    ],
  });

  const property = await Property.findById(propertyId);
  if (!property) return null;

  // If there is at least one active booking, mark as rented, otherwise available
  property.status = activeBookings > 0 ? 'rented' : 'available';
  await property.save();

  return property;
};

// @desc    Create a new booking and update availability
// @route   POST /api/bookings
// @access  Private (Buyer/Admin)
export const createBooking = asyncHandler(async (req, res) => {
  const { propertyId, groupSize = 1, checkIn, checkOut, notes } = req.body;

  if (!propertyId) {
    res.status(400);
    throw new Error('Property ID is required');
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  if (property.status !== 'available') {
    res.status(400);
    throw new Error('Property is not available for booking');
  }

  const booking = await Booking.create({
    property: propertyId,
    user: req.user._id,
    groupSize,
    checkIn: checkIn ? new Date(checkIn) : undefined,
    checkOut: checkOut ? new Date(checkOut) : undefined,
    status: 'confirmed',
    notes,
  });

  const updatedProperty = await updatePropertyAvailability(propertyId);

  res.status(201).json({
    success: true,
    data: {
      booking,
      property: updatedProperty,
    },
  });
});

// @desc    Cancel a booking and update availability
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Owner/Admin)
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only booking owner or admin can cancel
  if (
    booking.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  booking.status = 'cancelled';
  await booking.save();

  const updatedProperty = await updatePropertyAvailability(booking.property);

  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    data: {
      booking,
      property: updatedProperty,
    },
  });
});

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('property', 'title location price status images type')
    .sort('-createdAt');

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

