import express from 'express';
import { validationResult } from 'express-validator';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  toggleUserStatus,
} from '../controllers/user.js';
import { protect, roleAuth } from '../middlewares/auth.js';

const router = express.Router();

// Protected user routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin only routes
router.get('/', protect, roleAuth('admin'), getAllUsers);
router.patch(
  '/:userId/toggle-status',
  protect,
  roleAuth('admin'),
  toggleUserStatus
);

export default router;
