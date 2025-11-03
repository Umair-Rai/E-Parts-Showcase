import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from "axios";
import { toast } from "react-toastify";

const OTPVerification = ({ email, onBack, onOTPVerified }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://eme6.com/api/auth/verify-otp", {
        email: email,
        otp: otp,
      });

      if (response.status === 200) {
        toast.success("OTP verified successfully!");
        onOTPVerified(otp);
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "OTP verification failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    setCanResend(false);
    setCountdown(600);

    try {
      const response = await axios.post("https://eme6.com/api/auth/forgot-password", {
        email: email,
        userType: "customer",
      });

      if (response.status === 200) {
        toast.success("OTP resent successfully!");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      setError(message);
      toast.error(message);
      setCanResend(true);
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
            <CheckCircleIcon className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to <span className="font-semibold text-red-600">{email}</span>
          </p>
        </div>

        {/* OTP Form */}
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
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOTPChange}
                required
                className="block w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Code expires in: <span className="font-semibold text-red-600">{formatTime(countdown)}</span>
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || otp.length !== 6}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition duration-200 ${
                loading || otp.length !== 6
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </motion.button>
          </form>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResendOTP}
              disabled={!canResend || loading}
              className={`text-sm font-medium transition duration-200 ${
                canResend && !loading
                  ? "text-red-600 hover:text-red-500"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Sending..." : "Resend OTP"}
            </button>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={onBack}
              disabled={loading}
              className="inline-flex items-center text-sm text-gray-500 hover:text-red-500 transition duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Login
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
