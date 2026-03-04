import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  getDashboardStats,
} from '../controllers/auth.js';
import { protect } from '../middlewares/auth.js';
import { validateRegister, validateLogin } from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

// Private routes
router.get('/profile', protect, getUserProfile);
// Alias: frontend calls /profile/seller for seller-role users — same controller, role filtering done client-side
router.get('/profile/seller', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/logout', protect, logoutUser);
router.get('/dashboard-stats', protect, getDashboardStats);

export default router;
