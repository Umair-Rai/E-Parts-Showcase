import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

/**
 * CustomerProfile Component
 * Displays customer profile information with tabs for cart and settings
 * Integrates with backend APIs for real-time data fetching and updates
 */
const CustomerProfile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useContext(AuthContext);
  
  // State management
  const [activeTab, setActiveTab] = useState("cart");
  const [cartItems, setCartItems] = useState([]);
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

        // Fetch customer cart
        const cartRes = await axios.get(`https://eme6.com/api/cart/${user.id}`, { headers });
        setCartItems(cartRes.data);
        
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
      await axios.delete(`https://eme6.com/api/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(cartItems.filter(item => item.cart_item_id !== itemId));
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
      await axios.put(`https://eme6.com/api/cart/update/${itemId}`, 
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(cartItems.map(item => 
        item.cart_item_id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };



  // Render functions

  const renderCart = () => {
    if (cartItems.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <p className="text-gray-400 mt-2">Add some products to see them here!</p>
          <button 
            onClick={() => navigate('/product')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Cart Items */}
        {cartItems.map((item) => (
          <div key={item.cart_item_id} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center space-x-4">
              {item.image_url && (
                <img 
                  src={`https://eme6.com${item.image_url}`} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                {item.size && (
                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                )}
                {item.description && (
                  <p className="text-sm text-gray-500">Description: {item.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => updateCartQuantity(item.cart_item_id, item.quantity - 1)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span className="px-3 py-1 bg-gray-100 rounded">{item.quantity}</span>
                <button 
                  onClick={() => updateCartQuantity(item.cart_item_id, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => removeFromCart(item.cart_item_id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* View Full Cart Button */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-center">
            <p className="text-gray-600 mb-4">View and manage your full cart</p>
            <button 
              onClick={() => navigate('/cart')}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
            >
              Go to Cart Page
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
        const response = await axios.put(`https://eme6.com/api/customers/${user.id}`, 
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
        await axios.put(`https://eme6.com/api/customers/${user.id}`, 
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
          await axios.delete(`https://eme6.com/api/customers/${user.id}`, {
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.number}
                  onChange={(e) => setProfileForm({...profileForm, number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                  minLength="6"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
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


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-1/4 bg-gray-800 text-white">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold">{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{user?.name || 'User'}</h2>
                    <p className="text-gray-300 text-sm">{user?.email}</p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  {[
                    { id: 'cart', label: 'My Cart', icon: '🛒' },
                    { id: 'settings', label: 'Account Settings', icon: '⚙️' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-red-600 text-white'
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
                   activeTab === 'cart' ? 'My Cart' :
                   'My Profile'}
                </h1>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                {activeTab === 'cart' && renderCart()}
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