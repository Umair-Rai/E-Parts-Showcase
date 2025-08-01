import React from "react";
import Button from "../Component/Button";
import Input from "../Component/Input";
import Label from "../Component/Label";
import Card, { CardHeader, CardTitle, CardContent } from "../Component/Card";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // login logic here
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black to-gray-900 px-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-red-700">
            Al Sayyeds Enterprise
          </CardTitle>
          <p className="text-sm text-center text-gray-500">
            Sign in to manage your mechanical parts dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" required placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input type="password" id="password" required placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">
              Login
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
    </div>
  );
};

export default Login;
