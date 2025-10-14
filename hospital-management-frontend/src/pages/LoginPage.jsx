// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await loginUser({ username, password });
      const token = res.data.token;
      if (token) {
        localStorage.setItem("token", token);
        navigate("/dashboard");
      } else {
        setErr("Login failed: no token returned");
      }
    } catch (error) {
      const msg = error?.response?.data || "Invalid credentials";
      setErr(String(msg));
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Welcome Back 👋</h2>
        {err && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{err}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
          />
          <input
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-medium transition">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          New user?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
