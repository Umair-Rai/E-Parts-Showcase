import React, { useState } from 'react';
import {
  HomeIcon,
  CubeIcon,
  Squares2X2Icon,
  ClipboardIcon,
  UsersIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { label: 'Dashboard', icon: HomeIcon },
  { label: 'Products', icon: CubeIcon },
  { label: 'Categories', icon: Squares2X2Icon },
  { label: 'Seller Verification', icon: CheckCircleIcon },
  { label: 'Orders', icon: ClipboardIcon },
  { label: 'Customers', icon: UsersIcon },
  { label: 'Settings', icon: Cog6ToothIcon },
];

export default function AdminSideBar() {
      const [activeNav, setActiveNav] = useState('Dashboard');

       return (
    <div className="flex h-screen bg-gray-100 font-poppins">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-lg py-6 px-4 flex-shrink-0">
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
      </div>)
}