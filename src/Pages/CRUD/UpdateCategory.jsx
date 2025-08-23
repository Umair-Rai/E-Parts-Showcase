import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  PhotoIcon,
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon,
  Squares2X2Icon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

// Import reusable components
import Input from '../../Component/Input';
import Button from '../../Component/Button';
import ImageUpload from '../../Component/ImageUpload';

const UpdateCategory = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams(); // Fixed: Changed from 'id' to 'categoryId'
  
  // Move API_BASE_URL to component level (before any useEffect or functions)
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    specialCategory: false,
    images: [], // New images to upload
    existingImages: [] // Existing images from server
  });
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);

  // Fetch existing category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setFetchLoading(true);
        const adminToken = localStorage.getItem('adminToken');
        
        if (!adminToken) {
          toast.error('Authentication required. Please login again.');
          navigate('/admin/login');
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/categories/${categoryId}`,
          {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          }
        );

        const categoryData = response.data;
        console.log('📋 Fetched category data:', categoryData);
        
        // Enhanced helper function to safely handle category images with Postgres TEXT[] support
        const getCategoryImages = (category) => {
          console.log('🔍 Processing category images for:', category.name, category.pic);
          
          if (!category.pic) {
            console.log('⚠️ No pic field found for category:', category.name);
            return [];
          }
          
          let imageArray = [];
          
          if (Array.isArray(category.pic)) {
            // Already a JS array ✅
            imageArray = category.pic;
            console.log('📋 Found array of images:', imageArray);
          } else if (typeof category.pic === 'string') {
            // Handle Postgres TEXT[] format like: {"url1","url2"}
            imageArray = category.pic
              .replace(/[{}]/g, "")   // Remove curly braces
              .replace(/"/g, "")     // Remove quotation marks
              .split(",")            // Split string by commas
              .map((v) => v.trim());  // Trim whitespace from each element
            
            console.log('📋 Parsed Postgres TEXT[] images:', imageArray);
          }
          
          return imageArray;
        };

        const existingImages = getCategoryImages(categoryData);
        
        setFormData({
          name: categoryData.name || '',
          specialCategory: categoryData.special_category || false,
          images: [],
          existingImages: existingImages
        });
        
        setOriginalData(categoryData);
        
      } catch (error) {
        console.error('❌ Failed to fetch category:', error);
        
        if (error.response?.status === 404) {
          toast.error('Category not found');
        } else if (error.response?.status === 401) {
          toast.error('Authentication required. Please login again.');
          navigate('/admin/login');
          return;
        } else {
          toast.error('Failed to load category data');
        }
        
        navigate('/admin');
      } finally {
        setFetchLoading(false);
      }
    };

    if (categoryId) { // Fixed: Changed from 'id' to 'categoryId'
      fetchCategory();
    }
  }, [categoryId, navigate]); // Fixed: Changed from 'id' to 'categoryId'

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle new image upload changes
  const handleImageChange = (files) => {
    setFormData(prev => ({ ...prev, images: files }));
    
    // Clear image error when files are selected
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  // Handle removing existing images
  const handleRemoveExistingImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }
    
    // Check if there are any images (existing or new)
    const totalImages = formData.existingImages.length + formData.images.length;
    if (totalImages === 0) {
      newErrors.images = 'At least one category image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setLoading(true);
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast.error('Authentication required. Please login again.');
        navigate('/admin/login');
        return;
      }
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('specialCategory', formData.specialCategory);
      
      // Send existing images that should be kept
      formDataToSend.append('existingImages', JSON.stringify(formData.existingImages));
      
      // Append new image files
      formData.images.forEach((file, index) => {
        formDataToSend.append('images', file);
      });
      
      const response = await axios.put(
        `${API_BASE_URL}/api/categories/${categoryId}`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast.success('Category updated successfully!');
      
      // Navigate back to categories list after a short delay
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Failed to update category:', error);
      
      // Enhanced error handling
      if (error.code === 'NETWORK_ERROR') {
        toast.error('Network error. Please check your connection.');
      } else if (error.response?.status === 413) {
        toast.error('File too large. Please reduce image size.');
      } else if (error.response?.status === 404) {
        toast.error('Category not found');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel/back navigation
  const handleCancel = () => {
    navigate('/admin');
  };

  // Show loading spinner while fetching data
  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading category data...</span>
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
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Back to Categories"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <PencilIcon className="h-8 w-8 text-purple-600" />
                Update Category
              </h1>
            </div>
            <p className="text-gray-600 ml-10">
              Modify category information and settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 px-6 py-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-sm border max-w-4xl mx-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Squares2X2Icon className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Category Information</h2>
            {originalData && (
              <span className="text-sm text-gray-500 ml-2">
                (ID: {originalData.id})
              </span>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Category Name Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              📝 Basic Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name (e.g., GenSet Parts, Bearings)"
                  className={errors.name ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <XMarkIcon className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category Type
                </label>
                <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md bg-gray-50">
                  <input
                    type="checkbox"
                    id="specialCategory"
                    name="specialCategory"
                    checked={formData.specialCategory}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="specialCategory" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Special Category
                  </label>
                  {formData.specialCategory && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Special categories are highlighted and featured prominently
                </p>
              </div>
            </div>
          </div>

          {/* Existing Images Section */}
          {formData.existingImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                🖼️ Current Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.existingImages.map((imagePath, index) => {
                  // Helper function to get full image URL
                  const getImageUrl = (imagePath) => {
                    if (!imagePath) return null;
                    return imagePath.startsWith('http') 
                      ? imagePath 
                      : `${API_BASE_URL}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
                  };
                  
                  // Call the function to get the actual URL
                  const imageUrl = getImageUrl(imagePath);
                  
                  console.log('🖼️ Loading image:', imageUrl); // Debug log
                  
                  return (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Category ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          console.error('❌ Failed to load image:', imageUrl);
                          // Better fallback - hide the broken image
                          e.target.style.display = 'none';
                          // Show a placeholder div instead
                          const placeholder = document.createElement('div');
                          placeholder.className = 'w-full h-32 bg-gray-200 rounded-lg border flex items-center justify-center text-gray-500';
                          placeholder.innerHTML = '<span>Image not available</span>';
                          e.target.parentNode.appendChild(placeholder);
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully:', imageUrl);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Images Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              📤 Add New Images
            </h3>
            <p className="text-sm text-gray-600">
              Upload additional images for this category. You can upload up to 2 images total (max 5MB each).
            </p>
            
            <ImageUpload
              images={formData.images}
              onImagesChange={handleImageChange}
              maxImages={Math.max(0, 2 - formData.existingImages.length)}
              maxSizePerImage={5 * 1024 * 1024}
              acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
              className="w-full"
            />
            
            {errors.images && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <XMarkIcon className="h-4 w-4" />
                {errors.images}
              </p>
            )}
            
            <p className="text-xs text-gray-500">
              Current images: {formData.existingImages.length}, New images: {formData.images.length}, 
              Total: {formData.existingImages.length + formData.images.length}/2
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              * Required fields
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 px-6 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={`px-8 py-2 flex items-center gap-2 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Update Category
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCategory;