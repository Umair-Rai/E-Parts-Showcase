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
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Badge from '../../Component/Badge';
import Input from '../../Component/Input';
import Select from '../../Component/Select';

export default function ViewAllProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch products", err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter options
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get("http://localhost:5000/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleAddProduct = () => {
    navigate("/admin/add-product");
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchProducts();
        toast.success("Product deleted successfully");
      } catch (err) {
        console.error("❌ Failed to delete product", err);
        toast.error("Failed to delete product");
      }
    }
  };

  // Filter options
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map(cat => ({
      value: cat.id.toString(),
      label: cat.name
    }))
  ];

  const stockOptions = [
    { value: "all", label: "All Stock Status" },
    { value: "in_stock", label: "In Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "name", label: "Name A-Z" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "stock", label: "Stock: High to Low" },
  ];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || product.category_id?.toString() === selectedCategory;
      const matchesStock = stockFilter === "all" || 
                          (stockFilter === "in_stock" && product.stock_quantity > 0) ||
                          (stockFilter === "out_of_stock" && product.stock_quantity === 0);
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        case "stock":
          return b.stock_quantity - a.stock_quantity;
        case "newest":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
              </div>
              <CubeIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{products.filter(p => p.stock_quantity > 0).length}</p>
              </div>
              <TagIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{products.filter(p => p.stock_quantity === 0).length}</p>
              </div>
              <TagIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Add Product Button */}
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            Add Product
          </button>
        </div>
        
        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              placeholder="Category"
            />
            <Select
              options={stockOptions}
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              placeholder="Stock Status"
            />
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              placeholder="Sort By"
            />
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200">
            <div className="p-4">
              {/* Product Image */}
              <div className="relative mb-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url.startsWith('http') ? product.image_url : `http://localhost:5000/uploads/${product.image_url}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <Badge 
                    text={product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'} 
                    status={product.stock_quantity > 0 ? 'delivered' : 'cancelled'} 
                  />
                </div>
              </div>
              
              {/* Product Info */}
              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description || 'No description available'}</p>
                
                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-purple-600">SAR {product.price}</span>
                </div>
                
                {/* Stock Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Stock: {product.stock_quantity}</span>
                  <span className="text-gray-600">
                    Category: {categories.find(cat => cat.id === product.category_id)?.name || 'N/A'}
                  </span>
                </div>
              </div>
              
              {/* Actions */}
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
                  className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {selectedProduct.image_url ? (
                      <img
                        src={selectedProduct.image_url.startsWith('http') ? selectedProduct.image_url : `http://localhost:5000/uploads/${selectedProduct.image_url}`}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Product Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-purple-600">SAR {selectedProduct.price}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Category</span>
                      <p className="font-medium">
                        {categories.find(cat => cat.id === selectedProduct.category_id)?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Stock</span>
                      <p className="font-medium">{selectedProduct.stock_quantity} units</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Created</span>
                      <p className="font-medium">{new Date(selectedProduct.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Updated</span>
                      <p className="font-medium">{new Date(selectedProduct.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {selectedProduct.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Link
                  to={`/admin/update-product/${selectedProduct.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Product
                </Link>
                <button
                  onClick={() => {
                    handleDeleteProduct(selectedProduct.id);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}