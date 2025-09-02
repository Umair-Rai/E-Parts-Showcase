import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  TagIcon,
  StarIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Badge from '../../Component/Badge';
import Input from '../../Component/Input';
import Select from '../../Component/Select';

export default function ViewAllProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mechanicalSealAttributes, setMechanicalSealAttributes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Enhanced fetch products with retry logic
  const fetchProducts = async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }
      
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }

      const res = await axios.get("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${adminToken}`
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('📦 Products fetched:', res.data);
      setProducts(res.data);
      setRetryCount(0); // Reset retry count on success
      
      // Fetch mechanical seal attributes for each product
      await fetchMechanicalSealAttributes(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }
      
      // Handle network errors with retry logic
      if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || !err.response) {
        if (retryCount < 3) {
          console.log(`🔄 Retrying... Attempt ${retryCount + 1}/3`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchProducts(true), 2000 * (retryCount + 1)); // Exponential backoff
          return;
        }
      }
      
      setError("Failed to fetch products. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };



  // Enhanced fetch categories with error handling
  const fetchCategories = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        return; // Don't redirect here, let fetchProducts handle it
      }
      
      const res = await axios.get("http://localhost:5000/api/categories", {
        headers: {
          Authorization: `Bearer ${adminToken}`
        },
        timeout: 10000
      });
      setCategories(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch categories:", err);
      // Don't redirect on category fetch failure, just log the error
      if (err.response?.status !== 401) {
        console.warn("Categories unavailable, continuing without category filter");
      }
    }
  };

  // Fetch mechanical seal attributes for products
  const fetchMechanicalSealAttributes = async (products) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken || !products || products.length === 0) {
        return;
      }

      const attributes = {};
      
      // Fetch attributes for each product that might have mechanical seal data
      for (const product of products) {
        try {
          const res = await axios.get(`http://localhost:5000/api/mechanical-seals/product/${product.id}`, {
            headers: {
              Authorization: `Bearer ${adminToken}`
            },
            timeout: 5000
          });
          
          if (res.data && res.data.length > 0) {
            attributes[product.id] = res.data;
          }
        } catch (err) {
          // Silently handle errors for individual products
          // This is optional data, so we don't want to break the main flow
          if (err.response?.status !== 404) {
            console.warn(`Failed to fetch mechanical seal attributes for product ${product.id}:`, err.message);
          }
        }
      }
      
      setMechanicalSealAttributes(attributes);
    } catch (err) {
      console.error("❌ Failed to fetch mechanical seal attributes:", err);
      // Don't throw error, this is optional functionality
    }
  };

  // Enhanced useEffect with better error handling and DevTools compatibility
  useEffect(() => {
    const initializeData = async () => {
      // Ensure proper timing regardless of DevTools state
      const delay = window.chrome && window.chrome.devtools ? 200 : 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Use Promise.allSettled to prevent one failure from affecting others
      const results = await Promise.allSettled([
        fetchProducts(),
        fetchCategories()
      ]);
      
      // Log results for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Data fetch ${index} failed:`, result.reason);
        }
      });
    };

    initializeData();
  }, []);

  // Enhanced fetch products with DevTools-aware timing (keep this version)
  // Remove these lines completely (lines 40-85):
  // const fetchProducts = async (isRetry = false) => {
  //   try {
  //     if (!isRetry) {
  //       setLoading(true);
  //       setError(null);
  //     }
  //     
  //     const adminToken = localStorage.getItem('adminToken');
  //     
  //     if (!adminToken) {
  //       navigate('/admin/login');
  //       return;
  //     }
  
  //     const res = await axios.get("http://localhost:5000/api/products", {
  //       headers: {
  //         Authorization: `Bearer ${adminToken}`
  //       },
  //       timeout: 10000 // 10 second timeout
  //     });
  //     
  //     console.log('📦 Products fetched:', res.data);
  //     setProducts(res.data);
  //     setRetryCount(0); // Reset retry count on success
  //     
  //     // Fetch mechanical seal attributes for each product
  //     await fetchMechanicalSealAttributes(res.data);
  //   } catch (err) {
  //     console.error("❌ Failed to fetch products:", err);
  //     
  //     if (err.response?.status === 401) {
  //       localStorage.removeItem('adminToken');
  //       navigate('/admin/login');
  //       return;
  //     }
  //     
  //     // Handle network errors with retry logic
  //     if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || !err.response) {
  //       if (retryCount < 3) {
  //         console.log(`🔄 Retrying... Attempt ${retryCount + 1}/3`);
  //         setRetryCount(prev => prev + 1);
  //         setTimeout(() => fetchProducts(true), 2000 * (retryCount + 1)); // Exponential backoff
  //         return;
  //       }
  //     }
  //     
  //     setError("Failed to fetch products. Please refresh the page.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // Add error display in the render
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">
          Loading products... {retryCount > 0 && `(Retry ${retryCount}/3)`}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => fetchProducts()} 
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Delete product handler
  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error("❌ Failed to delete product:", err);
      toast.error("Failed to delete product");
      
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  // Helper function to get product images
  const getProductImages = (product) => {
    if (!product.pic) return [];
    if (Array.isArray(product.pic)) return product.pic;
    if (typeof product.pic === 'string') {
      try {
        return JSON.parse(product.pic);
      } catch {
        return [product.pic];
      }
    }
    return [];
  };

  // Helper function to get product descriptions
  const getProductDescriptions = (product) => {
    if (!product.descriptions) return [];
    if (Array.isArray(product.descriptions)) return product.descriptions;
    if (typeof product.descriptions === 'string') {
      try {
        return JSON.parse(product.descriptions);
      } catch {
        return [product.descriptions];
      }
    }
    return [];
  };

  // Helper function to get product sizes
  const getProductSizes = (product) => {
    if (!product.sizes) return [];
    if (Array.isArray(product.sizes)) return product.sizes;
    if (typeof product.sizes === 'string') {
      try {
        return JSON.parse(product.sizes);
      } catch {
        return [product.sizes];
      }
    }
    return [];
  };

  // View product details
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category_id === parseInt(selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "category":
          return getCategoryName(a.category_id).localeCompare(getCategoryName(b.category_id));
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <CubeIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        </div>
        <p className="text-gray-600">Manage store inventory and product listings across all categories.</p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CubeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TagIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Add Product Button */}
          <Link
            to="/admin/add-product"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            Add Product
          </Link>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <Select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: "all", label: "All Categories" },
                ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
              ]}
            />
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: "name", label: "Name (A-Z)" },
                { value: "category", label: "Category" }
              ]}
            />
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CubeIcon className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">All Products</h2>
            <span className="text-sm text-gray-500">({filteredProducts.length})</span>
          </div>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <CubeIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters, or add a new product.</p>
            <Link
              to="/admin/add-product"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredProducts.map((product) => {
              const images = getProductImages(product);
              const descriptions = getProductDescriptions(product);
              const sizes = getProductSizes(product);
              const categoryName = getCategoryName(product.category_id);
              const attributes = mechanicalSealAttributes[product.id];
              
              return (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
                    {images.length > 0 ? (
                      <img
                        src={images[0].startsWith('http') ? images[0] : `http://localhost:5000${images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        +{images.length - 1} more
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{product.name}</h3>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <TagIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{categoryName}</span>
                      </div>
                      
                      {sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sizes.slice(0, 3).map((size, index) => (
                            <Badge key={index} text={size} status="pending" />
                          ))}
                          {sizes.length > 3 && (
                            <span className="text-xs text-gray-500">+{sizes.length - 3} more</span>
                          )}
                        </div>
                      )}
                      
                      {descriptions.length > 0 && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {descriptions[0]}
                        </p>
                      )}
                      
                      {attributes && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Material:</span> {attributes.material}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </button>
                      <Link
                        to={`/admin/update-product/${product.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CubeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Product Images */}
              {(() => {
                const images = getProductImages(selectedProduct);
                return images.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Product Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((imagePath, index) => (
                        <img
                          key={index}
                          src={imagePath.startsWith('http') ? imagePath : `http://localhost:5000${imagePath}`}
                          alt={`${selectedProduct.name} ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
              
              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Product Name:</span>
                      <p className="font-semibold">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Category:</span>
                      <p className="font-semibold">{getCategoryName(selectedProduct.category_id)}</p>
                    </div>
                    {(() => {
                      const sizes = getProductSizes(selectedProduct);
                      return sizes.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600">Available Sizes:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {sizes.map((size, index) => (
                              <Badge key={index} text={size} status="pending" />
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Mechanical Seal Attributes */}
                {mechanicalSealAttributes[selectedProduct.id] && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Mechanical Seal Attributes</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Material:</span>
                        <p className="font-semibold">{mechanicalSealAttributes[selectedProduct.id].material}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Temperature:</span>
                        <p className="font-semibold">{mechanicalSealAttributes[selectedProduct.id].temperature}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Pressure:</span>
                        <p className="font-semibold">{mechanicalSealAttributes[selectedProduct.id].pressure}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Speed:</span>
                        <p className="font-semibold">{mechanicalSealAttributes[selectedProduct.id].speed}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Product Descriptions */}
              {(() => {
                const descriptions = getProductDescriptions(selectedProduct);
                return descriptions.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Descriptions</h4>
                    <div className="space-y-2">
                      {descriptions.map((desc, index) => (
                        <p key={index} className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {desc}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  handleDeleteProduct(selectedProduct.id);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                Delete Product
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate(`/admin/update-product/${selectedProduct.id}`);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}