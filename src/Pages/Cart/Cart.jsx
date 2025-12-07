import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { AuthContext } from '../../context/AuthContext';
import { openWhatsApp } from '../../utils/whatsappUtils';
import { buildApiUrl } from '../../config/api';
import { getFullImageUrl } from '../../utils/imageUtils';

const Cart = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});

  // Process product images similar to Product.jsx
  const processProductImages = (product) => {
    if (!product.pic) return [];
    
    try {
      const images = JSON.parse(product.pic);
      return Array.isArray(images) ? images : [images];
    } catch (error) {
      console.error('Error parsing product images:', error);
      return [product.pic];
    }
  };

  const normalizeImagePath = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    if (imagePath.startsWith('/uploads/')) {
      return getFullImageUrl(imagePath);
    }
    if (imagePath.startsWith('uploads/')) {
      return getFullImageUrl(`/${imagePath}`);
    }
    return getFullImageUrl(`/uploads/products/${imagePath.replace(/^\//, '')}`);
  };

  const constructImageUrls = (images) => {
    if (!images || images.length === 0) return [];
    return images
      .map(normalizeImagePath)
      .filter(Boolean);
  };

  // Navigate to product details
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // ✅ FIX: Fetch cart items with AbortController for cleanup
  const fetchCartItems = useCallback(async (signal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        buildApiUrl(`/api/cart/${user.id}`),
        {
          headers: { Authorization: `Bearer ${token}` },
          signal // ✅ FIX: Pass AbortSignal to axios
        }
      );
      setCartItems(response.data);

      // Initialize selected sizes for items that have multiple sizes
      const initialSizes = {};
      response.data.forEach(item => {
        if (item.sizes && item.sizes.length > 1) {
          // If item already has a size, use it; otherwise use the first available size
          initialSizes[item.cart_item_id] = item.size || item.sizes[0];
        }
      });
      setSelectedSizes(initialSizes);
    } catch (error) {
      // ✅ FIX: Don't show error if request was aborted
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        console.log('Cart fetch was cancelled');
        return;
      }
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items', {
        toastId: 'cart-load-error'
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ✅ FIX: Add AbortController to cleanup on unmount
  useEffect(() => {
    if (!user) return;

    const abortController = new AbortController();
    fetchCartItems(abortController.signal);

    return () => {
      abortController.abort(); // ✅ FIX: Cleanup on unmount
    };
  }, [user, fetchCartItems]);

  const getProductImages = (product) => {
    if (!product.pic) return [];  
    
    let imageArray = [];
    
    try {
      if (Array.isArray(product.pic)) {
        imageArray = product.pic;
      } else if (typeof product.pic === 'string') {
        if (product.pic.startsWith('{') && product.pic.endsWith('}')) {
          // Handle Postgres TEXT[] format: {"url1","url2"}
          console.log('Raw TEXT[] format:', product.pic);
          const cleanedString = product.pic
            .replace(/[{}"]/g, '') // Remove {, }, and " characters
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);
          imageArray = cleanedString;
        } else {
          try {
            imageArray = JSON.parse(product.pic);
          } catch {
            imageArray = [product.pic];
          }
        }
      }
    } catch (error) {
      console.error('Error processing product images:', error);
      return [];
    }

    // Construct full URLs
    return imageArray
      .map(normalizeImagePath)
      .filter(Boolean);
  };

  // Handle item selection
  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Select all items
  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.cart_item_id)));
    }
  };

  // Update quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        buildApiUrl(`/api/cart/update/${itemId}`),
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCartItems(prev => 
        prev.map(item => 
          item.cart_item_id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      toast.error('Failed to update quantity', {
        toastId: 'cart-update-quantity-error'
      });
    } finally {
      setUpdating(false);
    }
  };

  // Update size
  const updateSize = async (itemId, newSize) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        buildApiUrl(`/api/cart/update/${itemId}`),
        { size: newSize },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state immediately for better UX
      setSelectedSizes(prev => ({
        ...prev,
        [itemId]: newSize
      }));
      
      setCartItems(prev => 
        prev.map(item => 
          item.cart_item_id === itemId 
            ? { ...item, size: newSize }
            : item
        )
      );
      
      toast.success('Size updated successfully', {
        toastId: 'cart-update-size-success'
      });
    } catch (error) {
      console.error('Error updating size:', error);
      toast.error('Failed to update size', {
        toastId: 'cart-update-size-error'
      });
    } finally {
      setUpdating(false);
    }
  };

  // Remove item
  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        buildApiUrl(`/api/cart/remove/${itemId}`),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCartItems(prev => prev.filter(item => item.cart_item_id !== itemId));
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(itemId);
        return newSelected;
      });
      
      toast.success('Item removed from cart', {
        toastId: 'cart-remove-item-success'
      });
    } catch (error) {
      toast.error('Failed to remove item', {
        toastId: 'cart-remove-item-error'
      });
    }
  };

  // Get selected items
  const getSelectedItems = () => {
    return cartItems.filter(item => selectedItems.has(item.cart_item_id));
  };

  // Handle order
  const handleOrder = async () => {
    const selected = getSelectedItems();
    if (selected.length === 0) {
      toast.warning('Please select items to order', {
        toastId: 'cart-order-select-items-warning'
      });
      return;
    }
    
    try {
      const orderData = {
        userId: user.id,
        type: 'Order',
        items: selected.map(item => ({
          name: item.name,
          category_name: item.category_name,
          size: selectedSizes[item.cart_item_id] || item.size,
          quantity: item.quantity
        }))
      };
      
      await openWhatsApp(orderData);
      toast.success('Order request sent to WhatsApp!', {
        toastId: 'cart-order-success'
      });
    } catch (error) {
      toast.error('Failed to send order request', {
        toastId: 'cart-order-error'
      });
    }
  };

  // Handle inquiry
  const handleInquiry = async () => {
    const selected = getSelectedItems();
    if (selected.length === 0) {
      toast.warning('Please select items for inquiry', {
        toastId: 'cart-inquiry-select-items-warning'
      });
      return;
    }
    
    try {
      const orderData = {
        userId: user.id,
        type: 'Inquiry',
        items: selected.map(item => ({
          name: item.name,
          category_name: item.category_name,
          size: selectedSizes[item.cart_item_id] || item.size,
          quantity: item.quantity
        }))
      };
      
      await openWhatsApp(orderData);
      toast.success('Inquiry request sent to WhatsApp!', {
        toastId: 'cart-inquiry-success'
      });
    } catch (error) {
      toast.error('Failed to send inquiry request', {
        toastId: 'cart-inquiry-error'
      });
    }
  };

  // Handle quote request
  const handleQuoteRequest = async () => {
    const selected = getSelectedItems();
    if (selected.length === 0) {
      toast.warning('Please select items for quote request', {
        toastId: 'cart-quote-select-items-warning'
      });
      return;
    }
    
    try {
      const orderData = {
        userId: user.id,
        type: 'Quote',
        items: selected.map(item => ({
          name: item.name,
          category_name: item.category_name,
          size: selectedSizes[item.cart_item_id] || item.size,
          quantity: item.quantity
        }))
      };
      
      await openWhatsApp(orderData);
      toast.success('Quote request sent to WhatsApp!', {
        toastId: 'cart-quote-success'
      });
    } catch (error) {
      toast.error('Failed to send quote request', {
        toastId: 'cart-quote-error'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors self-start"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <ShoppingCartIcon className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold">My Cart</h1>
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                {cartItems.length} items
              </span>
            </div>
          </div>
          
          {cartItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end w-full md:w-auto">
              <button
                onClick={handleSelectAll}
                className="text-red-400 hover:text-red-300 font-medium"
              >
                {selectedItems.size === cartItems.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-gray-400">
                {selectedItems.size} of {cartItems.length} selected
              </span>
            </div>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCartIcon className="h-24 w-24 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Add some products to get started</p>
            <button
              onClick={() => navigate('/product')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => {
                // Use the robust image handling function
                const images = getProductImages(item);
                const imageUrl = images[0] || '/placeholder-image.jpg';
                
                return (
                  <div
                    key={item.cart_item_id}
                    className={`bg-gray-800 rounded-lg p-6 transition-all ${
                      selectedItems.has(item.cart_item_id) 
                        ? 'ring-2 ring-red-500 bg-gray-750' 
                        : 'hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.cart_item_id)}
                        onChange={() => handleItemSelect(item.cart_item_id)}
                        className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                      />
                      
                      {/* Product Image - Clickable */}
                      <div 
                        className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleProductClick(item.product_id)}
                      >
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                      
                      {/* Product Info - Clickable */}
                      <div 
                        className="flex-1 cursor-pointer hover:text-red-400 transition-colors"
                        onClick={() => handleProductClick(item.product_id)}
                      >
                        <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{item.category_name}</p>
                        {(selectedSizes[item.cart_item_id] || item.size) && (
                          <p className="text-red-400 text-sm">
                            Size: {selectedSizes[item.cart_item_id] || item.size}
                          </p>
                        )}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                          disabled={updating || item.quantity <= 1}
                          className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                          disabled={updating}
                          className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Size Selection - Only show if product has multiple sizes */}
                      {item.sizes && item.sizes.length > 1 && (
                        <div className="flex flex-col space-y-1 w-full sm:w-auto">
                          <label className="text-xs text-gray-400">Size:</label>
                          <select
                            value={selectedSizes[item.cart_item_id] || item.size || item.sizes[0]}
                            onChange={(e) => updateSize(item.cart_item_id, e.target.value)}
                            disabled={updating}
                            className="w-full sm:w-auto px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                          >
                            {item.sizes.map((size, index) => (
                              <option key={index} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.cart_item_id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleOrder}
                  disabled={selectedItems.size === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCardIcon className="h-5 w-5" />
                  <span>Order Selected ({selectedItems.size})</span>
                </button>
                
                <button
                  onClick={handleInquiry}
                  disabled={selectedItems.size === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <span>Send Inquiry ({selectedItems.size})</span>
                </button>
                
                <button
                  onClick={handleQuoteRequest}
                  disabled={selectedItems.size === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>Request Quote ({selectedItems.size})</span>
                </button>
              </div>
              
              {selectedItems.size === 0 && (
                <p className="text-gray-400 text-center mt-4">
                  Select items to enable actions
                </p>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default Cart;