import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";
import SearchBar from "../components/SearchBar";

export default function DoctorsPage() {
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [newDoctor, setNewDoctor] = useState({ name: "", specialization: "" });

  const load = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data || []);
    } catch {
      toast.push("Failed to load doctors", { type: "error" });
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newDoctor.name.trim()) return toast.push("Enter name");
    try {
      await api.post("/doctors", newDoctor);
      toast.push("Doctor added successfully");
      setNewDoctor({ name: "", specialization: "" });
      load();
    } catch {
      toast.push("Add failed", { type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete doctor?")) return;
    try {
      await api.delete(`/doctors/${id}`);
      toast.push("Doctor removed");
      load();
    } catch {
      toast.push("Delete failed", { type: "error" });
    }
  };

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-hospital-800">Doctors</h2>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="card mb-4 flex flex-wrap gap-2">
        <input
          placeholder="Name"
          value={newDoctor.name}
          onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          placeholder="Specialization"
          value={newDoctor.specialization}
          onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <button onClick={handleAdd} className="btn-primary">Add</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">#</th>
              <th className="p-2">Name</th>
              <th className="p-2">Specialization</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={d.id} className="border-b hover:bg-slate-50">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.specialization}</td>
                <td className="p-2">
                  <button onClick={() => handleDelete(d.id)} className="text-red-600 text-sm hover:underline">
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
