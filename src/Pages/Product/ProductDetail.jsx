import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  InformationCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  // Add mechanical seal attributes state
  const [mechanicalSealAttributes, setMechanicalSealAttributes] = useState(null);
  const [isMechanicalSeal, setIsMechanicalSeal] = useState(false);

  // Check if product category is mechanical seal
  const checkIfMechanicalSeal = useCallback((categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.special_category === true || category?.name?.toLowerCase() === 'mechanical seals';
  }, [categories]);

  // Fetch mechanical seal attributes for a specific product
  const fetchMechanicalSealAttributes = useCallback(async (productId) => {
    try {
      console.log('Fetching mechanical seal attributes for product:', productId);
      
      const response = await axios.get(
        `https://eme6.com/api/mechanical-seal-attributes/${productId}`
      );
      
      console.log('Mechanical seal attributes response:', response.data);
      setMechanicalSealAttributes(response.data);
    } catch (error) {
      console.log('Error fetching mechanical seal attributes:', error.response?.data || error.message);
      // Set to null if attributes are not found, but don't prevent display
      setMechanicalSealAttributes(null);
    }
  }, []);

  // Add these functions INSIDE the component
  const handleSizeSelection = (size, index) => {
    setSelectedSize(size);
    setSelectedSizeIndex(index);
  };

  // Get current description based on selected size index
  const getCurrentDescription = () => {
    if (product?.descriptions && product.descriptions.length > 0) {
      // If there's a selected size, show corresponding description
      if (selectedSizeIndex < product.descriptions.length) {
        return product.descriptions[selectedSizeIndex];
      }
      // Fallback to first description
      return product.descriptions[0];
    }
    // Fallback to product.description if descriptions array doesn't exist
    return product?.description || "No description available";
  };


  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://eme6.com/api/products/${id}`);
        const productData = response.data;
        setProduct(productData);
        
        // Set initial size selection (first size and first description)
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
          setSelectedSizeIndex(0);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast.error("Failed to load product details");
        navigate('/product');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://eme6.com/api/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    if (id) {
      fetchProduct();
      fetchCategories();
    }
  }, [id, navigate]);

  // Add new useEffect to check for mechanical seal and fetch attributes
  useEffect(() => {
    console.log('🔍 Checking mechanical seal conditions:');
    console.log('📦 Product:', product);
    console.log('📂 Categories length:', categories.length);
    console.log('🏷️ Product category_id:', product?.category_id);
    
    if (product && categories.length > 0) {
      const isMechSeal = checkIfMechanicalSeal(product.category_id);
      console.log('⚙️ Setting isMechanicalSeal to:', isMechSeal);
      setIsMechanicalSeal(isMechSeal);
      
      if (isMechSeal) {
        console.log('🔧 Product is mechanical seal, fetching attributes...');
        fetchMechanicalSealAttributes(product.id);
      } else {
        console.log('📝 Product is not a mechanical seal');
      }
    }
  }, [product, categories, checkIfMechanicalSeal, fetchMechanicalSealAttributes]);

  // Process product images
  const getProductImages = (product) => {
    if (!product?.pic) return [];
    
    let imageArray = [];
    
    try {
      if (Array.isArray(product.pic)) {
        imageArray = product.pic;
      } else if (typeof product.pic === 'string') {
        if (product.pic.startsWith('{') && product.pic.endsWith('}')) {
          const cleanedString = product.pic
            .replace(/[{}"]/g, '')
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

    return imageArray.map(imagePath => {
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `https://eme6.com${cleanPath}`;
    });
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  // Handle image error
  const handleImageError = (imageIndex, imageSrc) => {
    console.error(`Image failed to load: Index ${imageIndex}, URL: ${imageSrc}`);
    setImageLoadErrors(prev => ({
      ...prev,
      [imageIndex]: true
    }));
  };

  // Handle add to cart
  const { user, isAuthenticated } = useContext(AuthContext);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate('/login');
      return;
    }

    if (!selectedSize && product?.sizes?.length > 0) {
      toast.warning("Please select a size");
      return;
    }
    
    setAddingToCart(true);
    
    try {
      const token = localStorage.getItem('token');
      const cartData = {
        userId: user.id,
        productId: product.id,
        quantity: quantity,
        size: selectedSize || null,
        description: getCurrentDescription()
      };
      
      await axios.post(
        'https://eme6.com/api/cart/add',
        cartData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success(`✅ Added ${quantity} ${product.name} to cart!`);
      
      // Optional: Update cart count in header
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      if (error.response?.status === 401) {
        toast.error("Please login to add items to cart");
        navigate('/login');
      } else {
        toast.error(error.response?.data?.error || "Failed to add item to cart");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!selectedSize && product?.sizes?.length > 0) {
      toast.warning("Please select a size");
      return;
    }
    
    // Buy now logic here
    toast.success("Redirecting to checkout...");
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/product')}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(product);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ToastContainer position="top-right" theme="dark" />
      
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/product')}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Products
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-square">
              {productImages.length > 0 && !imageLoadErrors[selectedImageIndex] ? (
                <img
                  src={productImages[selectedImageIndex]}
                  alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setShowImageModal(true)}
                  onError={() => handleImageError(selectedImageIndex, productImages[selectedImageIndex])}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <PhotoIcon className="h-24 w-24 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Image not available</p>
                  </div>
                </div>
              )}
              
              {/* Image Navigation */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => 
                      prev === 0 ? productImages.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => 
                      prev === productImages.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}
              
              {/* Zoom Icon */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setShowImageModal(true)}
                  className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-red-600'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {!imageLoadErrors[index] ? (
                      <img
                        src={image}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(index, image)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <PhotoIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-2 gap-y-4">
                {/* First Row - Labels */}
                <div className="flex items-center justify-between col-span-2">
                  <p className="text-red-400 text-sm font-medium">
                    {getCategoryName(product.category_id)}
                  </p>
                  {product.sizes && product.sizes.length > 0 && (
                    <p className="text-sm font-semibold">Available Sizes</p>
                  )}
                </div>
                
                {/* Second Row - Product Title */}
                <div className="flex items-center justify-between col-span-2">
                  <h1 className="font-bold text-white truncate max-w-[70%]" style={{ fontSize: product.name.length > 20 ? "1.25rem" : "1.75rem",}}
                  >Model: {product.name}</h1>
                

              
              {/* Second Column - Size Dropdown */}
                {product.sizes && product.sizes.length > 0 && (
                  <select
                    value={selectedSize}
                    onChange={(e) => {
                      const index = product.sizes.indexOf(e.target.value);
                      handleSizeSelection(e.target.value, index);
                    }}
                    className="w-28 p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-red-500"
                  >
                    {product.sizes.map((size, index) => (
                      <option key={index} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              </div>

            {/* Size hint text */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-sm text-gray-400">
                  💡 {isMechanicalSeal 
                    ? 'Select different sizes to see specific technical specifications' 
                    : 'Click on different sizes to see specific descriptions'
                  }
                </p>
              </div>
            )}

            {/* Description - Dynamic based on selected size */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed">{getCurrentDescription()}</p>
              </div>
            </div>

            {/* Mechanical Seal Attributes */}
            {isMechanicalSeal && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  ⚙️ Technical Specifications
                </h3>
                
                {/* Display attributes for the selected product size */}
                {(() => {
                  // Show loading state if attributes are still being fetched
                  if (mechanicalSealAttributes === null) {
                    return (
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
                          <p className="text-gray-400">Loading technical specifications...</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Get attributes for the currently selected size
                  const currentSizeAttr = mechanicalSealAttributes[selectedSize];
                  
                  if (!currentSizeAttr) {
                    return (
                      <div className="bg-gray-800 rounded-lg p-6">
                        <p className="text-gray-400 text-center">
                          No technical specifications available for size: {selectedSize}
                        </p>
                      </div>
                    );
                  }
                  
                  console.log('🔧 Rendering mechanical seal attributes for size:', selectedSize, currentSizeAttr);
                  
                  return (
                    <div className="space-y-6">
                      {/* Mechanical Seal Specifications */}
                      {currentSizeAttr.sizes && currentSizeAttr.descriptions && currentSizeAttr.sizes.length > 0 && (
                        <div className="bg-gray-800 rounded-lg p-6">
                          <h4 className="text-md font-semibold mb-4 text-blue-400">
                            Specifications for {selectedSize}
                          </h4>
                          <div className="space-y-3">
                            {currentSizeAttr.sizes.map((size, index) => (
                              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                                <span className="text-gray-300 font-medium">
                                  {currentSizeAttr.descriptions[index] || 'Specification'}
                                </span>
                                <span className="text-red-400 font-semibold">{size}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Technical Attributes */}
                      <div className="bg-gray-800 rounded-lg p-6">
                        <h4 className="text-md font-semibold mb-4 text-green-400">
                          Technical Attributes
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <span className="text-sm text-gray-400">Material:</span>
                              <p className="font-semibold text-white">{currentSizeAttr.material}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-400">Temperature:</span>
                              <p className="font-semibold text-white">{currentSizeAttr.temperature}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <span className="text-sm text-gray-400">Pressure:</span>
                              <p className="font-semibold text-white">{currentSizeAttr.pressure}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-400">Speed:</span>
                              <p className="font-semibold text-white">{currentSizeAttr.speed}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>
            </div>

            {/* Features */}
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <TruckIcon className="h-6 w-6 text-green-400" />
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-gray-400 text-sm">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="font-semibold">Quality Guarantee</p>
                  <p className="text-gray-400 text-sm">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <InformationCircleIcon className="h-6 w-6 text-yellow-400" />
                <div>
                  <p className="font-semibold">Expert Support</p>
                  <p className="text-gray-400 text-sm">24/7 customer service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="Red">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {productImages.length > 0 && !imageLoadErrors[selectedImageIndex] && (
              <img
                src={productImages[selectedImageIndex]}
                alt={`${product.name} - Full size`}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;