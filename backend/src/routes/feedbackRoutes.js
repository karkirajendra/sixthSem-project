import express from 'express';
import {
  createFeedback,
  getMyFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} from '../controllers/feedbackController.js';
import { getPublicFeedback } from '../controllers/adminController.js';
import { protect, optionalAuth } from '../middlewares/auth.js';
import { validateFeedback } from '../middlewares/validation.js';
import asyncHandler from 'express-async-handler';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getPublicFeedback);
router.get('/approved', getPublicFeedback);

// GET /api/feedback/testimonials - public testimonials for homepage
router.get('/testimonials', asyncHandler(async (req, res) => {
  const testimonials = await Feedback.find({
    type: 'testimonial',
    status: 'approved',
  })
    .populate('user', 'name')
    .sort('-createdAt')
    .limit(10)
    .select('message rating user createdAt featured');

  const formatted = testimonials.map(t => ({
    _id: t._id,
    name: t.user?.name || 'Anonymous',
    message: t.message,
    rating: t.rating || 5,
    featured: t.featured || false,
    location: t.location || '',
    role: 'User',
  }));

  res.json({ success: true, data: formatted });
}));

// Submit feedback without auth (guest users)
router.post('/submit', optionalAuth, validateFeedback, asyncHandler(async (req, res) => {
  const feedbackData = {
    ...req.body,
    user: req.user?._id || null,
  };
  // For guest users, require name and email fields
  const feedback = await Feedback.create(feedbackData);
  res.status(201).json({ success: true, data: feedback });
}));

// Authenticated routes
router.use(protect);

router.post('/', validateFeedback, createFeedback);
router.get('/my-feedback', getMyFeedback);
router.get('/:id', getFeedbackById);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

export default router;
