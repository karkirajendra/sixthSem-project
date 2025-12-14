import express from 'express';
import {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
  updateReport,
  deleteReport,
  getMyReports,
  getReportStats,
} from '../controllers/reportController.js';
import { protect, roleAuth } from '../middlewares/auth.js';
import { validateReport } from '../middlewares/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.post('/', validateReport, createReport);
router.get('/my-reports', getMyReports);

// Admin only routes
router.get('/', roleAuth('admin'), getAllReports);
router.get('/stats', roleAuth('admin'), getReportStats);
router.get('/:id', roleAuth('admin'), getReportById);
router.put('/:id/status', roleAuth('admin'), updateReportStatus);
router.put('/:id', roleAuth('admin'), updateReport);
router.delete('/:id', roleAuth('admin'), deleteReport);

export default router;
