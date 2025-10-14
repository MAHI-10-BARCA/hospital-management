import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from "recharts";
import StatCard from "../components/StatCard";
import { FiUsers, FiCalendar, FiUserCheck } from "react-icons/fi";
import api from "../services/api";
import { useToast } from "../components/Toast";

export default function Dashboard() {
  const toast = useToast();
  const [summary, setSummary] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [appointmentsTrend, setAppointmentsTrend] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [dRes, pRes, aRes] = await Promise.all([
          api.get("/doctors"),
          api.get("/patients"),
          api.get("/api/appointments")
        ]);
        setSummary({
          doctors: dRes.data.length,
          patients: pRes.data.length,
          appointments: aRes.data.length
        });

        const trend = Array.from({ length: 7 }).map((_, i) => ({
          day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
          appts: Math.floor(Math.random() * 6) + 2
        }));
        setAppointmentsTrend(trend);

        setTopDoctors(dRes.data.slice(0, 5).map((d, i) => ({
          name: d.name || `Dr ${i + 1}`,
          count: Math.floor(Math.random() * 30) + 5
        })));

        toast.push("Dashboard data loaded");
      } catch {
        toast.push("Failed to load dashboard", { type: "error" });
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Doctors" value={summary.doctors} delta={4} icon={<FiUserCheck size={20} className="text-hospital-600" />} />
        <StatCard title="Patients" value={summary.patients} delta={12} icon={<FiUsers size={20} className="text-hospital-600" />} />
        <StatCard title="Appointments" value={summary.appointments} delta={-2} icon={<FiCalendar size={20} className="text-hospital-600" />} />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="card col-span-2">
          <h3 className="text-lg font-semibold mb-2">Appointments (last 7 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={appointmentsTrend}>
              <defs>
                <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e6fff" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#1e6fff" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="appts" stroke="#1e6fff" fill="url(#colorAppt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Top Doctors</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topDoctors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#1e6fff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
