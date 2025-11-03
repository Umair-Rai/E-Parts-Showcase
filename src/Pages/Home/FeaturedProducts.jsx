import React, { useState, useEffect } from "react";
import { ArrowRightIcon, EyeIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch featured products from database
  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://eme6.com/api/products");
      // Get first 8 products as featured products
      const featuredProducts = response.data.slice(0, 8);
      console.log('📊 Fetched featured products:', featuredProducts);
      setProducts(featuredProducts);
    } catch (error) {
      console.error("❌ Failed to fetch products:", error);
      // ✅ No toast error - silently handle failure
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Process product images
  const getProductImages = (product) => {
    if (!product.pic) return [];
    
    let imageArray = [];
    
    try {
      if (Array.isArray(product.pic)) {
        imageArray = product.pic;
      } else if (typeof product.pic === 'string') {
        if (product.pic.startsWith('{') && product.pic.endsWith('}')) {
          // Handle Postgres TEXT[] format: {"url1","url2"}
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
      return `https://eme6.com${cleanPath}`;
    });

    return constructedUrls;
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchFeaturedProducts();
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-red-600">Featured Products</h2>
          <p className="text-gray-400 mt-2">Discover our most popular and high-quality components</p>
        </div>
        <button
          onClick={() => navigate('/product')}
          className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm md:text-base font-medium transition-all group"
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
        transition-all
        duration-300
        hover:scale-105
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
        <h3 className="text-lg font-semibold mt-2 text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-tight">
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