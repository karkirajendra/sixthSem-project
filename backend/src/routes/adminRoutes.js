import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
  getAnalyticsData,
  trackAnalyticsEvent,
  getRealtimeAnalytics,
  getVisitorAnalytics,
  getPropertyAnalytics,
  getAllFeedback,
  updateFeedbackStatus,
  updateFeedback,
  deleteFeedback,
  getPublicFeedback,
  getRecentListings,
  getAdminProfile,
  updateAdminProfile,
  updateAdminSettings,
  changeAdminPassword,
  getAdminActivityLog,
  getAllPropertiesAdmin,
  updatePropertyStatus,
  togglePropertyFeatured,
  deletePropertyAdmin,
  getPropertyDetailsAdmin,
  bulkUpdatePropertiesStatus,
  createPropertyAdmin,
  getAdminCmsPages,
  getAdminCmsPageById,
  createAdminCmsPage,
  updateAdminCmsPage,
  deleteAdminCmsPage,
} from '../controllers/adminController.js';
import { protect, roleAuth } from '../middlewares/auth.js';
import User from '../models/user.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Test route (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes working', status: 'success' });
});

// Public analytics tracking endpoint (doesn't require auth)
router.post('/analytics/track', trackAnalyticsEvent);

// Admin login for testing - remove this in production
router.post(
  '/test-login',
  asyncHandler(async (req, res) => {
    const admin = await User.findOne({ email: 'admin@roomsathi.com' });
    if (admin) {
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
      });

      res.json({
        success: true,
        token,
        data: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Admin not found' });
    }
  })
);

// All other admin routes require authentication and admin role
router.use(protect);
router.use(roleAuth('admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Dashboard and analytics
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalyticsData);
router.get('/recent-listings', getRecentListings);

// Feedback management
router.get('/feedback', getAllFeedback);
router.put('/feedback/:id/status', updateFeedbackStatus);
router.put('/feedback/:id', updateFeedback);
router.delete('/feedback/:id', deleteFeedback);

// Admin profile management
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.put('/settings', updateAdminSettings);
router.put('/change-password', changeAdminPassword);
router.get('/activity-log', getAdminActivityLog);

// Property management
router.get('/properties', getAllPropertiesAdmin);
router.post('/properties', createPropertyAdmin);
// bulk-status MUST come before /:id to prevent Express matching "bulk-status" as an ID param
router.put('/properties/bulk-status', bulkUpdatePropertiesStatus);
router.get('/properties/:id', getPropertyDetailsAdmin);
router.put('/properties/:id/status', updatePropertyStatus);
router.put('/properties/:id/featured', togglePropertyFeatured);
router.delete('/properties/:id', deletePropertyAdmin);

// CMS management
router.get('/cms/pages', getAdminCmsPages);
router.get('/cms/pages/:id', getAdminCmsPageById);
router.post('/cms/pages', createAdminCmsPage);
router.put('/cms/pages/:id', updateAdminCmsPage);
router.delete('/cms/pages/:id', deleteAdminCmsPage);

// Protected Analytics Routes (require authentication)
router.get('/analytics/realtime', getRealtimeAnalytics);
router.get('/analytics/visitors', getVisitorAnalytics);
router.get('/analytics/properties', getPropertyAnalytics);

// Export the router as default
export default router;
