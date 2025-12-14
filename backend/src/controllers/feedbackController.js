import asyncHandler from 'express-async-handler';
import Feedback from '../models/Feedback.js';

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private
export const createFeedback = asyncHandler(async (req, res) => {
  const feedbackData = {
    ...req.body,
    user: req.user._id,
  };

  const feedback = await Feedback.create(feedbackData);

  const populatedFeedback = await Feedback.findById(feedback._id)
    .populate('user', 'name email')
    .populate('property', 'title');

  res.status(201).json({
    success: true,
    data: populatedFeedback,
  });
});

// @desc    Get user's feedback
// @route   GET /api/feedback/my-feedback
// @access  Private
export const getMyFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, status } = req.query;

  let query = { user: req.user._id };
  if (type) query.type = type;
  if (status) query.status = status;

  const feedback = await Feedback.find(query)
    .populate('property', 'title')
    .populate('adminResponse.respondedBy', 'name')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Feedback.countDocuments(query);

  res.json({
    success: true,
    count: feedback.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: feedback,
  });
});

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private
export const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('user', 'name email')
    .populate('property', 'title')
    .populate('adminResponse.respondedBy', 'name');

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  // Check if user is authorized to view this feedback
  if (
    feedback.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this feedback');
  }

  res.json({
    success: true,
    data: feedback,
  });
});

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private
export const updateFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  // Check if user owns this feedback
  if (feedback.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this feedback');
  }

  // Only allow updates if feedback is still pending
  if (feedback.status !== 'pending') {
    res.status(400);
    throw new Error('Can only update pending feedback');
  }

  const updatedFeedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('property', 'title');

  res.json({
    success: true,
    data: updatedFeedback,
  });
});

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  // Check if user owns this feedback or is admin
  if (
    feedback.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this feedback');
  }

  await Feedback.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Feedback deleted successfully',
  });
});
