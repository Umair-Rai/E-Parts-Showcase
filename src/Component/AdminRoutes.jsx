// src/components/AdminRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const AdminRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // null = loading, true/false = finished checking

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        // Fixed: Use the correct endpoint /api/auth/me instead of /api/admins/me
        await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAuthorized(true);
      } catch (err) {
        console.error("Token invalid or expired:", err);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        setIsAuthorized(false);
      }
    };

    checkToken();
  }, []);

  // Still checking token
  if (isAuthorized === null) return <div>Loading...</div>;

  return isAuthorized ? children : <Navigate to="/admin/login" />;
};

export default AdminRoute;
