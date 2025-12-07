import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, UserIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import "react-toastify/dist/ReactToastify.css";
import logo from '../../logo.jpg';
import OTPVerification from '../Auth/OTPVerification';
import ResetPassword from '../Auth/ResetPassword';
import { buildApiUrl } from '../../config/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  
  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [verifiedOTP, setVerifiedOTP] = useState("");

  // Check if user is already authenticated
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        await axios.get(buildApiUrl('/api/admin/dashboard/stats'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // User is authenticated, redirect to admin
        navigate("/admin", { replace: true });
      } catch (err) {
        // Token is invalid, remove it and show login form
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        setCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      toast.error("❗ Please fill in all fields", {
        toastId: 'admin-login-fields-required'
      });
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post(buildApiUrl('/api/admin/login'), {
        email: formData.email,
        password: formData.password,
      });

      const { token, admin } = response.data;
      
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminData", JSON.stringify(admin));
      
      navigate("/admin");
      
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        toastId: 'admin-login-error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handlers
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(buildApiUrl('/api/auth/forgot-password'), {
        email: forgotPasswordEmail,
        userType: "admin",
      });

      if (response.status === 200) {
        toast.success("OTP sent successfully to your email!", {
          toastId: 'admin-login-otp-sent-success'
        });
        setShowForgotPassword(false);
        setShowOTPVerification(true);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      setError(message);
      toast.error(message, {
        toastId: 'admin-login-forgot-password-error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = (otp) => {
    setVerifiedOTP(otp);
    setShowOTPVerification(false);
    setShowResetPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowOTPVerification(false);
    setShowResetPassword(false);
    setForgotPasswordEmail("");
    setVerifiedOTP("");
    setError("");
  };

  const handleBackToOTP = () => {
    setShowResetPassword(false);
    setShowOTPVerification(true);
  };

  const handlePasswordResetSuccess = () => {
    // Reset all forgot password states to show login form
    setShowForgotPassword(false);
    setShowOTPVerification(false);
    setShowResetPassword(false);
    setForgotPasswordEmail("");
    setVerifiedOTP("");
    setError("");
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Render different components based on state
  if (showOTPVerification) {
    return (
      <OTPVerification
        email={forgotPasswordEmail}
        userType="admin"
        onBack={handleBackToLogin}
        onOTPVerified={handleOTPVerified}
      />
    );
  }

  if (showResetPassword) {
    return (
      <ResetPassword
        email={forgotPasswordEmail}
        otp={verifiedOTP}
        onBack={handleBackToOTP}
        userType="admin"
        onSuccess={handlePasswordResetSuccess}
      />
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto h-20 w-20 bg-black rounded-full flex items-center justify-center mb-6 shadow-lg"
            >
              <ShieldCheckIcon className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Admin Password?</h2>
            <p className="text-gray-600">Enter your email to receive a verification code</p>
          </div>

          {/* Forgot Password Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 space-y-6"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="forgotEmail"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                    placeholder="Enter your admin email"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  "Send OTP"
                )}
              </motion.button>
            </form>

            {/* Back Button */}
            <div className="text-center">
              <button
                onClick={handleBackToLogin}
                disabled={loading}
                className="inline-flex items-center text-sm text-gray-500 hover:text-red-500 transition duration-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Admin Login
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* ToastContainer is in App.js - no need for duplicate */}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto h-20 w-20 bg-black rounded-full flex items-center justify-center mb-6 shadow-lg"
          >
            <ShieldCheckIcon className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
          <p className="text-gray-600">Sign in to access the admin dashboard</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 space-y-6"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-red-600 hover:text-red-500 transition duration-200"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Secure admin access only
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
