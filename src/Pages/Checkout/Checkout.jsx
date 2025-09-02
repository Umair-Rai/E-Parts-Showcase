import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  CreditCardIcon,
  TruckIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { AuthContext } from '../../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  
  // Get items from cart page
  const items = location.state?.items || [];
  
  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.number || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, card, bank
  const [orderNotes, setOrderNotes] = useState('');
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!items || items.length === 0) {
      toast.error('No items selected for checkout');
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, items, navigate]);
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price || 0);
    return sum + (price * item.quantity);
  }, 0);
  
  const shippingCost = subtotal > 100 ? 0 : 15; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (let field of required) {
      if (!shippingInfo[field].trim()) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        customerId: user.id,
        items: items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          size: item.size,
          price: parseFloat(item.price || 0)
        })),
        shippingInfo,
        paymentMethod,
        orderNotes,
        subtotal,
        shippingCost,
        tax,
        total,
        status: 'pending'
      };
      
      const response = await axios.post(
        'http://localhost:5000/api/orders/create',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Clear cart items that were ordered
      const cartItemIds = items.map(item => item.cart_item_id);
      await axios.post(
        'http://localhost:5000/api/cart/remove-multiple',
        { itemIds: cartItemIds },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Order placed successfully!');
      navigate('/order-confirmation', { 
        state: { 
          orderId: response.data.orderId,
          orderData 
        } 
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
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
            <CreditCardIcon className="h-8 w-8 text-green-500" />
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <TruckIcon className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold">Shipping Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <UserIcon className="h-4 w-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
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
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <PhoneIcon className="h-4 w-4 inline mr-2" />
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPinIcon className="h-4 w-4 inline mr-2" />
                    Country *
                  </label>
                  <select
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="India">India</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your street address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your city"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">State/Province *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your state/province"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">ZIP/Postal Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your ZIP/postal code"
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCardIcon className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-lg">Cash on Delivery (COD)</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-lg">Credit/Debit Card</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-lg">Bank Transfer</span>
                </label>
              </div>
            </div>
            
            {/* Order Notes */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Order Notes (Optional)</h2>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                placeholder="Any special instructions for your order..."
              />
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.cart_item_id} className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
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
                    <div className="text-right">
                      <p className="font-semibold">${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Place Order Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Place Order</span>
                  </>
                )}
              </button>
              
              {/* Security Notice */}
              <div className="mt-4 text-xs text-gray-400 text-center">
                <p>🔒 Your payment information is secure and encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;