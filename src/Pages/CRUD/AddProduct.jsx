import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { buildApiUrl, MECHANICAL_SEAL_CATEGORY_SLUG, normalizeCategoryName } from '../../config/api';
import {
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  SparklesIcon,
  CogIcon,
  TagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [form, setForm] = useState({
    productName: '',
    productCode: '',
    categoryId: ''
    // adminId removed - this is correct
  });
  
  // In handleSubmit, remove this line:
  // formData.append('adminId', form.adminId);

  // For regular products (non-mechanical seal) - multiple sizes with same description
  const [regularProduct, setRegularProduct] = useState({
    sizes: [''],
    description: ''
  });

  // For mechanical seal products - each product size will have its own mechanical seal attributes
  const [mechanicalSealData, setMechanicalSealData] = useState({
    sizeDescriptions: [{ size: '', description: '' }],
    // This will store mechanical seal attributes for each product size
    mechanicalSealAttributes: []
  });


  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken'); // Changed from 'token' to 'adminToken'
      const response = await axios.get(buildApiUrl('/api/categories'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories', {
        toastId: 'fetch-categories-error', // Prevent duplicate toasts
      });
    }
  };

  // Check if selected category is mechanical seal
  const isMechanicalSeal = () => {
    const selectedCategory = categories.find(cat => cat.id === parseInt(form.categoryId));
    return (
      selectedCategory?.special_category === true ||
      normalizeCategoryName(selectedCategory?.name) === MECHANICAL_SEAL_CATEGORY_SLUG
    );
  };

  // Image handling functions
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(file => file.type.startsWith('image/'));
      const newImages = [...images, ...validFiles].slice(0, 6);
      setImages(newImages);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    const newImages = [...images, ...validFiles].slice(0, 6);
    setImages(newImages);
  };

  const handleImageRemove = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleFormChange = (field, value) => {
    setForm({ ...form, [field]: value });
    
    // Reset form data when category changes
    if (field === 'categoryId') {
      setRegularProduct({ sizes: [''], description: '' });
      setMechanicalSealData({
        sizeDescriptions: [{ size: '', description: '' }],
        mechanicalSealAttributes: []
      });
    }
  };

  const handleRegularProductChange = (field, value) => {
    setRegularProduct({ ...regularProduct, [field]: value });
  };

  // Handle regular product size changes
  const handleRegularSizeChange = (index, value) => {
    const updatedSizes = [...regularProduct.sizes];
    updatedSizes[index] = value;
    setRegularProduct({ ...regularProduct, sizes: updatedSizes });
  };

  const addRegularSize = () => {
    setRegularProduct({
      ...regularProduct,
      sizes: [...regularProduct.sizes, '']
    });
  };

  const removeRegularSize = (index) => {
    if (regularProduct.sizes.length > 1) {
      const updatedSizes = regularProduct.sizes.filter((_, i) => i !== index);
      setRegularProduct({ ...regularProduct, sizes: updatedSizes });
    }
  };

  // Handle mechanical seal attributes for a specific product size
  const handleMechanicalSealChange = (sizeIndex, field, value) => {
    const updatedAttributes = [...mechanicalSealData.mechanicalSealAttributes];
    
    // Ensure we have an object for this size index
    if (!updatedAttributes[sizeIndex]) {
      updatedAttributes[sizeIndex] = {
        sizes: [],
        descriptions: [],
        material: '',
        temperature: '',
        pressure: '',
        speed: ''
      };
    }
    
    updatedAttributes[sizeIndex][field] = value;
    
    setMechanicalSealData({
      ...mechanicalSealData,
      mechanicalSealAttributes: updatedAttributes
    });
  };

  const addSizeDescription = () => {
    setMechanicalSealData({
      ...mechanicalSealData,
      sizeDescriptions: [...mechanicalSealData.sizeDescriptions, { size: '', description: '' }]
    });
  };

  const removeSizeDescription = (index) => {
    if (mechanicalSealData.sizeDescriptions.length > 1) {
      const updated = [...mechanicalSealData.sizeDescriptions];
      updated.splice(index, 1);
      setMechanicalSealData({
        ...mechanicalSealData,
        sizeDescriptions: updated
      });
    }
  };

  const handleSizeDescriptionChange = (index, field, value) => {
    const updated = [...mechanicalSealData.sizeDescriptions];
    updated[index][field] = value;
    setMechanicalSealData({
      ...mechanicalSealData,
      sizeDescriptions: updated
    });
  };

  // Handle mechanical seal size/description pairs for a specific product size
  const handleMechanicalSealSizeDescriptionChange = (sizeIndex, specIndex, field, value) => {
    const updatedAttributes = [...mechanicalSealData.mechanicalSealAttributes];
    
    // Ensure we have an object for this size index
    if (!updatedAttributes[sizeIndex]) {
      updatedAttributes[sizeIndex] = {
        sizes: [],
        descriptions: [],
        material: '',
        temperature: '',
        pressure: '',
        speed: ''
      };
    }
    
    const isSizeField = field === 'size';
    const targetArray = isSizeField ? 'sizes' : 'descriptions';
    const otherArray = isSizeField ? 'descriptions' : 'sizes';
    
    const updatedSpecs = [...updatedAttributes[sizeIndex][targetArray]];
    const otherSpecs = [...updatedAttributes[sizeIndex][otherArray]];
    
    // Ensure both arrays have enough items to match the specIndex
    while (updatedSpecs.length <= specIndex) {
      updatedSpecs.push('');
    }
    while (otherSpecs.length <= specIndex) {
      otherSpecs.push('');
    }
    
    // Update the target array
    updatedSpecs[specIndex] = value;
    updatedAttributes[sizeIndex][targetArray] = updatedSpecs;
    
    // Ensure the other array has the same length
    updatedAttributes[sizeIndex][otherArray] = otherSpecs;
    
    setMechanicalSealData({
      ...mechanicalSealData,
      mechanicalSealAttributes: updatedAttributes
    });
  };

  const addMechanicalSealSizeDescription = (sizeIndex) => {
    const updatedAttributes = [...mechanicalSealData.mechanicalSealAttributes];
    
    // Ensure we have an object for this size index
    if (!updatedAttributes[sizeIndex]) {
      updatedAttributes[sizeIndex] = {
        sizes: [],
        descriptions: [],
        material: '',
        temperature: '',
        pressure: '',
        speed: ''
      };
    }
    
    // If sizes array is empty, initialize with one empty item
    if (updatedAttributes[sizeIndex].sizes.length === 0) {
      updatedAttributes[sizeIndex].sizes = [''];
      updatedAttributes[sizeIndex].descriptions = [''];
    } else {
      // Add a new empty item
      updatedAttributes[sizeIndex].sizes.push('');
      updatedAttributes[sizeIndex].descriptions.push('');
    }
    
    setMechanicalSealData({
      ...mechanicalSealData,
      mechanicalSealAttributes: updatedAttributes
    });
  };

  const removeMechanicalSealSizeDescription = (sizeIndex, specIndex) => {
    const updatedAttributes = [...mechanicalSealData.mechanicalSealAttributes];
    
    if (updatedAttributes[sizeIndex] && updatedAttributes[sizeIndex].sizes.length > 1) {
      updatedAttributes[sizeIndex].sizes.splice(specIndex, 1);
      updatedAttributes[sizeIndex].descriptions.splice(specIndex, 1);
      
      setMechanicalSealData({
        ...mechanicalSealData,
        mechanicalSealAttributes: updatedAttributes
      });
    }
  };


  const validateForm = () => {
    if (!form.productName.trim()) {
      toast.error('Product name is required', {
        toastId: 'product-name-required',
      });
      return false;
    }
    if (!form.categoryId) {
      toast.error('Please select a category', {
        toastId: 'category-required',
      });
      return false;
    }
    if (images.length === 0) {
      toast.error('Please upload at least one image', {
        toastId: 'image-required',
      });
      return false;
    }

    if (isMechanicalSeal()) {
      const hasValidSizeDescription = mechanicalSealData.sizeDescriptions.some(
        item => item.size.trim() && item.description.trim()
      );
      if (!hasValidSizeDescription) {
        toast.error('Please provide at least one size and description pair', {
          toastId: 'size-desc-required',
        });
        return false;
      }
      
      // Validate mechanical seal attributes for each product size
      for (let i = 0; i < mechanicalSealData.sizeDescriptions.length; i++) {
        const sizeDesc = mechanicalSealData.sizeDescriptions[i];
        if (sizeDesc.size.trim() && sizeDesc.description.trim()) {
          const attr = mechanicalSealData.mechanicalSealAttributes[i];
          if (!attr || !attr.material?.trim() || !attr.temperature?.trim() || 
              !attr.pressure?.trim() || !attr.speed?.trim()) {
            toast.error(`All mechanical seal attributes are required for size: ${sizeDesc.size}`, {
              toastId: `ms-attr-required-${i}`,
            });
            return false;
          }
          
          // Validate that mechanical seal sizes and descriptions have the same length
          if (!attr.sizes || !attr.descriptions || attr.sizes.length !== attr.descriptions.length) {
            toast.error(`Mechanical seal sizes and descriptions must have the same length for product size: ${sizeDesc.size}. Sizes: ${attr.sizes?.length || 0}, Descriptions: ${attr.descriptions?.length || 0}`, {
              toastId: `ms-length-mismatch-${i}`,
            });
            return false;
          }
          
          // Validate that all mechanical seal size/description pairs are filled
          const hasValidMechanicalSpec = attr.sizes.some((size, index) => 
            size.trim() && attr.descriptions[index]?.trim()
          );
          
          if (!hasValidMechanicalSpec) {
            toast.error(`At least one mechanical seal size/description pair is required for product size: ${sizeDesc.size}`, {
              toastId: `ms-spec-required-${i}`,
            });
            return false;
          }
        }
      }
    } else {
      const validSizes = regularProduct.sizes.filter(size => size.trim());
      if (validSizes.length === 0) {
        toast.error('At least one size is required', {
          toastId: 'regular-product-size-required',
        });
        return false;
      }
      if (!regularProduct.description.trim()) {
        toast.error('Description is required', {
          toastId: 'regular-product-description-required',
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FIX: Prevent double submission
    if (loading) {
      console.log('⚠️ Form already submitting, please wait...');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken'); // Changed from 'token' to 'adminToken'

      if (!token) {
        toast.error('Authentication required. Please login again.', {
          toastId: 'auth-required',
        });
        setLoading(false); // ✅ FIX: Reset loading on early return
        navigate('/admin/login');
        return;
      }

      const formData = new FormData();
      formData.append('name', form.productName.trim());
      if (form.productCode.trim()) {
        formData.append('productCode', form.productCode.trim());
      }
      formData.append('categoryId', form.categoryId);

      if (isMechanicalSeal()) {
        const sizes = mechanicalSealData.sizeDescriptions
          .filter(item => item.size.trim())
          .map(item => item.size.trim());
        const descriptions = mechanicalSealData.sizeDescriptions
          .filter(item => item.description.trim())
          .map(item => item.description.trim());
        
        formData.append('sizes', JSON.stringify(sizes));
        formData.append('descriptions', JSON.stringify(descriptions));
        
        // Prepare mechanical seal attributes for each product size
        const mechanicalSealAttributes = [];
        for (let i = 0; i < sizes.length; i++) {
          const attr = mechanicalSealData.mechanicalSealAttributes[i];
          if (attr) {
            // Filter out empty mechanical seal size/description pairs
            const filteredSizes = attr.sizes.filter(size => size.trim());
            const filteredDescriptions = attr.descriptions.filter(desc => desc.trim());
            
            mechanicalSealAttributes.push({
              sizes: filteredSizes,
              descriptions: filteredDescriptions,
              material: attr.material,
              temperature: attr.temperature,
              pressure: attr.pressure,
              speed: attr.speed
            });
          }
        }
        
        formData.append('mechanicalSealAttributes', JSON.stringify(mechanicalSealAttributes));
      } else {
        // For regular products: multiple sizes with same description
        const validSizes = regularProduct.sizes
          .filter(size => size.trim())
          .map(size => size.trim());
        // Duplicate the description for each size
        const descriptions = validSizes.map(() => regularProduct.description.trim());
        formData.append('sizes', JSON.stringify(validSizes));
        formData.append('descriptions', JSON.stringify(descriptions));
      }

      // Append images with correct field name
      images.forEach((file) => {
        formData.append('productImages', file);
      });

      // Use the new API endpoint for products with mechanical seal attributes
      const productResponse = await axios.post(
        buildApiUrl(isMechanicalSeal() ? '/api/products/add' : '/api/products'),
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // ✅ Show success toast only once
      // ✅ CACHE: Dispatch event to invalidate product cache
      window.dispatchEvent(new Event('productUpdated'));
      
      toast.success('Product created successfully!', {
        toastId: 'product-success', // Prevent duplicate toasts
      });
      
      // Reset form
      setForm({ productName: '', productCode: '', categoryId: '' });
      setRegularProduct({ sizes: [''], description: '' });
      setMechanicalSealData({
        sizeDescriptions: [{ size: '', description: '' }],
        mechanicalSealAttributes: []
      });
      setImages([]);
      setCurrentStep(1);
      
      // Redirect to admin page immediately
      navigate('/admin');
      
    } catch (error) {
      console.error('❌ Error creating product:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error request:', error.config);
      
      // Enhanced error handling with detailed messages
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Network error. Please check your connection and ensure the backend server is running.', {
          toastId: 'network-error',
        });
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.', {
          toastId: 'auth-error',
        });
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else if (error.response?.status === 413) {
        toast.error('File too large. Please reduce image size.', {
          toastId: 'file-size-error',
        });
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid data provided';
        toast.error(`Validation Error: ${errorMessage}`, {
          toastId: 'validation-error',
        });
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.', {
          toastId: 'server-error',
        });
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`, {
          toastId: 'api-error',
        });
      } else {
        toast.error(`Failed to create product. Status: ${error.response?.status || 'Unknown'}`, {
          toastId: 'unknown-error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: 'Basic Info', icon: TagIcon },
    { id: 2, name: 'Images', icon: PhotoIcon },
    { id: 3, name: 'Specifications', icon: CogIcon },
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Products
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-6 w-6 text-indigo-600" />
                <h1 className="text-xl font-semibold text-gray-900">Add New Product</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center space-x-8">
            {steps.map((step, stepIdx) => {
              const status = getStepStatus(step.id);
              return (
                <li key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center group">
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                        ${
                          status === 'completed'
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : status === 'current'
                            ? 'border-indigo-600 text-indigo-600 bg-white'
                            : 'border-gray-300 text-gray-500 bg-white'
                        }
                      `}
                    >
                      {status === 'completed' ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`
                        mt-2 text-sm font-medium transition-colors
                        ${
                          status === 'current'
                            ? 'text-indigo-600'
                            : status === 'completed'
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }
                      `}
                    >
                      {step.name}
                    </span>
                  </div>
                  {stepIdx < steps.length - 1 && (
                    <div
                      className={`
                        w-16 h-0.5 ml-4 transition-colors
                        ${
                          step.id < currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                        }
                      `}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <TagIcon className="h-5 w-5 mr-2" />
                  Basic Information
                </h2>
                <p className="text-indigo-100 text-sm mt-1">Enter the fundamental details of your product</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a descriptive product name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 placeholder-gray-500"
                    value={form.productName}
                    onChange={(e) => handleFormChange('productName', e.target.value)}
                    required
                  />
                </div>

                {/* Product Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product code (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 placeholder-gray-500"
                    value={form.productCode}
                    onChange={(e) => handleFormChange('productCode', e.target.value)}
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Category *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                    value={form.categoryId}
                    onChange={(e) => handleFormChange('categoryId', e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {form.categoryId && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Selected:</strong> {categories.find(cat => cat.id === parseInt(form.categoryId))?.name}
                        {isMechanicalSeal() && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Special Category
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!form.productName.trim() || !form.categoryId}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue to Images
                    <ArrowLeftIcon className="ml-2 h-4 w-4 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Image Upload */}
          {currentStep === 2 && (
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  Product Images
                </h2>
                <p className="text-green-100 text-sm mt-1">Upload high-quality images of your product (max 6)</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Image Upload Area */}
                <div
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                    ${
                      dragActive
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">Drop images here or click to upload</p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG, WebP up to 10MB each • Maximum 6 images
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Images Grid */}
                {images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Uploaded Images ({images.length}/6)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleImageRemove(idx)}
                              className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-200 transform scale-90 group-hover:scale-100"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                          {idx === 0 && (
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Primary
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={images.length === 0}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue to Specifications
                    <ArrowLeftIcon className="ml-2 h-4 w-4 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Specifications */}
          {currentStep === 3 && form.categoryId && (
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <CogIcon className="h-5 w-5 mr-2" />
                  Product Specifications
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  {isMechanicalSeal() 
                    ? 'Configure mechanical seal attributes and size variations'
                    : 'Set product size and description'
                  }
                </p>
              </div>
              
              <div className="p-6 space-y-8">

                {!isMechanicalSeal() ? (
                  /* Regular Product Fields - Multiple Sizes with Same Description */
                  <div className="space-y-6">
                    {/* Sizes Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-600" />
                          Product Sizes
                        </h3>
                        <button
                          type="button"
                          onClick={addRegularSize}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Size
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {regularProduct.sizes.map((size, index) => (
                          <div key={index} className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Size {index + 1} *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Small, Medium, Large, 500ml"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                  value={size}
                                  onChange={(e) => handleRegularSizeChange(index, e.target.value)}
                                  required
                                />
                              </div>
                              {regularProduct.sizes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRegularSize(index)}
                                  className="mt-6 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description Section - Single description for all sizes */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Description * (Applies to all sizes)
                      </label>
                      <textarea
                        placeholder="Detailed product description that applies to all sizes"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                        value={regularProduct.description}
                        onChange={(e) => handleRegularProductChange('description', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  /* Mechanical Seal Fields */
                  <div className="space-y-8">
                    {/* Size/Description Pairs */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-600" />
                          Size & Description Variations
                        </h3>
                        <button
                          type="button"
                          onClick={addSizeDescription}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Variation
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {mechanicalSealData.sizeDescriptions.map((item, index) => (
                          <div key={index} className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Size {index + 1} *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., 25mm, 50mm, 3/4 inch"
                                  value={item.size}
                                  onChange={(e) => handleSizeDescriptionChange(index, 'size', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Description {index + 1} *
                                </label>
                                <textarea
                                  placeholder="Description for this size variant"
                                  rows={2}
                                  value={item.description}
                                  onChange={(e) => handleSizeDescriptionChange(index, 'description', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                                  required
                                />
                              </div>
                            </div>
                            {mechanicalSealData.sizeDescriptions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSizeDescription(index)}
                                className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mechanical Seal Attributes for each product size */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <CogIcon className="h-5 w-5 mr-2 text-purple-600" />
                        Mechanical Seal Attributes
                      </h3>
                      
                      {mechanicalSealData.sizeDescriptions.map((sizeDesc, sizeIndex) => {
                        if (!sizeDesc.size.trim() || !sizeDesc.description.trim()) return null;
                        
                        // Ensure we have a proper mechanical seal attributes object for this size
                        if (!mechanicalSealData.mechanicalSealAttributes[sizeIndex]) {
                          const updatedAttributes = [...mechanicalSealData.mechanicalSealAttributes];
                          updatedAttributes[sizeIndex] = {
                            sizes: [''],
                            descriptions: [''],
                            material: '',
                            temperature: '',
                            pressure: '',
                            speed: ''
                          };
                          setMechanicalSealData({
                            ...mechanicalSealData,
                            mechanicalSealAttributes: updatedAttributes
                          });
                        }
                        
                        const currentAttr = mechanicalSealData.mechanicalSealAttributes[sizeIndex] || {
                          sizes: [''],
                          descriptions: [''],
                          material: '',
                          temperature: '',
                          pressure: '',
                          speed: ''
                        };
                        
                        return (
                          <div key={sizeIndex} className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                            <h4 className="text-md font-medium text-purple-900 mb-4">
                              Attributes for Size: {sizeDesc.size}
                            </h4>
                            
                            {/* Technical Specifications */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Material *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Carbon, Ceramic, Silicon Carbide"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                  value={currentAttr.material}
                                  onChange={(e) => handleMechanicalSealChange(sizeIndex, 'material', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Temperature Range *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., -20°C to +200°C"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                  value={currentAttr.temperature}
                                  onChange={(e) => handleMechanicalSealChange(sizeIndex, 'temperature', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Pressure Rating *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., 0-16 bar, 0-25 bar"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                  value={currentAttr.pressure}
                                  onChange={(e) => handleMechanicalSealChange(sizeIndex, 'pressure', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Speed Rating *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., 0-3600 RPM"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                  value={currentAttr.speed}
                                  onChange={(e) => handleMechanicalSealChange(sizeIndex, 'speed', e.target.value)}
                                  required
                                />
                              </div>
                            </div>

                            {/* Mechanical Seal Size/Description Variations */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-sm font-medium text-purple-800">
                                    Mechanical Seal Specifications
                                  </h5>
                                  <p className="text-xs text-purple-600 mt-1">
                                    Add technical specifications for this product size (e.g., D1, D3, D7 for dimensions)
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addMechanicalSealSizeDescription(sizeIndex)}
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                                >
                                  <PlusIcon className="h-4 w-4 mr-1" />
                                  Add Specification
                                </button>
                              </div>
                              
                              <div className="space-y-3">
                                {currentAttr.sizes.map((size, specIndex) => (
                                  <div key={specIndex} className="relative bg-white rounded-lg p-4 border border-purple-200">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                          Mechanical Seal Size {specIndex + 1} *
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="e.g., 12mm, 26mm, 24mm"
                                          value={size}
                                          onChange={(e) => handleMechanicalSealSizeDescriptionChange(sizeIndex, specIndex, 'size', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                          Mechanical Seal Description {specIndex + 1} *
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="e.g., D1, D3, D7, L(+-0.3)"
                                          value={currentAttr.descriptions[specIndex] || ''}
                                          onChange={(e) => handleMechanicalSealSizeDescriptionChange(sizeIndex, specIndex, 'description', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                          required
                                        />
                                      </div>
                                    </div>
                                    {currentAttr.sizes.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeMechanicalSealSizeDescription(sizeIndex, specIndex)}
                                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                      >
                                        <XMarkIcon className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                
                                {/* Show message when no specifications exist */}
                                {currentAttr.sizes.length === 0 && (
                                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                                    <p className="text-gray-500 text-sm">
                                      No specifications added yet. Click "Add Specification" to get started.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/admin')}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Product...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          Create Product
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddProduct;