import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { AuthContext } from '../../context/AuthContext';

const Inquiry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  
  // Get items from cart page
  const items = location.state?.items || [];
  
  // Form states
  const [inquiryForm, setInquiryForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.number || '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'product' // product, technical, pricing, general
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!items || items.length === 0) {
      toast.error('No items selected for inquiry');
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, items, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInquiryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    const required = ['name', 'email', 'subject', 'message'];
    for (let field of required) {
      if (!inquiryForm[field].trim()) {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquiryForm.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  const handleSubmitInquiry = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const inquiryData = {
        customerId: user.id,
        ...inquiryForm,
        products: items.map(item => ({
          productId: item.product_id,
          productName: item.name,
          quantity: item.quantity,
          size: item.size
        })),
        status: 'pending'
      };
      
      await axios.post(
        'http://localhost:5000/api/inquiries/create',
        inquiryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Inquiry submitted successfully! We will contact you soon.');
      navigate('/profile', { state: { activeTab: 'inquiries' } });
      
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error(error.response?.data?.error || 'Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };
  
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
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Product Inquiry</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Send Your Inquiry</h2>
              
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <UserIcon className="h-4 w-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={inquiryForm.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={inquiryForm.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={inquiryForm.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={inquiryForm.company}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your company name (optional)"
                    />
                  </div>
                </div>
                
                {/* Inquiry Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Inquiry Type</label>
                  <select
                    name="inquiryType"
                    value={inquiryForm.inquiryType}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="product">Product Information</option>
                    <option value="technical">Technical Support</option>
                    <option value="pricing">Pricing & Availability</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
                
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={inquiryForm.subject}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter inquiry subject"
                  />
                </div>
                
                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={inquiryForm.message}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="6"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>
                
                {/* Submit Button */}
                <button
                  onClick={handleSubmitInquiry}
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5" />
                      <span>Send Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column - Selected Products */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Selected Products</h2>
              
              <div className="space-y-4">
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
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-gray-400 text-xs">
                        {item.size && `Size: ${item.size} • `}
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-900/30 rounded-lg">
                <h3 className="font-semibold text-blue-400 mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• We'll review your inquiry within 24 hours</li>
                  <li>• Our experts will contact you directly</li>
                  <li>• Get personalized recommendations</li>
                  <li>• Receive detailed product information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inquiry;