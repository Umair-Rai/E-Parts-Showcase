import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

// Import reusable components
import Input from '../../Component/Input';
import Button from '../../Component/Button';
import ImageUpload from '../../Component/ImageUpload';

const AddCategory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialCategory: false,
    images: [] // Changed from pic to images for file uploads
  });
  const [errors, setErrors] = useState({});

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

  // Handle image upload changes
  const handleImageChange = (files) => {
    setFormData(prev => ({ ...prev, images: files }));
    
    // Clear image error when files are selected
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }
    
    if (formData.images.length === 0) {
      newErrors.images = 'At least one category image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
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
      
      // Append image files
      formData.images.forEach((file, index) => {
        formDataToSend.append('images', file);
      });
      
      const response = await axios.post(
        'https://eme6.com/api/categories',
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast.success('Category created successfully!');
      
      // Reset form
      setFormData({ name: '', specialCategory: false, images: [] });
      setErrors({});
      
      // Navigate back to categories list after a short delay
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Failed to create category:', error);
      
      // Enhanced error handling
      if (error.code === 'NETWORK_ERROR') {
        toast.error('Network error. Please check your connection.');
      } else if (error.response?.status === 413) {
        toast.error('File too large. Please reduce image size.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel/back navigation
  const handleCancel = () => {
    navigate('/admin');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Squares2X2Icon className="h-8 w-8 text-purple-600" />
              Add New Category
            </h1>
            <p className="text-gray-600 mt-2">Create a new product category for your store</p>
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
            <PlusIcon className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Category Information</h2>
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

          {/* Category Images Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              🖼️ Category Images
            </h3>
            <p className="text-sm text-gray-600">
              Upload images for this category. You can upload up to 2 images (max 5MB each).
            </p>
            
            <ImageUpload
              images={formData.images}
              onImagesChange={handleImageChange}
              maxImages={2}
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
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Create Category
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

export default AddCategory;