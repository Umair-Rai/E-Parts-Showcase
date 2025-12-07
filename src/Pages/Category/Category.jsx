import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import {
  Squares2X2Icon,
  StarIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { buildApiUrl } from '../../config/api';
import { processImageArray } from '../../utils/imageUtils';
import { getCache, setCache, clearCacheByPattern } from '../../utils/cache';

const Category = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSpecialOnly, setShowSpecialOnly] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  // ✅ CACHE: Fetch categories with caching
  const fetchCategories = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const requestUrl = buildApiUrl('/api/categories');
      const cacheKey = '/api/categories';
      
      // ✅ Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = getCache(cacheKey);
        if (cachedData) {
          console.log('📦 Using cached categories');
          setCategories(cachedData);
          setLoading(false);
          return;
        }
      }
      
      console.log('🔄 Fetching categories from:', requestUrl);
      const response = await axios.get(requestUrl, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Categories response received:', response);
      console.log('📊 Fetched categories:', response.data);
      console.log('📊 Data type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
      console.log('📊 Data length:', Array.isArray(response.data) ? response.data.length : 'N/A');
      
      // ✅ Cache the response (5 minutes TTL)
      setCache(cacheKey, response.data, 5 * 60 * 1000);
      
      setCategories(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Show user-friendly error message
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        toast.error('Network error: Unable to connect to server. Please check your connection.', {
          toastId: 'category-fetch-error'
        });
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please check server configuration.', {
          toastId: 'category-fetch-error'
        });
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Please check CORS configuration.', {
          toastId: 'category-fetch-error'
        });
      } else {
        toast.error(`Failed to load categories: ${error.message}`, {
          toastId: 'category-fetch-error'
        });
      }
      
      setCategories([]); // Set empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // ✅ FIX: Track setTimeout ID for cleanup
    let scrollTimeoutId = null;

    // ✅ Listen for category updates
    const handleCategoryUpdate = () => {
      console.log('🔄 Category updated, clearing cache and refreshing...');
      // ✅ Clear cache when categories are updated
      clearCacheByPattern('/api/categories');
      fetchCategories(true); // Force refresh
    };

    // ✅ Listen for footer category click
    const handleFooterCategorySearch = (event) => {
      const categoryName = event.detail.categoryName;
      console.log('🔍 Footer category clicked:', categoryName);
      setSearchQuery(categoryName);
      // ✅ FIX: Clear any existing timeout before setting new one
      if (scrollTimeoutId) {
        clearTimeout(scrollTimeoutId);
      }
      // Scroll to search area
      scrollTimeoutId = setTimeout(() => {
        window.scrollTo({ top: 200, behavior: 'smooth' });
      }, 100);
    };

    window.addEventListener('categoryUpdated', handleCategoryUpdate);
    window.addEventListener('footerCategorySearch', handleFooterCategorySearch);

    // ✅ FIX: Cleanup timeout and event listeners
    return () => {
      if (scrollTimeoutId) {
        clearTimeout(scrollTimeoutId);
      }
      window.removeEventListener('categoryUpdated', handleCategoryUpdate);
      window.removeEventListener('footerCategorySearch', handleFooterCategorySearch);
    };
  }, []);

  // ✅ FIX: Clear image errors when categories change to prevent memory leak
  useEffect(() => {
    setImageLoadErrors({});
  }, [categories]);

  // Helper function to check if category is special
  const isSpecialCategory = (category) => {
    return category.special_category === true || 
           category.special_category === 'true' || 
           category.specialCategory === true || 
           category.specialCategory === 'true';
  };

  // Handle category click - navigate to product page with category filter
  const handleCategoryClick = (categoryId) => {
    navigate(`/product?category=${categoryId}`);
  };

  // Helper function to get category images with proper URL construction
  const getCategoryImages = (category) => {
    console.log('🔍 Processing category images for:', category.name, category.pic);
  
    if (!category.pic) {
      console.log('⚠️ No pic field found for category:', category.name);
      return [];
    }
  
    // Use processImageArray with proper default folder
    const constructedUrls = processImageArray(category.pic, {
      defaultFolder: '/uploads/categories'
    });
    
    // Log for debugging
    console.log('📸 Original pic value:', category.pic);
    console.log('🔗 Constructed URLs:', constructedUrls);
    
    // Ensure we return valid URLs
    return constructedUrls.filter(url => url && url.length > 0);
  };
  
  // Enhanced image error handling
  const handleImageError = (categoryId, imageIndex, imageSrc) => {
    console.error(`❌ Image failed to load: Category ${categoryId}, Image ${imageIndex}, URL: ${imageSrc}`);
    setImageLoadErrors(prev => ({
      ...prev,
      [`${categoryId}-${imageIndex}`]: true
    }));
  };

  // Filter categories based on search and special filter
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialFilter = !showSpecialOnly || isSpecialCategory(category);
    return matchesSearch && matchesSpecialFilter;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ToastContainer is in App.js - no need for duplicate */}
      
      {/* Hero Section - Matching Home page style */}
      <section className="bg-black text-white py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-red-600">
            Product Categories
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Explore our comprehensive range of high-quality components
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm sm:text-lg text-gray-300">
            <Squares2X2Icon className="h-6 w-6 text-red-600" />
            <span>{categories.length} Categories Available</span>
            <span className="hidden sm:inline-block mx-2">•</span>
            <StarIconSolid className="h-6 w-6 text-red-600" />
            <span>{categories.filter(isSpecialCategory).length} Special Categories</span>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="px-4 md:px-16 py-8 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-8 w-full">
            {/* Search Bar */}
            <div className="relative w-full md:flex-1 max-w-md md:max-w-none">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border-0 rounded-lg focus:ring-0 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            
            {/* Special Categories Filter */}
            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowSpecialOnly(!showSpecialOnly)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all w-full md:w-auto ${
                  showSpecialOnly 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                <StarIconSolid className="h-5 w-5" />
                Special Categories Only
              </button>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="text-center mb-6">
            <p className="text-gray-400">
              Showing {filteredCategories.length} of {categories.length} categories
              {searchQuery && ` for "${searchQuery}"`}
              {showSpecialOnly && " (Special categories only)"}
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4 md:px-16 pb-12 bg-black">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <Squares2X2Icon className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No categories found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "No categories available at the moment"}
            </p>
            {categories.length === 0 && (
              <div className="mt-6">
                <p className="text-gray-400 mb-4">It looks like there are no categories in the database yet.</p>
                <button 
                  onClick={() => {
                    clearCacheByPattern('/api/categories');
                    fetchCategories(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Refresh Categories
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const images = getCategoryImages(category);
              const isSpecial = isSpecialCategory(category);
              console.log("images",images);

              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`group relative bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] border cursor-pointer ${
                    isSpecial 
                      ? 'border-red-600 shadow-red-900/20 hover:shadow-red-900/40' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {/* Special Category Badge */}
                  {isSpecial && (
                    <div className="absolute top-3 right-3 z-20">
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <SparklesIcon className="h-3 w-3" />
                        SPECIAL
                      </div>
                    </div>
                  )}
                  
                  {/* Image Container with Enhanced Hover Effects */}
                  <div className="relative w-full h-64 bg-gray-800 overflow-hidden">
                    {images.length > 0 ? (
                      <>
                        {/* Primary Image */}
                        {!imageLoadErrors[`${category.id}-0`] && (
                          <img
                            src={images[0]}
                            alt={`${category.name} - Image 1`}
                            className="w-full h-full object-cover absolute inset-0 transition-all duration-700 ease-in-out transform group-hover:scale-110 opacity-100 group-hover:opacity-0"
                            onError={() => handleImageError(category.id, 0)}
                            onLoad={() => console.log(`✅ Image 1 loaded for ${category.name}`)}
                          />
                        )}
                        
                        {/* Secondary Image (if available) */}
                        {images.length > 1 && !imageLoadErrors[`${category.id}-1`] && (
                          <img
                            src={images[1]}
                            alt={`${category.name} - Image 2`}
                            className="w-full h-full object-cover absolute inset-0 transition-all duration-700 ease-in-out transform scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                            onError={() => handleImageError(category.id, 1)}
                            onLoad={() => console.log(`✅ Image 2 loaded for ${category.name}`)}
                          />
                        )}
                        
                        {/* Fallback when images fail to load */}
                        {(imageLoadErrors[`${category.id}-0`] && (images.length === 1 || imageLoadErrors[`${category.id}-1`])) && (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="text-center text-gray-500">
                              <PhotoIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
                              <p className="text-sm font-medium">Image not available</p>
                              <p className="text-xs mt-1 opacity-75">{category.name}</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // Placeholder when no images are provided
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <div className="text-center text-gray-500">
                          <PhotoIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
                          <p className="text-sm font-medium">No image available</p>
                          <p className="text-xs mt-1 opacity-75">{category.name}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Gradient Overlay for Special Categories */}
                    {isSpecial && (
                      <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 via-red-600/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                    )}
                    
                    {/* Subtle overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`text-xl font-bold leading-tight transition-colors duration-300 ${
                        isSpecial ? 'text-red-400 group-hover:text-red-300' : 'text-white group-hover:text-gray-100'
                      }`}>
                        {category.name}
                      </h3>
                      {isSpecial && (
                        <StarIconSolid className="h-5 w-5 text-red-500 flex-shrink-0 ml-2 transition-transform duration-300 group-hover:scale-110" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                        Category ID: {category.id}
                      </span>
                      <button className={`text-sm font-medium transition-all duration-300 transform group-hover:translate-x-1 ${
                        isSpecial 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-gray-300 hover:text-white'
                      }`}>
                        View Products →
                      </button>
                    </div>
                    
                    {/* Image count indicator */}
                    {images.length > 1 && (
                      <div className="mt-3 flex items-center gap-1">
                        <div className="flex gap-1">
                          {images.slice(0, 2).map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === 0 
                                  ? 'bg-gray-400 group-hover:bg-gray-600' 
                                  : 'bg-gray-600 group-hover:bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">Hover to see more</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Category;
