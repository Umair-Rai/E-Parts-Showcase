import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../Component/Button";
import Input from "../../Component/Input";
import Label from "../../Component/Label";
import Card, { CardHeader, CardTitle, CardContent } from "../../Component/Card";
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // Signup logic here
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black to-gray-900 px-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-red-700">
            Al Sayyeds Enterprise
          </CardTitle>
          <p className="text-sm text-center text-gray-650">
            Create an account to manage your dashboard
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Label htmlFor="name" className="text-gray-700 font-bold">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="email" className="text-gray-700 font-bold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="phone" className="text-gray-700 font-bold">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+92 300 1234567"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="password" className="text-gray-700 font-bold">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
              <div className="text-center text-sm text-gray-500 mt-3">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-red-600 hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </div>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
