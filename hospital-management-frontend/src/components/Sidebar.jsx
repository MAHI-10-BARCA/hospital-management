// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiUsers, FiCalendar, FiUserCheck } from "react-icons/fi";

const Item = ({ to, children }) => (
  <NavLink to={to} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-hospital-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
    {children}
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="bg-white w-64 border-r hidden md:block">
      <div className="p-4 border-b">
        <div className="text-hospital-500 font-bold text-lg">HealthCare OS</div>
        <div className="text-xs text-gray-400">Hospital Management</div>
      </div>
      <nav className="p-4 flex flex-col gap-2">
        <Item to="/dashboard"><FiHome /> Dashboard</Item>
        <Item to="/patients"><FiUsers /> Patients</Item>
        <Item to="/doctors"><FiUserCheck /> Doctors</Item>
        <Item to="/appointments"><FiCalendar /> Appointments</Item>
      </nav>
    </aside>
  );
}
