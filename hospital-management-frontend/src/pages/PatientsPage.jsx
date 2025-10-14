import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";
import SearchBar from "../components/SearchBar";

export default function PatientsPage() {
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [newPatient, setNewPatient] = useState({ name: "", age: "" });

  const load = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data || []);
    } catch {
      toast.push("Failed to load patients", { type: "error" });
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newPatient.name.trim()) return toast.push("Enter patient name");
    try {
      await api.post("/patients", newPatient);
      toast.push("Patient added");
      setNewPatient({ name: "", age: "" });
      load();
    } catch {
      toast.push("Add failed", { type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete patient?")) return;
    try {
      await api.delete(`/patients/${id}`);
      toast.push("Patient removed");
      load();
    } catch {
      toast.push("Delete failed", { type: "error" });
    }
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-hospital-800">Patients</h2>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="card mb-4 flex flex-wrap gap-2">
        <input
          placeholder="Name"
          value={newPatient.name}
          onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          placeholder="Age"
          type="number"
          value={newPatient.age}
          onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
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
              <th className="p-2">Age</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className="border-b hover:bg-slate-50">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.age}</td>
                <td className="p-2">
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 text-sm hover:underline">
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
