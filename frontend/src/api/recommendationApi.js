// Recommendation API Integration
import { API_URL } from '../config.js';
export const performSuperSearch = async (query, page = 1, limit = 12) => {
  try {
    // First try the API
    const response = await fetch(`${API_URL}/api/properties/super-search?page=${page}&limit=${limit}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('API Super Search Results:', data.data);
        // Return the properties with the additional metadata
        return {
          properties: data.data.properties || [],
          pagination: data.data.pagination || {},
          searchParams: data.data.searchParams || {},
          isAISearch: true
        };
      }
    } else {
      console.warn('API super search failed, falling back to local search');
      throw new Error('API super search failed');
    }
  } catch (error) {
    console.error('API Super search error, using fallback:', error);
    // Fallback to your existing enhanced local search
    try {
      const fallbackResults = await superSearch(query);
      return {
        properties: fallbackResults || [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalProperties: fallbackResults?.length || 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        searchParams: {
          originalQuery: query,
          parsedQuery: null,
          filtersApplied: {}
        },
        isAISearch: false
      };
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
      return {
        properties: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalProperties: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        searchParams: {
          originalQuery: query,
          parsedQuery: null,
          filtersApplied: {}
        },
        isAISearch: false
      };
    }
  }
};

// API Helper Functions
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const createHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleApiResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
};

// Import mock data for fallback
import { delay, PROPERTIES } from './api';

// Mock properties for fallback - simplified version
const MOCK_PROPERTIES = [
  {
    id: 1,
    title: 'Modern Single Room',
    price: 8000,
    type: 'room',
    location: 'Kathmandu',
    area: 200,
  },
  {
    id: 2,
    title: 'Cozy Double Room',
    price: 12000,
    type: 'room',
    location: 'Patan',
    area: 250,
  },
];

// Enhanced search function with natural language processing

const searchProperties = (query, properties = MOCK_PROPERTIES) => {
  if (!query) return properties;

  // Cache implementation
  const normalizedQuery = query.toLowerCase();
  const cacheKey = `search:${normalizedQuery}`;

  try {
    const cachedResults = sessionStorage.getItem(cacheKey);
    if (cachedResults) {
      return JSON.parse(cachedResults);
    }
  } catch (e) {
    console.warn('Failed to read from cache', e);
  }

  const queryLower = normalizedQuery;
  
  // Normalize properties to ensure all required fields exist
  const normalizedProperties = properties.map(property => ({
    ...property,
    id: property.id || property._id,
    title: property.title || '',
    description: property.description || '',
    location: property.location || '',
    type: property.type || '',
    price: property.price || 0,
    featured: property.featured || false,
    views: property.views || { total: 0, anonymous: 0 },
    imageUrl: property.images?.[0] || property.imageUrl || '/placeholder-property.jpg'
  }));

  let results = [...normalizedProperties];

  // Enhanced price matching patterns
  const priceTerms = [
    { regex: /(under|below|less than)\s*(\d+)(k|k?)/i, modifier: 'max' },
    { regex: /(over|above|more than)\s*(\d+)(k|k?)/i, modifier: 'min' },
    { regex: /(around|about|~)\s*(\d+)(k|k?)/i, modifier: 'approx' },
    { regex: /(\d+)\s*-\s*(\d+)(k|k?)/i, modifier: 'range' },
    { regex: /(\d+)(k|k?)\s*(and\s*)?(under|below|less)/i, modifier: 'max' },
    { regex: /(\d+)(k|k?)\s*(and\s*)?(over|above|more)/i, modifier: 'min' },
  ];

  let priceFilters = [];

  priceTerms.forEach(({ regex, modifier }) => {
    const match = queryLower.match(regex);
    if (match) {
      const amount1 = parseInt(match[2]) * (match[3] === 'k' ? 1000 : 1);
      const amount2 = match[4] ? parseInt(match[4]) * (match[5] === 'k' ? 1000 : 1) : null;

      if (modifier === 'max') {
        priceFilters.push({ max: amount1 });
      } else if (modifier === 'min') {
        priceFilters.push({ min: amount1 });
      } else if (modifier === 'approx') {
        priceFilters.push({ min: amount1 * 0.9, max: amount1 * 1.1 });
      } else if (modifier === 'range' && amount2) {
        priceFilters.push({ min: amount1, max: amount2 });
      }
    }
  });

  // Enhanced property type detection
  const typeKeywords = {
    room: ['room', 'rooms', 'studio', 'single room', 'shared room'],
    flat: ['flat', 'flats', 'apartment', 'apartments', 'condo', 'condos'],
    house: ['house', 'houses', 'home', 'homes', 'villa', 'bungalow'],
  };

  let matchedTypes = [];
  Object.entries(typeKeywords).forEach(([type, keywords]) => {
    if (keywords.some((kw) => queryLower.includes(kw))) {
      matchedTypes.push(type);
    }
  });

  // Enhanced location detection
  const locations = [
    'kathmandu', 'patan', 'bhaktapur', 'pokhara', 'lalitpur', 'boudha',
    'kirtipur', 'dhapasi', 'thamel', 'jawalakhel', 'baneshwor', 'dillibazar',
    'gongabu', 'koteshwor', 'chabahil', 'jorpati', 'mulpani'
  ];

  const matchedLocations = locations.filter((loc) => queryLower.includes(loc));

  // Enhanced budget terms
  const budgetTerms = {
    cheap: ['cheap', 'affordable', 'low cost', 'budget', 'economical', 'low price', 'inexpensive', 'reasonable'],
    expensive: ['expensive', 'luxury', 'premium', 'high end', 'deluxe', 'upscale', 'exclusive'],
  };

  let budgetFilter;
  Object.entries(budgetTerms).forEach(([type, terms]) => {
    if (terms.some((term) => queryLower.includes(term))) {
      budgetFilter = type;
    }
  });

  // Apply all filters with safe property access
  const filteredAndSortedResults = results
    .filter((property) => {
      // Price filters
      const priceMatch = priceFilters.length === 0 ? true : priceFilters.some((filter) => {
        if (filter.min !== undefined && filter.max !== undefined) {
          return property.price >= filter.min && property.price <= filter.max;
        } else if (filter.min !== undefined) {
          return property.price >= filter.min;
        } else if (filter.max !== undefined) {
          return property.price <= filter.max;
        }
        return true;
      });

      // Budget term matching
      const budgetMatch = budgetFilter === 'cheap' ? property.price <= 25000 
        : budgetFilter === 'expensive' ? property.price >= 20000 
        : true;

      // Type matching
      const typeMatch = matchedTypes.length === 0 ? true : matchedTypes.includes(property.type);

      // Location matching - SAFE VERSION
      const locationMatch = matchedLocations.length === 0 ? true : matchedLocations.some((loc) =>
        (property.location || '').toLowerCase().includes(loc)
      );

      // Text matching - SAFE VERSION
      const textMatch = 
        (property.title || '').toLowerCase().includes(queryLower) ||
        (property.description || '').toLowerCase().includes(queryLower) ||
        queryLower.split(' ').some((term) =>
          term.length > 3 && (
            (property.title || '').toLowerCase().includes(term) ||
            (property.description || '').toLowerCase().includes(term)
          )
        );

      return priceMatch && budgetMatch && typeMatch && locationMatch && textMatch;
    })
    .sort((a, b) => {
      // Sort by relevance score
      let scoreA = 0;
      let scoreB = 0;

      // Boost featured properties
      if (a.featured) scoreA += 2;
      if (b.featured) scoreB += 2;

      // Boost by views
      scoreA += (a.views?.total || 0) * 0.001;
      scoreB += (b.views?.total || 0) * 0.001;

      // Boost exact matches
      if ((a.title || '').toLowerCase().includes(queryLower)) scoreA += 1;
      if ((b.title || '').toLowerCase().includes(queryLower)) scoreB += 1;

      return scoreB - scoreA;
    });

  // Cache the results
  try {
    if (filteredAndSortedResults.length > 0) {
      sessionStorage.setItem(cacheKey, JSON.stringify(filteredAndSortedResults));
    }
  } catch (e) {
    console.warn('Failed to cache results', e);
  }

  return filteredAndSortedResults;
};

// Enhanced recommendation algorithm
const recommendProperties = (
  propertyId,
  allProperties,
  searchCriteria = null
) => {
  if (searchCriteria) {
    // For search-based recommendations
    const results = searchProperties(searchCriteria.query || '');

    // If we have price filters in criteria, apply them
    if (searchCriteria.minPrice || searchCriteria.maxPrice) {
      return results
        .filter((p) => {
          return (
            (!searchCriteria.minPrice || p.price >= searchCriteria.minPrice) &&
            (!searchCriteria.maxPrice || p.price <= searchCriteria.maxPrice)
          );
        })
        .slice(0, 4);
    }

    return results.slice(0, 4);
  }

  if (!propertyId) {
    // For homepage - return featured properties with highest views
    return allProperties
      .filter((p) => p.featured)
      .sort((a, b) => b.views.total - a.views.total)
      .slice(0, 4);
  }

  // For property page - find similar properties
  const currentProperty = allProperties.find((p) => p.id === propertyId);
  if (!currentProperty) return [];

  return allProperties
    .filter((p) => {
      // Don't recommend the same property
      if (p.id === propertyId) return false;

      // Match on type if specified
      if (currentProperty.type && p.type !== currentProperty.type) return false;

      // Match on location if specified
      if (currentProperty.location && p.location !== currentProperty.location)
        return false;

      return true;
    })
    .sort((a, b) => {
      // Sort by price similarity first
      const priceDiffA = Math.abs(a.price - currentProperty.price);
      const priceDiffB = Math.abs(b.price - currentProperty.price);

      if (priceDiffA !== priceDiffB) {
        return priceDiffA - priceDiffB;
      }

      // Then by bedroom count similarity
      const bedroomDiffA = Math.abs(
        (a.bedrooms || 0) - (currentProperty.bedrooms || 0)
      );
      const bedroomDiffB = Math.abs(
        (b.bedrooms || 0) - (currentProperty.bedrooms || 0)
      );

      if (bedroomDiffA !== bedroomDiffB) {
        return bedroomDiffA - bedroomDiffB;
      }

      // Then by views
      return b.views.total - a.views.total;
    })
    .slice(0, 4);
};

// Super Search function with enhanced error handling
const superSearch = async (query) => {
  try {
    await delay(500); // Simulate network delay
    return searchProperties(query);
  } catch (error) {
    console.error('Super search error:', error);
    return []; // Return empty array on error
  }
};

// Public API functions
export const getRecommendations = async (
  propertyId = null,
  searchCriteria = null
) => {
  try {
    await delay(700); // Simulate network delay
    return recommendProperties(propertyId, PROPERTIES, searchCriteria);
  } catch (error) {
    console.error('Recommendation error:', error);
    return []; // Return empty array on error
  }
};

// export const performSuperSearch = async (query) => {
//   return await superSearch(query);
// };

// Helper function to filter by criteria
const filterByCriteria = (properties, criteria) => {
  let results = [...properties];

  if (criteria.query) {
    results = searchProperties(criteria.query);
  }

  if (criteria.maxPrice) {
    results = results.filter((p) => p.price <= criteria.maxPrice);
  }

  if (criteria.minPrice) {
    results = results.filter((p) => p.price >= criteria.minPrice);
  }

  if (criteria.type) {
    results = results.filter((p) => p.type === criteria.type);
  }

  if (criteria.location) {
    results = results.filter((p) =>
      p.location.toLowerCase().includes(criteria.location.toLowerCase())
    );
  }

  // Enhanced sorting
  return results.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Featured properties first
    if (a.featured) scoreA += 2;
    if (b.featured) scoreB += 2;

    // Higher views get higher score
    scoreA += a.views.total * 0.001;
    scoreB += b.views.total * 0.001;

    // Match with query boosts score
    if (criteria.query) {
      const queryLower = criteria.query.toLowerCase();
      if (a.title.toLowerCase().includes(queryLower)) scoreA += 1;
      if (b.title.toLowerCase().includes(queryLower)) scoreB += 1;
    }

    return scoreB - scoreA;
  });
};

// New API-integrated recommendation functions
export const getApiRecommendations = async (userId = null) => {
  try {
    const response = await fetch(`${API_URL}/api/properties/recommendations`, {
      headers: createHeaders(),
    });

    const data = await handleApiResponse(response);
    return data.properties || [];
  } catch (error) {
    console.error('Error fetching API recommendations:', error);
    // Fallback to mock recommendations
    return getRecommendations();
  }
};

export const searchPropertiesApi = async (query, filters = {}) => {
  try {
    const searchParams = new URLSearchParams({
      search: query,
      ...filters,
    });

    const response = await fetch(`${API_URL}/api/properties?${searchParams}`, {
      headers: createHeaders(),
    });

    const data = await handleApiResponse(response);
    return data.properties || [];
  } catch (error) {
    console.error('Error searching properties via API:', error);
    // Fallback to local search
    return searchProperties(query, MOCK_PROPERTIES);
  }
};

export const getPersonalizedRecommendations = async () => {
  try {
    const response = await fetch(`${API_URL}/api/properties/personalized`, {
      headers: createHeaders(),
    });

    const data = await handleApiResponse(response);
    return data.properties || [];
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    return [];
  }
};
