// src/components/AdminRoute.jsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { buildApiUrl } from "../config/api";

const AdminRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        await axios.get(buildApiUrl('/api/admin/dashboard/stats'), {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000 // 8 second timeout
        });
        setIsAuthorized(true);
        setRetryCount(0);
      } catch (err) {
        console.error("Token validation error:", err);
        
        // Handle different types of errors
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Token is invalid/expired
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
          setIsAuthorized(false);
        } else if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || !err.response) {
          // Network/timeout error - retry up to 3 times
          if (retryCount < 3) {
            console.log(`🔄 Retrying token validation... Attempt ${retryCount + 1}/3`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => checkToken(), 2000 * (retryCount + 1));
            return;
          } else {
            // After 3 retries, assume network issues and allow access if token exists
            console.warn("Network issues detected, allowing access with existing token");
            setIsAuthorized(true);
          }
        } else {
          // Other server errors
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
          setIsAuthorized(false);
        }
      }
    };

    checkToken();
  }, [retryCount]);

  // Enhanced loading state
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-600">
            Verifying authentication...
            {retryCount > 0 && ` (Retry ${retryCount}/3)`}
          </div>
        </div>
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to="/admin/login" replace />;
};

export default AdminRoute;
