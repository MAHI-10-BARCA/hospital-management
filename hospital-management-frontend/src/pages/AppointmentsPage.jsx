// src/pages/AppointmentsPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get("/appointments")
      .then(res => setAppointments(res.data))
      .catch(() => console.log("appointments load fail"));
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Appointments</h2>
        <div className="bg-white p-4 rounded shadow">
          <table className="w-full">
            <thead><tr className="bg-gray-100"><th className="p-2">ID</th><th className="p-2">Patient</th><th className="p-2">Doctor</th><th className="p-2">Date</th></tr></thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id} className="border-b">
                  <td className="p-2">{a.id}</td>
                  <td className="p-2">{a.patientName || a.patientId}</td>
                  <td className="p-2">{a.doctorName || a.doctorId}</td>
                  <td className="p-2">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
