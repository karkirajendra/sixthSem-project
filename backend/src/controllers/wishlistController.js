import asyncHandler from 'express-async-handler';
import Wishlist from '../models/Wishlist.js';
import Property from '../models/Property.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private (Buyer)
export const getWishlist = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const wishlistItems = await Wishlist.find({ user: req.user._id })
    .populate({
      path: 'property',
      populate: {
        path: 'sellerId',
        select: 'name email profile.phone',
      },
    })
    .sort('-addedAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Wishlist.countDocuments({ user: req.user._id });

  // Filter out items where property might have been deleted
  const validItems = wishlistItems.filter((item) => item.property);

  res.json({
    success: true,
    count: validItems.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: validItems,
  });
});

// @desc    Add property to wishlist
// @route   POST /api/wishlist/:propertyId
// @access  Private (Buyer)
export const addToWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  // Check if property exists
  const property = await Property.findById(propertyId);
  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Check if already in wishlist
  const existingItem = await Wishlist.findOne({
    user: req.user._id,
    property: propertyId,
  });

  if (existingItem) {
    res.status(400);
    throw new Error('Property already in wishlist');
  }

  const wishlistItem = await Wishlist.create({
    user: req.user._id,
    property: propertyId,
  });

  const populatedItem = await Wishlist.findById(wishlistItem._id).populate({
    path: 'property',
    populate: {
      path: 'sellerId',
      select: 'name email profile.phone',
    },
  });

  res.status(201).json({
    success: true,
    message: 'Property added to wishlist',
    data: populatedItem,
  });
});

// @desc    Remove property from wishlist
// @route   DELETE /api/wishlist/:propertyId
// @access  Private (Buyer)
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const wishlistItem = await Wishlist.findOneAndDelete({
    user: req.user._id,
    property: propertyId,
  });

  if (!wishlistItem) {
    res.status(404);
    throw new Error('Property not found in wishlist');
  }

  res.json({
    success: true,
    message: 'Property removed from wishlist',
  });
});

// @desc    Check if property is in wishlist
// @route   GET /api/wishlist/check/:propertyId
// @access  Private (Buyer)
export const checkWishlistStatus = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const wishlistItem = await Wishlist.findOne({
    user: req.user._id,
    property: propertyId,
  });

  res.json({
    success: true,
    inWishlist: !!wishlistItem,
  });
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private (Buyer)
export const clearWishlist = asyncHandler(async (req, res) => {
  await Wishlist.deleteMany({ user: req.user._id });

  res.json({
    success: true,
    message: 'Wishlist cleared successfully',
  });
});
