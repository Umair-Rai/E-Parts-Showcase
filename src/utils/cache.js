/**
 * Cache Utility
 * 
 * Provides client-side caching with expiration for API responses
 * Uses localStorage with automatic expiration and cache invalidation
 */

const CACHE_PREFIX = 'eme6_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

/**
 * Generate cache key from URL and params
 */
const generateCacheKey = (url, params = {}) => {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${CACHE_PREFIX}${url}${paramString ? `?${paramString}` : ''}`;
};

/**
 * Get cached data if not expired
 * @param {string} key - Cache key (URL path)
 * @returns {Object|null} - Cached data or null if expired/not found
 */
export const getCache = (key) => {
  try {
    // If key already includes the prefix, use it directly, otherwise generate it
    const cacheKey = key.startsWith(CACHE_PREFIX) ? key : generateCacheKey(key);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return null;
    }
    
    const { data, timestamp, ttl } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - timestamp > ttl) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

/**
 * Set cache data with expiration
 * @param {string} key - Cache key (URL path)
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 */
export const setCache = (key, data, ttl = DEFAULT_TTL) => {
  try {
    // If key already includes the prefix, use it directly, otherwise generate it
    const cacheKey = key.startsWith(CACHE_PREFIX) ? key : generateCacheKey(key);
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      clearExpiredCache();
      // Try again
      try {
        const cacheKey = generateCacheKey(key);
        const cacheData = {
          data,
          timestamp: Date.now(),
          ttl
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (retryError) {
        console.error('Cache still full after cleanup:', retryError);
      }
    }
  }
};

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear (URL path)
 */
export const clearCache = (key) => {
  try {
    // If key already includes the prefix, use it directly, otherwise generate it
    const cacheKey = key.startsWith(CACHE_PREFIX) ? key : generateCacheKey(key);
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Clear all expired cache entries
 */
export const clearExpiredCache = () => {
  try {
    const now = Date.now();
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timestamp, ttl } = JSON.parse(cached);
            if (now - timestamp > ttl) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          // Invalid cache entry, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Cleared ${keysToRemove.length} expired cache entries`);
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
};

/**
 * Clear all cache entries matching a pattern
 * @param {string} pattern - Pattern to match (e.g., '/api/categories')
 */
export const clearCacheByPattern = (pattern) => {
  try {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX) && key.includes(pattern)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cleared ${keysToRemove.length} cache entries matching pattern: ${pattern}`);
  } catch (error) {
    console.error('Error clearing cache by pattern:', error);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
  try {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cleared all ${keysToRemove.length} cache entries`);
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  try {
    let totalEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;
    const now = Date.now();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        totalEntries++;
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            totalSize += cached.length;
            const { timestamp, ttl } = JSON.parse(cached);
            if (now - timestamp > ttl) {
              expiredEntries++;
            }
          }
        } catch (error) {
          expiredEntries++;
        }
      }
    }
    
    return {
      totalEntries,
      expiredEntries,
      activeEntries: totalEntries - expiredEntries,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
};

// Clean up expired cache on load
if (typeof window !== 'undefined') {
  clearExpiredCache();
  
  // Clean up expired cache every 10 minutes
  setInterval(clearExpiredCache, 10 * 60 * 1000);
}

