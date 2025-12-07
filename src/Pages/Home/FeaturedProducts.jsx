import React, { useState, useEffect } from "react";
import { ArrowRightIcon, EyeIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { buildApiUrl } from '../../config/api';
import { processImageArray } from '../../utils/imageUtils';
import { getCache, setCache } from '../../utils/cache';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ CACHE: Fetch featured products with caching
  const fetchFeaturedProducts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const requestUrl = buildApiUrl('/api/products');
      const cacheKey = '/api/products?featured=true';
      
      // ✅ Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = getCache(cacheKey);
        if (cachedData) {
          console.log('📦 Using cached featured products');
          const featuredProducts = Array.isArray(cachedData) ? cachedData.slice(0, 6) : (cachedData.products || []).slice(0, 6);
          setProducts(featuredProducts);
          setLoading(false);
          return;
        }
      }
      
      console.log('🔄 Fetching featured products from:', requestUrl);
      const response = await axios.get(requestUrl, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Featured products response received:', response);
      
      // Handle both array and paginated response
      const productsData = Array.isArray(response.data) ? response.data : (response.data.products || []);
      // Get first 6 products as featured products
      const featuredProducts = productsData.slice(0, 6);
      console.log('📊 Fetched featured products:', featuredProducts);
      
      // ✅ Cache the full response (5 minutes TTL)
      setCache(cacheKey, response.data, 5 * 60 * 1000);
      
      setProducts(featuredProducts);
    } catch (error) {
      console.error("❌ Failed to fetch products:", error);
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      // ✅ No toast error - silently handle failure for home page
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Process product images
  const getProductImages = (product) => {
    if (!product) return [];

    const collected = new Set();

    const appendImages = (value) => {
      if (!value) return;
      try {
        const processed = processImageArray(value, { defaultFolder: '/uploads/products' });
        processed.forEach(url => {
          if (url) {
            collected.add(url);
          }
        });
      } catch (error) {
        console.error('Error processing product images:', error);
      }
    };

    appendImages(product.pic);
    appendImages(product.pics);
    appendImages(product.image_url);
    appendImages(product.image_urls);

    return Array.from(collected);
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchFeaturedProducts();
    
    // ✅ CACHE: Listen for product updates to invalidate cache
    const handleProductUpdate = () => {
      console.log('🔄 Product updated, clearing cache and refreshing...');
      fetchFeaturedProducts(true); // Force refresh
    };
    
    window.addEventListener('productUpdated', handleProductUpdate);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate);
    };
  }, []);

  if (loading) {
    return (
      <section className="px-4 md:px-16 py-12 bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading featured products...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 md:px-16 py-12 bg-black">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 text-center sm:text-left">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-red-600">Featured Products</h2>
          <p className="text-gray-400 text-sm md:text-base">Discover our most popular and high-quality components</p>
        </div>
        <button
          onClick={() => navigate('/product')}
          className="inline-flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-sm md:text-base font-medium transition-all group w-full sm:w-auto py-2 sm:py-0"
        >
          View All Products
          <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onProductClick={handleProductClick}
            getProductImages={getProductImages}
          />
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="text-center py-16">
          <StarIcon className="h-16 w-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No featured products found</h3>
          <p className="text-gray-500">
            Featured products will appear here once they are added to the database.
          </p>
        </div>
      )}
    </section>
  );
}

function ProductCard({ product, onProductClick, getProductImages }) {
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const images = getProductImages(product);
  const primaryImage = images.length > 0 ? images[0] : null;
  const hoverImage = images.length > 1 ? images[1] : primaryImage;

  const handleImageError = () => {
    setImageError(true);
  };

  // Helper function to get product sizes
  const getProductSizes = (product) => {
    if (!product.sizes) return [];
    if (Array.isArray(product.sizes)) return product.sizes;
    if (typeof product.sizes === 'string') {
      try {
        // Handle JSON string arrays like ["size1","size2"]
        if (product.sizes.startsWith('[')) {
          return JSON.parse(product.sizes);
        }
        // Handle comma-separated strings
        return product.sizes.split(',').map(size => size.trim()).filter(size => size.length > 0);
      } catch {
        return [product.sizes];
      }
    }
    return [];
  };

  const productSizes = getProductSizes(product);

  return (
    <div
      className="
        bg-gray-900
        rounded-xl
        shadow-lg hover:shadow-red-800/50
        overflow-hidden
        transition-transform
        duration-300
        hover:scale-[1.02]
        cursor-pointer
        border border-gray-700
        hover:border-red-600
        group
      "
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onProductClick(product.id)}
    >
      {/* Image */}
      <div className="w-full h-56 bg-gray-800 relative overflow-hidden">
        {!imageError && primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300 ease-in-out absolute inset-0 group-hover:scale-110"
              style={{ opacity: hovered && hoverImage !== primaryImage ? 0 : 1 }}
              onError={handleImageError}
            />
            {hoverImage && hoverImage !== primaryImage && (
              <img
                src={hoverImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300 ease-in-out absolute inset-0 group-hover:scale-110"
                style={{ opacity: hovered ? 1 : 0 }}
                onError={handleImageError}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <EyeIcon className="h-16 w-16 text-gray-600" />
          </div>
        )}
        
        {/* Enhanced overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
            <div className="flex gap-3">
              <button className="p-3 bg-red-600 hover:bg-red-700 rounded-full text-white transition-all duration-200 transform hover:scale-110 shadow-lg">
                <EyeIcon className="h-5 w-5" />
              </button>
              <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-all duration-200 transform hover:scale-110 shadow-lg">
                <ShoppingCartIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Price badge if available */}
        {product.price && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            ${parseFloat(product.price).toFixed(2)}
          </div>
        )}
      </div>

      {/* Text */}
      <div className="p-5 flex flex-col h-full">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {product.model || `ID: ${product.id}`}
        </p>
        <h3 className="text-xl font-semibold mt-2 text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        {/* Description if available */}
        {product.description && (
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Product Sizes */}
        {productSizes.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
              Available Sizes
            </p>
            <div className="flex flex-wrap gap-1">
              {productSizes.slice(0, 4).map((size, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700"
                >
                  {size}
                </span>
              ))}
              {productSizes.length > 4 && (
                <span className="inline-block px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-md border border-gray-600">
                  +{productSizes.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-red-400 hover:text-red-300 text-sm font-medium transition-all">
            View Details
          </span>
          <div className="
            inline-flex
            items-center
            justify-center
            w-10
            h-10
            rounded-full
            bg-red-600
            hover:bg-red-700
            transition-all
            duration-200
            group-hover:scale-110
            shadow-lg
          ">
            <ArrowRightIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}