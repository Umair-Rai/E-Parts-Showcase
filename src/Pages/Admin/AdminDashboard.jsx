import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CubeIcon,
  UsersIcon,
  PlusCircleIcon,
  TagIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        navigate('/admin/login');
        return;
      }
      
      const response = await axios.get('https://eme6.com/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setDashboardData(response.data);
      // ✅ Removed unnecessary success toast that was showing on every load
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view dashboard data.');
      } else if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      }
      
      // ✅ Show error toast only once with toastId
      toast.error(err.response?.data?.message || 'Failed to load dashboard data', {
        toastId: 'dashboard-error', // Prevent duplicate error toasts
      });
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex-1 h-full bg-gray-50 px-8 py-6 overflow-y-auto font-poppins">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 h-full bg-gray-50 px-8 py-6 overflow-y-auto font-poppins">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const infoCards = [
    { 
      label: 'Total Products', 
      value: dashboardData.totalProducts, 
      Icon: CubeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Active Customers', 
      value: dashboardData.totalCustomers, 
      Icon: UsersIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'Categories', 
      value: dashboardData.totalCategories, 
      Icon: TagIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const actionCards = [
    { 
      label: 'Add Product', 
      Icon: PlusCircleIcon, 
      onClick: () => navigate('/admin/add-product'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Add Category', 
      Icon: PlusCircleIcon, 
      onClick: () => navigate('/admin/add-category'),
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="flex-1 h-full bg-gray-50 px-8 py-6 overflow-y-auto font-poppins">
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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {infoCards.map(({ label, value, Icon, color, bgColor }) => (
          <div
            key={label}
            className={`${bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition duration-300 ease-in-out hover:scale-[1.02] border border-gray-100`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-3xl font-bold text-gray-800 mb-1">{value.toLocaleString()}</p>
                <p className="text-sm font-medium text-gray-600">{label}</p>
              </div>
              <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {actionCards.map(({ label, Icon, onClick, color, bgColor }) => (
          <div
            key={label}
            onClick={onClick}
            className={`${bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition duration-300 ease-in-out hover:scale-[1.02] cursor-pointer border border-gray-100`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <span className="text-gray-800 font-semibold text-lg">{label}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;