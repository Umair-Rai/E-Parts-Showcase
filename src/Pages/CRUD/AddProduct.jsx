import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    categoryId: ''
    // adminId removed - this is correct
  });
  
  // In handleSubmit, remove this line:
  // formData.append('adminId', form.adminId);

  // For regular products (non-mechanical seal)
  const [regularProduct, setRegularProduct] = useState({
    size: '',
    description: ''
  });

  // For mechanical seal products
  const [mechanicalSealData, setMechanicalSealData] = useState({
    sizeDescriptions: [{ size: '', description: '' }],
    attributes: {
      material: '',
      temperature: '',
      pressure: '',
      speed: ''
    }
  });

  // For technical specifications (separate from mechanical seal attributes)
  const [technicalSpecs, setTechnicalSpecs] = useState([
    { size: '', description: '' }
  ]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken'); // Changed from 'token' to 'adminToken'
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  // Check if selected category is mechanical seal
  const isMechanicalSeal = () => {
    const selectedCategory = categories.find(cat => cat.id === parseInt(form.categoryId));
    return selectedCategory?.name?.toLowerCase() === 'mechanical seals';
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
      setRegularProduct({ size: '', description: '' });
      setMechanicalSealData({
        sizeDescriptions: [{ size: '', description: '' }],
        attributes: {
          material: '',
          temperature: '',
          pressure: '',
          speed: ''
        }
      });
      setTechnicalSpecs([{ size: '', description: '' }]);
    }
  };

  const handleRegularProductChange = (field, value) => {
    setRegularProduct({ ...regularProduct, [field]: value });
  };

  const handleMechanicalSealChange = (field, value) => {
    setMechanicalSealData({
      ...mechanicalSealData,
      attributes: {
        ...mechanicalSealData.attributes,
        [field]: value
      }
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

  // Technical Specifications functions
  const addTechnicalSpec = () => {
    setTechnicalSpecs([...technicalSpecs, { size: '', description: '' }]);
  };

  const removeTechnicalSpec = (index) => {
    if (technicalSpecs.length > 1) {
      const updated = [...technicalSpecs];
      updated.splice(index, 1);
      setTechnicalSpecs(updated);
    }
  };

  const handleTechnicalSpecChange = (index, field, value) => {
    const updated = [...technicalSpecs];
    updated[index][field] = value;
    setTechnicalSpecs(updated);
  };

  const validateForm = () => {
    if (!form.productName.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!form.categoryId) {
      toast.error('Please select a category');
      return false;
    }
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return false;
    }

    if (isMechanicalSeal()) {
      const hasValidSizeDescription = mechanicalSealData.sizeDescriptions.some(
        item => item.size.trim() && item.description.trim()
      );
      if (!hasValidSizeDescription) {
        toast.error('Please provide at least one size and description pair');
        return false;
      }
      
      const { material, temperature, pressure, speed } = mechanicalSealData.attributes;
      if (!material.trim() || !temperature.trim() || !pressure.trim() || !speed.trim()) {
        toast.error('All mechanical seal attributes are required');
        return false;
      }

      // Validate technical specifications
      const hasValidTechnicalSpec = technicalSpecs.some(
        spec => spec.size.trim() && spec.description.trim()
      );
      
      if (!hasValidTechnicalSpec) {
        toast.error('At least one technical specification with size and description is required');
        return false;
      }
    } else {
      if (!regularProduct.size.trim() || !regularProduct.description.trim()) {
        toast.error('Size and description are required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken'); // Changed from 'token' to 'adminToken'
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        navigate('/admin/login');
        return;
      }

      const formData = new FormData();
      formData.append('name', form.productName.trim());
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
      } else {
        formData.append('sizes', JSON.stringify([regularProduct.size.trim()]));
        formData.append('descriptions', JSON.stringify([regularProduct.description.trim()]));
      }

      // Fix: Append images with correct field name
      images.forEach((file) => {
        formData.append('productImages', file);
      });

      const productResponse = await axios.post(
        'http://localhost:5000/api/products',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const productId = productResponse.data.id;

      if (isMechanicalSeal()) {
        // Prepare sizes and descriptions from technical specifications
        const specSizes = technicalSpecs
          .filter(spec => spec.size.trim())
          .map(spec => spec.size.trim());
        const specDescriptions = technicalSpecs
          .filter(spec => spec.description.trim())
          .map(spec => spec.description.trim());

        // Send all mechanical seal data in one API call
        await axios.post(
          'http://localhost:5000/api/mechanical-seal-attributes',
          {
            productId,
            sizes: specSizes,
            descriptions: specDescriptions,
            ...mechanicalSealData.attributes
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      toast.success('Product created successfully!');
      
      // Reset form - REMOVE adminId reference
      setForm({ productName: '', categoryId: '' }); // Removed adminId reference
      setRegularProduct({ size: '', description: '' });
      setMechanicalSealData({
        sizeDescriptions: [{ size: '', description: '' }],
        attributes: { material: '', temperature: '', pressure: '', speed: '' }
      });
      setTechnicalSpecs([{ size: '', description: '' }]);
      setImages([]);
      setCurrentStep(1);
      
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
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
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mt-16"
      />
      
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
                  /* Regular Product Fields */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Size *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Small, Medium, Large, 500ml"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        value={regularProduct.size}
                        onChange={(e) => handleRegularProductChange('size', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Description *
                      </label>
                      <textarea
                        placeholder="Detailed product description"
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

                    {/* Mechanical Seal Attributes */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <CogIcon className="h-5 w-5 mr-2 text-purple-600" />
                        Technical Specifications
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Material *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Carbon, Ceramic, Silicon Carbide"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            value={mechanicalSealData.attributes.material}
                            onChange={(e) => handleMechanicalSealChange('material', e.target.value)}
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
                            value={mechanicalSealData.attributes.temperature}
                            onChange={(e) => handleMechanicalSealChange('temperature', e.target.value)}
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
                            value={mechanicalSealData.attributes.pressure}
                            onChange={(e) => handleMechanicalSealChange('pressure', e.target.value)}
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
                            value={mechanicalSealData.attributes.speed}
                            onChange={(e) => handleMechanicalSealChange('speed', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Technical Specifications - Size & Description Variations */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-gray-900 flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-2 text-indigo-600" />
                          Technical Specifications - Size & Description Variations
                        </h4>
                        <button
                          type="button"
                          onClick={addTechnicalSpec}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Specification
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {technicalSpecs.map((spec, index) => (
                          <div key={index} className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Specification Size {index + 1} *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., 12mm, 25mm, 1 inch"
                                  value={spec.size}
                                  onChange={(e) => handleTechnicalSpecChange(index, 'size', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Specification Description {index + 1} *
                                </label>
                                <textarea
                                  placeholder="Technical description for this specification"
                                  rows={2}
                                  value={spec.description}
                                  onChange={(e) => handleTechnicalSpecChange(index, 'description', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                                  required
                                />
                              </div>
                            </div>
                            {technicalSpecs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTechnicalSpec(index)}
                                className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
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