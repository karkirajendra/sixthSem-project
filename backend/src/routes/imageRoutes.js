import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
} from '../controllers/imageController.js';
import { protect, roleAuth } from '../middlewares/auth.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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
