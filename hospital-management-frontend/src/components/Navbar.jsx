// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiUser, FiLogOut } from "react-icons/fi";

export default function Navbar({ pageTitle = "Dashboard" }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden" onClick={() => document.body.classList.toggle("sidebar-open")}>
          ☰
        </button>
        <div>
          <h1 className="text-lg font-semibold text-hospital-800">{pageTitle}</h1>
          <div className="text-xs text-gray-500">Welcome to HealthCare OS</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100"><FiBell /></button>
        <Link to="/profile" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
          <FiUser /> <span className="hidden md:inline">Profile</span>
        </Link>
        <button onClick={logout} className="flex items-center gap-2 btn-outline small"><FiLogOut /> Logout</button>
      </div>
    </header>
  );
}
