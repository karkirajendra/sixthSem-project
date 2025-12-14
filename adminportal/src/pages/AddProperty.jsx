import { useState } from 'react';
import {
  FiSave,
  FiUser,
  FiHome,
  FiImage,
  FiMapPin,
  FiDollarSign,
  FiMaximize,
  FiUpload,
  FiX,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAppContext } from '../context/AppContext';
import { uploadSingleImage, uploadMultipleImages } from '../utils/adminApi';
import toast from 'react-hot-toast';

const AddListings = ({ isDark }) => {
  const navigate = useNavigate();
  const { addProperty } = useAppContext();

  const [sellerData, setSellerData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'seller',
  });

  const [propertyData, setPropertyData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'flat', // Default to flat
    roomType: '', // Required when type is 'room'
    flatType: '', // Required when type is 'flat' or 'apartment'
    location: '',
    area: '', // Changed from 'size' to match model
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
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState([]); // For preview before upload

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

  const handleSellerChange = (e) => {
    const { name, value } = e.target;
    setSellerData((prev) => ({ ...prev, [name]: value }));
  };

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

  // Dropzone configuration for image upload
  const onDrop = async (acceptedFiles) => {
    setUploadingImages(true);

    try {
      if (acceptedFiles.length === 1) {
        // Single image upload
        const result = await uploadSingleImage(acceptedFiles[0]);
        if (result.success) {
          setPropertyData((prev) => ({
            ...prev,
            images: [...prev.images, result.url],
          }));
          toast.success('Image uploaded successfully!');
        } else {
          toast.error(result.error || 'Failed to upload image');
        }
      } else if (acceptedFiles.length > 1) {
        // Multiple images upload
        const result = await uploadMultipleImages(acceptedFiles);
        if (result.success) {
          const newUrls = result.uploaded.map((img) => img.url);
          setPropertyData((prev) => ({
            ...prev,
            images: [...prev.images, ...newUrls],
          }));
          toast.success(
            `Successfully uploaded ${result.uploaded.length} images!`
          );
          if (result.failed > 0) {
            toast.warning(`${result.failed} images failed to upload`);
          }
        } else {
          toast.error(result.error || 'Failed to upload images');
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

  const removeUploadedImage = (index) => {
    setPropertyData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProperty = async (e) => {
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

      // If creating for a seller, you'd need to handle sellerId
      // For now, the admin endpoint will handle this

      const result = await addProperty(formattedPropertyData);

      if (result && result.success) {
        toast.success('Property created successfully!', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          icon: '🏠',
        });
        navigate('/listings');
      } else {
        throw new Error(result?.message || 'Failed to create property');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error(error.message || 'Failed to create listing', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
        icon: '❌',
      });
    }
  };

  // Styles for dark/light mode
  const inputStyles = `w-full px-4 py-3 rounded-lg border transition-colors ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  } focus:ring-2 focus:ring-blue-500/20`;

  const cardStyles = `rounded-xl shadow-lg p-6 transition-colors ${
    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  } border`;

  const labelStyles = `block text-sm font-medium mb-2 ${
    isDark ? 'text-gray-300' : 'text-gray-700'
  }`;

  const sectionTitleStyles = `text-lg font-medium ${
    isDark ? 'text-white' : 'text-gray-900'
  }`;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1
          className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-2`}
        >
          Add New Listing
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seller Details Form */}
        <div className={cardStyles}>
          <div className="flex items-center mb-6">
            <div
              className={`p-3 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 shadow-lg`}
            >
              <FiUser className="h-5 w-5 text-white" />
            </div>
            <h2 className={`${sectionTitleStyles} ml-3`}>Seller Details</h2>
          </div>

          <form className="space-y-4">
            <div>
              <label className={labelStyles}>
                Seller Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={sellerData.name}
                onChange={handleSellerChange}
                className={inputStyles}
                required
              />
            </div>

            <div>
              <label className={labelStyles}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={sellerData.email}
                onChange={handleSellerChange}
                className={inputStyles}
                required
              />
            </div>

            <div>
              <label className={labelStyles}>
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={sellerData.phone}
                onChange={handleSellerChange}
                className={inputStyles}
                required
              />
            </div>
          </form>
        </div>

        {/* Property Details Form */}
        <div className={`lg:col-span-2 ${cardStyles}`}>
          <div className="flex items-center mb-6">
            <div
              className={`p-3 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 shadow-lg`}
            >
              <FiHome className="h-5 w-5 text-white" />
            </div>
            <h2 className={`${sectionTitleStyles} ml-3`}>Listing Details</h2>
          </div>

          <form
            onSubmit={handleSaveProperty}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="md:col-span-2">
              <label className={labelStyles}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={propertyData.title}
                onChange={handlePropertyChange}
                className={inputStyles}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelStyles}>Description</label>
              <textarea
                name="description"
                value={propertyData.description}
                onChange={handlePropertyChange}
                rows="4"
                className={`${inputStyles} min-h-[120px]`}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className={labelStyles}>
                  <FiDollarSign className="inline-block mr-1" />
                  Price (Rs.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={propertyData.price}
                  onChange={handlePropertyChange}
                  className={inputStyles}
                  min="0"
                  required
                />
              </div>

              <div className="flex-1">
                <label className={labelStyles}>
                  <FiMaximize className="inline-block mr-1" />
                  Area (sqft) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="area"
                  value={propertyData.area}
                  onChange={handlePropertyChange}
                  className={inputStyles}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className={labelStyles}>Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={propertyData.bedrooms}
                  onChange={handlePropertyChange}
                  className={inputStyles}
                  min="0"
                />
              </div>

              <div className="flex-1">
                <label className={labelStyles}>Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={propertyData.bathrooms}
                  onChange={handlePropertyChange}
                  className={inputStyles}
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className={labelStyles}>
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={propertyData.type}
                onChange={handlePropertyChange}
                className={inputStyles}
                required
              >
                <option value="room">Room</option>
                <option value="flat">Flat</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
              </select>
            </div>

            {/* Conditional fields for room type */}
            {propertyData.type === 'room' && (
              <div>
                <label className={labelStyles}>
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="roomType"
                  value={propertyData.roomType}
                  onChange={handlePropertyChange}
                  className={inputStyles}
                  required
                >
                  <option value="">Select Room Type</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="studio">Studio</option>
                  <option value="single-kitchen">Single with Kitchen</option>
                </select>
              </div>
            )}

            {/* Conditional fields for flat/apartment type */}
            {(propertyData.type === 'flat' ||
              propertyData.type === 'apartment') && (
              <div>
                <label className={labelStyles}>
                  Flat Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="flatType"
                  value={propertyData.flatType}
                  onChange={handlePropertyChange}
                  className={inputStyles}
                  required
                >
                  <option value="">Select Flat Type</option>
                  <option value="1bhk">1 BHK</option>
                  <option value="2bhk">2 BHK</option>
                  <option value="3bhk">3 BHK</option>
                  <option value="4bhk">4 BHK</option>
                </select>
              </div>
            )}

            <div>
              <label className={labelStyles}>
                <FiMapPin className="inline-block mr-1" />
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={propertyData.location}
                onChange={handlePropertyChange}
                className={inputStyles}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelStyles}>
                <FiImage className="inline-block mr-1" />
                Property Images <span className="text-red-500">*</span>
              </label>

              {/* Image Upload Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : uploadingImages
                    ? 'border-gray-300 bg-gray-50 dark:bg-gray-700 cursor-not-allowed'
                    : isDark
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-2">
                  <FiUpload
                    className={`h-8 w-8 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  {uploadingImages ? (
                    <p
                      className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Uploading images...
                    </p>
                  ) : isDragActive ? (
                    <p className="text-sm text-blue-600">
                      Drop the images here
                    </p>
                  ) : (
                    <>
                      <p
                        className={`text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Drag & drop images here, or click to select
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Supports: JPG, PNG, WebP (Max 5MB each, up to 10 images)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Uploaded Images Preview */}
              {propertyData.images.length > 0 && (
                <div className="mt-4">
                  <h4
                    className={`text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Uploaded Images ({propertyData.images.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {propertyData.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative group"
                      >
                        <img
                          src={imageUrl}
                          alt={`Property ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Address Section */}
            <div className="md:col-span-2">
              <label className={labelStyles}>Address Details</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="address.street"
                  value={propertyData.address.street}
                  onChange={handlePropertyChange}
                  placeholder="Street Address"
                  className={inputStyles}
                />
                <input
                  type="text"
                  name="address.city"
                  value={propertyData.address.city}
                  onChange={handlePropertyChange}
                  placeholder="City"
                  className={inputStyles}
                />
                <input
                  type="text"
                  name="address.state"
                  value={propertyData.address.state}
                  onChange={handlePropertyChange}
                  placeholder="State"
                  className={inputStyles}
                />
                <input
                  type="text"
                  name="address.zipCode"
                  value={propertyData.address.zipCode}
                  onChange={handlePropertyChange}
                  placeholder="Zip Code"
                  className={inputStyles}
                />
              </div>
            </div>

            <div>
              <label className={labelStyles}>Available From</label>
              <input
                type="date"
                name="availableFrom"
                value={propertyData.availableFrom}
                onChange={handlePropertyChange}
                className={inputStyles}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelStyles}>Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {featuresList.map((feature) => (
                  <button
                    key={feature.key}
                    type="button"
                    onClick={() => handleFeatureToggle(feature.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      propertyData.features[feature.key]
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {feature.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelStyles}>Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {amenitiesList.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      propertyData.amenities.includes(amenity)
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelStyles}>Rules</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {rulesList.map((rule) => (
                  <button
                    key={rule}
                    type="button"
                    onClick={() => handleRuleToggle(rule)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      propertyData.rules.includes(rule)
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rule}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FiSave className="h-5 w-5 mr-2" />
                Save Listing
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddListings;
