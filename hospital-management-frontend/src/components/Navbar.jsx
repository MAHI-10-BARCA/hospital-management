// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ pageTitle }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-blue-600 shadow-md">
      <h1 className="text-2xl font-bold text-white">{pageTitle || "🏥 HealthCare OS"}</h1>
      <div className="space-x-4">
        <Link to="/dashboard" className="text-white hover:text-gray-200">Dashboard</Link>
        <Link to="/patients" className="text-white hover:text-gray-200">Patients</Link>
        <Link to="/doctors" className="text-white hover:text-gray-200">Doctors</Link>
        <Link to="/appointments" className="text-white hover:text-gray-200">Appointments</Link>
        <button
          onClick={logout}
          className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
