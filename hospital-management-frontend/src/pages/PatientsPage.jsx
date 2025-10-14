// src/pages/PatientsPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../services/api";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", age: "", gender: "Male" });

  const [confirm, setConfirm] = useState({ show: false, id: null });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPatients();
      setPatients(res.data || []);
    } catch (err) {
      console.error("Failed to load patients", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", age: "", gender: "Male" });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name || "", age: p.age || "", gender: p.gender || "Male" });
    setShowModal(true);
  };

  const submit = async (e) => {
    e?.preventDefault();
    try {
      if (editing) {
        await updatePatient(editing.id, { ...form, age: Number(form.age) });
      } else {
        await createPatient({ ...form, age: Number(form.age) });
      }
      setShowModal(false);
      load();
    } catch (err) {
      alert("Save failed: " + (err?.response?.data || err.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePatient(id);
      load();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <>
      <Navbar pageTitle="Patients" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Patients</h2>
          <div>
            <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Patient</button>
          </div>
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Age</th>
                <th className="p-3 text-left">Gender</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center">No patients yet</td></tr>
              ) : patients.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.id}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.age}</td>
                  <td className="p-3">{p.gender}</td>
                  <td className="p-3">
                    <button onClick={() => openEdit(p)} className="mr-2 px-3 py-1 rounded border">Edit</button>
                    <button onClick={() => setConfirm({ show: true, id: p.id })} className="px-3 py-1 rounded bg-red-500 text-white">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Patient" : "Add Patient"}>
        <form onSubmit={submit} className="space-y-3">
          <label className="block"><div className="text-sm mb-1">Name</div>
            <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="w-full border p-2 rounded" required />
          </label>
          <label className="block"><div className="text-sm mb-1">Age</div>
            <input type="number" value={form.age} onChange={(e)=>setForm({...form, age: e.target.value})} className="w-full border p-2 rounded" required />
          </label>
          <label className="block"><div className="text-sm mb-1">Gender</div>
            <select value={form.gender} onChange={(e)=>setForm({...form, gender: e.target.value})} className="w-full border p-2 rounded">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={()=>setShowModal(false)} className="px-3 py-1 rounded border">Cancel</button>
            <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white">{editing ? "Save" : "Create"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog show={confirm.show} onClose={() => setConfirm({show:false,id:null})} onConfirm={() => handleDelete(confirm.id)} message="Delete this patient?" />
    </>
  );
}
