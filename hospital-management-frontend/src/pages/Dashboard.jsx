// src/pages/Dashboard.jsx

import { Link, useNavigate } from "react-router-dom"; // <-- FIX 1: Import useNavigate

export default function Dashboard() {
  const navigate = useNavigate(); // <-- FIX 2: Initialize the hook

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // <-- FIX 3: Use navigate to go to the login page
  };

  return (
    <div className="p-6 bg-gray-50 flex-1">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
        {/* The Navbar already has a logout button, so you might not need this one.
            But if you keep it, it's now fixed. */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/patients" className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">👥 Manage Patients</h2>
          <p className="text-gray-600">View, add, or update patient records.</p>
        </Link>

        <Link to="/doctors" className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-2 text-green-600">👨‍⚕️ Manage Doctors</h2>
          <p className="text-gray-600">Oversee doctor information and schedules.</p>
        </Link>

        <Link to="/appointments" className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-2 text-purple-600">🗓️ View Appointments</h2>
          <p className="text-gray-600">Track and manage all appointments.</p>
        </Link>
      </div>
    </div>
  );
}