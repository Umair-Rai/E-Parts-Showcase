import React from 'react';
import {
  CubeIcon,
  ClipboardIcon,
  UsersIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const infoCards = [
  { label: 'Total Products', value: 1247, Icon: CubeIcon },
  { label: 'Orders', value: 892, Icon: ClipboardIcon },
  { label: 'Verified Sellers', value: 156, Icon: CheckCircleIcon },
  { label: 'Active Customers', value: 3421, Icon: UsersIcon },
];

const actionCards = [
  { label: 'Add Product', Icon: PlusCircleIcon },
  { label: 'Verify Sellers', Icon: CheckCircleIcon },
  { label: 'Monitor Orders', Icon: TruckIcon },
];

const AdminDashboard = () => {
  return (
    <div className="flex-1 h-full bg-gray-50 px-8 py-6 overflow-y-auto font-poppins">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what’s happening with your store.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {infoCards.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-purple-300 transition duration-300 ease-in-out hover:scale-[1.02] flex justify-between items-center"
          >
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
            <Icon className="w-10 h-10 text-gray-300" />
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actionCards.map(({ label, Icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-purple-300 transition duration-300 ease-in-out hover:scale-[1.03] flex items-center space-x-4 cursor-pointer"
          >
            <Icon className="w-8 h-8 text-purple-600 hover:scale-110 transition-transform duration-300" />
            <span className="text-gray-800 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
