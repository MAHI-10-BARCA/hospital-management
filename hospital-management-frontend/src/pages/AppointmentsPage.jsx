import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";
import SearchBar from "../components/SearchBar";

export default function AppointmentsPage() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/api/appointments");
      setAppointments(res.data || []);
    } catch (err) {
      toast.push("Failed to load appointments", { type: "error" });
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete appointment?")) return;
    try {
      await api.delete(`/api/appointments/${id}`);
      toast.push("Appointment deleted");
      load();
    } catch (err) {
      toast.push("Delete failed", { type: "error" });
    }
  };

  const filtered = appointments.filter(a =>
    a.patientName?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-hospital-800">Appointments</h2>
        <SearchBar value={query} onChange={setQuery} placeholder="Search patient..." />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">#</th>
              <th className="p-2">Patient</th>
              <th className="p-2">Doctor</th>
              <th className="p-2">Date</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.id} className="border-b hover:bg-slate-50">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{a.patientName}</td>
                <td className="p-2">{a.doctorName}</td>
                <td className="p-2">{a.date}</td>
                <td className="p-2">
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 text-sm hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
