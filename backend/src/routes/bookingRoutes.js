import express from 'express';
import { protect, roleAuth } from '../middlewares/auth.js';
import {
  createBooking,
  cancelBooking,
  getMyBookings,
} from '../controllers/bookingController.js';

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// Create a new booking (buyers/admin)
router.post('/', roleAuth('buyer', 'admin'), createBooking);

// Get current user's bookings
router.get('/my', getMyBookings);

// Cancel a booking
router.put('/:id/cancel', cancelBooking);

export default router;

