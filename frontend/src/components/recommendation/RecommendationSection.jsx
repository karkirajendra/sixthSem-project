import { useEffect, useState } from 'react';
import PropertyCard from '../PropertyCard';
import { getLocationBasedRecommendations } from '../../api/api';
import { getCachedLocation, formatDistanceFromMeters } from '../../utils/LocationService';
import { PROPERTIES } from '../../api/api'; // Fallback mock data

const RecommendationSection = ({ 
  propertyId, 
  searchCriteria, 
  userLocation: propUserLocation 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(propUserLocation);

  useEffect(() => {
    // Get user location if not provided
    if (!userLocation) {
      const cached = getCachedLocation();
      if (cached) {
        setUserLocation(cached);
      }
    }
  }, [userLocation]);

  useEffect(() => {
    fetchRecommendations();
  }, [propertyId, searchCriteria, userLocation]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      if (userLocation?.latitude && userLocation?.longitude) {
        // Use location-based recommendations
        const requestData = {
          userLocation: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          },
          preferences: searchCriteria || {},
          limit: 4
        };

        const response = await getLocationBasedRecommendations(requestData);

        if (response.success && response.recommendations?.length > 0) {
          setRecommendations(response.recommendations);
          setLoading(false);
          return;
        }
      }

      // Fallback to mock recommendations
      const fallbackRecommendations = PROPERTIES
        .filter(property => property.id !== parseInt(propertyId))
        .filter(property => {
          // Apply search criteria if available
          if (searchCriteria?.type && property.type !== searchCriteria.type) {
            return false;
          }
          if (searchCriteria?.minPrice && property.price < searchCriteria.minPrice) {
            return false;
          }
          if (searchCriteria?.maxPrice && property.price > searchCriteria.maxPrice) {
            return false;
          }
          return true;
        })
        .slice(0, 4);

      setRecommendations(fallbackRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      
      // Final fallback
      const fallbackRecommendations = PROPERTIES
        .filter(property => property.id !== parseInt(propertyId))
        .slice(0, 4);
      
      setRecommendations(fallbackRecommendations);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
            Loading Recommendations...
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="py-12 bg-gray-50 text-center">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            No Recommendations Found
          </h2>
          <p className="text-gray-600">
            We couldn't find similar properties at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {userLocation 
                ? 'Recommended Properties Near You' 
                : 'Similar Properties You Might Like'
              }
            </h2>
            {userLocation && (
              <p className="text-gray-600 mt-2">
                Based on your {userLocation.source === 'gps' ? 'current' : 'detected'} location
                {userLocation.city && ` in ${userLocation.city}`}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((property) => {
            const normalizedProperty = {
              id: property.id || property._id,
              title: property.title,
              price: property.price,
              type: property.type,
              location: property.location,
              imageUrl: property.images?.[0] || property.imageUrl || '/placeholder-property.jpg',
              views: property.views || { total: 0 },
              featured: property.featured || false,
              inWishlist: property.inWishlist || false,
              distance: property.distance,
              recommendationScore: property.recommendationScore
            };

            return (
              <div key={normalizedProperty.id} className="relative">
                <PropertyCard property={normalizedProperty} />
                
                {/* Distance Badge */}
                {normalizedProperty.distance && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium z-10">
                    {formatDistanceFromMeters(normalizedProperty.distance)}
                  </div>
                )}
                
                {/* Recommendation Score Badge */}
                {normalizedProperty.recommendationScore > 85 && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium z-10">
                    Perfect Match
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecommendationSection;