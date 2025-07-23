import React from "react";

const Select = ({ value, onChange, options = [], className = "", ...props }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${className}`}
      {...props}
    >
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
