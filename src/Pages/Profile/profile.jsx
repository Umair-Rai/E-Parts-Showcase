import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { buildApiUrl } from "../../config/api";
import { getFullImageUrl } from "../../utils/imageUtils";
import ConfirmDialog from "../../Component/ConfirmDialog";
import {
  ShoppingCartIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

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
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  
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
        setError(null); // Clear any previous errors
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch customer cart
        const cartRes = await axios.get(buildApiUrl(`/api/cart/${user.id}`), { headers });
        setCartItems(cartRes.data || []);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        // Only set error for non-404 errors (404 means empty cart, which is fine)
        if (err.response?.status !== 404) {
          setError('Failed to load profile data');
          toast.error('Failed to load profile data', {
            toastId: 'profile-load-error'
          });
        } else {
          // Empty cart is not an error
          setCartItems([]);
        }
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
      if (!token) {
        toast.error('Authentication required', {
          toastId: 'profile-auth-required'
        });
        navigate('/login');
        return;
      }
      
      await axios.delete(buildApiUrl(`/api/cart/remove/${itemId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(cartItems.filter(item => item.cart_item_id !== itemId));
      toast.success('Item removed from cart', {
        toastId: 'profile-remove-cart-item-success'
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from cart', {
        toastId: 'profile-remove-cart-item-error'
      });
    }
  };

  const updateCartQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required', {
          toastId: 'profile-auth-required'
        });
        navigate('/login');
        return;
      }
      
      await axios.put(buildApiUrl(`/api/cart/update/${itemId}`), 
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(cartItems.map(item => 
        item.cart_item_id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      toast.success('Quantity updated', {
        toastId: 'profile-update-cart-quantity-success'
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart', {
        toastId: 'profile-update-cart-quantity-error'
      });
    }
  };

  // Delete account handlers (moved to component level for ConfirmDialog access)
  const handleDeleteAccountClick = () => {
    setShowDeleteAccountDialog(true);
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(buildApiUrl(`/api/customers/${user.id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      logout();
      navigate('/');
      toast.success('Account deleted successfully', {
        toastId: 'profile-delete-account-success'
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account', {
        toastId: 'profile-delete-account-error'
      });
    }
  };

  // Render functions

  const renderCart = () => {
    if (cartItems.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg">Your cart is empty</p>
          <p className="text-gray-500 mt-2">Add some products to see them here!</p>
          <button 
            onClick={() => navigate('/product')}
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
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
          <div key={item.cart_item_id} className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center space-x-4">
              {item.image_url && (
                <img
                  src={getFullImageUrl(item.image_url)}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-white">{item.name}</h3>
                {item.size && (
                  <p className="text-sm text-gray-400">Size: <span className="text-red-400">{item.size}</span></p>
                )}
                {item.description && (
                  <p className="text-sm text-gray-400">{item.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => updateCartQuantity(item.cart_item_id, item.quantity - 1)}
                  className="px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-white border border-gray-600 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-600 min-w-[3rem] text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateCartQuantity(item.cart_item_id, item.quantity + 1)}
                  className="px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-white border border-gray-600 transition-colors"
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => removeFromCart(item.cart_item_id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* View Full Cart Button */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
          <div className="text-center">
            <p className="text-gray-300 mb-4">View and manage your full cart</p>
            <button 
              onClick={() => navigate('/cart')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
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
        const response = await axios.put(buildApiUrl(`/api/customers/${user.id}`),
          profileForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updateUser(response.data);
        toast.success('Profile updated successfully', {
          toastId: 'profile-update-success'
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile', {
          toastId: 'profile-update-error'
        });
      }
    };

    const handlePasswordSubmit = async (e) => {
      e.preventDefault();
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('New passwords do not match', {
          toastId: 'profile-password-mismatch-error'
        });
        return;
      }
      try {
        const token = localStorage.getItem('token');
        await axios.put(buildApiUrl(`/api/customers/${user.id}`),
          { 
            currentPassword: passwordForm.currentPassword,
            password: passwordForm.newPassword 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success('Password updated successfully', {
          toastId: 'profile-password-update-success'
        });
      } catch (error) {
        console.error('Error updating password:', error);
        toast.error('Failed to update password', {
          toastId: 'profile-password-update-error'
        });
      }
    };

    return (
      <div className="space-y-8">
        {/* Profile Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Profile Information</h3>
          <form onSubmit={handleProfileSubmit} className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-white placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-white placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.number}
                  onChange={(e) => setProfileForm({...profileForm, number: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-white placeholder-gray-500"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors font-semibold"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-white placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-white placeholder-gray-500"
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-white placeholder-gray-500"
                  required
                  minLength="6"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors font-semibold"
            >
              Change Password
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
          <div className="bg-gray-900 border-2 border-red-600 p-6 rounded-xl">
            <h4 className="font-medium text-red-400 mb-2">Delete Account</h4>
            <p className="text-gray-300 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button 
              onClick={handleDeleteAccountClick}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors font-semibold"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden min-h-[600px] border border-gray-700">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Sidebar */}
            <div className="lg:w-64 bg-gray-800 text-white flex-shrink-0 lg:min-h-[600px] border-r border-gray-700">
              <div className="p-6 h-full">
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
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-red-600 text-white shadow-lg'
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
            <div className="flex-1 p-6 min-h-[600px]">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white capitalize">
                  {activeTab === 'settings' ? 'Account Settings' : 
                   activeTab === 'cart' ? 'My Cart' :
                   'My Profile'}
                </h1>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 min-h-[500px] border border-gray-700">
                {activeTab === 'cart' && renderCart()}
                {activeTab === 'settings' && renderSettings()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAccountDialog}
        onClose={() => setShowDeleteAccountDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete Account"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CustomerProfile;