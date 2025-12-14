import asyncHandler from 'express-async-handler';
import User from '../models/user.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'buyer',
  });

  if (user) {
    generateToken(user, 201, res);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if account is locked
  if (user.isLocked) {
    res.status(423);
    throw new Error(
      'Account temporarily locked due to too many failed login attempts'
    );
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    // Record failed login attempt
    await user.incLoginAttempts();
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  generateToken(user, 200, res);
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      success: true,
      data: user,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Update profile fields
    if (req.body.profile) {
      user.profile = { ...user.profile, ...req.body.profile };
    }

    // Update preferences
    if (req.body.preferences) {
      user.preferences = { ...user.preferences, ...req.body.preferences };
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: updatedUser,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
});

// @desc    Get dashboard stats for user
// @route   GET /api/auth/dashboard-stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let stats = {};

  if (userRole === 'buyer') {
    const Wishlist = (await import('../models/Wishlist.js')).default;
    const wishlistItems = await Wishlist.find({ user: userId })
      .populate('property', 'title location price images status')
      .sort('-createdAt');

    const savedLocations = [
      ...new Set(
        wishlistItems
          .map((item) => item.property?.location?.city)
          .filter(Boolean)
      ),
    ];

    stats = {
      wishlistCount: wishlistItems.length,
      savedLocations,
      recentWishlist: wishlistItems.slice(0, 3),
    };
  } else if (userRole === 'seller') {
    const Property = (await import('../models/Property.js')).default;
    const sellerProperties = await Property.find({ sellerId: userId }).sort(
      '-createdAt'
    );

    const totalViews = sellerProperties.reduce(
      (sum, property) => sum + (property.views?.total || 0),
      0
    );
    const averagePrice =
      sellerProperties.length > 0
        ? Math.round(
            sellerProperties.reduce((sum, property) => sum + property.price, 0) /
              sellerProperties.length
          )
        : 0;

    stats = {
      totalProperties: sellerProperties.length,
      activeListings: sellerProperties.filter(
        (property) => property.status === 'available'
      ).length,
      pendingListings: sellerProperties.filter(
        (property) => property.status !== 'available'
      ).length,
      totalViews,
      averageListingPrice: averagePrice,
      recentListings: sellerProperties.slice(0, 3),
    };
  }

  res.json({
    success: true,
    data: stats,
  });
});
