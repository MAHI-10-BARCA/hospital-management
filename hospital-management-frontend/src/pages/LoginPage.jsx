import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      toast.push("Login successful");
      navigate("/dashboard");
    } catch {
      toast.push("Invalid credentials", { type: "error" });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-hospital-50">
      <form onSubmit={handleSubmit} className="card w-96 space-y-4">
        <h2 className="text-2xl font-semibold text-hospital-800">Login</h2>
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border px-3 py-2 w-full rounded" />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border px-3 py-2 w-full rounded" />
        <button className="btn-primary w-full">Login</button>
        <p className="text-sm text-center">
          Don’t have an account? <a href="/register" className="text-hospital-600 underline">Register</a>
        </p>
      </form>
    </div>
  );
}
