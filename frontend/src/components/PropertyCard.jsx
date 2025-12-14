import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaEye, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { addToWishlist, removeFromWishlist, getWishlistState } from '../api/api';
import toast from 'react-hot-toast';

const PropertyCard = ({ property, onWishlistUpdate }) => {
  const {
    id,
    title,
    type,
    price,
    location,
    imageUrl,
    bedrooms,
    bathrooms,
    area,
    status = 'available',
    views = { total: 0 },
  } = property;

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false);
  const { isLoggedIn, currentUser } = useAuth(); // Only use currentUser from your AuthContext
  const navigate = useNavigate();

  // Load initial wishlist state from localStorage
  useEffect(() => {
    if (currentUser && currentUser.id && id) {
      const wishlistState = getWishlistState(currentUser.id, id);
      setIsInWishlist(wishlistState);
    }
  }, [currentUser, id]);

  const formatPrice = new Intl.NumberFormat('ne-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0
  }).format(price || 0);

  const getTypeColor = (type) => {
    switch (type) {
      case 'apartment':
        return 'bg-blue-100 text-blue-800';
      case 'house':
        return 'bg-green-100 text-green-800';
      case 'room':
        return 'bg-purple-100 text-purple-800';
      case 'flat':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'for sale':
        return 'bg-green-100 text-green-800';
      case 'sold out':
      case 'not available':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn || !currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setIsWishlistUpdating(true);
    try {
      if (isInWishlist) {
        const response = await removeFromWishlist(currentUser.id, id);
        if (response.success) {
          setIsInWishlist(false);
          toast.success('Removed from wishlist');
          if (onWishlistUpdate) {
            onWishlistUpdate(id, false);
          }
        } else {
          toast.error(response.message || 'Failed to remove from wishlist');
        }
      } else {
        const response = await addToWishlist(currentUser.id, id);
        if (response.success) {
          setIsInWishlist(true);
          toast.success('Added to wishlist');
          if (onWishlistUpdate) {
            onWishlistUpdate(id, true);
          }
        } else {
          toast.error(response.message || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsWishlistUpdating(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/property/${id}`);
  };

  const handleContactOwner = () => {
    if (!isLoggedIn || !currentUser) {
      navigate('/login', {
        state: {
          from: `/property/${id}`,
          message: 'Please log in to contact property owners',
        },
      });
      return;
    }
    navigate(`/property/${id}`, { state: { focusContact: true } });
  };

  const isAvailable = !['sold out', 'not available'].includes(status?.toLowerCase() || 'available');
  const propertyType = type?.toLowerCase() || 'property';
  const propertyStatus = status?.toLowerCase() || 'available';
  const viewCount = views?.total || 0;

  return (
    <div className="card group animate-fade-in">
      <div className="relative overflow-hidden">
        <img 
          src={imageUrl || '/placeholder-property.jpg'} 
          alt={title || 'Property'} 
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <div className={`absolute top-4 left-4 ${getTypeColor(propertyType)} px-2 py-1 rounded text-xs font-medium`}>
          {propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}
        </div>

        <div className={`absolute top-4 right-4 ${getStatusColor(propertyStatus)} px-2 py-1 rounded text-xs font-medium`}>
          {propertyStatus.charAt(0).toUpperCase() + propertyStatus.slice(1)}
        </div>

        <button
          onClick={handleWishlistToggle}
          disabled={isWishlistUpdating}
          className="absolute bottom-4 right-6 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlistUpdating ? (
            <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          ) : isInWishlist ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-600" />
          )}
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">{title || 'Untitled Property'}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <FaMapMarkerAlt className="text-primary-500 mr-1" />
          <p className="text-sm">{location || 'Location not specified'}</p>
        </div>
        
        <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
          {bedrooms && (
            <div className="flex items-center">
              <FaBed className="mr-1" />
              <span>{bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
          )}
          
          {bathrooms && (
            <div className="flex items-center">
              <FaBath className="mr-1" />
              <span>{bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <FaEye className="mr-1" />
          <span>{viewCount} views</span>
        </div>
        
        <div className="space-y-3">
          <p className="text-lg font-bold text-primary-600">
            {formatPrice} <span className="text-sm font-normal text-gray-600">/ per month</span>
          </p>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleContactOwner}
              disabled={!isAvailable}
              className={`btn-primary flex-1 ${
                isAvailable
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg hover:shadow-teal-500/30 transition-all duration-300'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg cursor-not-allowed'
              }`}
            >
              {isAvailable ? 'Contact Owner' : 'Not Available'}
            </button>
            <button 
              onClick={handleViewDetails}
              className="btn-outline flex-1"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;