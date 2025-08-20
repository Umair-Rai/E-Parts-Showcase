import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  Squares2X2Icon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Badge from '../../Component/Badge';
import Input from '../../Component/Input';
import Select from '../../Component/Select';

const ViewAllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      const res = await axios.get("http://localhost:5000/api/categories", {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      
      // Debug logging to check the API response
      console.log('📊 API Response:', res.data);
      if (res.data.length > 0) {
        console.log('📋 Sample category object:', res.data[0]);
        console.log('🔍 Special category field:', res.data[0].special_category);
      }
      
      setCategories(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch categories:", err);
      toast.error("Failed to fetch categories");
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = async (categoryId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      console.error("❌ Failed to delete category:", err);
      toast.error("Failed to delete category");
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  // Helper function to safely check special category status
  const isSpecialCategory = (category) => {
    // Handle various possible field names and data types
    return category.special_category === true || 
           category.special_category === 'true' || 
           category.specialCategory === true || 
           category.specialCategory === 'true';
  };

  // Helper function to safely handle category images
  const getCategoryImages = (category) => {
    if (!category.pic) return [];
    if (Array.isArray(category.pic)) return category.pic;
    if (typeof category.pic === 'string') {
      try {
        // Try to parse if it's a JSON string
        return JSON.parse(category.pic);
      } catch {
        // If parsing fails, treat as single image path
        return [category.pic];
      }
    }
    return [];
  };

  // Filter categories based on search (only by name since description doesn't exist)
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Categories Management</h1>
            <p className="text-gray-600 mt-2">Manage your product categories</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
              <span className="text-sm text-gray-600">Total Categories: </span>
              <span className="font-semibold text-purple-600">{categories.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Add Category Button */}
          <Link
            to="/admin/add-category"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Squares2X2Icon className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">All Categories</h2>
            <span className="text-sm text-gray-500">({filteredCategories.length})</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <Squares2X2Icon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No categories found</p>
                    <p className="text-sm">Try adjusting your search or add a new category</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category, index) => {
                  // Debug logging for each category
                  console.log(`🔍 Category ${index + 1}:`, {
                    id: category.id,
                    name: category.name,
                    special_category: category.special_category,
                    specialCategory: category.specialCategory,
                    isSpecial: isSpecialCategory(category)
                  });
                  
                  return (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 rounded-lg mr-3">
                            <Squares2X2Icon className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isSpecialCategory(category) ? (
                          <Badge text="Yes" status="delivered" />
                        ) : (
                          <Badge text="No" status="cancelled" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCategory(category)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/update-category/${category.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Edit Category"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Delete Category"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Details Modal */}
      {showModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Squares2X2Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedCategory.name}
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
              {/* Category Info */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Category Name:</span>
                  <p className="font-semibold">{selectedCategory.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Special Category:</span>
                  <div className="mt-1">
                    {isSpecialCategory(selectedCategory) ? (
                      <Badge text="Yes" status="delivered" />
                    ) : (
                      <Badge text="No" status="cancelled" />
                    )}
                  </div>
                </div>
                {/* Display category images if available */}
                {(() => {
                  const images = getCategoryImages(selectedCategory);
                  return images.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Category Images:</span>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {images.map((imagePath, index) => (
                          <img
                            key={index}
                            src={imagePath.startsWith('http') ? imagePath : `http://localhost:5000${imagePath}`}
                            alt={`${selectedCategory.name} ${index + 1}`}
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
              </div>
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
                  navigate(`/admin/update-category/${selectedCategory.id}`);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Edit Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllCategories;
