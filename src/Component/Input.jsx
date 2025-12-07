import React from "react";

const Input = ({ type = "text", placeholder, value, onChange, className = "", ...props }) => {
  // Check if this is an admin page input (has input-search class or is in admin context)
  const isAdminInput = className.includes('input-search') || className.includes('admin-input');
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 ${
        isAdminInput 
          ? 'border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-sm text-gray-900 placeholder-gray-500' 
          : 'border-0 bg-transparent focus:outline-none focus:ring-0 text-sm'
      } ${className}`}
      {...props}
    />
  );
};

export default Input;
