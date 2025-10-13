// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow">
      <div className="text-xl font-bold text-blue-600">HMS</div>
      <div className="space-x-4">
        <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
        <Link to="/patients" className="text-gray-700 hover:text-blue-600">Patients</Link>
        <Link to="/doctors" className="text-gray-700 hover:text-blue-600">Doctors</Link>
        <Link to="/appointments" className="text-gray-700 hover:text-blue-600">Appointments</Link>
        <button onClick={logout} className="ml-4 bg-red-500 text-white px-3 py-1 rounded">Logout</button>
      </div>
    </div>
  );
}
