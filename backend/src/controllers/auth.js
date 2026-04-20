import asyncHandler from 'express-async-handler';
import User from '../models/user.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import { sendEmail, emailTemplates } from '../utils/emailService.js';

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

// @desc    Change current user's password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }

  // Load password hash for comparison
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!(await user.comparePassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully',
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
    const ChatRoom = (await import('../models/ChatRoom.js')).default;
    const Message = (await import('../models/Message.js')).default;

    const wishlistItems = await Wishlist.find({ user: userId })
      .populate('property', 'title location price images status')
      .sort('-addedAt');

    const savedLocations = [
      ...new Set(
        wishlistItems
          .map((item) => item.property?.location)
          .filter(Boolean)
      ),
    ];

    const inquiriesCount = await Message.countDocuments({ senderId: userId });
    const unreadMessages = await Message.countDocuments({
      receiverId: userId,
      read: false,
    });

    const recentChats = await ChatRoom.find({ participants: userId })
      .sort('-updatedAt')
      .limit(3)
      .populate('participants', 'name role profile')
      .populate('propertyId', 'title location price images type')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId receiverId', select: 'name role profile' },
      })
      .lean();

    stats = {
      wishlistCount: wishlistItems.length,
      inquiriesCount,
      unreadMessages,
      savedLocations,
      recentWishlist: wishlistItems.slice(0, 3),
      recentChats,
    };
  } else if (userRole === 'seller') {
    const Property = (await import('../models/Property.js')).default;
    const ChatRoom = (await import('../models/ChatRoom.js')).default;
    const Message = (await import('../models/Message.js')).default;

    const sellerProperties = await Property.find({ sellerId: userId }).sort(
      '-createdAt'
    );

    const totalViews = sellerProperties.reduce(
      (sum, property) => sum + (property.views?.total || 0),
      0
    );
    const loggedInViews = sellerProperties.reduce(
      (sum, property) => sum + (property.views?.loggedIn || 0),
      0
    );
    const anonymousViews = sellerProperties.reduce(
      (sum, property) => sum + (property.views?.anonymous || 0),
      0
    );
    const averagePrice =
      sellerProperties.length > 0
        ? Math.round(
            sellerProperties.reduce((sum, property) => sum + property.price, 0) /
              sellerProperties.length
          )
        : 0;

    const unreadMessages = await Message.countDocuments({
      receiverId: userId,
      read: false,
    });

    const recentChats = await ChatRoom.find({ participants: userId })
      .sort('-updatedAt')
      .limit(3)
      .populate('participants', 'name role profile')
      .populate('propertyId', 'title location price images type')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId receiverId', select: 'name role profile' },
      })
      .lean();

    // Chart: messages received by day (last 7 days)
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);

    const messagesPerDay = await Message.aggregate([
      {
        $match: {
          receiverId: req.user._id,
          createdAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const messageCountByDate = new Map(
      messagesPerDay.map((d) => [d._id, d.count])
    );
    const messagesChartLabels = [];
    const messagesChartData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      messagesChartLabels.push(key);
      messagesChartData.push(messageCountByDate.get(key) || 0);
    }

    stats = {
      totalProperties: sellerProperties.length,
      activeListings: sellerProperties.filter(
        (property) => property.status === 'available'
      ).length,
      pendingListings: sellerProperties.filter(
        (property) => property.status !== 'available'
      ).length,
      totalViews,
      loggedInViews,
      anonymousViews,
      averageListingPrice: averagePrice,
      recentListings: sellerProperties.slice(0, 3),
      unreadMessages,
      recentChats,
      messagesChartLabels,
      messagesChartData,
    };
  }

  res.json({
    success: true,
    data: stats,
  });
});

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No account found with that email address');
  }

  // Get reset token (stores hashed version on user doc)
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Build reset URL pointing to the frontend
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    const template = emailTemplates.passwordReset(user.name, resetUrl);
    await sendEmail({
      email: user.email,
      subject: template.subject,
      html: template.html,
      message: template.text,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (err) {
    // Log the real error so we can debug it
    console.error('Email send error:', err);

    // If email fails, clear the token so user can try again
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error(`Email could not be sent: ${err.message}`);
  }
});

// @desc    Reset password using token from email
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Hash the token from the URL to compare with stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Set the new password and clear reset fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully. You can now log in.',
  });
});
