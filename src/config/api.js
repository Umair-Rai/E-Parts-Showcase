/**
 * API Configuration
 * 
 * Centralized configuration for API base URL
 * Uses environment variable REACT_APP_API_URL if set, otherwise defaults to backend URL
 */

// Backend URL - should match Backend/config/appConfig.js BACKEND_URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://eme6.com';

// Frontend URL - should match Backend/config/appConfig.js FRONTEND_URL
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'https://eme6.com';

// API Base URL (uses backend URL)
const API_BASE_URL = process.env.REACT_APP_API_URL || BACKEND_URL;

const normalizeCategoryName = (value = '') =>
  String(value).trim().toLowerCase();

// Shared category identifiers
const MECHANICAL_SEAL_CATEGORY_NAME =
  (process.env.REACT_APP_MECHANICAL_SEAL_CATEGORY_NAME || 'Mechanical/ Water Pump Seals').trim();

const MECHANICAL_SEAL_CATEGORY_SLUG = normalizeCategoryName(MECHANICAL_SEAL_CATEGORY_NAME);

/**
 * Builds a full API URL using the configured base URL.
 * Ensures the path begins with a leading slash.
 *
 * @param {string} path - API path, with or without leading slash.
 * @returns {string} - Full URL such as "https://eme6.com/api/categories".
 */
export const buildApiUrl = (path = '') => {
  if (!path) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getMechanicalSealCategoryName = () => MECHANICAL_SEAL_CATEGORY_NAME;
export const getMechanicalSealCategorySlug = () => MECHANICAL_SEAL_CATEGORY_SLUG;
export const normalizeCategory = normalizeCategoryName;

export {
  API_BASE_URL as default,
  BACKEND_URL,
  FRONTEND_URL,
  MECHANICAL_SEAL_CATEGORY_NAME,
  MECHANICAL_SEAL_CATEGORY_SLUG,
  normalizeCategoryName,
};

