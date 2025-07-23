import React from "react";

const Input = ({ type = "text", placeholder, value, onChange, className = "", ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${className}`}
      {...props}
    />
  );
};

export default Input;
