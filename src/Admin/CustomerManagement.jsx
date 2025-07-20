import React, { useState } from 'react';
import { EyeIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Select from '../components/Select';
import Badge from '../components/Badge';
import Input from '../components/Input';

const customersData = [
  {
    id: '12345',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 555-123-4567',
    avatar: 'https://i.pravatar.cc/150?img=3',
    orders: 24,
    status: 'verified',
    joined: '2024-01-15',
  },
  {
    id: '12346',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    phone: '+1 555-222-9876',
    avatar: 'https://i.pravatar.cc/150?img=6',
    orders: 12,
    status: 'unverified',
    joined: '2024-03-10',
  },
  {
    id: '12347',
    name: 'Mark Taylor',
    email: 'mark@example.com',
    phone: '+1 555-333-1111',
    avatar: 'https://i.pravatar.cc/150?img=7',
    orders: 0,
    status: 'suspended',
    joined: '2023-11-01',
  },
];

const CustomerManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [accountStatus, setAccountStatus] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <p className="text-sm text-gray-600">Manage platform customers and their account status.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Input
          placeholder="Search by Name, Email or Phone"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/3"
        />
        <div className="flex gap-3">
          <Select
            value={accountStatus}
            onChange={(e) => setAccountStatus(e.target.value)}
            options={[
              { label: 'Account Status', value: 'all' },
              { label: 'Verified', value: 'verified' },
              { label: 'Unverified', value: 'unverified' },
              { label: 'Suspended', value: 'suspended' },
            ]}
          />
          <Select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            options={[
              { label: 'Activity', value: 'all' },
              { label: 'Recently Active', value: 'recent' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { label: 'Sort by: Newest', value: 'newest' },
              { label: 'Oldest', value: 'oldest' },
              { label: 'Most Orders', value: 'orders' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-xl">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Contact</th>
              <th className="px-6 py-3 text-left">Orders</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Joined</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customersData.map((cust) => (
              <tr key={cust.id} className="hover:bg-gray-50 transition">
                {/* Customer Info */}
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={cust.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium">{cust.name}</p>
                    <p className="text-xs text-gray-500">ID: #{cust.id}</p>
                  </div>
                </td>
                {/* Contact */}
                <td className="px-6 py-4">
                  <p>{cust.email}</p>
                  <p className="text-xs text-gray-500">{cust.phone}</p>
                </td>
                {/* Orders */}
                <td className="px-6 py-4">{cust.orders} Total Orders</td>
                {/* Status */}
                <td className="px-6 py-4">
                  <Badge
                    text={cust.status.charAt(0).toUpperCase() + cust.status.slice(1)}
                    status={cust.status}
                  />
                </td>
                {/* Joined */}
                <td className="px-6 py-4">
                  <p>{new Date(cust.joined).toDateString()}</p>
                  <p className="text-xs text-gray-500">~ {Math.floor((Date.now() - new Date(cust.joined)) / (1000 * 60 * 60 * 24 * 30))} months ago</p>
                </td>
                {/* Actions */}
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-3">
                    <EyeIcon className="w-5 h-5 text-blue-500 hover:scale-110 transition cursor-pointer" />
                    {cust.status === 'suspended' || cust.status === 'unverified' ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 hover:scale-110 transition cursor-pointer" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-orange-400 hover:scale-110 transition cursor-pointer" />
                    )}
                    <TrashIcon className="w-5 h-5 text-red-500 hover:scale-110 transition cursor-pointer" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Show{' '}
          <select className="border rounded px-2 py-1 text-sm">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>{' '}
          entries
        </div>
        <div className="flex items-center gap-1 text-sm">
          <button className="px-3 py-1 border rounded hover:bg-gray-100">Previous</button>
          <button className="px-3 py-1 border rounded bg-blue-500 text-white">1</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-100">2</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-100">3</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-100">Next</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
