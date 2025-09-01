import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  CubeIcon,
  ClipboardIcon,
  UsersIcon,
  PlusCircleIcon,
  TagIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChartBarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalCategories: 0,
    recentOrders: [],
    orderStatusDistribution: [],
    topProducts: []
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
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'processing': return <ChartBarIcon className="w-4 h-4" />;
      case 'shipped': return <TruckIcon className="w-4 h-4" />;
      case 'delivered': return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      label: 'Total Orders', 
      value: dashboardData.totalOrders, 
      Icon: ClipboardIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
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
    },
    { 
      label: 'View Orders', 
      Icon: EyeIcon, 
      onClick: () => navigate('/admin/orders'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="flex-1 h-full bg-gray-50 px-8 py-6 overflow-y-auto font-poppins">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

      {/* Recent Orders and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <ClipboardIcon className="w-6 h-6 mr-2 text-purple-600" />
            Recent Orders
          </h3>
          <div className="space-y-4">
            {dashboardData.recentOrders.length > 0 ? (
              dashboardData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-800">#{order.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent orders found</p>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2 text-purple-600" />
            Order Status Overview
          </h3>
          <div className="space-y-3">
            {dashboardData.orderStatusDistribution.length > 0 ? (
              dashboardData.orderStatusDistribution.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(status.status).split(' ')[1]}`}>
                      {getStatusIcon(status.status)}
                    </div>
                    <span className="font-medium text-gray-700 capitalize">{status.status}</span>
                  </div>
                  <span className="font-bold text-gray-800">{status.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No order data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      {dashboardData.topProducts.length > 0 && (
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <CubeIcon className="w-6 h-6 mr-2 text-purple-600" />
            Top Selling Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.topProducts.map((product, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 truncate">{product.name}</h4>
                <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
                <p className="text-sm font-medium text-purple-600">Sold: {product.total_sold} units</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;