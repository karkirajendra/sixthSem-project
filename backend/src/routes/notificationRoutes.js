import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect); // All notification routes require authentication

router.route('/').get(getNotifications);
router.route('/read-all').put(markAllAsRead);
router.route('/:id/read').put(markAsRead);

export default router;
