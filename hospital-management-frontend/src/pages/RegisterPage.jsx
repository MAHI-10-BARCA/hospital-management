// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "ROLE_USER" });
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return toast.push("Please fill all fields", { type: "error" });
    }

    try {
      await api.post("/auth/register", form);
      toast.push("Registration successful!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const message = err?.response?.data?.message || "Registration failed";
      toast.push(message, { type: "error" });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-hospital-50">
      <form onSubmit={handleSubmit} className="card w-96 p-6 space-y-4 shadow-lg border border-gray-200 rounded-lg bg-white">
        <h2 className="text-2xl font-semibold text-hospital-800 text-center">Create an Account</h2>

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border px-3 py-2 w-full rounded focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border px-3 py-2 w-full rounded focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border px-3 py-2 w-full rounded focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border px-3 py-2 w-full rounded focus:ring-2 focus:ring-blue-400"
        >
          <option value="ROLE_USER">Patient</option>
          <option value="ROLE_DOCTOR">Doctor</option>
          <option value="ROLE_ADMIN">Admin</option>
        </select>

        <button className="btn-primary w-full py-2 mt-2">Register</button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}
