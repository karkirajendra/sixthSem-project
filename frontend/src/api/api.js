// API Configuration and Utilities
import { API_URL } from '../config.js';

// API Helper Functions
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const handleApiResponse = async (response) => {
  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    if (response.status !== 204) {
      throw new Error('Failed to parse server response.');
    }
  }

  if (!response.ok) {
    const apiError = new Error(
      data?.message || `HTTP error! status: ${response.status}`
    );
    apiError.status = response.status;
    if (data?.errors) {
      apiError.errors = data.errors;
    }
    apiError.data = data;
    throw apiError;
  }

  return data;
};

// Mock data for fallback (will be replaced by API calls)
export const USERS = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'buyer' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'seller' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'seller' },
];

export const PROPERTIES = [
  // Rooms
  {
    id: 1,
    title: 'Modern Single Room with Kitchen',
    description:
      'A beautifully designed single room with attached kitchen and sleeping area.',
    price: 8000,
    type: 'room',
    roomType: 'single-kitchen',
    location: 'Kathmandu',
    area: 200,
    imageUrl:
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
    sellerId: 2,
    status: 'available',
    views: { total: 156, loggedIn: 89, anonymous: 67 },
    featured: true,
  },
  {
    id: 2,
    title: 'Cozy Double Room',
    description:
      'Spacious double room with shared kitchen and bathroom facilities.',
    price: 12000,
    type: 'room',
    roomType: 'double',
    location: 'Patan',
    area: 250,
    imageUrl:
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    sellerId: 2,
    status: 'available',
    views: { total: 98, loggedIn: 45, anonymous: 53 },
    featured: false,
  },
  {
    id: 3,
    title: 'Luxury Studio Apartment',
    description: 'Fully furnished studio apartment with modern amenities.',
    price: 18000,
    type: 'room',
    roomType: 'studio',
    location: 'Boudha',
    area: 300,
    imageUrl:
      'https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg',
    sellerId: 3,
    status: 'available',
    views: { total: 210, loggedIn: 120, anonymous: 90 },
    featured: true,
  },
  {
    id: 4,
    title: 'Budget Single Room',
    description: 'Simple and affordable single room with shared facilities.',
    price: 6000,
    type: 'room',
    roomType: 'single',
    location: 'Koteshwor',
    area: 150,
    imageUrl:
      'https://images.pexels.com/photos/164558/pexels-photo-164558.jpeg',
    sellerId: 3,
    status: 'available',
    views: { total: 87, loggedIn: 32, anonymous: 55 },
    featured: false,
  },

  // Flats
  {
    id: 5,
    title: 'Spacious 2BHK Flat',
    description: 'Modern 2BHK flat with all amenities in a prime location.',
    price: 25000,
    type: 'flat',
    flatType: '2bhk',
    location: 'Lalitpur',
    area: 800,
    imageUrl:
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    sellerId: 2,
    status: 'available',
    views: { total: 234, loggedIn: 145, anonymous: 89 },
    featured: true,
  },
  {
    id: 6,
    title: 'Luxury 3BHK Apartment',
    description:
      'Premium apartment with modern amenities and stunning city views.',
    price: 35000,
    type: 'flat',
    flatType: '3bhk',
    location: 'Kathmandu',
    area: 1200,
    imageUrl:
      'https://images.pexels.com/photos/2462015/pexels-photo-2462015.jpeg',
    sellerId: 2,
    status: 'available',
    views: { total: 312, loggedIn: 198, anonymous: 114 },
    featured: true,
  },
  {
    id: 7,
    title: 'Compact 1BHK Flat',
    description: 'Affordable 1BHK flat perfect for singles or couples.',
    price: 18000,
    type: 'flat',
    flatType: '1bhk',
    location: 'Bhaktapur',
    area: 500,
    imageUrl:
      'https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg',
    sellerId: 3,
    status: 'available',
    views: { total: 145, loggedIn: 78, anonymous: 67 },
    featured: false,
  },
  {
    id: 8,
    title: 'Modern 2BHK Duplex',
    description: 'Stylish duplex apartment with two floors and balcony.',
    price: 30000,
    type: 'flat',
    flatType: '2bhk-duplex',
    location: 'Kathmandu',
    area: 950,
    imageUrl:
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
    sellerId: 3,
    status: 'available',
    views: { total: 189, loggedIn: 112, anonymous: 77 },
    featured: true,
  },
  {
    id: 9,
    title: 'Affordable 1BHK for Students',
    description: 'Budget-friendly 1BHK near university area.',
    price: 15000,
    type: 'flat',
    flatType: '1bhk',
    location: 'Kirtipur',
    area: 450,
    imageUrl:
      'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg',
    sellerId: 2,
    status: 'available',
    views: { total: 132, loggedIn: 65, anonymous: 67 },
    featured: false,
  },
  {
    id: 10,
    title: 'Family 3BHK with Garden',
    description: 'Spacious family flat with small garden area.',
    price: 40000,
    type: 'flat',
    flatType: '3bhk',
    location: 'Dhapasi',
    area: 1400,
    imageUrl:
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
    sellerId: 3,
    status: 'available',
    views: { total: 167, loggedIn: 98, anonymous: 69 },
    featured: true,
  },
];

const WISHLIST = [
  { userId: 1, propertyId: 1 },
  { userId: 1, propertyId: 3 },
  { userId: 1, propertyId: 6 },
];

// Helper function to simulate API delay (keeping for backward compatibility)
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Authentication API functions
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    const data = await handleApiResponse(response);

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
    }

    return { success: true, user: data.data, token: data.token };
  } catch (error) {
    const message =
      error.errors?.map((err) => err.msg).join(', ') || error.message;
    return { success: false, message };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(userData),
    });

    const data = await handleApiResponse(response);

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
    }

    return { success: true, user: data.data, token: data.token };
  } catch (error) {
    const message =
      error.errors?.map((err) => err.msg).join(', ') || error.message;
    return { success: false, message };
  }
};

export const logoutUser = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return { success: true };
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify({ email }),
    });

    const data = await handleApiResponse(response);
    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await fetch(
      `${API_URL}/api/auth/reset-password/${token}`,
      {
        method: 'POST',
        headers: createHeaders(false),
        body: JSON.stringify({ password }),
      }
    );

    const data = await handleApiResponse(response);
    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Property API functions
export const getFeaturedProperties = async () => {
  try {
    const response = await fetch(`${API_URL}/api/properties/featured`, {
      headers: createHeaders(false),
    });

    const data = await handleApiResponse(response);
    return data.properties || [];
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return PROPERTIES.filter((property) => property.featured); // Fallback to mock data
  }
};

export const getAllProperties = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.location) queryParams.append('location', filters.location);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const url = `${API_URL}/api/properties${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    console.log('Fetching from URL:', url); // Debug log

    const response = await fetch(url, {
      headers: createHeaders(false),
    });

    console.log('Response status:', response.status); // Debug log

    const data = await handleApiResponse(response);
    console.log('Raw API response:', data); // Debug log

    const result = {
      properties: data.data || data.properties || [],
      totalPages: data.totalPages || 1,
      currentPage: data.currentPage || 1,
      total: data.total || 0,
    };

    console.log('Processed result:', result); // Debug log
    return result;
  } catch (error) {
    console.error('Error fetching properties:', error);
    // Fallback to mock data with filtering
    let filteredProperties = [...PROPERTIES];

    if (filters.location) {
      filteredProperties = filteredProperties.filter((property) =>
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.type) {
      filteredProperties = filteredProperties.filter(
        (property) => property.type === filters.type
      );
    }

    if (filters.minPrice) {
      filteredProperties = filteredProperties.filter(
        (property) => property.price >= filters.minPrice
      );
    }

    if (filters.maxPrice) {
      filteredProperties = filteredProperties.filter(
        (property) => property.price <= filters.maxPrice
      );
    }

    return {
      properties: filteredProperties,
      totalPages: 1,
      currentPage: 1,
      total: filteredProperties.length,
    };
  }
};

export const getPropertyById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/properties/${id}`, {
      headers: createHeaders(false),
    });

    const data = await handleApiResponse(response);
    return { success: true, property: data.data };
  } catch (error) {
    console.error('Error fetching property:', error);
    // Fallback to mock data
    const property = PROPERTIES.find(
      (property) => property.id === parseInt(id)
    );

    if (property) {
      property.views.total += 1;
      property.views.anonymous += 1;
      return { success: true, property };
    }

    return { success: false, message: 'Property not found' };
  }
};

// In your api.js file, update the createProperty function:
export const createProperty = async (propertyData) => {
  try {
    console.log('Sending property data to API:', propertyData); // Debug log
    
    const response = await fetch(`${API_URL}/api/properties`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(propertyData),
    });

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Server error response:', errorData);
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response:', data); // Debug log
    
    return { success: true, property: data.data };
  } catch (error) {
    console.error('Error creating property:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to create property' 
    };
  }
};

export const updateProperty = async (id, propertyData) => {
  try {
    const response = await fetch(`${API_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(propertyData),
    });

    const data = await handleApiResponse(response);
    return { success: true, property: data.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deleteProperty = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/properties/${id}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });

    await handleApiResponse(response);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Wishlist API functions
// Add these wishlist functions to your api.js

// In your api.js, update the wishlist functions:

// Helper function to normalize IDs (convert to string for consistency)
const normalizeId = (id) => String(id);

// Update the localStorage helper functions
const updateLocalStorageWishlist = (userId, propertyId, action) => {
  try {
    const storageKey = `wishlist_${userId}`;
    const currentWishlist = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    let updatedWishlist;
    const normalizedId = normalizeId(propertyId);
    
    if (action === 'add') {
      if (!currentWishlist.includes(normalizedId)) {
        updatedWishlist = [...currentWishlist, normalizedId];
        localStorage.setItem(storageKey, JSON.stringify(updatedWishlist));
      }
    } else {
      updatedWishlist = currentWishlist.filter(id => id !== normalizedId);
      localStorage.setItem(storageKey, JSON.stringify(updatedWishlist));
    }
  } catch (e) {
    console.error('Error updating localStorage wishlist:', e);
    throw e;
  }
};

// Get initial wishlist state for a property
export const getWishlistState = (userId, propertyId) => {
  try {
    const storageKey = `wishlist_${userId}`;
    const currentWishlist = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const normalizedId = normalizeId(propertyId);
    return currentWishlist.includes(normalizedId);
  } catch (e) {
    console.error('Error getting wishlist state:', e);
    return false;
  }
};

// Update the API calls to handle ID conversion
export const addToWishlist = async (userId, propertyId) => {
  try {
    // Try API first
    const response = await fetch(`${API_URL}/api/wishlist`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ propertyId: normalizeId(propertyId) }),
    });

    if (response.ok) {
      const data = await response.json();
      
      // Update localStorage as backup
      updateLocalStorageWishlist(userId, propertyId, 'add');
      
      return { success: true, message: data.message || 'Added to wishlist' };
    }
    
    throw new Error('API unavailable');
  } catch (error) {
    console.warn('Using localStorage fallback for addToWishlist');
    
    // Fallback to localStorage
    try {
      updateLocalStorageWishlist(userId, propertyId, 'add');
      return { success: true, message: 'Added to wishlist' };
    } catch (e) {
      console.error('Error with localStorage fallback:', e);
      return { success: false, message: 'Failed to add to wishlist' };
    }
  }
};

export const removeFromWishlist = async (userId, propertyId) => {
  try {
    // Try API first
    const response = await fetch(`${API_URL}/api/wishlist/${normalizeId(propertyId)}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });

    if (response.ok) {
      const data = await response.json();
      
      // Update localStorage as backup
      updateLocalStorageWishlist(userId, propertyId, 'remove');
      
      return { success: true, message: data.message || 'Removed from wishlist' };
    }
    
    throw new Error('API unavailable');
  } catch (error) {
    console.warn('Using localStorage fallback for removeFromWishlist');
    
    // Fallback to localStorage
    try {
      updateLocalStorageWishlist(userId, propertyId, 'remove');
      return { success: true, message: 'Removed from wishlist' };
    } catch (e) {
      console.error('Error with localStorage fallback:', e);
      return { success: false, message: 'Failed to remove from wishlist' };
    }
  }
};
export const getWishlistByUserId = async (userId) => {
  // Return empty array if userId is not provided
  if (!userId) {
    return [];
  }

  try {
    // Try API first
    const response = await fetch(`${API_URL}/api/wishlist/user/${userId}`, {
      headers: createHeaders(true),
    });

    if (response.ok) {
      const data = await response.json();
      return data.wishlistItems || data.data || [];
    }
    
    throw new Error('API unavailable');
  } catch (error) {
    console.warn('Using localStorage fallback for getWishlistByUserId');
    
    // Fallback to localStorage
    try {
      const storageKey = `wishlist_${userId}`;
      const wishlist = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return wishlist;
    } catch (e) {
      console.error('Error with localStorage fallback:', e);
      return [];
    }
  }
};

// User API functions
export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      headers: createHeaders(true),
    });

    const data = await handleApiResponse(response);
    return { success: true, user: data.data.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(profileData),
    });

    const data = await handleApiResponse(response);
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Feedback API functions
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(feedbackData),
    });

    const data = await handleApiResponse(response);
    return { success: true, feedback: data.feedback };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getFeedback = async () => {
  try {
    const response = await fetch(`${API_URL}/api/feedback`, {
      headers: createHeaders(true),
    });

    const data = await handleApiResponse(response);
    return { success: true, feedback: data.feedback };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const addProperty = async (propertyData) => {
  try {
    const response = await fetch(`${API_URL}/api/properties`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(propertyData),
    });

    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('Error adding property:', error);
    // Fallback to mock data for development
    await delay(800);

    const newProperty = {
      id: PROPERTIES.length + 1,
      ...propertyData,
      views: {
        total: 0,
        loggedIn: 0,
        anonymous: 0,
      },
      status: 'pending',
      featured: false,
    };

    PROPERTIES.push(newProperty);
    return { success: true, data: newProperty };
  }
};

export const getPropertiesBySellerId = async (sellerId) => {
  await delay(500);
  return PROPERTIES.filter((property) => property.sellerId === sellerId);
};

export const getSellerDashboardStats = async (sellerId) => {
  await delay(400);

  const sellerProperties = PROPERTIES.filter(
    (property) => property.sellerId === sellerId
  );

  const totalListings = sellerProperties.length;
  const totalViews = sellerProperties.reduce(
    (sum, property) => sum + (property.views?.total || 0),
    0
  );
  const loggedInViews = sellerProperties.reduce(
    (sum, property) => sum + (property.views?.loggedIn || 0),
    0
  );
  const anonymousViews = Math.max(totalViews - loggedInViews, 0);

  const totalInquiries = Math.max(
    Math.round(totalListings * 1.5) + Math.floor(Math.random() * 5),
    0
  );

  const viewsChartData =
    totalListings === 0
      ? Array(7).fill(0)
      : Array.from({ length: 7 }, (_, index) => {
          const property =
            sellerProperties[index % sellerProperties.length] || {};
          const averageViews = property.views?.total
            ? property.views.total / 7
            : 0;
          return Math.max(
            0,
            Math.round(averageViews) + Math.floor(Math.random() * 10)
          );
        });

  return {
    totalListings,
    totalViews,
    totalInquiries,
    loggedInViews,
    anonymousViews,
    viewsChartData,
  };
};

// Get my properties (for authenticated sellers)
export const getMyProperties = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(
      `${API_URL}/api/properties/my/properties${
        queryParams.toString() ? '?' + queryParams.toString() : ''
      }`,
      {
        method: 'GET',
        headers: createHeaders(true),
      }
    );

    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('Error fetching my properties:', error);
    // Fallback to mock data for development
    await delay(500);
    const mockProperties = PROPERTIES.filter(
      (property) => property.sellerId === 2
    );
    return {
      success: true,
      data: mockProperties,
      count: mockProperties.length,
      total: mockProperties.length,
    };
  }
};

// Image Upload Functions
export const uploadSingleImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/images/upload-single`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    const data = await handleApiResponse(response);
    return { success: true, imageUrl: data.data.url };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const uploadMultipleImages = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await fetch(`${API_URL}/api/images/upload-multiple`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    const data = await handleApiResponse(response);
    return {
      success: true,
      imageUrls: data.data.uploaded.map((img) => img.url),
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Search Properties API
export const searchProperties = async (searchParams) => {
  try {
    const queryParams = new URLSearchParams();

    // Handle search query - could be from location, type, or general search
    let searchQuery = '';
    if (searchParams.location) {
      searchQuery = searchParams.location;
    } else if (searchParams.type) {
      searchQuery = searchParams.type;
    } else if (searchParams.q) {
      searchQuery = searchParams.q;
    }

    if (searchQuery) queryParams.append('q', searchQuery);
    if (searchParams.minPrice)
      queryParams.append('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice)
      queryParams.append('maxPrice', searchParams.maxPrice);
    if (searchParams.page) queryParams.append('page', searchParams.page);
    if (searchParams.limit) queryParams.append('limit', searchParams.limit);

    const url = `${API_URL}/api/properties/search${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url, {
      headers: createHeaders(false),
    });

    const data = await handleApiResponse(response);
    return {
      properties: data.properties || data.data || [],
      totalPages: data.totalPages || 1,
      currentPage: data.currentPage || 1,
      total: data.total || 0,
    };
  } catch (error) {
    console.error('Error searching properties:', error);
    // Fallback to regular getAllProperties if search fails
    return getAllProperties(searchParams);
  }
};

// Add these functions to your existing src/api/api.js file

// Location-based API functions
export const getNearbyProperties = async (locationData) => {
  try {
    const response = await fetch(`${API_URL}/api/properties/nearby`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(locationData)
    });

    const data = await handleApiResponse(response);
    return {
      success: true,
      properties: data.data.properties || [],
      userLocation: data.data.userLocation,
      searchRadius: data.data.searchRadius,
      pagination: data.data.pagination
    };
  } catch (error) {
    console.error('Error fetching nearby properties:', error);
    return { success: false, message: error.message };
  }
};

export const getLocationBasedRecommendations = async (requestData) => {
  try {
    const response = await fetch(`${API_URL}/api/properties/recommendations`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(requestData)
    });

    const data = await handleApiResponse(response);
    return {
      success: true,
      recommendations: data.data.recommendations || [],
      basedOn: data.data.basedOn,
      userLocation: data.data.userLocation
    };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { success: false, message: error.message };
  }
};

export const detectUserLocationAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/api/properties/detect-location`, {
      headers: createHeaders(false)
    });

    const data = await handleApiResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error detecting location:', error);
    throw error;
  }
};

export const geocodeAddress = async (address, city = '') => {
  try {
    const response = await fetch(`${API_URL}/api/properties/geocode`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ address, city })
    });

    const data = await handleApiResponse(response);
    return {
      success: true,
      coordinates: data.data.coordinates,
      formattedAddress: data.data.formattedAddress
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return { success: false, message: error.message };
  }
};