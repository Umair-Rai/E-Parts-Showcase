import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon,
  CubeIcon,
  ArrowLeftIcon,
  TagIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

// Import reusable components
import Input from '../../Component/Input';
import Button from '../../Component/Button';
import ImageUpload from '../../Component/ImageUpload';

// Add this helper function after line 21
const getProductDescriptions = (descriptions) => {
  if (!descriptions) return '';
  if (Array.isArray(descriptions)) {
    return descriptions.join(', ');
  }
  if (typeof descriptions === 'string') {
    return descriptions;
  }
  return String(descriptions);
};

const UpdateProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams(); // FIXED: Changed from 'id' to 'productId'
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    sizes: '',
    descriptions: '',
    images: [], // New images to upload
    existingImages: [], // Existing images from server
    // Mechanical seal attributes
    material: '',
    temperature: '',
    pressure: '',
    speed: ''
  });
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);
  const [mechanicalSealAttributes, setMechanicalSealAttributes] = useState(null);
  const [isMechanicalSeal, setIsMechanicalSeal] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        const response = await axios.get('http://localhost:5000/api/categories', {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load categories');
        // Set empty array to prevent infinite loading
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch existing product data - FIXED VERSION
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetchLoading(true);
        const adminToken = localStorage.getItem('adminToken');
        
        if (!adminToken) {
          toast.error('Authentication required. Please login again.');
          navigate('/admin/login');
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/products/${productId}`, // FIXED: Changed from 'id' to 'productId'
          {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          }
        );

        const productData = response.data;
        console.log('📋 Fetched product data:', productData);
        
        // Helper function to safely handle product images
        const getProductImages = (product) => {
          if (!product.pic) return [];
          
          let imageArray = [];
          
          if (Array.isArray(product.pic)) {
            imageArray = product.pic;
          } else if (typeof product.pic === 'string') {
            // Handle Postgres TEXT[] format like: {"url1","url2"}
            imageArray = product.pic
              .replace(/[{}]/g, "")   // Remove curly braces
              .replace(/"/g, "")     // Remove quotation marks
              .split(",")            // Split string by commas
              .map((v) => v.trim());  // Trim whitespace from each element
          }
          
          return imageArray;
        };

        const existingImages = getProductImages(productData);
        
        setFormData({
          name: productData.name || '',
          categoryId: productData.category_id || '',
          sizes: productData.sizes || '',
          descriptions: getProductDescriptions(productData.descriptions),
          images: [],
          existingImages: existingImages,
          material: '',
          temperature: '',
          pressure: '',
          speed: ''
        });
        
        setOriginalData(productData);
        
      } catch (error) {
        console.error('❌ Failed to fetch product:', error);
        
        if (error.response?.status === 404) {
          toast.error('Product not found');
        } else if (error.response?.status === 401) {
          toast.error('Authentication required. Please login again.');
          navigate('/admin/login');
          return;
        } else {
          toast.error('Failed to load product data');
        }
        
        navigate('/admin');
      } finally {
        // CRITICAL: Always set loading to false
        setFetchLoading(false);
      }
    };

    // FIXED: Remove categories dependency to prevent deadlock
    if (productId) { // FIXED: Changed from 'id' to 'productId'
      fetchProduct();
    }
    else{
      setFetchLoading(false);
    }                
  }, [productId, navigate]); // FIXED: Changed from 'id' to 'productId'

  // Separate useEffect for mechanical seal logic
  useEffect(() => {
    const fetchMechanicalSealData = async () => {
      if (!formData.categoryId || categories.length === 0) return;
      
      // Determine if this is a mechanical seal product
      const selectedCategory = categories.find(cat => cat.id === parseInt(formData.categoryId));
      const isMechSeal = selectedCategory?.name?.toLowerCase().includes('mechanical seal') || false;
      setIsMechanicalSeal(isMechSeal);
      
      // Fetch mechanical seal attributes if needed
      if (isMechSeal && productId) { // FIXED: Changed from 'id' to 'productId'
        try {
          const adminToken = localStorage.getItem('adminToken');
          const mechResponse = await axios.get(
            `http://localhost:5000/api/mechanical-seal-attributes/${productId}`, // FIXED: Changed from 'id' to 'productId'
            {
              headers: {
                'Authorization': `Bearer ${adminToken}`
              }
            }
          );
          
          const mechData = mechResponse.data;
          setMechanicalSealAttributes(mechData);
          setFormData(prev => ({
            ...prev,
            material: mechData.material || '',
            temperature: mechData.temperature || '',
            pressure: mechData.pressure || '',
            speed: mechData.speed || ''
          }));
        } catch (mechError) {
          console.log('No mechanical seal attributes found for this product');
        }
      }
    };

    fetchMechanicalSealData();
  }, [formData.categoryId, categories, productId]); // FIXED: Changed from 'id' to 'productId'

  // Update isMechanicalSeal when category changes
  useEffect(() => {
    if (formData.categoryId && categories.length > 0) {
      const selectedCategory = categories.find(cat => cat.id === parseInt(formData.categoryId));
      const isMechSeal = selectedCategory?.name?.toLowerCase().includes('mechanical seal') || false;
      setIsMechanicalSeal(isMechSeal);
    }
  }, [formData.categoryId, categories]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle new image upload changes
  const handleImageChange = (files) => {
    // Handle both event object and direct files array
    let fileList;
    if (files && files.target) {
      // Called from a file input event
      fileList = Array.from(files.target.files || []);
    } else if (Array.isArray(files)) {
      // Called from ImageUpload component
      fileList = files;
    } else {
      console.error('Invalid files parameter:', files);
      return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    // Validate each file
    for (const file of fileList) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported image format. Please use JPEG, PNG, or WebP.`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Please use images under 5MB.`);
        return;
      }
    }
    
    const totalImages = formData.existingImages.length + fileList.length;
    if (totalImages > 2) {
      toast.error('Maximum 2 images allowed. Please remove some existing images first.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: fileList
    }));
    
    // Clear any previous image errors
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
    
    // Enhanced name validation
    if (!formData.name.trim()) {
        newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length > 100) {
        newErrors.name = 'Product name must be less than 100 characters';
    } else if (!/^[a-zA-Z0-9\s\-_.,()]+$/.test(formData.name.trim())) {
        newErrors.name = 'Product name contains invalid characters';
    }
    
    if (!formData.categoryId) {
        newErrors.categoryId = 'Category is required';
    }
    
    // Enhanced description validation
    if (!formData.descriptions || !formData.descriptions.trim()) {
        newErrors.descriptions = 'Product description is required';
    } else if (formData.descriptions.trim().length > 1000) {
        newErrors.descriptions = 'Description must be less than 1000 characters';
    }
    
    // Enhanced image validation (KEEP ONLY THIS ONE)
    const totalImages = formData.existingImages.length + formData.images.length;
    if (totalImages === 0) {
        newErrors.images = 'At least one product image is required';
    } else if (totalImages > 2) {
        newErrors.images = 'Maximum 2 images allowed';
    }
    
    // Validate mechanical seal attributes if applicable
    if (isMechanicalSeal) {
        if (!formData.material.trim()) {
            newErrors.material = 'Material is required for mechanical seal products';
        }
        if (!formData.temperature.trim()) {
            newErrors.temperature = 'Temperature is required for mechanical seal products';
        }
        if (!formData.pressure.trim()) {
            newErrors.pressure = 'Pressure is required for mechanical seal products';
        }
        if (!formData.speed.trim()) {
            newErrors.speed = 'Speed is required for mechanical seal products';
        }
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
      
      // Additional validation before submission
      if (!productId) {
        toast.error('Product ID is missing. Cannot update product.');
        return;
      }
      
      // Validate category exists
      if (!categories.find(cat => cat.id === parseInt(formData.categoryId))) {
        toast.error('Selected category is invalid.');
        return;
      }
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('sizes', formData.sizes.trim());
      formDataToSend.append('descriptions', formData.descriptions.trim());
      // REMOVED: formDataToSend.append('adminId', localStorage.getItem('adminId') || '1');
      
      // Send existing images that should be kept
      // In handleSubmit function
      formDataToSend.append('existingImages', JSON.stringify(formData.existingImages));
      // Remove the old keepExistingImages line
      
      // Append new image files
      formData.images.forEach((file, index) => {
        formDataToSend.append('productImages', file);
      });
      
      // Replace all instances of http://localhost:5000 with your actual backend URL
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Then use:
      const response = await axios.put(
        `${API_BASE_URL}/api/products/${productId}`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update mechanical seal attributes if applicable
      if (isMechanicalSeal) {
        const mechData = {
          productId: productId, // FIXED: Changed from 'id' to 'productId'
          material: formData.material.trim(),
          temperature: formData.temperature.trim(),
          pressure: formData.pressure.trim(),
          speed: formData.speed.trim()
        };
        
        try {
          if (mechanicalSealAttributes) {
            // Update existing attributes (if update endpoint exists)
            // For now, we'll create new ones since update endpoint doesn't exist
            await axios.post(
              'http://localhost:5000/api/mechanical-seal-attributes',
              mechData,
              {
                headers: {
                  'Authorization': `Bearer ${adminToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
          } else {
            // Create new attributes
            await axios.post(
              'http://localhost:5000/api/mechanical-seal-attributes',
              mechData,
              {
                headers: {
                  'Authorization': `Bearer ${adminToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
          }
        } catch (mechError) {
          console.error('Failed to update mechanical seal attributes:', mechError);
          // Don't fail the entire update for this
        }
      }
      
      toast.success('Product updated successfully!');
      
      // Navigate back to products list after a short delay
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      
      // Enhanced network error handling
      if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
          toast.error('Cannot connect to server. Please ensure the backend is running on http://localhost:5000');
      } else if (error.code === 'ECONNREFUSED') {
          toast.error('Connection refused. Backend server may not be running.');
      } else if (error.code === 'ERR_CONNECTION_REFUSED') {
          toast.error('Backend server is not responding. Please start the server.');
      } else if (!error.response) {
          toast.error('Network error. Please check if the backend server is running and try again.');
      } else if (error.response?.status === 400) {
          const errorMessage = error.response.data.message || 'Validation error';
          if (errorMessage.includes('image')) {
              toast.error('Image upload failed. Please check file size and format.');
          } else {
              toast.error(errorMessage);
          }
      } else if (error.response?.status === 413) {
          toast.error('File too large. Please reduce image size to under 5MB.');
      } else if (error.response?.status === 404) {
          toast.error('Product not found. It may have been deleted.');
      } else if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
      } else if (error.response?.status === 403) {
          toast.error('You do not have permission to update this product.');
      } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
      } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
      } else {
          toast.error('Failed to update product. Please check your data and try again.');
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
        <span className="ml-3 text-gray-600">Loading product data...</span>
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
                title="Back to Products"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <PencilIcon className="h-8 w-8 text-purple-600" />
                Update Product
              </h1>
            </div>
            <p className="text-gray-600 ml-10">
              Modify product information and settings
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
            <CubeIcon className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Product Information</h2>
            {originalData && (
              <span className="text-sm text-gray-500 ml-2">
                (ID: {originalData.id})
              </span>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              📝 Basic Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
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
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.categoryId ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <XMarkIcon className="h-4 w-4" />
                    {errors.categoryId}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sizes
                </label>
                <Input
                  name="sizes"
                  value={formData.sizes}
                  onChange={handleInputChange}
                  placeholder="Enter available sizes (e.g., Small, Medium, Large)"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  name="descriptions"
                  value={formData.descriptions}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.descriptions ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.descriptions && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <XMarkIcon className="h-4 w-4" />
                    {errors.descriptions}
                  </p>
                )}
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
                  const imageUrl = imagePath.startsWith('http') 
                    ? imagePath 
                    : `http://localhost:5000${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
                  
                  return (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          console.error('❌ Failed to load image:', imageUrl);
                          e.target.style.display = 'none';
                          const placeholder = document.createElement('div');
                          placeholder.className = 'w-full h-32 bg-gray-200 rounded-lg border flex items-center justify-center text-gray-500';
                          placeholder.innerHTML = '<span>Image not available</span>';
                          e.target.parentNode.appendChild(placeholder);
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
              Upload additional images for this product. You can upload up to 2 images total (max 5MB each).
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

          {/* Mechanical Seal Attributes Section */}
          {isMechanicalSeal && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                ⚙️ Mechanical Seal Specifications
              </h3>
              <p className="text-sm text-gray-600">
                Technical specifications for mechanical seal products.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Material *
                  </label>
                  <Input
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    placeholder="Enter material (e.g., Carbon Steel, Stainless Steel)"
                    className={errors.material ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.material && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <XMarkIcon className="h-4 w-4" />
                      {errors.material}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Temperature *
                  </label>
                  <Input
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    placeholder="Enter temperature range (e.g., -20°C to 200°C)"
                    className={errors.temperature ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.temperature && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <XMarkIcon className="h-4 w-4" />
                      {errors.temperature}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pressure *
                  </label>
                  <Input
                    name="pressure"
                    value={formData.pressure}
                    onChange={handleInputChange}
                    placeholder="Enter pressure rating (e.g., 0-16 bar)"
                    className={errors.pressure ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.pressure && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <XMarkIcon className="h-4 w-4" />
                      {errors.pressure}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Speed *
                  </label>
                  <Input
                    name="speed"
                    value={formData.speed}
                    onChange={handleInputChange}
                    placeholder="Enter speed rating (e.g., 0-3600 RPM)"
                    className={errors.speed ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.speed && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <XMarkIcon className="h-4 w-4" />
                      {errors.speed}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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
                    Update Product
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

export default UpdateProduct;

  // Add this function inside the UpdateProduct component
  const testBackendConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      console.log('✅ Backend connection successful');
      return true;
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to backend server. Please ensure it\'s running on http://localhost:5000');
      }
      return false;
    }
  };
