import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

// A simple placeholder logo icon
const LogoIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const baseLinkStyle = "flex items-center px-4 py-3 text-gray-300 hover:bg-blue-700 hover:text-white transition-colors duration-200 rounded-lg";
  const activeLinkStyle = "bg-blue-700 text-white font-bold";

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen flex flex-col p-4">
      <div className="px-4 py-6 text-center border-b border-gray-700">
        <LogoIcon />
        <h1 className="text-xl font-bold mt-2">HealthCare OS</h1>
      </div>
      <nav className="flex-grow mt-6 space-y-2">
        <NavLink to="/dashboard" className={({ isActive }) => `${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`}>
          <span className="ml-3">Dashboard</span>
        </NavLink>
        <NavLink to="/doctors" className={({ isActive }) => `${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`}>
          <span className="ml-3">Doctors</span>
        </NavLink>
        <NavLink to="/patients" className={({ isActive }) => `${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`}>
          <span className="ml-3">Patients</span>
        </NavLink>
        <NavLink to="/appointments" className={({ isActive }) => `${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`}>
          <span className="ml-3">Appointments</span>
        </NavLink>
      </nav>
      <div className="mt-auto">
        <button onClick={handleLogout} className={`${baseLinkStyle} w-full`}>
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </aside>
  );
}