import React, { useState } from 'react';
import {
  HomeIcon,
  CubeIcon,
  Squares2X2Icon,
  ClipboardIcon,
  UsersIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

import AdminDashboard from '../Admin/AdminDashboard';
import ViewAllProduct from '../Admin/ViewAllProduct';
import ViewAllCategories from '../Admin/ViewAllCategories';
import ManageOrders from '../Admin/ManageOrders';
import CustomerManagement from '../Admin/CustomerManagement';
import AccountSettings from '../Admin/AccountSetting';

const navItems = [
  { label: 'Dashboard', icon: HomeIcon },
  { label: 'Products', icon: CubeIcon },
  { label: 'Categories', icon: Squares2X2Icon },
  { label: 'Orders', icon: ClipboardIcon },
  { label: 'Customers', icon: UsersIcon },
  { label: 'Settings', icon: Cog6ToothIcon },
];

export default function Admin() {
  const [activeNav, setActiveNav] = useState('Dashboard');

  const renderContent = () => {
    switch (activeNav) {
      case 'Dashboard':
        return <AdminDashboard />;
      case 'Products':
        return <ViewAllProduct />;
       case 'Categories':
        return <ViewAllCategories />;
       case 'Orders':
         return <ManageOrders />;
       case 'Customers':
         return <CustomerManagement />;
       case 'Settings':
         return <AccountSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-lg py-6 px-4 flex-shrink-0 h-full">
        {navItems.map(({ label, icon: Icon }) => (
          <div
            key={label}
            onClick={() => setActiveNav(label)}
            className={`flex items-center space-x-3 px-4 py-2 rounded-lg mb-2 cursor-pointer transition-all duration-200 ease-in-out ${
              activeNav === label
                ? 'bg-purple-100 text-purple-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {renderContent()}
      </main>
    </div>
  );
}
