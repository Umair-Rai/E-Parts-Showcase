import React from "react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-700",
  paid: "bg-green-200 text-green-800",
  unpaid: "bg-pink-100 text-pink-800",
};

const Badge = ({ text, status }) => {
  const baseClass = "text-xs font-semibold px-3 py-1 rounded-full";
  const colorClass = statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";

  return <span className={`${baseClass} ${colorClass}`}>{text}</span>;
};

export default Badge;
