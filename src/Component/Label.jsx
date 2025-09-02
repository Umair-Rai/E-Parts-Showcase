import React from "react";

const Label = ({ htmlFor, children, className = "", ...props }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-200 mb-1 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
