import { useState, useEffect } from 'react';
import { getWishlistByUserId, removeFromWishlist, getAllProperties } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BuyerWishlist = () => {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to normalize IDs for comparison
  const normalizeId = (id) => String(id);

  // Fetch wishlist properties
  useEffect(() => {
    const loadWishlist = async () => {
      if (!currentUser || !currentUser.id) {
        setLoading(false);
        return;
      }

      try {
        // Get wishlist IDs from API or localStorage
        const wishlistIds = await getWishlistByUserId(currentUser.id);
        
        if (wishlistIds.length === 0) {
          setWishlist([]);
          setLoading(false);
          return;
        }

        // Get all properties
        const allPropertiesResponse = await getAllProperties();
        const allProperties = allPropertiesResponse.properties || [];
        
        // Filter properties to only include those in the wishlist
        // Use normalized IDs for comparison
        const wishlistProperties = allProperties.filter(property => 
          wishlistIds.includes(normalizeId(property._id || property.id))
        );
        
        setWishlist(wishlistProperties);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [currentUser]);

  // Handle remove from wishlist
  const handleRemove = async (propertyId) => {
    if (!currentUser || !currentUser.id) {
      toast.error('You need to be logged in to modify your wishlist');
      return;
    }

    try {
      const response = await removeFromWishlist(currentUser.id, propertyId);
      if (response.success) {
        // Update the local state by filtering out the removed property
        setWishlist(wishlist.filter(property => 
          (property._id || property.id) !== propertyId
        ));
        toast.success('Removed from wishlist');
      } else {
        toast.error(response.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get property ID (handle both MongoDB _id and mock id)
  const getPropertyId = (property) => {
    return property._id || property.id;
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
        <p className="text-gray-600">Properties you've saved for later</p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wishlist.map((property) => {
            const propertyId = getPropertyId(property);
            return (
              <div key={propertyId} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="relative h-48">
                  <img 
                    src={property.images && property.images.length > 0 
                      ? property.images[0] 
                      : property.imageUrl || '/default-property.jpg'
                    } 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 bg-primary-600 text-white px-3 py-1 rounded-br-lg">
                    <span className="capitalize">{property.type}</span>
                  </div>
                </div>
                
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{property.title}</h3>
                  <p className="text-gray-600 mb-3 flex items-center">
                    <span>{property.location}</span>
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-primary-600">
                      {formatPrice(property.price)} <span className="text-sm font-normal text-gray-600">/ per month</span>
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                  <Link 
                    to={`/property/${propertyId}`} 
                    className="text-primary-600 hover:text-primary-800 font-medium flex items-center"
                  >
                    <span>View Property</span>
                    <FaExternalLinkAlt className="ml-2 text-sm" />
                  </Link>
                  <div className="flex space-x-2">
                    <Link
                      to={`/property/${propertyId}`}
                      className="btn-primary"
                    >
                      Contact Owner
                    </Link>
                    <button
                      onClick={() => handleRemove(propertyId)}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <FaHeart className="text-2xl text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Start browsing properties and add them to your wishlist to keep track of your favorites.
          </p>
          <Link to="/properties" className="btn-primary">
            Browse Properties
          </Link>
        </div>
      )}
    </div>
  );
};

export default BuyerWishlist;