import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
} from '../controllers/imageController.js';
import { protect, roleAuth } from '../middlewares/auth.js';

const router = express.Router();

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Image routes are working',
    path: req.originalUrl,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl
  });
});

// Debug route to list all available routes
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Image routes debug info',
    availableRoutes: [
      'GET /api/images/test',
      'GET /api/images/debug',
      'POST /api/images/upload-single (requires auth: admin/seller)',
      'POST /api/images/upload-multiple (requires auth: admin/seller)',
      'DELETE /api/images/delete (requires auth: admin/seller)'
    ],
    requestInfo: {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl
    }
  });
});

// Ensure uploads directory exists
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before saving
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

// Single image upload (for admin/sellers)
router.post(
  '/upload-single',
  (req, res, next) => {
    console.log('Upload single route hit:', req.method, req.path);
    next();
  },
  protect,
  roleAuth('admin', 'seller'),
  upload.single('image'),
  uploadImage
);

// Multiple images upload (for admin/sellers)
router.post(
  '/upload-multiple',
  protect,
  roleAuth('admin', 'seller'),
  upload.array('images', 10), // Maximum 10 images
  uploadMultipleImages
);

// Delete image (for admin/sellers)
router.delete('/delete', protect, roleAuth('admin', 'seller'), deleteImage);

export default router;
