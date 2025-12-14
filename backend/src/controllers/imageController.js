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

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, {
      folder: 'sajilo-basai/properties',
    });

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to cloud storage',
        error: uploadResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height,
      },
    });
  } catch (error) {
    // Clean up local file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError);
      }
    }

    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during image upload',
      error: error.message,
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

    const filePaths = req.files.map((file) => file.path);

    // Upload all images to Cloudinary
    const uploadResults = await uploadMultipleToCloudinary(filePaths, {
      folder: 'sajilo-basai/properties',
    });

    // Delete local files after upload
    filePaths.forEach((filePath) => {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting local file:', error);
      }
    });

    // Filter successful uploads
    const successfulUploads = uploadResults.filter((result) => result.success);
    const failedUploads = uploadResults.filter((result) => !result.success);

    if (successfulUploads.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload any images',
        errors: failedUploads.map((result) => result.error),
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${successfulUploads.length} out of ${req.files.length} images`,
      data: {
        uploaded: successfulUploads.map((result) => ({
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
        })),
        failed: failedUploads.length,
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
