/**
 * Utility function to format image URLs for display
 * Handles various URL formats and converts them to full URLs
 * 
 * @param {string} imageUrl - The image URL from backend (can be relative or absolute)
 * @returns {string} - Formatted full URL for the image
 */
export const formatImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return 'https://via.placeholder.com/400x300?text=No+Image';
  }
  
  // If it's already a full URL, use it
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Get API URL from environment or use default
  const apiUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
  
  // If it starts with /uploads/, prepend API URL
  if (imageUrl.startsWith('/uploads/')) {
    return `${apiUrl}${imageUrl}`;
  }
  
  // If it starts with uploads/ (no leading slash), prepend API URL with slash
  if (imageUrl.startsWith('uploads/')) {
    return `${apiUrl}/${imageUrl}`;
  }
  
  // If it starts with /, prepend API URL
  if (imageUrl.startsWith('/')) {
    return `${apiUrl}${imageUrl}`;
  }
  
  // Otherwise, assume it's a filename in the uploads folder
  return `${apiUrl}/uploads/${imageUrl}`;
};

/**
 * Get the first image from a property object
 * Checks multiple possible fields for image data
 * 
 * @param {object} property - Property object
 * @returns {string|null} - First image URL or null
 */
export const getPropertyImage = (property) => {
  if (!property) return null;
  
  // Check various possible image fields
  const imageUrl = property.imageUrl || 
                   property.image ||
                   (Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : null);
  
  return imageUrl;
};

/**
 * Format and get the first image from a property
 * Combines getPropertyImage and formatImageUrl
 * 
 * @param {object} property - Property object
 * @returns {string} - Formatted image URL
 */
export const getFormattedPropertyImage = (property) => {
  const imageUrl = getPropertyImage(property);
  return formatImageUrl(imageUrl);
};
