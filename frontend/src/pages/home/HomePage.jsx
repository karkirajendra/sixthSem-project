import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from './Hero';
import SearchFilters from '../../components/SearchFilters';
import FeaturedProperties from './FeaturedProperties';
import AboutSection from './AboutSection';
import TestimonialsSection from './TestimonialsSection';
import LocationBasedRecommendations from '../../components/LocationBasedRecommendations';
import LocationPrompt from '../../components/LocationPrompt';
import { getUserLocation, getCachedLocation } from '../../utils/LocationService';
import toast from 'react-hot-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState(null);

  useEffect(() => {
    // Check for cached location first
    const cachedLocation = getCachedLocation();
    if (cachedLocation) {
      setUserLocation(cachedLocation);
      setLocationDetected(true);
    } else {
      // Show location prompt after 2 seconds
      const timer = setTimeout(() => {
        setShowLocationPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLocationAllow = async () => {
    try {
      setShowLocationPrompt(false);
      const location = await getUserLocation({ showPrompt: true });
      
      setUserLocation(location);
      setLocationDetected(true);
      
      if (location.source === 'gps') {
        toast.success(`Location detected: ${location.city || 'Your area'}`);
      } else if (location.source === 'ip') {
        toast.success(`Location detected from IP: ${location.city || 'Your area'}`);
      } else {
        toast.success('Using default location: Kathmandu');
      }
    } catch (error) {
      console.error('Location detection error:', error);
      toast.error('Could not detect location. Using default location.');
      
      // Set default location
      const defaultLocation = {
        latitude: 27.7172,
        longitude: 85.3240,
        city: 'Kathmandu',
        source: 'default'
      };
      setUserLocation(defaultLocation);
      setLocationDetected(true);
    }
  };

  const handleLocationDecline = () => {
    setShowLocationPrompt(false);
    // Set default location
    const defaultLocation = {
      latitude: 27.7172,
      longitude: 85.3240,
      city: 'Kathmandu',
      source: 'default'
    };
    setUserLocation(defaultLocation);
    setLocationDetected(true);
  };

  const handleSearch = async (searchParams) => {
    try {
      // Store search criteria for recommendations
      setSearchCriteria(searchParams);
      
      // Construct query params string for navigation
      const queryParams = new URLSearchParams();

      // Handle search query (from search box)
      if (searchParams.search) {
        queryParams.append('q', searchParams.search);
      }

      // Handle filter parameters
      if (searchParams.location)
        queryParams.append('location', searchParams.location);
      if (searchParams.type) queryParams.append('type', searchParams.type);
      if (searchParams.minPrice)
        queryParams.append('minPrice', searchParams.minPrice);
      if (searchParams.maxPrice)
        queryParams.append('maxPrice', searchParams.maxPrice);

      // Add user location if available
      if (userLocation?.latitude && userLocation?.longitude) {
        queryParams.append('userLat', userLocation.latitude);
        queryParams.append('userLon', userLocation.longitude);
      }

      // Navigate to properties page with search params
      navigate({
        pathname: '/properties',
        search: queryParams.toString(),
      });
    } catch (error) {
      console.error('Search error:', error);
      // Fallback navigation
      const queryParams = new URLSearchParams();
      if (searchParams.search) {
        queryParams.append('q', searchParams.search);
      }
      if (searchParams.location)
        queryParams.append('location', searchParams.location);
      if (searchParams.type) queryParams.append('type', searchParams.type);
      if (searchParams.minPrice)
        queryParams.append('minPrice', searchParams.minPrice);
      if (searchParams.maxPrice)
        queryParams.append('maxPrice', searchParams.maxPrice);

      navigate({
        pathname: '/properties',
        search: queryParams.toString(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Location Permission Prompt */}
      {showLocationPrompt && (
        <LocationPrompt
          onAllow={handleLocationAllow}
          onDecline={handleLocationDecline}
        />
      )}

      {/* Hero Section */}
      <Hero userLocation={userLocation} />

      {/* Search Filters - Positioned beautifully */}
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto -mt-24 relative z-30">
          <SearchFilters
            onSearch={handleSearch}
            layout="horizontal"
            userLocation={userLocation}
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16"></div>

      {/* Location-based Recommendations */}
      {locationDetected && userLocation && (
        <LocationBasedRecommendations 
          userLocation={userLocation}
          searchCriteria={searchCriteria}
        />
      )}

      {/* Featured Properties */}
      <FeaturedProperties />

      {/* About Section */}
      <AboutSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Modern CTA Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Modern gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-teal-700"></div>

        {/* Geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-blue-400/5 rounded-full blur-2xl"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          ></div>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Premium badge */}
          <div className="inline-flex items-center px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 mb-6">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-white/90 text-sm font-medium">
              {userLocation?.city ? `Serving ${userLocation.city}` : 'Trusted by renters across Nepal'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Searching for a New
            <span className="block text-transparent bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text">
              Place to Live?
            </span>
          </h2>

          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
            Find your perfect place to live quick, easy, and hassle-free. 
            {userLocation?.city && (
              <span> Discover properties near you in {userLocation.city}.</span>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <button
              onClick={() => navigate('/properties')}
              className="group flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Browse Properties
            </button>
            <button
              onClick={() => navigate('/register')}
              className="group flex items-center justify-center px-6 py-3 bg-transparent border border-white/30 text-white font-medium rounded-lg hover:bg-white hover:text-gray-900 transform hover:scale-[1.02] transition-all duration-200 backdrop-blur-sm"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              List Your Property
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;