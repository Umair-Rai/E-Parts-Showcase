import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = ({ email, otp, onBack, userType = 'customer', onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(""); // Clear error when user types

    // Update password validation in real-time
    if (e.target.name === 'newPassword') {
      const password = e.target.value;
      setPasswordValidation({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&]/.test(password)
      });
    }
  };

  const validatePassword = (password) => {
    // Password must be at least 8 characters long and contain:
    // - At least 1 uppercase letter
    // - At least 1 lowercase letter  
    // - At least 1 number
    // - At least 1 special character (@$!%*?&)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate password complexity
    if (!validatePassword(formData.newPassword)) {
      setError("Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)");
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://eme6.com/api/auth/reset-password", {
        email: email,
        otp: otp,
        newPassword: formData.newPassword,
        userType: userType,
      });

      if (response.status === 200) {
        if (onSuccess) {
          // If onSuccess callback is provided, use it (for embedded reset password)
          onSuccess();
        } else {
          // Otherwise navigate to the appropriate login page
          navigate(userType === 'admin' ? "/admin/login" : "/login");
        }
      }
    } catch (err) {
      console.error("Password reset error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Password reset failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
            <LockClosedIcon className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600">
            Enter your new password for <span className="font-semibold text-red-600">{email}</span>
          </p>
        </div>

        {/* Reset Password Form */}
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
            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                  placeholder="Enter new password"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium mb-2">Password Requirements:</p>
              <ul className="text-xs space-y-1">
                <li className={`flex items-center ${passwordValidation.length ? 'text-green-700' : 'text-blue-700'}`}>
                  <span className="mr-2">{passwordValidation.length ? '✅' : '⭕'}</span>
                  At least 8 characters long
                </li>
                <li className={`flex items-center ${passwordValidation.uppercase ? 'text-green-700' : 'text-blue-700'}`}>
                  <span className="mr-2">{passwordValidation.uppercase ? '✅' : '⭕'}</span>
                  At least 1 uppercase letter (A-Z)
                </li>
                <li className={`flex items-center ${passwordValidation.lowercase ? 'text-green-700' : 'text-blue-700'}`}>
                  <span className="mr-2">{passwordValidation.lowercase ? '✅' : '⭕'}</span>
                  At least 1 lowercase letter (a-z)
                </li>
                <li className={`flex items-center ${passwordValidation.number ? 'text-green-700' : 'text-blue-700'}`}>
                  <span className="mr-2">{passwordValidation.number ? '✅' : '⭕'}</span>
                  At least 1 number (0-9)
                </li>
                <li className={`flex items-center ${passwordValidation.special ? 'text-green-700' : 'text-blue-700'}`}>
                  <span className="mr-2">{passwordValidation.special ? '✅' : '⭕'}</span>
                  At least 1 special character (@$!%*?&)
                </li>
                <li className={`flex items-center ${formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'text-green-700' : 'text-blue-700'}`}>
                  <span className="mr-2">{formData.newPassword === formData.confirmPassword && formData.confirmPassword ? '✅' : '⭕'}</span>
                  Passwords match
                </li>
              </ul>
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
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </motion.button>
          </form>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={onBack}
              disabled={loading}
              className="inline-flex items-center text-sm text-gray-500 hover:text-red-500 transition duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to OTP Verification
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
