import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import { getFeaturedProperties, getAllProperties } from '../../api/api';

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState(null);

  const CARDS_TO_SHOW = 3;
  const AUTO_SLIDE_INTERVAL = 4000; // 4 seconds

  // Helper function to normalize property data (similar to PropertiesPage)
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
      if (!Array.isArray(properties)) {
        console.warn('normalizeProperties received non-array:', properties);
        return [];
      }
      
      return properties.map(normalizeProperty);
    },
    [normalizeProperty]
  );

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading featured properties...');
        
        // First try to get featured properties
        let featuredData = await getFeaturedProperties();
        console.log('Featured properties response:', featuredData);
        
        // Handle different response structures
        let propertiesArray = [];
        if (Array.isArray(featuredData)) {
          propertiesArray = featuredData;
        } else if (featuredData && Array.isArray(featuredData.properties)) {
          propertiesArray = featuredData.properties;
        } else if (featuredData && Array.isArray(featuredData.data)) {
          propertiesArray = featuredData.data;
        }

        // If no featured properties found, get all properties and filter for featured ones
        if (propertiesArray.length === 0) {
          console.log('No featured properties found, fetching all properties...');
          const allPropertiesData = await getAllProperties({ limit: 10 });
          console.log('All properties response:', allPropertiesData);
          
          const allProperties = allPropertiesData?.properties || allPropertiesData?.data || allPropertiesData || [];
          
          // Filter for featured properties or take the first few if none are marked as featured
          const featuredProperties = allProperties.filter(p => p.featured === true);
          
          if (featuredProperties.length > 0) {
            propertiesArray = featuredProperties;
          } else {
            // If no properties are marked as featured, take the first 6 properties
            propertiesArray = allProperties.slice(0, 6);
            console.log('No featured properties found, using first 6 properties');
          }
        }

        // Normalize the properties
        const normalizedProperties = normalizeProperties(propertiesArray);
        console.log('Normalized featured properties:', normalizedProperties);
        
        setProperties(normalizedProperties);
        
        // Reset slider position if needed
        if (normalizedProperties.length <= CARDS_TO_SHOW) {
          setCurrentIndex(0);
        }
        
      } catch (error) {
        console.error('Error loading featured properties:', error);
        setError('Failed to load featured properties. Please try again later.');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [normalizeProperties]);

  // Auto-slide functionality
  const nextSlide = useCallback(() => {
    if (properties.length <= CARDS_TO_SHOW) return;
    
    setCurrentIndex((prevIndex) => {
      const maxIndex = properties.length - CARDS_TO_SHOW;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  }, [properties.length, CARDS_TO_SHOW]);

  const prevSlide = useCallback(() => {
    if (properties.length <= CARDS_TO_SHOW) return;
    
    setCurrentIndex((prevIndex) => {
      const maxIndex = properties.length - CARDS_TO_SHOW;
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  }, [properties.length, CARDS_TO_SHOW]);

  // Auto-slide effect
  useEffect(() => {
    if (!isPlaying || isHovering || properties.length <= CARDS_TO_SHOW || loading) {
      return;
    }

    const interval = setInterval(() => {
      nextSlide();
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, isHovering, nextSlide, properties.length, loading]);

  const goToSlide = (index) => {
    const maxIndex = Math.max(0, properties.length - CARDS_TO_SHOW);
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(newIndex);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(prev => !prev);
  };

  // Handle responsive cards display
  const getCardsToShow = () => {
    if (typeof window === 'undefined') return CARDS_TO_SHOW;
    
    if (window.innerWidth < 768) return 1; // Mobile
    if (window.innerWidth < 1024) return 2; // Tablet
    return CARDS_TO_SHOW; // Desktop
  };

  const [responsiveCardsToShow, setResponsiveCardsToShow] = useState(CARDS_TO_SHOW);

  useEffect(() => {
    const handleResize = () => {
      const newCardsToShow = getCardsToShow();
      setResponsiveCardsToShow(newCardsToShow);
      
      // Reset current index if needed
      if (properties.length > 0) {
        const maxIndex = Math.max(0, properties.length - newCardsToShow);
        setCurrentIndex(prev => Math.min(prev, maxIndex));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [properties.length]);

  // Loading state
  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Properties</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Loading featured properties...</p>
        </div>
        
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex justify-between space-x-3">
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container-custom py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Properties</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our handpicked selection of exceptional rooms, flats, and apartments.
          </p>
        </div>
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-block px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!properties || properties.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Properties</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our handpicked selection of exceptional rooms, flats, and apartments.
          </p>
        </div>
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-lg mb-6">No featured properties available at the moment.</p>
          <Link 
            to="/properties" 
            className="inline-block btn-primary px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg hover:shadow-teal-500/30 transition-all duration-300 rounded-lg"
          >
            Browse All Properties
          </Link>
        </div>
      </div>
    );
  }

  const totalSlides = Math.max(0, properties.length - responsiveCardsToShow + 1);
  const canSlide = properties.length > responsiveCardsToShow;

  return (
    <div className="container-custom py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Properties</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our handpicked selection of exceptional rooms, flats, and apartments. 
          Each chosen for its quality, location, and value. Discover your perfect living space among these featured listings.
        </p>
      </div>

      <div 
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Slider Container */}
        <div className="overflow-hidden rounded-lg">
          <div 
            className={`flex transition-transform duration-500 ease-in-out ${
              responsiveCardsToShow === 1 ? 'gap-4' : 
              responsiveCardsToShow === 2 ? 'gap-5' : 'gap-6'
            }`}
            style={{ 
              transform: `translateX(-${currentIndex * (100 / responsiveCardsToShow)}%)`,
              width: `${(properties.length / responsiveCardsToShow) * 100}%`
            }}
          >
            {properties.map((property) => (
              <div 
                key={property.id} 
                className="flex-shrink-0"
                style={{ width: `${100 / properties.length}%` }}
              >
                <PropertyCard property={property} />
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

      {/* View All Properties Button */}
      <div className="text-center mt-12">
        <Link 
          to="/properties" 
          className="inline-flex items-center gap-2 btn-primary px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg hover:shadow-teal-500/30 transition-all duration-300 rounded-lg group"
        >
          View All Properties
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Property Count Display */}
      {properties.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-500">
          Showing {Math.min(responsiveCardsToShow, properties.length)} of {properties.length} featured properties
        </div>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && properties.length > 0 && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
          Debug: {properties.length} properties loaded, showing {responsiveCardsToShow} at a time
        </div>
      )}

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
        
        .container-custom {
          max-width: 1200px;
          margin: 0 auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        @media (min-width: 768px) {
          .container-custom {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }
        
        .card {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }
        
        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
        }
        
        .btn-primary:hover {
          text-decoration: none;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FeaturedProperties;