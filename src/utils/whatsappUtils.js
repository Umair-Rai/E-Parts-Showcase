// WhatsApp utility functions for order redirection

import { BACKEND_URL } from '../config/api';

const WHATSAPP_NUMBER = "+966535276218";

/**
 * Fetch customer details from database
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Customer details
 */
export const fetchCustomerDetails = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BACKEND_URL}/api/customers/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch customer details');
    }
    
    const customerData = await response.json();
    return {
      name: customerData.name || 'N/A',
      email: customerData.email || 'N/A',
      phone: customerData.number || 'N/A'
    };
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return {
      name: 'N/A',
      email: 'N/A',
      phone: 'N/A'
    };
  }
};

/**
 * Generate simplified WhatsApp message with order details
 * @param {Object} orderData - Order information
 * @param {string} orderData.type - Type of request (Order, Inquiry, Quote)
 * @param {Object} orderData.customer - Customer details
 * @param {Array} orderData.items - Array of items with product details
 * @returns {string} - Formatted WhatsApp message
 */
export const generateWhatsAppMessage = (orderData) => {
  const { type, customer, items } = orderData;
  
  let messageText = `Name: ${customer.name}\n`;
  messageText += `Number: ${customer.phone}\n`;
  messageText += `Email: ${customer.email}\n`;
  messageText += `Type: ${type}\n\n`;
  
  // Product details
  items.forEach((item, index) => {
    messageText += `Product Name: ${item.name}\n`;
    messageText += `Product Category: ${item.category_name || 'N/A'}\n`;
    messageText += `Product Size: ${item.size || 'N/A'}\n`;
    messageText += `Product Quantity: ${item.quantity}\n\n`;
  });
  
  messageText += `Hello! I'm interested in your electro-mechanical Products.`;
  
  return messageText;
};

/**
 * Open WhatsApp with pre-filled message
 * @param {Object} orderData - Order information
 */
export const openWhatsApp = async (orderData) => {
  const { userId, type, items } = orderData;
  
  // Fetch customer details from database
  const customer = await fetchCustomerDetails(userId);
  
  const messageData = {
    type,
    customer,
    items
  };
  
  const message = generateWhatsAppMessage(messageData);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};

/**
 * Generate simplified WhatsApp message for single product
 * @param {Object} productData - Product information
 * @param {string} productData.type - Type of request (Order, Inquiry, Quote)
 * @param {Object} productData.customer - Customer details
 * @param {Object} productData.product - Product details
 * @param {string} productData.size - Selected size
 * @param {number} productData.quantity - Quantity
 * @returns {string} - Formatted WhatsApp message
 */
export const generateSingleProductMessage = (productData) => {
  const { type, customer, product, size, quantity } = productData;
  
  let messageText = `Name: ${customer.name}\n`;
  messageText += `Number: ${customer.phone}\n`;
  messageText += `Email: ${customer.email}\n`;
  messageText += `Type: ${type}\n`;
  messageText += `Product Name: ${product.name}\n`;
  messageText += `Product Category: ${product.category_name || 'N/A'}\n`;
  messageText += `Product Size: ${size || 'N/A'}\n`;
  messageText += `Product Quantity: ${quantity}\n\n`;
  
  messageText += `Hello! I'm interested in your electro-mechanical Products.`;
  
  return messageText;
};

/**
 * Open WhatsApp for single product
 * @param {Object} productData - Product information
 */
export const openWhatsAppForProduct = async (productData) => {
  const { userId, type, product, size, quantity } = productData;
  
  // Fetch customer details from database
  const customer = await fetchCustomerDetails(userId);
  
  const messageData = {
    type,
    customer,
    product,
    size,
    quantity
  };
  
  const message = generateSingleProductMessage(messageData);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};
