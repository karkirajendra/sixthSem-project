import fs from 'fs';
import path from 'path';
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
} from '../config/cloudinary.js';

// Upload single image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Use relative path so it works through Vite proxy (/uploads → http://localhost:5000/uploads)
    // Storing absolute localhost URLs causes issues when displayed from a different port
    const relativePath = `/${req.file.path.replace(/\\/g, '/')}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: relativePath,
        publicId: req.file.filename,
        width: null,
        height: null,
      },
    });
  } catch (error) {
    // Clean up local file if it exists
    if (req.file && req.file.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError);
      }
    }

    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during image upload',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Upload multiple images
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided',
      });
    }

    // Use relative paths for all uploaded files (works through Vite proxy)
    const uploadedFiles = req.files.map((file) => {
      const relativePath = `/${file.path.replace(/\\/g, '/')}`;
      return {
        url: relativePath,
        publicId: file.filename,
        width: null,
        height: null,
      };
    });

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${req.files.length} images`,
      data: {
        uploaded: uploadedFiles,
        failed: 0,
      },
    });
  } catch (error) {
    // Clean up local files if they exist
    if (req.files) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error deleting local file:', unlinkError);
        }
      });
    }

    console.error('Multiple images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during multiple image upload',
      error: error.message,
    });
  }
};

// Delete image from Cloudinary
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required to delete image',
      });
    }

    const deleteResult = await deleteFromCloudinary(publicId);

    if (!deleteResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete image from cloud storage',
        error: deleteResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: deleteResult,
    });
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during image deletion',
      error: error.message,
    });
  }
};
