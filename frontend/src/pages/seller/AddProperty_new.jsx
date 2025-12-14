import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProperty } from '../../api/api';
import {
  FiSave,
  FiHome,
  FiImage,
  FiMapPin,
  FiDollarSign,
  FiMaximize,
  FiX,
  FiPlus,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [propertyData, setPropertyData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'room', // Default to room
    roomType: '', // Required when type is 'room'
    flatType: '', // Required when type is 'flat' or 'apartment'
    location: '',
    area: '', // Changed from 'size' to match backend model
    bedrooms: 0,
    bathrooms: 0,
    images: [], // URLs from uploaded images
    features: {
      electricity: false,
      parking: false,
      wifi: false,
      security: false,
      furnished: false,
      waterSupply: false,
    },
    amenities: [], // Array of strings
    rules: [],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    availableFrom: new Date().toISOString().split('T')[0], // Date input format
    imageUrl: '', // Temporary field for adding images
  });

  const propertyTypes = [
    { value: 'room', label: 'Room' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'flat', label: 'Flat' },
  ];

  const roomTypes = [
    { value: 'single', label: 'Single Room' },
    { value: 'double', label: 'Double Room' },
    { value: 'single-kitchen', label: 'Single Room with Kitchen' },
    { value: 'double-kitchen', label: 'Double Room with Kitchen' },
    { value: 'studio', label: 'Studio' },
  ];

  const flatTypes = [
    { value: '1BHK', label: '1 BHK' },
    { value: '2BHK', label: '2 BHK' },
    { value: '3BHK', label: '3 BHK' },
    { value: '4BHK', label: '4 BHK' },
    { value: 'penthouse', label: 'Penthouse' },
  ];

  const locations = [
    'Kathmandu',
    'Lalitpur',
    'Bhaktapur',
    'Pokhara',
    'Biratnagar',
    'Birgunj',
    'Butwal',
    'Dharan',
    'Bharatpur',
    'Hetauda',
    'Janakpur',
    'Nepalgunj',
  ];

  const amenitiesList = [
    'WiFi',
    'AC',
    'Gym',
    'Swimming Pool',
    'Elevator',
    'Garden',
    'CCTV',
    'Laundry',
    'Internet',
  ];

  const featuresList = [
    { key: 'electricity', label: 'Electricity' },
    { key: 'parking', label: 'Parking' },
    { key: 'wifi', label: 'WiFi' },
    { key: 'security', label: 'Security' },
    { key: 'furnished', label: 'Furnished' },
    { key: 'waterSupply', label: 'Water Supply' },
  ];

  const rulesList = [
    'No Smoking',
    'No Pets',
    'No Parties',
    'Visitors Allowed',
    'Family Preferred',
    'Students Welcome',
  ];

  const handlePropertyChange = (e) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      // Handle nested objects like address.street
      const [parent, child] = name.split('.');
      setPropertyData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? Number(value) : value,
        },
      }));
    } else {
      setPropertyData((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleFeatureToggle = (featureKey) => {
    setPropertyData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey],
      },
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setPropertyData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleRuleToggle = (rule) => {
    setPropertyData((prev) => ({
      ...prev,
      rules: prev.rules.includes(rule)
        ? prev.rules.filter((r) => r !== rule)
        : [...prev.rules, rule],
    }));
  };

  const handleAddImage = () => {
    if (propertyData.imageUrl.trim()) {
      setPropertyData((prev) => ({
        ...prev,
        images: [...prev.images, prev.imageUrl.trim()],
        imageUrl: '',
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setPropertyData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !propertyData.title ||
      !propertyData.price ||
      !propertyData.location ||
      !propertyData.area
    ) {
      toast.error(
        'Please fill in all required fields (title, price, location, area)'
      );
      return;
    }

    // Validate conditional fields
    if (propertyData.type === 'room' && !propertyData.roomType) {
      toast.error('Room type is required for room properties');
      return;
    }

    if (
      (propertyData.type === 'flat' || propertyData.type === 'apartment') &&
      !propertyData.flatType
    ) {
      toast.error('Flat type is required for flat/apartment properties');
      return;
    }

    if (propertyData.images.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    setLoading(true);

    try {
      // Format data to match the Property model
      const formattedPropertyData = {
        title: propertyData.title,
        description: propertyData.description,
        type: propertyData.type.toLowerCase(), // Convert to lowercase
        roomType:
          propertyData.type === 'room' ? propertyData.roomType : undefined,
        flatType:
          propertyData.type === 'flat' || propertyData.type === 'apartment'
            ? propertyData.flatType
            : undefined,
        price: Number(propertyData.price),
        location: propertyData.location,
        area: Number(propertyData.area),
        bedrooms: Number(propertyData.bedrooms),
        bathrooms: Number(propertyData.bathrooms),
        features: propertyData.features,
        images: propertyData.images,
        amenities: propertyData.amenities,
        rules: propertyData.rules,
        address: propertyData.address,
        availableFrom: new Date(propertyData.availableFrom),
        status: 'pending', // Set to pending for admin approval
      };

      const response = await addProperty(formattedPropertyData);

      if (response.success) {
        toast.success('Property added successfully!', {
          duration: 4000,
          position: 'top-right',
        });

        setTimeout(() => {
          navigate('/seller/listings');
        }, 2000);
      } else {
        toast.error('Failed to add property');
      }
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error('Error adding property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-lg text-gray-600 mt-2">
            Create a new property listing with comprehensive details
          </p>
        </div>

        {/* Decorative Element */}
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8"
        >
          {/* Property Information Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiHome className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Property Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={propertyData.title}
                  onChange={handlePropertyChange}
                  placeholder="e.g., Modern Apartment in City Center"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  name="type"
                  value={propertyData.type}
                  onChange={handlePropertyChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {propertyTypes.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional Type-specific Fields */}
              {propertyData.type === 'room' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <select
                    name="roomType"
                    value={propertyData.roomType}
                    onChange={handlePropertyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Room Type</option>
                    {roomTypes.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(propertyData.type === 'flat' ||
                propertyData.type === 'apartment') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flat Type *
                  </label>
                  <select
                    name="flatType"
                    value={propertyData.flatType}
                    onChange={handlePropertyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Flat Type</option>
                    {flatTypes.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <select
                  name="location"
                  value={propertyData.location}
                  onChange={handlePropertyChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiDollarSign className="inline h-4 w-4 mr-1" />
                  Price (NPR per month) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={propertyData.price}
                  onChange={handlePropertyChange}
                  placeholder="Enter monthly rent"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMaximize className="inline h-4 w-4 mr-1" />
                  Area (sq ft) *
                </label>
                <input
                  type="number"
                  name="area"
                  value={propertyData.area}
                  onChange={handlePropertyChange}
                  placeholder="Area in square feet"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={propertyData.bedrooms}
                  onChange={handlePropertyChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={propertyData.bathrooms}
                  onChange={handlePropertyChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From
                </label>
                <input
                  type="date"
                  name="availableFrom"
                  value={propertyData.availableFrom}
                  onChange={handlePropertyChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={propertyData.description}
                  onChange={handlePropertyChange}
                  rows="4"
                  placeholder="Describe your property..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiMapPin className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Address Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={propertyData.address.street}
                  onChange={handlePropertyChange}
                  placeholder="Street address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={propertyData.address.city}
                  onChange={handlePropertyChange}
                  placeholder="City"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={propertyData.address.state}
                  onChange={handlePropertyChange}
                  placeholder="State/Province"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={propertyData.address.zipCode}
                  onChange={handlePropertyChange}
                  placeholder="Zip/Postal code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiImage className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Property Images *
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="url"
                  name="imageUrl"
                  value={propertyData.imageUrl}
                  onChange={handlePropertyChange}
                  placeholder="Enter image URL"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FiPlus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>

              {propertyData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {propertyData.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group"
                    >
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Property Features
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {featuresList.map((feature) => (
                <label
                  key={feature.key}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={propertyData.features[feature.key]}
                    onChange={() => handleFeatureToggle(feature.key)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Amenities
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenitiesList.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={propertyData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rules Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Property Rules
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {rulesList.map((rule) => (
                <label
                  key={rule}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={propertyData.rules.includes(rule)}
                    onChange={() => handleRuleToggle(rule)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{rule}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/seller/listings')}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4" />
                  <span>Create Property</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
