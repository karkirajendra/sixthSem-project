import asyncHandler from 'express-async-handler';
import { Notification } from '../models/Notification.js';

// @desc    Get user notifications (or admin notifications if user is admin)
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const query = {};

  // If the user is an admin, they can see global notifications (recipient: null)
  // or notifications specifically for them.
  if (req.user && req.user.role === 'admin') {
    query.$or = [{ recipient: null }, { recipient: req.user._id }];
  } else {
    // Normal users only see their own
    query.recipient = req.user._id;
  }

  const notifications = await Notification.find(query).sort('-createdAt').limit(50); // get last 50

  res.json({
    success: true,
    data: notifications,
  });
});

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };
  if (req.user && req.user.role === 'admin') {
    query.$or = [{ recipient: null }, { recipient: req.user._id }];
  } else {
    query.recipient = req.user._id;
  }

  const notification = await Notification.findOneAndUpdate(
    query,
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found or access denied');
  }

  res.json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user && req.user.role === 'admin') {
    query.$or = [{ recipient: null }, { recipient: req.user._id }];
  } else {
    query.recipient = req.user._id;
  }

  await Notification.updateMany(query, { $set: { isRead: true } });

  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// @desc    Clear all notifications (delete) for current user/admin scope
// @route   DELETE /api/notifications/clear-all
// @access  Private
export const clearAllNotifications = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user && req.user.role === 'admin') {
    query.$or = [{ recipient: null }, { recipient: req.user._id }];
  } else {
    query.recipient = req.user._id;
  }

  const result = await Notification.deleteMany(query);

  res.json({
    success: true,
    message: 'All notifications cleared',
    deletedCount: result.deletedCount || 0,
  });
});

// Internal helper for other controllers
export const createNotification = async ({ message, type = 'system', recipient = null, link = null }) => {
  try {
    const notif = await Notification.create({
      message,
      type,
      recipient,
      link,
    });
    return notif;
  } catch (error) {
    console.error('Failed to create notification', error);
  }
};
