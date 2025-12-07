import React from "react";
import { ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Custom Select Component for Admin Pages
 * Matches the admin design with rounded corners and red accent colors
 */
const AdminSelect = ({ value, onChange, options = [], label, className = "", ...props }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="admin-select-custom w-full px-4 py-3 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-sm text-gray-900 cursor-pointer transition-all hover:border-gray-400"
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            backgroundImage: 'none',
            border: '1px solid rgb(209, 213, 219)',
            boxSizing: 'border-box'
          }}
          {...props}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style={{ zIndex: 1 }}>
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default AdminSelect;

