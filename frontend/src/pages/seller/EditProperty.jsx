import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPropertyById,
  updateProperty,
  uploadSingleImage,
  uploadMultipleImages,
} from '../../api/api';
import { useDropzone } from 'react-dropzone';
import {
  FiSave,
  FiHome,
  FiImage,
  FiMapPin,
  FiDollarSign,
  FiMaximize,
  FiX,
  FiUpload,
  FiArrowLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [propertyData, setPropertyData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'room',
    roomType: '',
    flatType: '',
    location: '',
    area: '',
    bedrooms: 0,
    bathrooms: 0,
    images: [],
    features: {
      electricity: false,
      parking: false,
      wifi: false,
      security: false,
      furnished: false,
      waterSupply: false,
    },
    amenities: [],
    rules: [],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    availableFrom: new Date().toISOString().split('T')[0],
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
    { value: 'studio', label: 'Studio' },
    { value: 'single-kitchen', label: 'Single Room with Kitchen' },
  ];

  const flatTypes = [
    { value: '1bhk', label: '1 BHK' },
    { value: '2bhk', label: '2 BHK' },
    { value: '3bhk', label: '3 BHK' },
    { value: '4bhk', label: '4 BHK' },
  ];

  const featuresList = [
    { key: 'electricity', label: 'Electricity' },
    { key: 'parking', label: 'Parking' },
    { key: 'wifi', label: 'WiFi' },
    { key: 'security', label: 'Security' },
    { key: 'furnished', label: 'Furnished' },
    { key: 'waterSupply', label: 'Water Supply' },
  ];

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setFetchLoading(true);
        const response = await getPropertyById(id);

        if (response.success) {
          const property = response.property;
          setPropertyData({
            title: property.title || '',
            description: property.description || '',
            price: property.price?.toString() || '',
            type: property.type || 'room',
            roomType: property.roomType || '',
            flatType: property.flatType || '',
            location: property.location || '',
            area: property.area?.toString() || '',
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            images: property.images || [],
            features: {
              electricity: property.features?.electricity || false,
              parking: property.features?.parking || false,
              wifi: property.features?.wifi || false,
              security: property.features?.security || false,
              furnished: property.features?.furnished || false,
              waterSupply: property.features?.waterSupply || false,
            },
            amenities: property.amenities || [],
            rules: property.rules || [],
            address: {
              street: property.address?.street || '',
              city: property.address?.city || '',
              state: property.address?.state || '',
              zipCode: property.address?.zipCode || '',
            },
            availableFrom: property.availableFrom
              ? new Date(property.availableFrom).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
          });
        } else {
          toast.error('Property not found');
          navigate('/seller/listings');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property');
        navigate('/seller/listings');
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id, navigate]);

  const handlePropertyChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPropertyData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setPropertyData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
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

  const handleRemoveImage = (index) => {
    setPropertyData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Dropzone configuration for image upload
  const onDrop = async (acceptedFiles) => {
    setUploadingImages(true);

    try {
      if (acceptedFiles.length === 1) {
        // Single image upload
        const result = await uploadSingleImage(acceptedFiles[0]);
        console.log('Single upload result:', result);
        if (result.success && result.imageUrl) {
          setPropertyData((prev) => ({
            ...prev,
            images: [...prev.images, result.imageUrl],
          }));
          toast.success('Image uploaded successfully!');
        } else {
          toast.error(result.message || 'Failed to upload image');
        }
      } else if (acceptedFiles.length > 1) {
        // Multiple images upload
        const result = await uploadMultipleImages(acceptedFiles);
        console.log('Multiple upload result:', result);
        if (result.success && result.imageUrls && result.imageUrls.length > 0) {
          setPropertyData((prev) => ({
            ...prev,
            images: [...prev.images, ...result.imageUrls.filter((url) => url)],
          }));
          toast.success(
            `Successfully uploaded ${result.imageUrls.length} images!`
          );
        } else {
          toast.error(result.message || 'Failed to upload images');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading images');
    } finally {
      setUploadingImages(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploadingImages,
  });

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
        type: propertyData.type.toLowerCase(),
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
        images: propertyData.images.filter((img) => img && img.trim() !== ''),
        amenities: propertyData.amenities,
        rules: propertyData.rules,
        address: propertyData.address,
        availableFrom: new Date(propertyData.availableFrom),
      };

      const response = await updateProperty(id, formattedPropertyData);

      if (response.success) {
        toast.success('Property updated successfully!', {
          duration: 4000,
          position: 'top-right',
        });

        setTimeout(() => {
          navigate('/seller/listings');
        }, 2000);
      } else {
        toast.error('Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Error updating property');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/seller/listings')}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <FiArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Property
              </h1>
              <p className="text-gray-600">Update your property information</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-xl p-8 space-y-8"
        >
          {/* Basic Information */}
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
                  placeholder="Enter property title"
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
                    <option value="">Select room type</option>
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
                    <option value="">Select flat type</option>
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
                  Price (NPR) *
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={propertyData.price}
                    onChange={handlePropertyChange}
                    placeholder="Enter price per month"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sq ft) *
                </label>
                <div className="relative">
                  <FiMaximize className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="area"
                    value={propertyData.area}
                    onChange={handlePropertyChange}
                    placeholder="Enter area in sq ft"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="1"
                  />
                </div>
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
                  placeholder="Number of bedrooms"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
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
                  placeholder="Number of bathrooms"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={propertyData.description}
                onChange={handlePropertyChange}
                placeholder="Describe your property..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiMapPin className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Location</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={propertyData.location}
                  onChange={handlePropertyChange}
                  placeholder="Enter property location"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

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
                  placeholder="State"
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
              {/* Image Upload Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : uploadingImages
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-2">
                  <FiUpload className="h-8 w-8 text-gray-500" />
                  {uploadingImages ? (
                    <p className="text-sm text-gray-500">Uploading images...</p>
                  ) : isDragActive ? (
                    <p className="text-sm text-blue-600">
                      Drop the images here
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">
                        Drag & drop images here, or click to select
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports: JPG, PNG, WebP (Max 5MB each, up to 10 images)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Uploaded Images Preview */}
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
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {feature.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Available From */}
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

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/seller/listings')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4" />
                  <span>Update Property</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
