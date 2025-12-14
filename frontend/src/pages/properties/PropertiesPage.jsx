import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProperties, searchProperties } from '../../api/api';
import { performSuperSearch } from '../../api/recommendationApi';
import PropertyCard from '../../components/PropertyCard';
import SearchFilters from '../../components/SearchFilters';
import SuperSearchBar from '../../components/superSearch/SuperSearchBar';
import { FaSort, FaFilter } from 'react-icons/fa';
import RecommendationSection from '../../components/recommendation/RecommendationSection';

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debug function - can be called from browser console
  window.testPropertiesAPI = async () => {
    try {
      console.log('Testing API...');
      const result = await getAllProperties({});
      console.log('API test result:', result);
      return result;
    } catch (error) {
      console.error('API test failed:', error);
      return error;
    }
  };

  // Direct fetch test
  window.testDirectFetch = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/properties');
      console.log('Direct fetch response status:', response.status);
      const data = await response.json();
      console.log('Direct fetch data:', data);
      return data;
    } catch (error) {
      console.error('Direct fetch failed:', error);
      return error;
    }
  };

  // Helper function to normalize property data from API
  const normalizeProperty = useCallback((property) => {
    return {
      ...property,
      // Ensure id exists (MongoDB uses _id)
      id: property.id || property._id,
      // Ensure imageUrl exists for PropertyCard component
      imageUrl:
        property.imageUrl ||
        (property.images && property.images[0]) ||
        '/placeholder-property.jpg',
      // Ensure other required fields have defaults
      views: property.views || { total: 0, anonymous: 0 },
      status: property.status || 'available',
      featured: property.featured || false,
      inWishlist: property.inWishlist || false,
    };
  }, []);

  // Helper function to normalize properties array
const normalizeProperties = useCallback(
  (properties) => {
    // Ensure properties is an array before mapping
    if (!Array.isArray(properties)) {
      console.warn('normalizeProperties received non-array:', properties);
      return [];
    }
    
    return properties.map(normalizeProperty);
  },
  [normalizeProperty]
);
  // Initialize filters from URL params
  const initialFilters = {
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    q: searchParams.get('q') || '', // Add search query parameter
  };

// In your handleSuperSearchResults function, update it like this:
const handleSuperSearchResults = (results, query = '') => {
  if (results === null) {
    // When search is cleared, show all properties
    setFilteredProperties(properties);
    // Remove superSearch param from URL
    const params = new URLSearchParams(searchParams);
    params.delete('superSearch');
    setSearchParams(params);
  } else {
    // Handle both old array format and new API response format
    let propertiesArray = [];
    
    if (Array.isArray(results)) {
      // Old format - direct array
      propertiesArray = results;
    } else if (results && typeof results === 'object' && results.properties) {
      // New API format with metadata - extract properties array
      propertiesArray = results.properties || [];
    } else if (results && typeof results === 'object') {
      // Fallback - try to extract properties from various possible structures
      propertiesArray = results.data?.properties || results.properties || [];
    }
    
    // Ensure we have an array
    if (!Array.isArray(propertiesArray)) {
      console.warn('Could not extract properties array from results:', results);
      propertiesArray = [];
    }
    
    const normalizedResults = normalizeProperties(propertiesArray);
    setFilteredProperties(normalizedResults);
    
    // Add superSearch param to URL if query exists
    if (query) {
      const params = new URLSearchParams(searchParams);
      params.set('superSearch', query);
      setSearchParams(params);
    }
  }
};

// Also, add this helper to check for super search on mount
useEffect(() => {
  const superSearchQuery = searchParams.get('superSearch');
  if (superSearchQuery) {
    handleSuperSearchFromURL(superSearchQuery);
  }
}, [searchParams]);

const handleSuperSearchFromURL = async (query) => {
  setLoading(true);
  try {
    const results = await performSuperSearch(query);
    const normalizedResults = normalizeProperties(results.properties || []);
    setFilteredProperties(normalizedResults);
  } catch (error) {
    console.error('Super search from URL failed:', error);
    setFilteredProperties([]);
  } finally {
    setLoading(false);
  }
};

  const [filters, setFilters] = useState(initialFilters);

  // Load properties based on filters
  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);

      // Check for cached results first
      const cachedSearch = sessionStorage.getItem('superSearchResults');
      const superSearchQuery = searchParams.get('superSearch');

      if (cachedSearch && superSearchQuery) {
        const { query, results } = JSON.parse(cachedSearch);

        if (query === superSearchQuery) {
          setFilteredProperties(results);
          setLoading(false);
          sessionStorage.removeItem('superSearchResults');
          return;
        }
      }

      try {
        setError(null);

        // Determine which API to use based on whether there's a search query
        let response;
        if (filters.q) {
          // Use search API when there's a search query
          console.log('Using search API with query:', filters.q);
          response = await searchProperties(filters);
        } else {
          // Use regular properties API for filtering
          console.log('Using regular properties API');
          response = await getAllProperties(filters);
        }

        console.log('API Response:', response); // Debug log

        // Handle the API response structure
        const rawPropertiesData =
          response?.properties || response?.data || response || [];
        const propertiesData = normalizeProperties(rawPropertiesData);
        const total = response?.total || propertiesData.length;
        const pages = response?.totalPages || 1;
        const page = response?.currentPage || 1;

        console.log('Raw Properties Data:', rawPropertiesData); // Debug log
        console.log('Normalized Properties Data:', propertiesData); // Debug log

        setProperties(propertiesData);
        setTotalCount(total);
        setTotalPages(pages);
        setCurrentPage(page);
if (superSearchQuery) {
  const results = await performSuperSearch(superSearchQuery);
  
  // Handle the response structure correctly
  let propertiesArray = [];
  if (results && typeof results === 'object') {
    if (Array.isArray(results)) {
      // Old format - direct array
      propertiesArray = results;
    } else if (results.properties && Array.isArray(results.properties)) {
      // New API format - extract properties array
      propertiesArray = results.properties;
    }
  }
  
  const normalizedResults = normalizeProperties(propertiesArray);
  console.log('SuperSearch Results:', normalizedResults);
  setFilteredProperties(normalizedResults);
} else {
  console.log('Setting filtered properties to:', propertiesData);
  setFilteredProperties(propertiesData);
}

        // Update search criteria for recommendations
        if (
          filters.location ||
          filters.type ||
          filters.minPrice ||
          filters.maxPrice ||
          filters.q
        ) {
          setSearchCriteria({
            location: filters.location,
            type: filters.type,
            query: filters.q,
            priceRange: {
              min: filters.minPrice,
              max: filters.maxPrice,
            },
          });
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        setError(error.message || 'Failed to load properties');
        setProperties([]);
        setFilteredProperties([]);
        setTotalCount(0);
        setTotalPages(1);
        setCurrentPage(1);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [filters, searchParams, normalizeProperties]);

  // Handle search submission from traditional filters
  const handleSearch = (searchFilters) => {
    // Update filters state
    setFilters(searchFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    setSearchParams(params);
  };


  // Sort properties
  const sortProperties = (option) => {
    let sortedProperties = [...filteredProperties];

    switch (option) {
      case 'price-low-high':
        sortedProperties.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        sortedProperties.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sortedProperties.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case 'rating':
        sortedProperties.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Default sorting (featured first, then by creation date)
        sortedProperties.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        break;
    }

    setFilteredProperties(sortedProperties);
    setSortOption(option);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    sortProperties(e.target.value);
  };

  // Clear all filters and search
  const clearAllFilters = () => {
    const newFilters = {
      location: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      q: '', // Clear search query as well
    };
    setFilters(newFilters);
    setSearchParams({});
    setSearchCriteria(null);
  };

  // Retry loading properties
  const retryLoading = () => {
    setError(null);
    const loadProperties = async () => {
      setLoading(true);
      try {
        // Use the same logic as in the main useEffect
        let response;
        if (filters.q) {
          response = await searchProperties(filters);
        } else {
          response = await getAllProperties(filters);
        }

        const rawPropertiesData =
          response?.properties || response?.data || response || [];
        const propertiesData = normalizeProperties(rawPropertiesData);
        const total = response?.total || propertiesData.length;
        const pages = response?.totalPages || 1;
        const page = response?.currentPage || 1;

        setProperties(propertiesData);
        setFilteredProperties(propertiesData);
        setTotalCount(total);
        setTotalPages(pages);
        setCurrentPage(page);
      } catch (error) {
        console.error('Error loading properties:', error);
        setError(error.message || 'Failed to load properties');
        setTotalCount(0);
        setTotalPages(1);
        setCurrentPage(1);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  };

  return (
    <div className="pt-20 pb-12 bg-gray-50 min-h-screen">
      <div className="container-custom">
        {/* Page Header with Gradient Background */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Properties</h1>
          <p className="mb-6 text-blue-100">
            {filters.q
              ? `Search results for "${filters.q}"`
              : 'Find your perfect property from our comprehensive listings'}
          </p>

          {/* Super Search Bar inside header */}
          <div className="max-w-4xl mx-auto">
            <SuperSearchBar onSearchResults={handleSuperSearchResults} />
          </div>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full btn-outline flex items-center justify-center"
          >
            <FaFilter className="mr-2" />
            <span>{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters - Desktop */}
          <div className="hidden md:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Filter Properties
              </h3>
              <SearchFilters
                onSearch={handleSearch}
                layout="vertical"
              />
            </div>
          </div>

          {/* Filters - Mobile */}
          {showMobileFilters && (
            <div className="md:hidden">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Filter Properties
                </h3>
                <SearchFilters
                  onSearch={handleSearch}
                  layout="vertical"
                />
              </div>
            </div>
          )}

          {/* Property Listings */}
          <div className="lg:col-span-3">
            {/* Sort Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
              <div className="text-gray-600">
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    Loading properties...
                  </div>
                ) : error ? (
                  <span className="text-red-600">Error loading properties</span>
                ) : (
                  <>
                    {filteredProperties.length}
                    {totalCount > filteredProperties.length && (
                      <span className="text-gray-500"> of {totalCount}</span>
                    )}
                    {filters.q
                      ? ` results for "${filters.q}"`
                      : ' properties found'}
                    {totalPages > 1 && (
                      <span className="text-gray-500">
                        {' '}
                        (Page {currentPage} of {totalPages})
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="sort"
                  className="text-gray-600 hidden sm:inline"
                >
                  Sort by:
                </label>
                <div className="relative">
                  <select
                    id="sort"
                    value={sortOption}
                    onChange={handleSortChange}
                    className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-gray-700"
                  >
                    <option value="default">Featured</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FaSort className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-red-600 mr-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-red-800 font-medium">
                        Error loading properties
                      </h3>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={retryLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="card animate-pulse"
                  >
                    <div className="w-full h-48 bg-gray-300 rounded-t-lg"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="flex justify-between mb-3">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <>
                <div className="text-sm text-gray-500 mb-4">
                  Debug: Showing {filteredProperties.length} properties
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id || property._id}
                      property={property}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-4">
                  We couldn&apos;t find any properties matching your search
                  criteria.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recommendation Section */}
        <RecommendationSection searchCriteria={searchCriteria} />
      </div>
    </div>
  );
};

export default PropertiesPage;
