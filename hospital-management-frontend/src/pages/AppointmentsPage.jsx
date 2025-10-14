// src/pages/AppointmentsPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  getAppointments,
  createAppointment,
  deleteAppointment,
  getDoctors,
  getAvailableSchedulesForDoctor,
  getPatients
} from "../services/api";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: "", doctorId: "", date: "", time: "", scheduleId: null });
  const [schedules, setSchedules] = useState([]);

  const [confirm, setConfirm] = useState({ show: false, id: null });

  const load = async () => {
    setLoading(true);
    try {
      const [apRes, dRes, pRes] = await Promise.all([getAppointments(), getDoctors(), getPatients().catch(()=>({data:[]}))]);
      setAppointments(apRes.data || []);
      setDoctors(dRes.data || []);
      setPatients(pRes.data || []);
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = () => {
    setForm({ patientId: "", doctorId: "", date: "", time: "", scheduleId: null });
    setSchedules([]);
    setShowModal(true);
  };

  const onDoctorChange = async (doctorId) => {
    setForm({ ...form, doctorId, scheduleId: null });
    try {
      const res = await getAvailableSchedulesForDoctor(doctorId);
      setSchedules(res.data || []);
    } catch (err) {
      // if schedules endpoint not available, ignore
      setSchedules([]);
    }
  };

  const submit = async (e) => {
    e?.preventDefault();
    try {
      // If scheduleId provided, send schedule reference; otherwise send patientId, doctorId, date/time
      const payload = form.scheduleId ? { schedule: { id: form.scheduleId }, patientId: Number(form.patientId) } : {
        patientId: Number(form.patientId),
        doctorId: Number(form.doctorId),
        date: form.date,
        time: form.time
      };
      await createAppointment(payload);
      setShowModal(false);
      load();
    } catch (err) {
      alert("Booking failed: " + (err?.response?.data || err.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppointment(id);
      load();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <>
      <Navbar pageTitle="Appointments" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Appointments</h2>
          <div>
            <button onClick={openModal} className="bg-blue-600 text-white px-4 py-2 rounded">+ Book Appointment</button>
          </div>
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Doctor</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center">No appointments yet</td></tr>
              ) : appointments.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-3">{a.id}</td>
                  <td className="p-3">{a.patientName || a.patientId}</td>
                  <td className="p-3">{a.doctorName || a.doctorId}</td>
                  <td className="p-3">{a.date}</td>
                  <td className="p-3">{a.time}</td>
                  <td className="p-3">
                    <button onClick={() => setConfirm({ show: true, id: a.id })} className="px-3 py-1 rounded bg-red-500 text-white">Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title="Book Appointment">
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <div className="text-sm mb-1">Patient</div>
            <select value={form.patientId} onChange={(e)=>setForm({...form, patientId: e.target.value})} className="w-full border p-2 rounded" required>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>)}
            </select>
          </label>

          <label className="block">
            <div className="text-sm mb-1">Doctor</div>
            <select value={form.doctorId} onChange={(e)=>onDoctorChange(e.target.value)} className="w-full border p-2 rounded" required>
              <option value="">Select doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
            </select>
          </label>

          {schedules.length > 0 ? (
            <label className="block">
              <div className="text-sm mb-1">Available Slots (select one)</div>
              <select value={form.scheduleId || ""} onChange={(e)=>setForm({...form, scheduleId: e.target.value})} className="w-full border p-2 rounded">
                <option value="">Choose slot</option>
                {schedules.map(s => <option key={s.id} value={s.id}>{s.availableDate} {s.startTime} - {s.endTime}</option>)}
              </select>
            </label>
          ) : (
            <>
              <label className="block">
                <div className="text-sm mb-1">Date</div>
                <input type="date" value={form.date} onChange={(e)=>setForm({...form, date: e.target.value})} className="w-full border p-2 rounded" required />
              </label>
              <label className="block">
                <div className="text-sm mb-1">Time</div>
                <input type="time" value={form.time} onChange={(e)=>setForm({...form, time: e.target.value})} className="w-full border p-2 rounded" required />
              </label>
            </>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={()=>setShowModal(false)} className="px-3 py-1 rounded border">Cancel</button>
            <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white">Book</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog show={confirm.show} onClose={() => setConfirm({show:false,id:null})} onConfirm={() => deleteAppointment(confirm.id).then(()=>load()).catch(()=>alert("Delete failed"))} message="Cancel this appointment?" />
    </>
  );
}
