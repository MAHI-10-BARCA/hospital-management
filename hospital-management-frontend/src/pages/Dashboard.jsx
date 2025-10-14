// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();

  const cards = [
    { title: "Manage Patients", emoji: "🧍‍♂️", link: "/patients" },
    { title: "Manage Doctors", emoji: "👨‍⚕️", link: "/doctors" },
    { title: "Appointments", emoji: "📅", link: "/appointments" },
  ];

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">🏥 Hospital Dashboard</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div
              key={c.title}
              onClick={() => navigate(c.link)}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition transform cursor-pointer text-center"
            >
              <div className="text-4xl mb-2">{c.emoji}</div>
              <h3 className="text-lg font-semibold text-gray-700">{c.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
