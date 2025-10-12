import React from 'react';

// Mock data
const mockAppointments = [
  { id: 'A001', patientName: 'John Doe', doctorName: 'Dr. Alice Brown', date: '2025-10-15', time: '10:00 AM', status: 'Confirmed' },
  { id: 'A002', patientName: 'Jane Smith', doctorName: 'Dr. Carol Green', date: '2025-10-15', time: '11:30 AM', status: 'Pending' },
  { id: 'A003', patientName: 'Peter Jones', doctorName: 'Dr. Alice Brown', date: '2025-10-16', time: '02:00 PM', status: 'Completed' },
];

export default function AppointmentsPage() {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-200 text-blue-800';
      case 'Pending': return 'bg-yellow-200 text-yellow-800';
      case 'Completed': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Schedule Appointment
        </button>
      </div>
      <div className="bg-white shadow-lg rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="p-4 font-semibold">Appt ID</th>
              <th className="p-4 font-semibold">Patient</th>
              <th className="p-4 font-semibold">Doctor</th>
              <th className="p-4 font-semibold">Date & Time</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAppointments.map((appt) => (
              <tr key={appt.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">{appt.id}</td>
                <td className="p-4">{appt.patientName}</td>
                <td className="p-4">{appt.doctorName}</td>
                <td className="p-4">{`${appt.date} at ${appt.time}`}</td>
                <td className="p-4">
                   <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appt.status)}`}>
                    {appt.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-blue-500 hover:underline">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}