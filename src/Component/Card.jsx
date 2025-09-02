import React from "react";

const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-[#1a1a1a] border border-red-700 rounded-lg p-6 shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h2 className={`text-xl font-bold mb-1 ${className}`} {...props}>
      {children}
    </h2>
  );
};

export const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
