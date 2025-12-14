import asyncHandler from 'express-async-handler';
import Property from '../models/Property.js';
import User from '../models/user.js';
import { trackPropertyView } from '../middlewares/analytics.js';

// @desc    Get all properties with filters
// @route   GET /api/properties
// @access  Public
export const getAllProperties = asyncHandler(async (req, res) => {
  const {
    location,
    type,
    minPrice,
    maxPrice,
    roomType,
    flatType,
    bedrooms,
    bathrooms,
    features,
    page = 1,
    limit = 10,
    sort = '-createdAt',
    search,
  } = req.query;

  // Build query
  let query = { status: 'available' };

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (type) {
    query.type = type;
  }

  if (roomType) {
    query.roomType = roomType;
  }

  if (flatType) {
    query.flatType = flatType;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice);
    if (maxPrice) query.price.$lte = parseInt(maxPrice);
  }

  if (bedrooms) {
    query.bedrooms = parseInt(bedrooms);
  }

  if (bathrooms) {
    query.bathrooms = parseInt(bathrooms);
  }

  if (features) {
    const featureArray = features.split(',');
    featureArray.forEach((feature) => {
      query[`features.${feature}`] = true;
    });
  }

  if (search) {
    query.$text = { $search: search };
  }

  // Execute query
  const properties = await Property.find(query)
    .populate('sellerId', 'name email profile.phone')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Property.countDocuments(query);

  res.json({
    success: true,
    count: properties.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: properties,
  });
});

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
export const getFeaturedProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({
    featured: true,
    status: 'available',
  })
    .populate('sellerId', 'name email profile.phone')
    .sort('-createdAt')
    .limit(8)
    .lean();

  res.json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate(
    'sellerId',
    'name email profile.phone profile.avatar'
  );

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Increment view count
  const userAgent = req.get('User-Agent');
  const isLoggedIn = req.user ? true : false;

  property.views.total += 1;
  if (isLoggedIn) {
    property.views.loggedIn += 1;
  } else {
    property.views.anonymous += 1;
  }

  await property.save();

  // Track property view in analytics
  await trackPropertyView(req.params.id, req);

  res.json({
    success: true,
    data: property,
  });
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Seller)
export const createProperty = asyncHandler(async (req, res) => {
  const propertyData = {
    ...req.body,
    sellerId: req.user._id,
  };

  console.log(propertyData);

  const property = await Property.create(propertyData);

  res.status(201).json({
    success: true,
    data: property,
  });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Seller - own properties only)
export const updateProperty = asyncHandler(async (req, res) => {
  let property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Make sure user is property owner
  if (
    property.sellerId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to update this property');
  }

  property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: property,
  });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Seller - own properties only)
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Make sure user is property owner
  if (
    property.sellerId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this property');
  }

  await Property.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Property deleted successfully',
  });
});

// @desc    Get properties by seller
// @route   GET /api/properties/seller/:sellerId
// @access  Public
export const getPropertiesBySeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  let query = { sellerId };
  if (status) {
    query.status = status;
  }

  const properties = await Property.find(query)
    .populate('sellerId', 'name email profile.phone')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Property.countDocuments(query);

  res.json({
    success: true,
    count: properties.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: properties,
  });
});

// @desc    Get my properties (for sellers)
// @route   GET /api/properties/my-properties
// @access  Private (Seller)
export const getMyProperties = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  let query = { sellerId: req.user._id };
  if (status) {
    query.status = status;
  }

  const properties = await Property.find(query)
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Property.countDocuments(query);

  res.json({
    success: true,
    count: properties.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: properties,
  });
});

// @desc    Search properties
// @route   GET /api/properties/search
// @access  Public
export const searchProperties = asyncHandler(async (req, res) => {
  const {
    q,
    location,
    type,
    minPrice,
    maxPrice,
    roomType,
    flatType,
    bedrooms,
    bathrooms,
    page = 1,
    limit = 10,
    sort = '-createdAt',
  } = req.query;

  let query = { status: 'available' };

  // Enhanced search query with better text matching
  if (q) {
    const searchTerms = q
      .toLowerCase()
      .split(' ')
      .filter((term) => term.length > 1);

    // Create flexible search patterns
    const searchPatterns = searchTerms.map((term) => ({
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { type: { $regex: term, $options: 'i' } },
        { roomType: { $regex: term, $options: 'i' } },
        { flatType: { $regex: term, $options: 'i' } },
      ],
    }));

    // Check for price-related queries
    const pricePatterns = [
      { regex: /(under|below|less than)\s*(\d+)(k|thousand)?/i, type: 'max' },
      { regex: /(over|above|more than)\s*(\d+)(k|thousand)?/i, type: 'min' },
      {
        regex: /(around|about|approximately)\s*(\d+)(k|thousand)?/i,
        type: 'approx',
      },
      { regex: /(\d+)\s*-\s*(\d+)(k|thousand)?/i, type: 'range' },
      { regex: /(\d+)(k|thousand)?\s*(and\s*)?(under|below)/i, type: 'max' },
    ];

    let priceFilter = null;
    for (const pattern of pricePatterns) {
      const match = q.match(pattern.regex);
      if (match) {
        const amount =
          parseInt(match[2]) *
          (match[3] && match[3].startsWith('k') ? 1000 : 1);

        if (pattern.type === 'max') {
          priceFilter = { $lte: amount };
        } else if (pattern.type === 'min') {
          priceFilter = { $gte: amount };
        } else if (pattern.type === 'approx') {
          priceFilter = { $gte: amount * 0.8, $lte: amount * 1.2 };
        } else if (pattern.type === 'range' && match[4]) {
          const amount2 =
            parseInt(match[4]) *
            (match[5] && match[5].startsWith('k') ? 1000 : 1);
          priceFilter = {
            $gte: Math.min(amount, amount2),
            $lte: Math.max(amount, amount2),
          };
        }
        break;
      }
    }

    if (priceFilter) {
      query.price = priceFilter;
    }

    // Add text search conditions
    if (searchPatterns.length > 0) {
      query.$and = searchPatterns;
    }
  }

  // Additional filters
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (type) {
    query.type = type;
  }

  if (roomType) {
    query.roomType = roomType;
  }

  if (flatType) {
    query.flatType = flatType;
  }

  // Price range filters
  if (minPrice || maxPrice) {
    if (!query.price) query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice);
    if (maxPrice) query.price.$lte = parseInt(maxPrice);
  }

  if (bedrooms) {
    query.bedrooms = parseInt(bedrooms);
  }

  if (bathrooms) {
    query.bathrooms = parseInt(bathrooms);
  }

  console.log('Search query:', JSON.stringify(query, null, 2));

  const properties = await Property.find(query)
    .populate('sellerId', 'name email profile.phone')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Property.countDocuments(query);

  res.json({
    success: true,
    count: properties.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: properties,
  });
});

// @desc    Toggle property featured status
// @route   PUT /api/properties/:id/featured
// @access  Private (Admin)
export const toggleFeatured = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  property.featured = !property.featured;
  await property.save();

  res.json({
    success: true,
    data: property,
  });
});
