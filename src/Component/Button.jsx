import React from "react";

const Button = ({ children, onClick, className = "", type = "button", icon }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
