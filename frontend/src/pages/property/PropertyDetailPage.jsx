// src/pages/property/PropertyDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyById, addToWishlist } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaEye, FaUserCheck, FaUserSecret, FaEnvelope, FaPhone, FaUser, FaStore, FaArrowLeft } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import ChatModal from '../../components/ChatModal';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import RecommendationSection from '../../components/recommendation/RecommendationSection';

// Fixed PropertyDetailPage.jsx - Move seller definition after property is loaded

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Mock images array
  const images = [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
  ];

  // Load property data
  useEffect(() => {
    const loadProperty = async () => {
      setLoading(true);
      try {
        const response = await getPropertyById(id);
        console.log('Property response:', response);
        
        if (response.success || response.data) {
          const propertyData = response.property || response.data || response;
          setProperty(propertyData);
          setInWishlist(false);
        } else {
          setError(response.message || 'Property not found');
        }
      } catch (error) {
        console.error('Error loading property:', error);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  // MOVED: Define seller and isAvailable after property is loaded
  const isAvailable = property && !['sold out', 'not available'].includes(property?.status?.toLowerCase());
  
  // Get seller info from property data - Handle different possible structures
  const seller = property ? (property.sellerId || property.seller || property.owner || {
    _id: 'unknown',
    name: 'Property Owner',
    email: 'owner@example.com',
    phone: '+977-1-234567'
  }) : null;

  const handleWishlistToggle = async () => {
    console.log('handleWishlistToggle - isLoggedIn:', isLoggedIn);
    console.log('handleWishlistToggle - currentUser:', currentUser);
    
    if (!isLoggedIn || !currentUser || (!currentUser.id && !currentUser._id)) {
      setShowLoginModal(true);
      return;
    }

    try {
      const userId = currentUser.id || currentUser._id;
      const response = await addToWishlist(userId, property._id || property.id);
      if (response.success) {
        setInWishlist(!inWishlist);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleChatClick = () => {
    console.log('handleChatClick - isLoggedIn:', isLoggedIn);
    console.log('handleChatClick - currentUser:', currentUser);
    console.log('handleChatClick - currentUser?.id:', currentUser?.id);
    
    if (!isLoggedIn) {
      console.log('Not logged in - showing modal');
      setShowLoginModal(true);
      return;
    }
    
    if (!currentUser) {
      console.log('No currentUser - showing modal');
      setShowLoginModal(true);
      return;
    }
    
    if (!currentUser.id && !currentUser._id) {
      console.log('No user ID - showing modal');
      setShowLoginModal(true);
      return;
    }
    
    console.log('All checks passed - opening chat modal');
    setShowChatModal(true);
  };

  const handleBackClick = () => {
    // Go back to previous page if available, otherwise go to properties page
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/properties');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Loading state
  if (loading) {
    return (
      <div className="pt-20 pb-12 bg-gray-50 min-h-screen">
        <div className="container-custom">
          {/* Back button in loading state */}
          <button
            onClick={handleBackClick}
            className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          
          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded mb-6 w-1/2"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="pt-20 pb-12 bg-gray-50 min-h-screen">
        <div className="container-custom">
          {/* Back button in error state */}
          <button
            onClick={handleBackClick}
            className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "We couldn't find the property you're looking for."}</p>
            <button
              onClick={() => navigate('/properties')}
              className="btn-primary"
            >
              Browse Other Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Debug log for seller
  console.log('Seller data:', seller);

  return (
    <div className="pt-20 pb-12 bg-gray-50 min-h-screen">
      <div className="container-custom">
        {/* Back Navigation Button */}
        <button
          onClick={handleBackClick}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors duration-300 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section */}
          <div className="lg:col-span-2">
            {/* Image Slider */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="h-96"
              >
                {(property.images && property.images.length > 0 ? property.images : images).map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image}
                      alt={`Property view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-primary-500" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <p className="text-3xl font-bold text-primary-600">{formatPrice(property.price)}</p>
                  <p className="text-sm text-gray-600 text-right">/ per month</p>
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaBed className="text-xl text-primary-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Bedrooms</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-700">{property.bedrooms || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaBath className="text-xl text-primary-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Bathrooms</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-700">{property.bathrooms || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaRulerCombined className="text-xl text-primary-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Area</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-700">{property.area || 'N/A'} sqft</p>
                </div>
              </div>

              {/* Contact button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={handleChatClick}
                  disabled={!isAvailable}
                  className={`btn-primary flex items-center justify-center py-3 px-6 rounded-lg ${
                    isAvailable
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg hover:shadow-teal-500/30 transition-all duration-300'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg cursor-not-allowed'
                  }`}
                >
                  {isAvailable ? 'Contact Owner' : 'Not Available'}
                </button>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
              </div>

              {/* Features List */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Features</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.features ? (
                    Object.entries(property.features).map(([key, value]) => 
                      value && (
                        <li key={key} className="flex items-center text-gray-600">
                          <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </li>
                      )
                    )
                  ) : (
                    <>
                      <li className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                        Free Electricity
                      </li>
                      <li className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                        Parking Available
                      </li>
                      <li className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                        Free Wi-Fi
                      </li>
                      <li className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                        24/7 Security
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Property Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Property Interest</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                  <FaEye className="text-2xl text-blue-500 mr-3" />
                  <div>
                    <h4 className="text-sm text-gray-600">Total Views</h4>
                    <p className="text-xl font-bold text-gray-800">{property.views?.total || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Only render if seller exists */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {seller && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      {seller.profile?.avatar || seller.avatar ? (
                        <img
                          src={seller.profile?.avatar || seller.avatar}
                          alt={seller.name}
                          className="w-16 h-16 rounded-full mr-4"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mr-4">
                          <FaStore className="text-2xl text-white" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <FaStore className="text-xs text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {seller.name || seller.username || 'Property Owner'}
                      </h3>
                      <div className="flex items-center">
                        <span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          Property Owner
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="mr-3 text-green-500" />
                      <span>{seller.phone || seller.phoneNumber || 'Contact via chat'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="mr-3 text-green-500" />
                      <span>{seller.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleChatClick}
                  className="w-full btn-primary flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg hover:shadow-teal-500/30 transition-all duration-300 py-3 px-4 rounded-lg"
                >
                  <FaEnvelope className="mr-2" />
                  Chat with Owner
                </button>

                <button
                  onClick={handleWishlistToggle}
                  className="w-full btn-outline flex items-center justify-center py-3 px-4 rounded-lg border border-gray-300 hover:border-primary-500 hover:text-primary-500 transition-colors duration-300"
                >
                  {inWishlist ? (
                    <>
                      <FaHeart className="mr-2 text-red-500" />
                      Remove from Wishlist
                    </>
                  ) : (
                    <>
                      <FaRegHeart className="mr-2" />
                      Add to Wishlist
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Section */}
      <RecommendationSection propertyId={id} />

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to perform this action. Would you like to log in now?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="btn-outline py-2 px-4 rounded-lg border border-gray-300 hover:border-primary-500 hover:text-primary-500 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/login');
                }}
                className="btn-primary py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg hover:shadow-teal-500/30 transition-all duration-300"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal - Only render if we have all required data */}
      {showChatModal && property && seller && (seller._id || seller.id) && (
        <ChatModal 
          propertyId={property._id || property.id} 
          sellerId={seller._id || seller.id} 
          sellerInfo={seller}
          propertyTitle={property.title}
          onClose={() => setShowChatModal(false)} 
        />
      )}
    </div>
  );
};
export default PropertyDetailPage;