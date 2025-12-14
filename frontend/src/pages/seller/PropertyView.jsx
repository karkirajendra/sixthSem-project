import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPropertyById } from '../../api/api';
import {
  FiArrowLeft,
  FiEdit,
  FiMapPin,
  FiHome,
  FiDollarSign,
  FiMaximize,
  FiUsers,
  FiCalendar,
  FiEye,
  FiClock,
} from 'react-icons/fi';
import {
  FaBed,
  FaBath,
  FaCheck,
  FaTimes,
  FaWifi,
  FaCar,
  FaShieldAlt,
  FaCouch,
  FaTint,
  FaBolt,
} from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import toast from 'react-hot-toast';

const PropertyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await getPropertyById(id);

        if (response.success) {
          setProperty(response.property);
        } else {
          toast.error('Property not found');
          navigate('/seller/listings');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property');
        navigate('/seller/listings');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id, navigate]);

  const getStatusColor = (status) => {
    const statusColors = {
      available: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rented: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      sold: 'bg-gray-100 text-gray-800',
      inactive: 'bg-gray-100 text-gray-600',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getFeatureIcon = (featureKey) => {
    const icons = {
      wifi: FaWifi,
      parking: FaCar,
      security: FaShieldAlt,
      furnished: FaCouch,
      waterSupply: FaTint,
      electricity: FaBolt,
    };
    return icons[featureKey] || FaCheck;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Property Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The property you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            to="/seller/listings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/seller/listings')}
                className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <FiArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {property.title}
                </h1>
                <p className="text-gray-600">Property Details</p>
              </div>
            </div>
            <Link
              to={`/seller/edit-property/${property._id}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Edit Property
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {property.images && property.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  spaceBetween={0}
                  slidesPerView={1}
                  className="h-96"
                >
                  {property.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-96 object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Property Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <FiHome className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium capitalize">{property.type}</p>
                  </div>
                </div>

                {property.roomType && (
                  <div className="flex items-center space-x-3">
                    <FiHome className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Room Type</p>
                      <p className="font-medium capitalize">
                        {property.roomType.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                )}

                {property.flatType && (
                  <div className="flex items-center space-x-3">
                    <FiHome className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Flat Type</p>
                      <p className="font-medium uppercase">
                        {property.flatType}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <FiMaximize className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Area</p>
                    <p className="font-medium">{property.area} sq ft</p>
                  </div>
                </div>

                {property.bedrooms > 0 && (
                  <div className="flex items-center space-x-3">
                    <FaBed className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">Bedrooms</p>
                      <p className="font-medium">{property.bedrooms}</p>
                    </div>
                  </div>
                )}

                {property.bathrooms > 0 && (
                  <div className="flex items-center space-x-3">
                    <FaBath className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="text-sm text-gray-500">Bathrooms</p>
                      <p className="font-medium">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
              </div>

              {property.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {property.features && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Features & Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(property.features).map(([key, value]) => {
                      const IconComponent = getFeatureIcon(key);
                      return (
                        <div
                          key={key}
                          className="flex items-center space-x-3"
                        >
                          <div
                            className={`p-2 rounded-full ${
                              value ? 'bg-green-100' : 'bg-red-100'
                            }`}
                          >
                            {value ? (
                              <IconComponent className="h-4 w-4 text-green-600" />
                            ) : (
                              <FaTimes className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              value ? 'text-gray-900' : 'text-gray-500'
                            }`}
                          >
                            {key.charAt(0).toUpperCase() +
                              key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Additional Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {property.rules && property.rules.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Property Rules
                  </h3>
                  <ul className="space-y-2">
                    {property.rules.map((rule, index) => (
                      <li
                        key={index}
                        className="flex items-start space-x-2"
                      >
                        <FaCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Location
              </h2>

              <div className="flex items-start space-x-3 mb-4">
                <FiMapPin className="h-5 w-5 text-red-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">
                    {property.location}
                  </p>
                  {property.address && (
                    <div className="text-gray-600 text-sm mt-2 space-y-1">
                      {property.address.street && (
                        <p>{property.address.street}</p>
                      )}
                      <p>
                        {[
                          property.address.city,
                          property.address.state,
                          property.address.zipCode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Status */}
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <FiDollarSign className="h-6 w-6 text-green-600" />
                  <span className="text-3xl font-bold text-gray-900">
                    NPR {property.price?.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600">per month</p>
              </div>

              <div className="text-center mb-6">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    property.status
                  )}`}
                >
                  {property.status?.charAt(0).toUpperCase() +
                    property.status?.slice(1)}
                </span>
              </div>

              <Link
                to={`/seller/edit-property/${property._id}`}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FiEdit className="h-4 w-4" />
                <span>Edit Property</span>
              </Link>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistics
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiEye className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Total Views</span>
                  </div>
                  <span className="font-medium">
                    {property.views?.total || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiUsers className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Logged In Views
                    </span>
                  </div>
                  <span className="font-medium">
                    {property.views?.loggedIn || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiUsers className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      Anonymous Views
                    </span>
                  </div>
                  <span className="font-medium">
                    {property.views?.anonymous || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Property Info
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-600">
                      Available From
                    </span>
                  </div>
                  <span className="font-medium text-sm">
                    {property.availableFrom
                      ? formatDate(property.availableFrom)
                      : 'Not specified'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiClock className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm text-gray-600">Listed On</span>
                  </div>
                  <span className="font-medium text-sm">
                    {property.createdAt
                      ? formatDate(property.createdAt)
                      : 'Unknown'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiClock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-gray-600">Last Updated</span>
                  </div>
                  <span className="font-medium text-sm">
                    {property.updatedAt
                      ? formatDate(property.updatedAt)
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyView;
