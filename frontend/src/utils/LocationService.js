import { API_URL } from '../config';

// Browser geolocation detection
export const detectUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          source: 'gps'
        });
      },
      (error) => {
        let message = 'Location detection failed';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      options
    );
  });
};

// IP-based location detection (fallback)
export const detectLocationFromIP = async () => {
  try {
    const response = await fetch(`${API_URL}/api/properties/detect-location`);
    const data = await response.json();

    if (data.success) {
      return {
        ...data.data.location.coordinates,
        city: data.data.location.city,
        region: data.data.location.region,
        country: data.data.location.country,
        source: 'ip',
        detected: data.data.detected
      };
    } else {
      throw new Error(data.message || 'IP location detection failed');
    }
  } catch (error) {
    console.error('IP location error:', error);
    
    // Fallback to public IP API if our API fails
    try {
      const fallbackResponse = await fetch('https://ipapi.co/json/');
      const fallbackData = await fallbackResponse.json();
      
      return {
        latitude: fallbackData.latitude,
        longitude: fallbackData.longitude,
        city: fallbackData.city,
        region: fallbackData.region,
        country: fallbackData.country_name,
        source: 'ip-fallback',
        detected: true
      };
    } catch (fallbackError) {
      console.error('Fallback IP location also failed:', fallbackError);
      throw new Error('All location detection methods failed');
    }
  }
};

// Combined location detection with fallback
export const getUserLocation = async (options = {}) => {
  const { showPrompt = true, fallbackToIP = true } = options;

  try {
    // First try GPS
    if (showPrompt) {
      const gpsLocation = await detectUserLocation();
      
      // Store location in localStorage for future use
      localStorage.setItem('userLocation', JSON.stringify({
        ...gpsLocation,
        timestamp: Date.now()
      }));
      
      return gpsLocation;
    }
  } catch (gpsError) {
    console.warn('GPS location failed:', gpsError.message);
    
    if (fallbackToIP) {
      try {
        const ipLocation = await detectLocationFromIP();
        
        // Store fallback location
        localStorage.setItem('userLocation', JSON.stringify({
          ...ipLocation,
          timestamp: Date.now()
        }));
        
        return ipLocation;
      } catch (ipError) {
        console.error('IP location also failed:', ipError.message);
        
        // Return default Kathmandu location
        const defaultLocation = {
          latitude: 27.7172,
          longitude: 85.3240,
          city: 'Kathmandu',
          region: 'Bagmati',
          country: 'Nepal',
          source: 'default',
          detected: false
        };
        
        localStorage.setItem('userLocation', JSON.stringify({
          ...defaultLocation,
          timestamp: Date.now()
        }));
        
        return defaultLocation;
      }
    } else {
      throw gpsError;
    }
  }
};

// Get cached location
export const getCachedLocation = () => {
  try {
    const cached = localStorage.getItem('userLocation');
    if (cached) {
      const location = JSON.parse(cached);
      
      // Check if cache is still valid (24 hours)
      const age = Date.now() - location.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (age < maxAge) {
        return location;
      } else {
        localStorage.removeItem('userLocation');
      }
    }
  } catch (error) {
    console.error('Error getting cached location:', error);
  }
  return null;
};

// Calculate distance between two points (client-side)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Format distance for display
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km away`;
  } else {
    return `${Math.round(distance)}km away`;
  }
};

// Format distance in meters for display
export const formatDistanceFromMeters = (distanceInMeters) => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m away`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(1)}km away`;
  }
};

// Location permission status
export const checkLocationPermission = async () => {
  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({name: 'geolocation'});
      return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Permission check failed:', error);
      return 'unknown';
    }
  }
  return 'unknown';
};

// Request location permission with custom messaging
export const requestLocationPermission = async () => {
  const permission = await checkLocationPermission();
  
  if (permission === 'denied') {
    throw new Error('Location access was previously denied. Please enable location access in your browser settings.');
  }
  
  if (permission === 'granted') {
    return detectUserLocation();
  }
  
  // For 'prompt' or 'unknown', attempt to get location (will trigger permission prompt)
  return detectUserLocation();
};

// Clear cached location
export const clearCachedLocation = () => {
  localStorage.removeItem('userLocation');
};

// Check if location services are available
export const isLocationAvailable = () => {
  return 'geolocation' in navigator;
};