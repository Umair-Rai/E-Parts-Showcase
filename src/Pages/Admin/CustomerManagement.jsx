import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  EyeIcon, 
  TrashIcon, 
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Select from '../../Component/Select';
import Input from '../../Component/Input';
import Button from '../../Component/Button';

const CustomerManagement = () => {
  // State management - ALL REQUIRED STATE VARIABLES
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', number: '' });

  // Fetch customers from database
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          setError('Authentication required');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/customers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setCustomers(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(err.response?.data?.error || 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Delete customer
  const handleDeleteCustomer = async (customerId) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      await axios.delete(`http://localhost:5000/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setCustomers(customers.filter(customer => customer.id !== customerId));
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(err.response?.data?.error || 'Failed to delete customer');
    }
  };

  // Update customer
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.put(
        `http://localhost:5000/api/customers/${editingCustomer.id}`,
        editForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setCustomers(customers.map(customer => 
        customer.id === editingCustomer.id ? response.data : customer
      ));
      setShowEditModal(false);
      setEditingCustomer(null);
      setEditForm({ name: '', email: '', number: '' });
    } catch (err) {
      console.error('Error updating customer:', err);
      setError(err.response?.data?.error || 'Failed to update customer');
    }
  };

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        (customer.number && customer.number.includes(searchTerm))
      );
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [customers, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredAndSortedCustomers.slice(startIndex, endIndex);

  // Bulk operations
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCustomers(currentCustomers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId, checked) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      await Promise.all(
        selectedCustomers.map(customerId => 
          axios.delete(`http://localhost:5000/api/customers/${customerId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        )
      );

      setCustomers(customers.filter(customer => !selectedCustomers.includes(customer.id)));
      setSelectedCustomers([]);
    } catch (err) {
      console.error('Error deleting customers:', err);
      setError(err.response?.data?.error || 'Failed to delete customers');
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Name', 'Email', 'Phone'].join(','),
      ...filteredAndSortedCustomers.map(customer => [
        customer.id,
        `"${customer.name}"`,
        customer.email,
        customer.number || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Modal handlers
  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name,
      email: customer.email,
      number: customer.number || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const openViewModal = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading customers...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XMarkIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">Error: {error}</span>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600 mt-1">Manage customer database records</p>
          </div>
          <div className="flex space-x-3">
            {selectedCustomers.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete Selected ({selectedCustomers.length})</span>
              </Button>
            )}
            <Button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm min-w-[120px]"
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="id">Sort by ID</option>
                </select>
              </div>
              
              <Button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === currentCustomers.length && currentCustomers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={(e) => handleSelectCustomer(customer.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{customer.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.number || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openViewModal(customer)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(customer)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Edit Customer"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(customer)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete Customer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedCustomers.length)} of {filteredAndSortedCustomers.length} customers
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* View Customer Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                <p className="text-sm text-gray-900">#{selectedCustomer.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{selectedCustomer.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedCustomer.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-sm text-gray-900">{selectedCustomer.number || 'Not provided'}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Customer</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  type="text"
                  value={editForm.number}
                  onChange={(e) => setEditForm({...editForm, number: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Update Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete customer <strong>{customerToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteCustomer(customerToDelete.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Delete Customer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
