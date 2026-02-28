import asyncHandler from 'express-async-handler';
import Property from '../models/Property.js';
import User from '../models/user.js';
import Wishlist from '../models/Wishlist.js';
import Booking from '../models/Booking.js';
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

  // Increment view count (prevent double counting)
  // Use a simple in-memory cache to track recent views per IP/session
  const viewCache = global.viewCache || new Map();
  global.viewCache = viewCache;
  
  const sessionId = req.headers['x-session-id'] || req.ip || 'anonymous';
  const viewKey = `${req.params.id}_${sessionId}`;
  const lastViewTime = viewCache.get(viewKey) || 0;
  const now = Date.now();
  const oneMinute = 60 * 1000; // 1 minute cooldown
  
  // Only increment if not viewed in the last minute
  if (now - lastViewTime > oneMinute) {
    const isLoggedIn = req.user ? true : false;

    property.views.total += 1;
    if (isLoggedIn) {
      property.views.loggedIn += 1;
    } else {
      property.views.anonymous += 1;
    }

    await property.save();
    
    // Store view timestamp in cache
    viewCache.set(viewKey, now);
    
    // Clean up old cache entries (older than 1 hour)
    if (viewCache.size > 1000) {
      for (const [key, time] of viewCache.entries()) {
        if (now - time > 60 * 60 * 1000) { // 1 hour
          viewCache.delete(key);
        }
      }
    }

    // Track property view in analytics
    await trackPropertyView(req.params.id, req);
  }

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

    // Map common search terms to property types
    const typeMapping = {
      'room': 'room',
      'rooms': 'room',
      'flat': 'flat',
      'flats': 'flat',
      'apartment': 'apartment',
      'apartments': 'apartment',
      'house': 'house',
      'houses': 'house',
      'studio': 'studio',
      'studios': 'studio',
      'penthouse': 'penthouse',
      'commercial': 'commercial',
      'office': 'commercial',
      'shop': 'commercial',
    };

    // Check if search term matches a property type
    let matchedType = null;
    for (const term of searchTerms) {
      if (typeMapping[term]) {
        matchedType = typeMapping[term];
        break;
      }
    }

    // Create flexible search patterns
    const searchPatterns = searchTerms.map((term) => ({
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { type: { $regex: term, $options: 'i' } },
        { roomType: { $regex: term, $options: 'i' } },
        { flatType: { $regex: term, $options: 'i' } },
        { 'address.city': { $regex: term, $options: 'i' } },
        { 'address.street': { $regex: term, $options: 'i' } },
        { 'address.state': { $regex: term, $options: 'i' } },
      ],
    }));

    // If type was matched, add it to query
    if (matchedType && !type) {
      query.type = matchedType;
    }

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

// @desc    Smart recommendations based on history, preferences, and group size
// @route   POST /api/properties/recommendations
// @access  Public (uses auth when available)
export const getRecommendations = asyncHandler(async (req, res) => {
  const { user } = req;
  const {
    userLocation,
    preferences = {},
    limit = 8,
  } = req.body || {};

  const maxResults = Math.min(parseInt(limit, 10) || 8, 20);

  // Base query: only available properties
  const query = { status: 'available' };

  if (preferences.type) {
    query.type = preferences.type;
  }

  if (preferences.minPrice || preferences.maxPrice) {
    query.price = {};
    if (preferences.minPrice) query.price.$gte = Number(preferences.minPrice);
    if (preferences.maxPrice) query.price.$lte = Number(preferences.maxPrice);
  }

  // Fetch candidate properties
  const candidates = await Property.find(query)
    .populate('sellerId', 'name email role')
    .lean();

  if (!candidates.length) {
    return res.json({
      success: true,
      data: {
        recommendations: [],
        basedOn: {
          reason: 'no_candidates',
        },
        userLocation: userLocation || null,
      },
    });
  }

  // Derive implicit preferences from wishlist and bookings (acts as "booking history")
  let historyProperties = [];
  if (user) {
    const [wishlistItems, bookings] = await Promise.all([
      Wishlist.find({ user: user._id })
        .populate('property', 'type price location bedrooms bathrooms address')
        .lean(),
      Booking.find({
        user: user._id,
        status: { $in: ['confirmed', 'completed'] },
      })
        .populate('property', 'type price location bedrooms bathrooms address')
        .lean(),
    ]);

    historyProperties = [
      ...wishlistItems.map((w) => w.property).filter(Boolean),
      ...bookings.map((b) => b.property).filter(Boolean),
    ];
  }

  const historyCount = historyProperties.length;

  // Aggregate history preferences
  const typeCounts = {};
  const cityCounts = {};
  let priceSum = 0;
  let priceCount = 0;
  let inferredGroupSize = 0;

  historyProperties.forEach((p) => {
    if (!p) return;
    if (p.type) {
      typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
    }
    const city =
      p.address?.city || (p.location ? p.location.split(',')[0].trim() : null);
    if (city) {
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    }
    if (typeof p.price === 'number') {
      priceSum += p.price;
      priceCount += 1;
    }
    if (typeof p.bedrooms === 'number' && p.bedrooms > 0) {
      inferredGroupSize = Math.max(
        inferredGroupSize,
        Math.min(p.bedrooms * 2, 10)
      );
    }
  });

  const favoriteType =
    Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const favoriteCity =
    Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const averageHistoryPrice =
    priceCount > 0 ? Math.round(priceSum / priceCount) : null;

  const groupSize =
    Number(preferences.groupSize) > 0
      ? Number(preferences.groupSize)
      : inferredGroupSize || 1;

  // Build a quick lookup set for history properties (used to boost score)
  const historyIds = new Set(
    historyProperties.map((p) => p?._id?.toString()).filter(Boolean)
  );

  const desiredLocation =
    preferences.location || favoriteCity || userLocation?.city || null;

  // Score each candidate
  const scored = candidates.map((p) => {
    let score = 10; // base score

    // Type match
    if (preferences.type && p.type === preferences.type) {
      score += 20;
    } else if (!preferences.type && favoriteType && p.type === favoriteType) {
      score += 15;
    }

    // Location match (very simple text-based matching)
    const propertyCity =
      p.address?.city || (p.location ? p.location.split(',')[0].trim() : null);
    if (
      desiredLocation &&
      propertyCity &&
      propertyCity.toLowerCase().includes(desiredLocation.toLowerCase())
    ) {
      score += 20;
    } else if (
      desiredLocation &&
      p.location &&
      p.location.toLowerCase().includes(desiredLocation.toLowerCase())
    ) {
      score += 15;
    }

    // Price closeness to either explicit preference or history average
    const targetPrice =
      (preferences.minPrice && preferences.maxPrice
        ? (Number(preferences.minPrice) + Number(preferences.maxPrice)) / 2
        : preferences.maxPrice
        ? Number(preferences.maxPrice)
        : preferences.minPrice
        ? Number(preferences.minPrice)
        : averageHistoryPrice) || null;

    if (targetPrice && typeof p.price === 'number') {
      const diff = Math.abs(p.price - targetPrice);
      const ratio = Math.min(diff / Math.max(targetPrice, 1), 1); // 0..1
      const priceScore = Math.round((1 - ratio) * 20); // 0..20
      score += priceScore;
    }

    // Group size / capacity match (simple heuristic: 2 people per bedroom)
    const capacity =
      typeof p.bedrooms === 'number' && p.bedrooms > 0
        ? p.bedrooms * 2
        : 2;
    if (groupSize && capacity >= groupSize) {
      score += 20;
    } else if (groupSize) {
      const ratio = capacity / groupSize;
      score += Math.max(0, Math.round(ratio * 15)); // up to 15 if partially suitable
    }

    // Boost properties the user has interacted with before (wishlist / bookings)
    if (historyIds.has(p._id.toString())) {
      score += 20;
    }

    // Add small popularity boost based on views
    const views = p.views?.total || 0;
    if (views > 0) {
      const popularityBoost = Math.min(Math.round(views / 50), 15);
      score += popularityBoost;
    }

    return {
      ...p,
      recommendationScore: Math.min(score, 100),
    };
  });

  // Sort by score descending and limit
  scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
  const recommendations = scored.slice(0, maxResults);

  res.json({
    success: true,
    data: {
      recommendations,
      basedOn: {
        historyCount,
        favoriteType,
        favoriteCity,
        averageHistoryPrice,
        explicitType: preferences.type || null,
        explicitPriceRange: {
          min: preferences.minPrice || null,
          max: preferences.maxPrice || null,
        },
        groupSize,
      },
      userLocation: userLocation || null,
    },
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
