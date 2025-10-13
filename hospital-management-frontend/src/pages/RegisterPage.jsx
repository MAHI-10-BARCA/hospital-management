// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", password: "", roles: ["ROLE_USER"] });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await registerUser(form);
      setMsg(res.data);
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setMsg(error?.response?.data || "Registration failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-blue-600 mb-6">Register</h2>
        {msg && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{msg}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required name="username" value={form.username} onChange={(e)=>setForm({...form, username: e.target.value})} placeholder="Username" className="w-full border p-2 rounded"/>
          <input required name="password" type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} placeholder="Password" className="w-full border p-2 rounded"/>
          <select value={form.roles[0]} onChange={(e)=>setForm({...form, roles:[e.target.value]})} className="w-full border p-2 rounded">
            <option value="ROLE_USER">Patient (User)</option>
            <option value="ROLE_DOCTOR">Doctor</option>
            <option value="ROLE_ADMIN">Admin</option>
          </select>
          <button className="w-full bg-blue-600 text-white p-2 rounded">Register</button>
        </form>
      </div>
    </div>
  );
}
