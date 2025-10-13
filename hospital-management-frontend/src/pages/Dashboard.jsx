// src/pages/Dashboard.jsx
import React from "react";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">🏥 Hospital Dashboard</h1>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">👨‍⚕️ Manage Patients</div>
          <div className="bg-white p-4 rounded shadow">🩺 Manage Doctors</div>
          <div className="bg-white p-4 rounded shadow">📅 Appointments</div>
        </div>
      </div>
    </>
  );
}
