import React, { useState } from "react";
import Button from "../../Component/Button";
import Input from "../../Component/Input";
import Label from "../../Component/Label";
import Card, { CardHeader, CardTitle, CardContent } from "../../Component/Card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.email,
        password: formData.password,
        role: "customer",

      });

      if (response.status === 200) {
        // Save token (if returned) to localStorage or context (adjust as per your backend)
        localStorage.setItem("token", response.data.token);
        // Redirect to dashboard or home page
        navigate("/dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black to-gray-900 px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Card className="w-full bg-white shadow-lg rounded-2xl p-6">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold text-red-700">
              Al Sayyeds Enterprise
            </CardTitle>
            <p className="text-sm text-center text-gray-650">
              Sign in to manage your mechanical parts dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <p className="text-red-600 text-center font-semibold">{error}</p>
              )}
              <div>
                <Label htmlFor="email" className="text-gray-700 font-bold">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700 font-bold">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="text-gray-700"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm text-gray-500 mt-3">
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="text-red-600 hover:underline"
                  onClick={() => navigate("/signup")}
                >
                  Register
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
