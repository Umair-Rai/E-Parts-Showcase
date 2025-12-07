/**
 * Image URL Utilities
 * 
 * This file centralizes all image URL construction logic for the frontend.
 * Images are stored in the backend and served via Express static middleware
 */

import API_BASE_URL from '../config/api';

// Base URL for the API and static files
const BASE_URL = API_BASE_URL;

/**
 * Constructs a full image URL from a relative path
 * 
 * @param {string} imagePath - The relative image path (e.g., "/uploads/categories/seal1.jpg")
 * @returns {string} - The full URL using the configured backend URL
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
export const processImageArray = (images, options = {}) => {
  const { defaultFolder = '' } = options;
  try {
    // Normalize input into an array
    let imageArray = images;

    if (typeof images === 'string') {
      const trimmed = images.trim();

      // Handle Postgres TEXT[] format: {"url1","url2"}
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        imageArray = trimmed
          .slice(1, -1) // remove {}
          .split(',')
          .map(item =>
            item
              .trim()
              .replace(/^"(.*)"$/, '$1') // remove surrounding quotes
          )
          .filter(Boolean);
      } else {
        // Attempt JSON parse for regular JSON strings
        try {
          imageArray = JSON.parse(trimmed);
        } catch {
          // Fallback: treat as single path string
          imageArray = [trimmed];
        }
      }
    }

    // Ensure we have an array
    if (!Array.isArray(imageArray)) {
      imageArray = [imageArray];
    }

    // Filter out null/undefined and construct full URLs
    return imageArray
      .map(item => (typeof item === 'string' ? item.trim() : item))
      .filter(img => typeof img === 'string' && img.length > 0)
      .map(img => {
        // If already a full URL, return as is
        if (img.startsWith('http://') || img.startsWith('https://')) {
          return img;
        }

        // Handle paths that already start with /uploads/
        if (img.startsWith('/uploads/')) {
          return getFullImageUrl(img);
        }

        // Handle paths that start with uploads/ (without leading slash)
        if (img.startsWith('uploads/')) {
          return getFullImageUrl(`/${img}`);
        }

        // If defaultFolder is provided, use it to construct the path
        if (defaultFolder) {
          const normalizedFolder = defaultFolder.replace(/\/$/, ''); // Remove trailing slash
          const normalizedPath = img.replace(/^\//, ''); // Remove leading slash from image path
          const combined = `${normalizedFolder}/${normalizedPath}`;
          return getFullImageUrl(combined.startsWith('/') ? combined : `/${combined}`);
        }

        // Fallback: treat as relative path and prepend /uploads/categories or /uploads/products
        // This handles cases where images are stored as just filenames
        const cleanPath = img.startsWith('/') ? img : `/${img}`;
        return getFullImageUrl(cleanPath);
      })
      .filter(Boolean);
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

