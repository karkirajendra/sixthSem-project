import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, MapPin } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { getLocationBasedRecommendations } from '../api/api';

// Format distance function
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m away`;
  }
  return `${(meters / 1000).toFixed(1)}km away`;
};

const LocationBasedRecommendations = ({ userLocation, searchCriteria }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [responsiveCardsToShow, setResponsiveCardsToShow] = useState(3);

  const AUTO_SLIDE_INTERVAL = 4000; // 4 seconds

  // Helper function to normalize property data
  const normalizeProperty = useCallback((property) => {
    return {
      ...property,
      id: property.id || property._id,
      imageUrl: property.imageUrl || (property.images && property.images[0]) || '/placeholder-property.jpg',
      views: property.views || { total: 0, anonymous: 0 },
      status: property.status || 'available',
      featured: property.featured || false,
      inWishlist: property.inWishlist || false,
    };
  }, []);

  // Helper function to normalize properties array
  const normalizeProperties = useCallback(
    (properties) => {
      if (!Array.isArray(properties)) {
        console.warn('normalizeProperties received non-array:', properties);
        return [];
      }
      
      return properties.map(normalizeProperty);
    },
    [normalizeProperty]
  );

  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      fetchRecommendations();
    }
  }, [userLocation, searchCriteria]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestData = {
        userLocation: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        },
        preferences: {
          type: searchCriteria?.type,
          minPrice: searchCriteria?.minPrice,
          maxPrice: searchCriteria?.maxPrice,
          features: searchCriteria?.features
        },
        limit: 12
      };

      const response = await getLocationBasedRecommendations(requestData);

      if (response.success) {
        const normalizedRecs = normalizeProperties(response.recommendations || []);
        setRecommendations(normalizedRecs);
      } else {
        setError(response.message || 'Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Unable to load recommendations at this time');
    } finally {
      setLoading(false);
    }
  };

  // Handle responsive cards display
  const getCardsToShow = () => {
    if (typeof window === 'undefined') return 3;
    
    if (window.innerWidth < 768) return 1; // Mobile
    if (window.innerWidth < 1024) return 2; // Tablet
    return 3; // Desktop
  };

  useEffect(() => {
    const handleResize = () => {
      const newCardsToShow = getCardsToShow();
      setResponsiveCardsToShow(newCardsToShow);
      
      // Reset current index if needed
      if (recommendations.length > 0) {
        const maxIndex = Math.max(0, recommendations.length - newCardsToShow);
        setCurrentIndex(prev => Math.min(prev, maxIndex));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recommendations.length]);

  // Auto-slide functionality
  const nextSlide = useCallback(() => {
    if (recommendations.length <= responsiveCardsToShow) return;
    
    setCurrentIndex((prevIndex) => {
      const maxIndex = recommendations.length - responsiveCardsToShow;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  }, [recommendations.length, responsiveCardsToShow]);

  const prevSlide = useCallback(() => {
    if (recommendations.length <= responsiveCardsToShow) return;
    
    setCurrentIndex((prevIndex) => {
      const maxIndex = recommendations.length - responsiveCardsToShow;
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  }, [recommendations.length, responsiveCardsToShow]);

  // Auto-slide effect
  useEffect(() => {
    if (!isPlaying || isHovering || recommendations.length <= responsiveCardsToShow || loading) {
      return;
    }

    const interval = setInterval(() => {
      nextSlide();
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, isHovering, nextSlide, recommendations.length, loading, responsiveCardsToShow]);

  const goToSlide = (index) => {
    const maxIndex = Math.max(0, recommendations.length - responsiveCardsToShow);
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(newIndex);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(prev => !prev);
  };

  // Don't render if no location or no recommendations
  if (!userLocation?.latitude || (!loading && recommendations.length === 0)) {
    return null;
  }

  const totalSlides = Math.max(0, recommendations.length - responsiveCardsToShow + 1);
  const canSlide = recommendations.length > responsiveCardsToShow;

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Properties Near You
            </h2>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              {userLocation.source === 'gps' 
                ? `Based on your current location${userLocation.city ? ` in ${userLocation.city}` : ''}`
                : userLocation.source === 'ip'
                ? `Based on your approximate location in ${userLocation.city}`
                : `Showing properties in ${userLocation.city}`
              }
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Recommendations with Slider */}
        {!loading && !error && recommendations.length > 0 && (
          <div 
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Slider Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out gap-6"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / responsiveCardsToShow)}%)`
                }}
              >
                {recommendations.map((property) => (
                  <div 
                    key={property.id} 
                    className="flex-shrink-0 relative"
                    style={{ width: `calc(${100 / responsiveCardsToShow}% - ${(6 * (responsiveCardsToShow - 1)) / responsiveCardsToShow}rem)` }}
                  >
                    {/* Distance Badge */}
                    {property.distance && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium z-10">
                        {formatDistance(property.distance)}
                      </div>
                    )}
                    
                    {/* Recommendation Score Badge */}
                    {property.recommendationScore > 80 && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium z-10">
                        Perfect Match
                      </div>
                    )}
                    
                    <PropertyCard property={{
                      ...property,
                      inWishlist: false
                    }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            {canSlide && (
              <>
                {/* Previous Button */}
                <button
                  onClick={prevSlide}
                  disabled={loading}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 group disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous properties"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-blue-600" />
                </button>

                {/* Next Button */}
                <button
                  onClick={nextSlide}
                  disabled={loading}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 group disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next properties"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-blue-600" />
                </button>

                {/* Auto-play Control */}
                <button
                  onClick={toggleAutoPlay}
                  className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-300 hover:scale-110 group"
                  aria-label={isPlaying ? "Pause auto-slide" : "Start auto-slide"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                  ) : (
                    <Play className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                  )}
                </button>
              </>
            )}

            {/* Slide Indicators */}
            {canSlide && totalSlides > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Progress Bar for Auto-slide */}
            {canSlide && isPlaying && !isHovering && (
              <div className="mt-4 w-full max-w-md mx-auto">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-100 ease-linear"
                    style={{
                      width: '100%',
                      animation: `progressBar ${AUTO_SLIDE_INTERVAL}ms linear infinite`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* View More Button */}
        {!loading && !error && recommendations.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => window.location.href = `/properties?userLat=${userLocation.latitude}&userLon=${userLocation.longitude}`}
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              View More Properties Near You
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes progressBar {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0%);
          }
        }
      `}</style>
    </section>
  );
};

export default LocationBasedRecommendations;