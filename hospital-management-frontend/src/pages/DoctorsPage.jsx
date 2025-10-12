import React from 'react';

// Mock data
const mockDoctors = [
  { id: 'D001', name: 'Dr. Alice Brown', specialization: 'Cardiology', onCall: true },
  { id: 'D002', name: 'Dr. Bob White', specialization: 'Neurology', onCall: false },
  { id: 'D003', name: 'Dr. Carol Green', specialization: 'Pediatrics', onCall: true },
];

export default function DoctorsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Doctors</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Add New Doctor
        </button>
      </div>
      <div className="bg-white shadow-lg rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="p-4 font-semibold">Doctor ID</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Specialization</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockDoctors.map((doctor) => (
              <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">{doctor.id}</td>
                <td className="p-4">{doctor.name}</td>
                <td className="p-4">{doctor.specialization}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${doctor.onCall ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {doctor.onCall ? 'On Call' : 'Off Duty'}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-blue-500 hover:underline mr-4">Edit</button>
                  <button className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}