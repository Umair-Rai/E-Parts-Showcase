import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
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
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  // Add mechanical seal attributes state
  const [mechanicalSealAttributes, setMechanicalSealAttributes] = useState(null);
  const [isMechanicalSeal, setIsMechanicalSeal] = useState(false);

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

  // Check if product is mechanical seal
  const checkIfMechanicalSeal = (categoryId) => {
    const category = categories.find(cat => String(cat.id) === String(categoryId));
    console.log('Checking category:', category);
    console.log('Category ID:', categoryId);
    
    if (!category) {
      console.log('No category found for ID:', categoryId);
      return false;
    }
    
    const categoryName = category.name.toLowerCase();
    console.log('Category name (lowercase):', categoryName);
    
    // Check for exact match with "Mechanical Seals"
    const isMechanical = categoryName === 'mechanical seals' || 
                    categoryName.includes('mechanical seal');
    
    console.log('Is mechanical seal?', isMechanical);
    return isMechanical;
  };
  
  // Fetch mechanical seal attributes with authentication
  const fetchMechanicalSealAttributes = async (productId) => {
    try {
      console.log('Fetching mechanical seal attributes for product:', productId);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      console.log('Auth token found:', !!token);
      
      if (!token) {
        console.log('No authentication token found');
        setMechanicalSealAttributes(null);
        return;
      }
      
      const response = await axios.get(
        `http://localhost:5000/api/mechanical-seals/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Mechanical seal attributes response:', response.data);
      setMechanicalSealAttributes(response.data);
    } catch (error) {
      console.log('Error fetching mechanical seal attributes:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.log('Authentication failed - please login');
      }
      setMechanicalSealAttributes(null);
    }
  };

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
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
        const response = await axios.get("http://localhost:5000/api/categories");
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
    console.log('Checking mechanical seal conditions:');
    console.log('Product:', product);
    console.log('Categories length:', categories.length);
    console.log('Product category_id:', product?.category_id);
    
    if (product && categories.length > 0) {
      const isMechSeal = checkIfMechanicalSeal(product.category_id);
      console.log('Setting isMechanicalSeal to:', isMechSeal);
      setIsMechanicalSeal(isMechSeal);
      
      if (isMechSeal) {
        console.log('Product is mechanical seal, fetching attributes...');
        fetchMechanicalSealAttributes(product.id);
      } else {
        console.log('Product is not a mechanical seal');
      }
    }
  }, [product, categories]);

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
      return `http://localhost:5000${cleanPath}`;
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
  const handleAddToCart = () => {
    if (!selectedSize && product?.sizes?.length > 0) {
      toast.warning("Please select a size");
      return;
    }
    
    // Add to cart logic here
    toast.success(`Added ${quantity} ${product.name} to cart!`);
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

  // Handle inquiry
  const handleInquiry = () => {
    setShowInquiryModal(true);
  };

  // Submit inquiry
  const submitInquiry = () => {
    if (!inquiryMessage.trim()) {
      toast.warning("Please enter your inquiry message");
      return;
    }
    
    // Submit inquiry logic here
    toast.success("Inquiry submitted successfully! We'll get back to you soon.");
    setShowInquiryModal(false);
    setInquiryMessage("");
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
            {/* Product Title and Category */}
            <div>
              <p className="text-red-400 text-sm font-medium mb-2">
                {getCategoryName(product.category_id)}
              </p>
              <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-400">(4.0) • 24 reviews</span>
                </div>
              </div>
            </div>

            {/* Description - Dynamic based on selected size */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed">{getCurrentDescription()}</p>
              </div>
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Available Sizes</h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => handleSizeSelection(size, index)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        selectedSizeIndex === index
                          ? 'border-red-600 bg-red-600 bg-opacity-20 text-red-400'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {/* Show size-specific description hint */}
                {product.descriptions && product.descriptions.length > 1 && (
                  <p className="text-sm text-gray-400 mt-2">
                    💡 Click on different sizes to see specific descriptions
                  </p>
                )}
              </div>
            )}

            {/* Mechanical Seal Attributes */}
            {isMechanicalSeal && mechanicalSealAttributes && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  ⚙️ Mechanical Seal Specifications
                </h3>
                <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-400">Material:</span>
                        <p className="font-semibold text-white">{mechanicalSealAttributes.material}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Temperature:</span>
                        <p className="font-semibold text-white">{mechanicalSealAttributes.temperature}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-400">Pressure:</span>
                        <p className="font-semibold text-white">{mechanicalSealAttributes.pressure}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Speed:</span>
                        <p className="font-semibold text-white">{mechanicalSealAttributes.speed}</p>
                      </div>
                    </div>
                  </div>
                </div>
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
                <p className="text-gray-400 text-sm">In stock</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  <span>Buy Now</span>
                </button>
              </div>
              
              <button
                onClick={handleInquiry}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>Send Inquiry</span>
              </button>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  {isWishlisted ? (
                    <HeartSolid className="h-5 w-5 text-red-400" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  <span>Wishlist</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <ShareIcon className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Send Product Inquiry</h3>
            <p className="text-gray-400 mb-4">Ask us anything about {product.name}</p>
            <textarea
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-red-500"
            />
            <div className="flex space-x-4 mt-4">
              <button
                onClick={submitInquiry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Send Inquiry
              </button>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;