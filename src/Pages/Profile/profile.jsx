import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

/**
 * CustomerProfile Component
 * Displays customer profile information with tabs for orders, wishlist, addresses, and settings
 * Integrates with backend APIs for real-time data fetching and updates
 */
const CustomerProfile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useContext(AuthContext);
  
  // State management
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Profile form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    number: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false
  });

  // Move all useEffect hooks to the top level (unconditional)
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        number: user.number || ""
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch customer details, orders, and cart in parallel
        const [ordersRes, cartRes] = await Promise.all([
          axios.get('http://localhost:5000/api/orders', { headers }),
          axios.get(`http://localhost:5000/api/cart/${user.id}`, { headers })
        ]);

        // Filter orders for current customer
        const customerOrders = ordersRes.data.filter(order => order.customer_id === user.id);
        setOrders(customerOrders);
        setCartItems(cartRes.data);
        
        // Set placeholder data for wishlist and addresses
        setWishlist([]);
        setAddresses([]);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load profile data');
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Check authentication and redirect if necessary
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    } else if (user && (user.role === 'seller' || user.role === 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Early returns after all hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Profile</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(cartItems.filter(item => item.id !== itemId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateCartQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/cart/update/${itemId}`, 
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const addAddress = () => {
    if (newAddress.street && newAddress.city && newAddress.state) {
      const address = {
        id: Date.now(),
        ...newAddress
      };
      setAddresses([...addresses, address]);
      setNewAddress({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        isDefault: false
      });
      toast.success('Address added successfully');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const removeAddress = (addressId) => {
    setAddresses(addresses.filter(addr => addr.id !== addressId));
    toast.success('Address removed');
  };

  const setDefaultAddress = (addressId) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
    toast.success('Default address updated');
  };

  const addToWishlist = (product) => {
    if (!wishlist.find(item => item.id === product.id)) {
      setWishlist([...wishlist, product]);
      toast.success('Added to wishlist');
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(wishlist.filter(item => item.id !== productId));
    toast.success('Removed from wishlist');
  };

  // Render functions
  const renderOrders = () => {
    if (orders.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400 mt-2">Start shopping to see your orders here!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                <p className="text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColor(order.status)
              }`}>
                {order.status}
              </span>
            </div>
            <div className="border-t pt-4">
              <p className="text-gray-700"><strong>Total:</strong> ${order.total_amount}</p>
              <p className="text-gray-700"><strong>Items:</strong> {order.items?.length || 0}</p>
              {order.shipping_address && (
                <p className="text-gray-700"><strong>Shipping:</strong> {order.shipping_address}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCart = () => {
    if (cartItems.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <p className="text-gray-400 mt-2">Add some products to see them here!</p>
        </div>
      );
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center space-x-4">
              {item.image_url && (
                <img 
                  src={`http://localhost:5000${item.image_url}`} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">${item.price}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span className="px-3 py-1 bg-gray-100 rounded">{item.quantity}</span>
                <button 
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-center text-xl font-semibold">
            <span>Total: ${totalAmount.toFixed(2)}</span>
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderWishlist = () => {
    if (wishlist.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Your wishlist is empty</p>
          <p className="text-gray-400 mt-2">Save items you love to see them here!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow border">
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded mb-4" />
            <h3 className="font-semibold mb-2">{item.name}</h3>
            <p className="text-gray-600 mb-4">${item.price}</p>
            <div className="flex space-x-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add to Cart
              </button>
              <button 
                onClick={() => removeFromWishlist(item.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAddresses = () => {
    return (
      <div className="space-y-6">
        {/* Existing Addresses */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Saved Addresses</h3>
          {addresses.length === 0 ? (
            <p className="text-gray-500">No addresses saved yet.</p>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{address.street}</p>
                      <p className="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                      <p className="text-gray-600">{address.country}</p>
                      {address.isDefault && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!address.isDefault && (
                        <button 
                          onClick={() => setDefaultAddress(address.id)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Set Default
                        </button>
                      )}
                      <button 
                        onClick={() => removeAddress(address.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Address Form */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={newAddress.zipCode}
                  onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="United States"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
              </div>
            </div>
            <button 
              onClick={addAddress}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Address
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    const handleProfileSubmit = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`http://localhost:5000/api/customers/${user.id}`, 
          profileForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updateUser(response.data);
        toast.success('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      }
    };

    const handlePasswordSubmit = async (e) => {
      e.preventDefault();
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/customers/${user.id}`, 
          { 
            currentPassword: passwordForm.currentPassword,
            password: passwordForm.newPassword 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success('Password updated successfully');
      } catch (error) {
        console.error('Error updating password:', error);
        toast.error('Failed to update password');
      }
    };

    const handleDeleteAccount = async () => {
      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/customers/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          logout();
          navigate('/');
          toast.success('Account deleted successfully');
        } catch (error) {
          console.error('Error deleting account:', error);
          toast.error('Failed to delete account');
        }
      }
    };

    return (
      <div className="space-y-8">
        {/* Profile Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
          <form onSubmit={handleProfileSubmit} className="bg-white p-6 rounded-lg shadow border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.number}
                  onChange={(e) => setProfileForm({...profileForm, number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="bg-white p-6 rounded-lg shadow border">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength="6"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Change Password
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
            <p className="text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button 
              onClick={handleDeleteAccount}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    );
  };

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-1/4 bg-gray-800 text-white">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold">{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{user?.name || 'User'}</h2>
                    <p className="text-gray-300 text-sm">{user?.email}</p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  {[
                    { id: 'orders', label: 'My Orders', icon: '📦' },
                    { id: 'cart', label: 'My Cart', icon: '🛒' },
                    { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
                    { id: 'addresses', label: 'Address Book', icon: '📍' },
                    { id: 'settings', label: 'Account Settings', icon: '⚙️' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <span className="mr-3">🚪</span>
                    Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeTab === 'settings' ? 'Account Settings' : 
                   activeTab === 'addresses' ? 'Address Book' :
                   activeTab === 'cart' ? 'My Cart' :
                   `My ${activeTab}`}
                </h1>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'cart' && renderCart()}
                {activeTab === 'wishlist' && renderWishlist()}
                {activeTab === 'addresses' && renderAddresses()}
                {activeTab === 'settings' && renderSettings()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;