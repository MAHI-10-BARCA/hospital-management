// src/pages/DoctorsPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get("/doctors")
      .then(res => setDoctors(res.data))
      .catch(() => console.log("doctors load fail"));
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Doctors</h2>
        <div className="bg-white p-4 rounded shadow">
          <table className="w-full">
            <thead><tr className="bg-gray-100"><th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">Specialization</th></tr></thead>
            <tbody>
              {doctors.map(d => (
                <tr key={d.id} className="border-b">
                  <td className="p-2">{d.id}</td>
                  <td className="p-2">{d.name}</td>
                  <td className="p-2">{d.specialization}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
