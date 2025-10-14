// src/pages/DoctorsPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../services/api";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", specialization: "", contact: "" });

  const [confirm, setConfirm] = useState({ show: false, id: null });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDoctors();
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Failed to load doctors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", specialization: "", contact: "" });
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({ name: d.name || "", specialization: d.specialization || "", contact: d.contact || "" });
    setShowModal(true);
  };

  const submit = async (e) => {
    e?.preventDefault();
    try {
      if (editing) {
        await updateDoctor(editing.id, form);
      } else {
        await createDoctor(form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      alert("Save failed: " + (err?.response?.data || err.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoctor(id);
      load();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <>
      <Navbar pageTitle="Doctors" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Doctors</h2>
          <div>
            <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Doctor</button>
          </div>
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Specialization</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
              ) : doctors.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center">No doctors yet</td></tr>
              ) : doctors.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-3">{d.id}</td>
                  <td className="p-3">{d.name}</td>
                  <td className="p-3">{d.specialization}</td>
                  <td className="p-3">{d.contact}</td>
                  <td className="p-3">
                    <button onClick={() => openEdit(d)} className="mr-2 px-3 py-1 rounded border">Edit</button>
                    <button onClick={() => setConfirm({ show: true, id: d.id })} className="px-3 py-1 rounded bg-red-500 text-white">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Doctor" : "Add Doctor"}>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <div className="text-sm mb-1">Name</div>
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border p-2 rounded" required />
          </label>
          <label className="block">
            <div className="text-sm mb-1">Specialization</div>
            <input value={form.specialization} onChange={(e) => setForm({...form, specialization: e.target.value})} className="w-full border p-2 rounded" required />
          </label>
          <label className="block">
            <div className="text-sm mb-1">Contact</div>
            <input value={form.contact} onChange={(e) => setForm({...form, contact: e.target.value})} className="w-full border p-2 rounded" />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 rounded border">Cancel</button>
            <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white">{editing ? "Save" : "Create"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog show={confirm.show} onClose={() => setConfirm({show:false,id:null})} onConfirm={() => handleDelete(confirm.id)} message="Delete this doctor?" />
    </>
  );
}
