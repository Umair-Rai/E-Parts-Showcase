import React, { useState, useEffect } from "react";
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
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useSearchParams } from "react-router-dom";
import { openWhatsAppForProduct } from '../../utils/whatsappUtils';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [searchParams] = useSearchParams();

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://eme6.com/api/products");
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch products:", error);
      // ✅ No toast error - silently handle failure
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://eme6.com/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      // ✅ No toast error - silently handle failure
      setCategories([]);
    }
  };

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
      return `https://eme6.com${cleanPath}`;
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

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.category_id === parseInt(selectedCategory)
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle search query and category from URL parameters
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category');
    
    if (searchQuery) {
      setSearchTerm(searchQuery);
    } else {
      // Reset search term when no search parameter in URL (page reload)
      setSearchTerm("");
    }
    
    if (categoryQuery) {
      setSelectedCategory(categoryQuery);
    } else {
      // Reset category filter when no category parameter in URL
      setSelectedCategory("");
    }
  }, [searchParams]);


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
        <ToastContainer position="top-right" autoClose={3000} />
        
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
      <ToastContainer position="top-right" autoClose={3000} />
      
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
          <div className="flex items-center justify-center gap-4 text-lg text-gray-300">
            <Squares2X2Icon className="h-6 w-6 text-red-600" />
            <span>{products.length} Products Available</span>
            <span className="mx-2">•</span>
            <FunnelIcon className="h-6 w-6 text-red-600" />
            <span>{categories.length} Categories</span>
          </div>
        </div>
      </section>

      {/* Search and Filter Section - Matching Category.jsx style */}
      <section className="px-4 md:px-16 py-8 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
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
            <div className="flex items-center gap-4">
              <FunnelIcon className="text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-black border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
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
              Showing {filteredProducts.length} of {products.length} products
              {searchTerm && ` for "${searchTerm}"`}
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
            {products.length === 0 && (
              <div className="mt-6">
                <button 
                  onClick={fetchProducts}
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
          <h3 className="text-lg font-bold leading-tight transition-colors duration-300 text-white group-hover:text-gray-100">
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
