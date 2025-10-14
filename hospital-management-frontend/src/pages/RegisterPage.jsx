// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", password: "", roles: ["ROLE_USER"] });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const res = await registerUser(form);
      setMsg(res.data);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err?.response?.data || "Registration failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Create an Account</h2>

        {msg && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{msg}</div>}
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            name="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
          />
          <input
            required
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={form.roles[0]}
            onChange={(e) => setForm({ ...form, roles: [e.target.value] })}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
          >
            <option value="ROLE_USER">Patient</option>
            <option value="ROLE_DOCTOR">Doctor</option>
            <option value="ROLE_ADMIN">Admin</option>
          </select>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-medium transition">
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
