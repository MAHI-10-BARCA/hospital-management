// src/pages/PatientsPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    api.get("/patients")
      .then(res => setPatients(res.data))
      .catch(err => console.error("patients load error", err));
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Patients</h2>
        <div className="bg-white p-4 rounded shadow">
          <table className="w-full">
            <thead><tr className="bg-gray-100"><th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">Age</th></tr></thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.id}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
