import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createProperty,
  uploadSingleImage,
  uploadMultipleImages,
  geocodeAddress,
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
  FiMap,
  FiSearch,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import L from 'leaflet';

// Import Leaflet CSS
const leafletCSS = `
  @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
`;

// Nominatim geocoding service (free OpenStreetMap service)
const geocodeWithNominatim = async (query) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, Nepal&limit=5`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

const reverseGeocodeWithNominatim = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

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
  });

  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: '',
    accuracy: null
  });

  const [mapCenter, setMapCenter] = useState([27.7172, 85.3240]); // Kathmandu center
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Initialize map when showMap becomes true
  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      // Add Leaflet CSS
      if (!document.querySelector('#leaflet-css')) {
        const style = document.createElement('style');
        style.id = 'leaflet-css';
        style.textContent = leafletCSS;
        document.head.appendChild(style);
      }

      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView(mapCenter, 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Add click event
      mapInstanceRef.current.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        await handleMapClick(lat, lng);
      });
    }

    return () => {
      if (mapInstanceRef.current && !showMap) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap]);

  // Update map center when mapCenter state changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(mapCenter, 15);
    }
  }, [mapCenter]);

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
    { value: '1bhk', label: '1 BHK' },
    { value: '2bhk', label: '2 BHK' },
    { value: '3bhk', label: '3 BHK' },
    { value: '4bhk', label: '4 BHK' },
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

  // Map event handlers
const handleMapClick = useCallback(async (lat, lng) => {
  setSelectedLocation([lat, lng]);
  setCoordinates({
    latitude: lat.toString(),
    longitude: lng.toString(),
    accuracy: 1.0 // High accuracy for manual selection
  });

  // Remove existing marker
  if (markerRef.current) {
    mapInstanceRef.current.removeLayer(markerRef.current);
  }

  // Add new marker
  markerRef.current = L.marker([lat, lng])
    .addTo(mapInstanceRef.current)
    .bindPopup(`
      <div style="text-align: center;">
        <p style="margin: 0; font-weight: bold; color: #1f2937;">Selected Location</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
      </div>
    `)
    .openPopup();

  // Reverse geocode to get address
  const addressData = await reverseGeocodeWithNominatim(lat, lng);
  if (addressData && addressData.display_name) {
    // Create a shorter location string (max 50 characters)
    const shortLocation = createShortLocation(addressData);
    
    // Update the main location field with the shorter address
    setPropertyData(prev => ({
      ...prev,
      location: shortLocation, // Use shortened location
      address: {
        street: `${addressData.address?.house_number || ''} ${addressData.address?.road || ''}`.trim().substring(0, 30),
        city: addressData.address?.city || addressData.address?.town || addressData.address?.village || addressData.address?.suburb || '',
        state: addressData.address?.state || addressData.address?.region || 'Nepal',
        zipCode: addressData.address?.postcode || '',
      },
    }));
  }

  toast.success('Location selected! Address shortened to meet requirements.');
}, []);

// Helper function to create shorter location strings
const createShortLocation = (addressData) => {
  const address = addressData.address;
  
  // Try different combinations to get a good short address
  let shortLocation = '';
  
  if (address.road && address.city) {
    shortLocation = `${address.road}, ${address.city}`;
  } else if (address.suburb && address.city) {
    shortLocation = `${address.suburb}, ${address.city}`;
  } else if (address.village && address.state) {
    shortLocation = `${address.village}, ${address.state}`;
  } else {
    // Fallback: use the first parts of the display name
    const parts = addressData.display_name.split(',');
    shortLocation = parts.slice(0, 2).join(', '); // Just use first two parts
  }
  
  // Ensure it's max 50 characters
  return shortLocation.substring(0, 50);
};

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      // First try your backend's geocoding API for better results
      const backendResult = await geocodeAddress(searchQuery.trim());
      
      if (backendResult.success) {
        const { coordinates: coords, formattedAddress } = backendResult;
        const lat = coords.latitude;
        const lng = coords.longitude;
        
        // Create a result that matches Nominatim format for consistency
        const result = {
          lat: lat.toString(),
          lon: lng.toString(),
          display_name: formattedAddress || searchQuery,
          address: {
            city: propertyData.address.city || 'Kathmandu'
          }
        };
        
        await selectSearchResult(result);
        setSearchResults([]);
        setSearchQuery('');
        return;
      }
    } catch (error) {
      console.warn('Backend geocoding failed, trying Nominatim:', error);
    }

    // Fallback to Nominatim if backend geocoding fails
    try {
      const results = await geocodeWithNominatim(searchQuery);
      setSearchResults(results.slice(0, 5)); // Limit to 5 results
    } catch (error) {
      toast.error('Error searching for location');
    } finally {
      setSearching(false);
    }
  };

 const selectSearchResult = async (result) => {
  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);
  
  setMapCenter([lat, lng]);
  await handleMapClick(lat, lng);

  // Create a shorter location string
  const shortLocation = createShortSearchLocation(result);

  // Update the main location field with the selected search result
  setPropertyData(prev => ({
    ...prev,
    location: shortLocation, // Use shortened location
    address: {
      street: result.display_name.split(',')[0]?.substring(0, 30) || '',
      city: result.address?.city || result.address?.town || result.address?.village || '',
      state: result.address?.state || result.address?.region || 'Nepal',
      zipCode: result.address?.postcode || '',
    },
  }));

  setSearchResults([]);
  setSearchQuery('');
  toast.success('Location found! Address shortened to meet requirements.');
};

// Helper function for search results
const createShortSearchLocation = (result) => {
  const parts = result.display_name.split(',');
  // Use the most relevant parts (usually first 2-3)
  let shortLocation = parts.slice(0, 2).join(', ');
  
  // If still too long, try different combinations
  if (shortLocation.length > 50) {
    if (result.address?.road && result.address?.city) {
      shortLocation = `${result.address.road}, ${result.address.city}`;
    } else if (result.address?.suburb && result.address?.city) {
      shortLocation = `${result.address.suburb}, ${result.address.city}`;
    } else {
      // Last resort: truncate
      shortLocation = shortLocation.substring(0, 50);
    }
  }
  
  return shortLocation.substring(0, 50);
};

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setMapCenter([lat, lng]);
          setCoordinates({
            latitude: lat.toString(),
            longitude: lng.toString(),
            accuracy: position.coords.accuracy ? (1 / position.coords.accuracy) : 0.8
          });

          await handleMapClick(lat, lng); // This will handle marker creation and address update

          toast.success('Current location detected and address updated!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Could not get your current location');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
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

  const handleRemoveImage = (index) => {
    setPropertyData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Add this function to handle geocoding
  const handleGeocode = async () => {
    if (!propertyData.location.trim()) {
      toast.error('Please enter a property address first');
      return;
    }

    setGeocoding(true);
    try {
      // Use your backend's geocoding API
      const result = await geocodeAddress(propertyData.location.trim(), propertyData.address.city);
      
      if (result.success) {
        const { coordinates: coords, formattedAddress } = result;
        
        // Update coordinates state
        setCoordinates({
          latitude: coords.latitude.toString(),
          longitude: coords.longitude.toString(),
          accuracy: coords.accuracy || 0.9
        });

        // Update map center and add marker
        const lat = coords.latitude;
        const lng = coords.longitude;
        setMapCenter([lat, lng]);
        setSelectedLocation([lat, lng]);

        // Add marker to map if map is visible
        if (mapInstanceRef.current) {
          // Remove existing marker
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
          }

          // Add new marker
          markerRef.current = L.marker([lat, lng])
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div style="text-align: center;">
                <p style="margin: 0; font-weight: bold; color: #1f2937;">Found Location</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">${formattedAddress || propertyData.location}</p>
              </div>
            `)
            .openPopup();

          // Pan to location
          mapInstanceRef.current.setView([lat, lng], 15);
        }

        // Auto-fill address fields if we have formatted address
        if (formattedAddress) {
          // Try to parse the formatted address
          const addressParts = formattedAddress.split(',').map(part => part.trim());
          
          setPropertyData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: addressParts[0] || prev.address.street,
              city: addressParts.length > 1 ? addressParts[addressParts.length - 2] : prev.address.city,
              state: addressParts.length > 2 ? addressParts[addressParts.length - 1] : 'Nepal'
            },
          }));
        }

        toast.success('Location found and coordinates updated!');
      } else {
        toast.error(result.message || 'Could not find coordinates for this address');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to find location. Please check the address.');
    } finally {
      setGeocoding(false);
    }
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

  // Enhanced validation with better error messages
  const errors = [];

  // Required field validation
  if (!propertyData.title?.trim()) {
    errors.push('Property title is required');
  }

  if (!propertyData.description?.trim()) {
    errors.push('Property description is required');
  }

  if (!propertyData.price) {
    errors.push('Property price is required');
  }

  if (!propertyData.location?.trim()) {
    errors.push('Property location is required');
  }

  if (!propertyData.area) {
    errors.push('Property area is required');
  }

  // Validate location length (max 50 characters)
  if (propertyData.location && propertyData.location.length > 50) {
    errors.push('Location must be 50 characters or less. Please shorten the address.');
  }

  // Validate conditional fields
  if (propertyData.type === 'room' && !propertyData.roomType) {
    errors.push('Room type is required for room properties');
  }

  if ((propertyData.type === 'flat' || propertyData.type === 'apartment') && !propertyData.flatType) {
    errors.push('Flat type is required for flat/apartment properties');
  }

  if (propertyData.images.length === 0) {
    errors.push('At least one image is required');
  }

  // Show all validation errors
  if (errors.length > 0) {
    errors.forEach(error => toast.error(error));
    return;
  }

  setLoading(true);

  try {
    // Format data to match your backend's expected format
    const formattedPropertyData = {
      title: propertyData.title.trim(),
      description: propertyData.description.trim() || 'No description provided', // Ensure description is never empty
      type: propertyData.type.toLowerCase(),
      price: Number(propertyData.price),
      location: propertyData.location.trim().substring(0, 50), // TRUNCATE TO 50 CHARACTERS
      area: Number(propertyData.area),
      bedrooms: Number(propertyData.bedrooms) || 0,
      bathrooms: Number(propertyData.bathrooms) || 0,
      features: propertyData.features,
      images: propertyData.images.filter(img => img && img.trim() !== ''),
      amenities: propertyData.amenities,
      rules: propertyData.rules,
      address: {
        street: propertyData.address.street?.trim() || '',
        city: propertyData.address.city?.trim() || propertyData.location.substring(0, 50),
        state: propertyData.address.state?.trim() || 'Nepal',
        zipCode: propertyData.address.zipCode?.trim() || ''
      },
      availableFrom: new Date(propertyData.availableFrom).toISOString(),
      status: 'available'
    };

    // Add conditional fields based on type
    if (propertyData.type === 'room' && propertyData.roomType) {
      formattedPropertyData.roomType = propertyData.roomType;
    }

    if ((propertyData.type === 'flat' || propertyData.type === 'apartment') && propertyData.flatType) {
      formattedPropertyData.flatType = propertyData.flatType.toLowerCase();
    }

    // Add coordinates if available
    if (coordinates.latitude && coordinates.longitude) {
      formattedPropertyData.coordinates = {
        latitude: parseFloat(coordinates.latitude),
        longitude: parseFloat(coordinates.longitude),
        accuracy: coordinates.accuracy || 1.0
      };
    }

    console.log('Formatted property data:', formattedPropertyData);

    const response = await createProperty(formattedPropertyData);

    if (response.success) {
      toast.success('Property added successfully!', {
        duration: 4000,
        position: 'top-right',
      });

      setTimeout(() => {
        navigate('/seller/listings');
      }, 2000);
    } else {
      toast.error(response.message || 'Failed to add property');
    }
  } catch (error) {
    console.error('Error adding property:', error);
    toast.error(error.message || 'Error adding property');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-8">
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
    Property Address/Location *
  </label>
  <div className="space-y-2">
    <input
      type="text"
      name="location"
      value={propertyData.location}
      onChange={handlePropertyChange}
                    placeholder="Enter short address (max 50 characters)"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      maxLength={50}
      required
    />
    <p className="text-xs text-gray-500">
      {propertyData.location.length}/50 characters. Keep it short and descriptive.
    </p>
    {propertyData.location.length > 50 && (
      <p className="text-xs text-red-500">
        Location must be 50 characters or less
      </p>
    )}
  </div>
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={propertyData.description}
                  onChange={handlePropertyChange}
                  rows="4"
                  placeholder="Describe your property in detail..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a detailed description of your property including features, condition, and any special aspects.
                </p>
              </div>
            </div>
          </div>

          {/* Address & Location Selection Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiMapPin className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Address Details & Location Selection
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

              {/* Enhanced Location Selection Section with Vanilla Leaflet */}
              <div className="md:col-span-2">
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Precise Location Selection
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowMap(!showMap)}
                      className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                      <FiMap className="h-4 w-4" />
                      <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
                    </button>
                  </div>
                  
                  {showMap && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="font-medium text-blue-900 mb-1">How to set your property location:</h5>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                          <li><strong>Type address:</strong> Enter address in the field above, then click "Find Coordinates"</li>
                          <li><strong>Search on map:</strong> Use the search box below to find a specific location</li>
                          <li><strong>Click on map:</strong> Click anywhere on the map to select exact location</li>
                          <li><strong>Use GPS:</strong> Click "Use Current Location" if you're at the property</li>
                        </ol>
                        <p className="text-xs text-blue-700 mt-2 font-medium">
                          💡 The "Property Address/Location" field above will automatically update when you select a location!
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        Use the map below to select the exact location of your property. You can search for an address, click on the map, or use your current location.
                      </p>
                      
                      {/* Map Controls */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Search for address or place in Nepal..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <button
                            type="button"
                            onClick={handleSearch}
                            disabled={searching || !searchQuery.trim()}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-xs font-medium"
                          >
                            {searching ? '...' : 'Search'}
                          </button>
                        </div>
                        
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                        >
                          <FiMapPin className="h-4 w-4" />
                          <span>Use Current Location</span>
                        </button>
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-300 max-h-48 overflow-y-auto">
                          {searchResults.map((result, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectSearchResult(result)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
                            >
                              <div className="font-medium text-gray-900 text-sm">
                                {result.display_name.split(',').slice(0, 3).join(', ')}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {result.display_name}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Map Container */}
                      <div className="rounded-lg overflow-hidden border border-gray-300">
                        <div
                          ref={mapRef}
                          style={{ height: '400px', width: '100%' }}
                          className="bg-gray-100"
                        />
                      </div>

                      {/* Selected Location Info */}
                      {selectedLocation && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">Selected Location</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-blue-700 font-medium">Latitude:</span>
                              <span className="ml-2 text-blue-800">{selectedLocation[0].toFixed(6)}</span>
                            </div>
                            <div>
                              <span className="text-blue-700 font-medium">Longitude:</span>
                              <span className="ml-2 text-blue-800">{selectedLocation[1].toFixed(6)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Traditional Coordinates Section */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        Manual Coordinates (Alternative)
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowCoordinates(!showCoordinates)}
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                      >
                        {showCoordinates ? 'Hide' : 'Show'} Manual Entry
                      </button>
                    </div>
                    
                    {showCoordinates && (
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          If you prefer, you can manually enter coordinates or use the auto-detect feature below.
                        </p>
                        
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={handleGeocode}
                            disabled={geocoding || !propertyData.location.trim()}
                            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <FiMap className="h-4 w-4" />
                            <span>{geocoding ? 'Finding Location...' : 'Find Coordinates from Address'}</span>
                          </button>
                          
                          {coordinates.latitude && coordinates.longitude && (
                            <span className="text-sm text-green-600 font-medium flex items-center space-x-1">
                              <span>✓</span>
                              <span>Coordinates found</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Latitude
                            </label>
                            <input
                              type="number"
                              value={coordinates.latitude}
                              onChange={(e) => setCoordinates(prev => ({...prev, latitude: e.target.value}))}
                              placeholder="27.7172"
                              step="any"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Longitude
                            </label>
                            <input
                              type="number"
                              value={coordinates.longitude}
                              onChange={(e) => setCoordinates(prev => ({...prev, longitude: e.target.value}))}
                              placeholder="85.3240"
                              step="any"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                        
                        {coordinates.accuracy && (
                          <p className="text-xs text-gray-500">
                            Accuracy: {(coordinates.accuracy * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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