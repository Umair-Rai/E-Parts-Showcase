import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  ArrowRightIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EyeIcon, 
  ShoppingCartIcon,
  Squares2X2Icon,
  PhotoIcon 
} from '@heroicons/react/24/outline';
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useSearchParams } from "react-router-dom";
import { openWhatsAppForProduct } from '../../utils/whatsappUtils';
import API_BASE_URL from '../../config/api';
import { getCache, setCache, clearCacheByPattern } from '../../utils/cache';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(20); // 20 products per page

  // ✅ CACHE: Use useCallback to memoize fetchProducts function with caching
  const fetchProducts = useCallback(async (page = 1, search = "", forceRefresh = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      const requestUrl = `${API_BASE_URL}/api/products?${params.toString()}`;
      const cacheKey = `/api/products?${params.toString()}`;
      
      // ✅ Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = getCache(cacheKey);
        if (cachedData) {
          console.log('📦 Using cached products');
          // Handle cached paginated response
          if (cachedData.products) {
            setProducts(cachedData.products);
            setTotalProducts(cachedData.total);
            setTotalPages(cachedData.pages);
            setCurrentPage(cachedData.page);
          } else {
            const productsData = Array.isArray(cachedData) ? cachedData : [];
            setProducts(productsData);
            setTotalProducts(productsData.length);
            setTotalPages(1);
            setCurrentPage(1);
          }
          setLoading(false);
          return;
        }
      }

      console.log('🔄 Fetching products from:', requestUrl);
      const response = await axios.get(requestUrl, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Products response received:', response);
      console.log('📦 Response data:', response.data);
      console.log('📊 Data type:', Array.isArray(response.data) ? 'Array' : typeof response.data);

      // ✅ Cache the response (3 minutes TTL for products - shorter than categories)
      setCache(cacheKey, response.data, 3 * 60 * 1000);

      // Handle new API response format (paginated)
      if (response.data.products) {
        console.log('📄 Paginated response detected');
        setProducts(response.data.products);
        setTotalProducts(response.data.total);
        setTotalPages(response.data.pages);
        setCurrentPage(response.data.page);
      } else {
        // Fallback for old API format (plain array)
        console.log('📋 Plain array response detected');
        const productsData = Array.isArray(response.data) ? response.data : [];
        setProducts(productsData);
        setTotalProducts(productsData.length);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("❌ Failed to fetch products:", error);
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });

      // Show user-friendly error message
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        toast.error('Network error: Unable to connect to server. Please check your connection.', {
          toastId: 'product-fetch-error'
        });
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please check server configuration.', {
          toastId: 'product-fetch-error'
        });
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Please check CORS configuration.', {
          toastId: 'product-fetch-error'
        });
      } else {
        toast.error(`Failed to load products: ${error.message}`, {
          toastId: 'product-fetch-error'
        });
      }
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  }, [limit]); // ✅ FIX: Added limit to dependencies

  // ✅ CACHE: Use useCallback to memoize fetchCategories function with caching
  const fetchCategories = useCallback(async (forceRefresh = false) => {
    try {
      const cacheKey = '/api/categories';
      
      // ✅ Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = getCache(cacheKey);
        if (cachedData) {
          console.log('📦 Using cached categories');
          setCategories(cachedData);
          return;
        }
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/categories`);
      
      // ✅ Cache the response (5 minutes TTL)
      setCache(cacheKey, response.data, 5 * 60 * 1000);
      
      setCategories(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      // ✅ No toast error - silently handle failure
      setCategories([]);
    }
  }, []); // ✅ FIX: No dependencies needed

  // Process product images similar to Category.jsx
  const getProductImages = (product) => {
    if (!product.pic) return [];  // ✅ FIXED: Changed from 'pics' to 'pic'
    
    let imageArray = [];
    
    try {
      if (Array.isArray(product.pic)) {
        imageArray = product.pic;
      } else if (typeof product.pic === 'string') {
        if (product.pic.startsWith('{') && product.pic.endsWith('}')) {
          // Handle Postgres TEXT[] format: {"url1","url2"}
          console.log('Raw TEXT[] format:', product.pic);
          const cleanedString = product.pic
            .replace(/[{}"]/g, '') // Remove {, }, and " characters
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);
          imageArray = cleanedString;
        } else {
          try {
            imageArray = JSON.parse(product.pic);
          } catch {
            imageArray = [product.pic];
          }
        }
      }
    } catch (error) {
      console.error('Error processing product images:', error);
      return [];
    }

    // Construct full URLs
    const constructedUrls = imageArray.map(imagePath => {
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `${API_BASE_URL}${cleanPath}`;
    });

    return constructedUrls;
  };

  // Enhanced image error handling
  const handleImageError = (productId, imageIndex, imageSrc) => {
    console.error(`❌ Image failed to load: Product ${productId}, Image ${imageIndex}, URL: ${imageSrc}`);
    setImageLoadErrors(prev => ({
      ...prev,
      [`${productId}-${imageIndex}`]: true
    }));
  };

  // Filter products by category on client side (since backend doesn't support category filter yet)
  const filteredProducts = React.useMemo(() => {
    if (!selectedCategory) {
      return products;
    }
    return products.filter(product => 
      product.category_id === parseInt(selectedCategory)
    );
  }, [products, selectedCategory]);

  // ✅ FIX: Track initial mount to prevent duplicate calls
  const initialMount = useRef(true);

  // ✅ CACHE: Listen for product updates to invalidate cache
  useEffect(() => {
    const handleProductUpdate = () => {
      console.log('🔄 Product updated, clearing cache...');
      clearCacheByPattern('/api/products');
      // Refresh current page
      fetchProducts(currentPage, searchTerm, true);
    };
    
    window.addEventListener('productUpdated', handleProductUpdate);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate);
    };
  }, [currentPage, searchTerm, fetchProducts]);

  // Initial load
  useEffect(() => {
    if (!initialMount.current) return;
    initialMount.current = false;

    fetchCategories();

    // Get initial page and search from URL params
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');

    if (pageParam) {
      setCurrentPage(parseInt(pageParam) || 1);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }

    fetchProducts(pageParam ? parseInt(pageParam) : 1, searchParam || "");
  }, [fetchCategories, fetchProducts, searchParams]); // ✅ FIX: Added all dependencies

  // Handle search query and category from URL parameters
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category');
    const pageQuery = searchParams.get('page');
    
    if (searchQuery !== null && searchQuery !== searchTerm) {
      setSearchTerm(searchQuery);
    }
    
    if (categoryQuery !== null && categoryQuery !== selectedCategory) {
      setSelectedCategory(categoryQuery);
    }
    
    if (pageQuery) {
      const pageNum = parseInt(pageQuery);
      if (pageNum !== currentPage) {
        setCurrentPage(pageNum);
      }
    }
  }, [searchParams]);

  // ✅ FIX: Handle search input change with debounce
  useEffect(() => {
    // Skip on initial mount to avoid duplicate call
    if (initialMount.current) return;

    const timeoutId = setTimeout(() => {
      const newPage = 1; // Reset to page 1 on search
      setCurrentPage(newPage);

      // Update URL params
      const newParams = new URLSearchParams(searchParams);
      if (searchTerm) {
        newParams.set('search', searchTerm);
      } else {
        newParams.delete('search');
      }
      newParams.set('page', '1');
      setSearchParams(newParams, { replace: true });

      // Fetch products with new search term
      fetchProducts(newPage, searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchProducts, searchParams, setSearchParams]); // ✅ FIX: Added all dependencies

  // ✅ FIX: Handle category filter change
  useEffect(() => {
    // Skip on initial mount
    if (initialMount.current) return;

    // Reset to page 1 when category changes
    if (currentPage !== 1) {
      setCurrentPage(1);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', '1');
      if (selectedCategory) {
        newParams.set('category', selectedCategory);
      } else {
        newParams.delete('category');
      }
      setSearchParams(newParams, { replace: true });
    } else {
      // Update URL params even if staying on page 1
      const newParams = new URLSearchParams(searchParams);
      if (selectedCategory) {
        newParams.set('category', selectedCategory);
      } else {
        newParams.delete('category');
      }
      setSearchParams(newParams, { replace: true });
    }
  }, [selectedCategory, currentPage, searchParams, setSearchParams]); // ✅ FIX: Added all dependencies

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setCurrentPage(newPage);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    if (searchTerm) {
      newParams.set('search', searchTerm);
    }
    if (selectedCategory) {
      newParams.set('category', selectedCategory);
    }
    setSearchParams(newParams);
    
    // Fetch products for new page
    fetchProducts(newPage, searchTerm);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-black">
      {/* ToastContainer is in App.js - no need for duplicate */}
      
      {/* Hero Section */}
        <section className="bg-black text-white py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-red-600">
              Product Catalog
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Discover our comprehensive range of premium quality components
            </p>
          </div>
        </section>
        
        {/* Loading State */}
        <div className="flex justify-center items-center py-20 bg-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ToastContainer is in App.js - no need for duplicate */}
      
      {/* Hero Section - Matching Category.jsx style */}
      <section className="bg-black text-white py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-red-600">
            Product Catalog
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Discover our comprehensive range of premium quality components
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm sm:text-lg text-gray-300">
            <Squares2X2Icon className="h-6 w-6 text-red-600" />
            <span>{totalProducts} Products Available</span>
            <span className="hidden sm:inline-block mx-2">•</span>
            <FunnelIcon className="h-6 w-6 text-red-600" />
            <span>{categories.length} Categories</span>
          </div>
        </div>
      </section>

      {/* Search and Filter Section - Matching Category.jsx style */}
      <section className="px-4 md:px-16 py-8 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-8 w-full">
            {/* Search Bar */}
            <div className="relative w-full md:flex-1 max-w-md md:max-w-none">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border-0 rounded-lg focus:ring-0 focus:outline-none text-white placeholder-gray-400"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <FunnelIcon className="text-gray-400 h-5 w-5 hidden md:block" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-auto px-4 py-3 bg-black border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="text-center mb-6">
            <p className="text-gray-400">
              Showing {filteredProducts.length} of {totalProducts} products
              {searchTerm && ` for "${searchTerm}"`}
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 md:px-16 pb-12 bg-black">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Squares2X2Icon className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No products found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "No products available at the moment"}
            </p>
            {totalProducts === 0 && (
              <div className="mt-6">
                <button 
                  onClick={() => {
                    clearCacheByPattern('/api/products');
                    fetchProducts(1, searchTerm, true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Refresh Products
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={handleQuickView}
                getCategoryName={getCategoryName}
                getProductImages={getProductImages}
                handleImageError={handleImageError}
                imageLoadErrors={imageLoadErrors}
              />
            ))}
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentPage === 1
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
              }`}
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex gap-2">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentPage === pageNum
                        ? 'bg-red-600 text-white font-semibold'
                        : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Quick View Modal */}
      {showQuickView && selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setShowQuickView(false)}
          getCategoryName={getCategoryName}
          getProductImages={getProductImages}
          handleImageError={handleImageError}
          imageLoadErrors={imageLoadErrors}
        />
      )}
    </div>
  );
};

// Product Card Component - Matching Category.jsx styling
function ProductCard({ product, onQuickView, getCategoryName, getProductImages, handleImageError, imageLoadErrors, onViewDetails }) {
  const productImages = getProductImages(product);
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  // Add navigation function
  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div
      className="group relative bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] border border-gray-700 hover:border-gray-600 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => handleViewDetails(product.id)}
    >
      {/* Image Container with Enhanced Hover Effects */}
      <div className="relative w-full h-64 bg-gray-800 overflow-hidden">
        {productImages.length > 0 ? (
          <>
            {/* Primary Image */}
            {!imageLoadErrors[`${product.id}-0`] && (
              <img
                src={productImages[0]}
                alt={`${product.name} - Image 1`}
                className={`w-full h-full object-cover absolute inset-0 transition-all duration-700 ease-in-out transform ${
                  productImages.length === 1 
                    ? 'group-hover:scale-110' 
                    : 'group-hover:scale-110 opacity-100 group-hover:opacity-0'
                }`}
                onError={() => handleImageError(product.id, 0, productImages[0])}
              />
            )}
            
            {/* Secondary Image (only show if there are 2+ images) */}
            {productImages.length > 1 && !imageLoadErrors[`${product.id}-1`] && (
              <img
                src={productImages[1]}
                alt={`${product.name} - Image 2`}
                className="w-full h-full object-cover absolute inset-0 transition-all duration-700 ease-in-out transform scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                onError={() => handleImageError(product.id, 1, productImages[1])}
              />
            )}
            
            {/* Fallback when images fail to load */}
            {(imageLoadErrors[`${product.id}-0`] && (productImages.length === 1 || imageLoadErrors[`${product.id}-1`])) && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center text-gray-500">
                  <PhotoIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Image not available</p>
                  <p className="text-xs mt-1 opacity-75">{product.name}</p>
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
              <p className="text-xs mt-1 opacity-75">{product.name}</p>
            </div>
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition-all border border-gray-600"
              title="Quick View"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(product.id);
              }}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all"
              title="View Details"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all"
              title="Add to Cart"
            >
              <ShoppingCartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold leading-tight transition-colors duration-300 text-white group-hover:text-gray-100">
            {product.name}
          </h3>
        </div>
        
        <p className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300 mb-2">
          {getCategoryName(product.category_id)}
        </p>
        
        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Available Sizes:</p>
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 3).map((size, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-xs text-gray-500">+{product.sizes.length - 3} more</span>
              )}
            </div>
          </div>
        )}
        
        {/* Image count indicator - Only show if there are multiple images */}
        {productImages.length > 1 && (
          <div className="mt-3 flex items-center gap-1">
            <div className="flex gap-1">
              {productImages.slice(0, 2).map((_, index) => (
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
}

// Quick View Modal Component - Matching black/red theme
function QuickViewModal({ product, onClose, getCategoryName, getProductImages, handleImageError, imageLoadErrors }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const productImages = getProductImages(product);

  const handleContactUs = async () => {
    try {
      // Get user ID from localStorage or context
      const token = localStorage.getItem('token');
      if (!token) {
        // ✅ No toast error - silently handle, just open WhatsApp
        const productData = {
          type: "Contact Us - Guest",
          product: {
            ...product,
            category_name: getCategoryName(product.category_id)
          },
          size: null,
          quantity: 1
        };
        await openWhatsAppForProduct(productData);
        return;
      }
      
      // Decode token to get user ID (simplified approach)
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.id;
      
      const productData = {
        userId: userId,
        type: "Contact Us",
        product: {
          ...product,
          category_name: getCategoryName(product.category_id)
        },
        size: null,
        quantity: 1
      };
      
      await openWhatsAppForProduct(productData);
      // ✅ Keep success toast - positive feedback is good
      toast.success("Contact request sent to WhatsApp!", {
        toastId: 'contact-success',
      });
    } catch (error) {
      console.error('Failed to send contact request:', error);
      // ✅ No toast error - silently handle failure
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="w-full h-80 bg-gray-800 rounded-lg mb-4 overflow-hidden border border-gray-700">
                {productImages.length > 0 ? (
                  <img
                    src={productImages[currentImageIndex] || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={() => handleImageError(product.id, currentImageIndex, productImages[currentImageIndex])}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <PhotoIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">No image available</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-colors ${
                        currentImageIndex === index ? 'border-red-600' : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain bg-gray-800"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <p className="text-sm text-gray-400 mb-2">
                {getCategoryName(product.category_id)}
              </p>
              <h1 className="text-3xl font-bold mb-4 text-white">{product.name}</h1>
              
              {/* Descriptions */}
              {product.descriptions && product.descriptions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-red-400">Description</h3>
                  <div className="space-y-2">
                    {product.descriptions.map((desc, index) => (
                      <p key={index} className="text-gray-300">{desc}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Available Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-red-400">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, index) => (
                      <span
                        key={index}
                        className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg border border-gray-700"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-all font-semibold">
                  Add to Cart
                </button>
                <button 
                  onClick={handleContactUs}
                  className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-800 transition-all text-gray-300 hover:text-white"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ProductCatalog;
