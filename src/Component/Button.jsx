import React from "react";

const Button = ({ children, onClick, className = "", type = "button", icon }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`items-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-700 transition ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
