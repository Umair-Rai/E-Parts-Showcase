/**
 * Image URL Utilities
 * 
 * This file centralizes all image URL construction logic for the frontend.
 * Images are stored in the backend at /home/alsayyed/backend/uploads/
 * and served via Express static middleware at https://eme6.com/uploads/
 */

// Base URL for the API and static files
const BASE_URL = process.env.REACT_APP_API_URL || 'https://eme6.com';

/**
 * Constructs a full image URL from a relative path
 * 
 * @param {string} imagePath - The relative image path (e.g., "/uploads/categories/seal1.jpg")
 * @returns {string} - The full URL (e.g., "https://eme6.com/uploads/categories/seal1.jpg")
 */
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/images/placeholder.jpg'; // Fallback for missing images
  }

  // If already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Ensure the path starts with a slash
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Construct and return the full URL
  return `${BASE_URL}${cleanPath}`;
};

/**
 * Processes an array of image paths and returns full URLs
 * 
 * @param {Array|string} images - Array of image paths or JSON string
 * @returns {Array} - Array of full image URLs
 */
export const processImageArray = (images) => {
  try {
    // If images is a string, try to parse it as JSON
    let imageArray = images;
    if (typeof images === 'string') {
      try {
        imageArray = JSON.parse(images);
      } catch {
        // If parsing fails, treat as single image path
        imageArray = [images];
      }
    }

    // Ensure we have an array
    if (!Array.isArray(imageArray)) {
      imageArray = [imageArray];
    }

    // Filter out null/undefined and construct full URLs
    return imageArray
      .filter(img => img)
      .map(img => getFullImageUrl(img));
  } catch (error) {
    console.error('Error processing image array:', error);
    return [];
  }
};

/**
 * Constructs a product image URL
 * 
 * @param {string} imagePath - The relative product image path
 * @returns {string} - The full URL
 */
export const getProductImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/images/placeholder.jpg';
  }
  
  // If it's just a filename, prepend the products folder path
  if (!imagePath.includes('/')) {
    return `${BASE_URL}/uploads/products/${imagePath}`;
  }
  
  return getFullImageUrl(imagePath);
};

/**
 * Constructs a category image URL
 * 
 * @param {string} imagePath - The relative category image path
 * @returns {string} - The full URL
 */
export const getCategoryImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/images/placeholder.jpg';
  }
  
  // If it's just a filename, prepend the categories folder path
  if (!imagePath.includes('/')) {
    return `${BASE_URL}/uploads/categories/${imagePath}`;
  }
  
  return getFullImageUrl(imagePath);
};

export default {
  getFullImageUrl,
  processImageArray,
  getProductImageUrl,
  getCategoryImageUrl,
  BASE_URL
};

