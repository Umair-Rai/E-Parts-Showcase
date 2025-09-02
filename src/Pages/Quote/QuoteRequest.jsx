import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { AuthContext } from '../../context/AuthContext';

const QuoteRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  
  // Get items from cart page
  const items = location.state?.items || [];
  
  // Form states
  const [quoteForm, setQuoteForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.number || '',
    company: '',
    jobTitle: '',
    industry: '',
    projectDescription: '',
    estimatedQuantity: '',
    timeline: '',
    budget: '',
    additionalRequirements: '',
    urgency: 'normal' // urgent, normal, flexible
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!items || items.length === 0) {
      toast.error('No items selected for quote request');
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, items, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    const required = ['name', 'email', 'company', 'projectDescription', 'estimatedQuantity'];
    for (let field of required) {
      if (!quoteForm[field].trim()) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(quoteForm.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  const handleSubmitQuote = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const quoteData = {
        customerId: user.id,
        ...quoteForm,
        products: items.map(item => ({
          productId: item.product_id,
          productName: item.name,
          requestedQuantity: item.quantity,
          size: item.size
        })),
        status: 'pending',
        totalItems: items.length
      };
      
      await axios.post(
        'http://localhost:5000/api/quotes/create',
        quoteData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Quote request submitted successfully! We will prepare your quote within 48 hours.');
      navigate('/profile', { state: { activeTab: 'quotes' } });
      
    } catch (error) {
      console.error('Error submitting quote request:', error);
      toast.error(error.response?.data?.error || 'Failed to submit quote request');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Calculate total estimated quantity
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl font-bold">Request Quote</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Quote Request Details</h2>
              
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-blue-400">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <UserIcon className="h-4 w-4 inline mr-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={quoteForm.name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <EnvelopeIcon className="h-4 w-4 inline mr-2" />
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={quoteForm.email}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <PhoneIcon className="h-4 w-4 inline mr-2" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={quoteForm.phone}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <BuildingOfficeIcon className="h-4 w-4 inline mr-2" />
                        Company *
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={quoteForm.company}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your company name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Job Title</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={quoteForm.jobTitle}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your job title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Industry</label>
                      <select
                        name="industry"
                        value={quoteForm.industry}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Industry</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="oil-gas">Oil & Gas</option>
                        <option value="chemical">Chemical Processing</option>
                        <option value="water-treatment">Water Treatment</option>
                        <option value="power-generation">Power Generation</option>
                        <option value="mining">Mining</option>
                        <option value="marine">Marine</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Project Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-purple-400">Project Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Project Description *</label>
                      <textarea
                        name="projectDescription"
                        value={quoteForm.projectDescription}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows="4"
                        placeholder="Describe your project and how these products will be used..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Estimated Total Quantity *</label>
                        <input
                          type="text"
                          name="estimatedQuantity"
                          value={quoteForm.estimatedQuantity}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., 100 units, 50 sets"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <CalendarIcon className="h-4 w-4 inline mr-2" />
                          Project Timeline
                        </label>
                        <input
                          type="text"
                          name="timeline"
                          value={quoteForm.timeline}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., 3 months, Q2 2024"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Budget Range (Optional)</label>
                        <select
                          name="budget"
                          value={quoteForm.budget}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select Budget Range</option>
                          <option value="under-1k">Under $1,000</option>
                          <option value="1k-5k">$1,000 - $5,000</option>
                          <option value="5k-10k">$5,000 - $10,000</option>
                          <option value="10k-25k">$10,000 - $25,000</option>
                          <option value="25k-50k">$25,000 - $50,000</option>
                          <option value="over-50k">Over $50,000</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Urgency Level</label>
                        <select
                          name="urgency"
                          value={quoteForm.urgency}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="flexible">Flexible Timeline</option>
                          <option value="normal">Normal Priority</option>
                          <option value="urgent">Urgent - Need ASAP</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Requirements</label>
                      <textarea
                        name="additionalRequirements"
                        value={quoteForm.additionalRequirements}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows="3"
                        placeholder="Any special requirements, certifications, or customizations needed..."
                      />
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <button
                  onClick={handleSubmitQuote}
                  disabled={submitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5" />
                      <span>Submit Quote Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column - Selected Products & Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Quote Summary</h2>
              
              {/* Selected Products */}
              <div className="mb-6">
                <h3 className="font-medium mb-4">Selected Products ({items.length})</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.cart_item_id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                        <img
                          src={item.pic || '/placeholder-image.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-gray-400 text-xs">
                          {item.size && `Size: ${item.size} • `}
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-purple-900/30 rounded-lg">
                  <p className="text-sm text-purple-300">
                    <strong>Total Items:</strong> {totalQuantity} units
                  </p>
                </div>
              </div>
              
              {/* Quote Process Info */}
              <div className="bg-purple-900/30 rounded-lg p-4">
                <h3 className="font-semibold text-purple-400 mb-3">Quote Process</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">1.</span>
                    <span>Submit your detailed requirements</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">2.</span>
                    <span>Our team reviews and analyzes your needs</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">3.</span>
                    <span>Receive detailed quote within 48 hours</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">4.</span>
                    <span>Schedule consultation if needed</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-4 text-xs text-gray-400 text-center">
                <p>💼 Professional quotes for bulk orders</p>
                <p>🔒 Your information is kept confidential</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequest;