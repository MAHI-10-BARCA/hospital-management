import React from 'react';

// Mock data - replace with API call later
const mockPatients = [
  { id: 'P001', name: 'John Doe', age: 45, gender: 'Male', lastVisit: '2025-10-10' },
  { id: 'P002', name: 'Jane Smith', age: 32, gender: 'Female', lastVisit: '2025-10-11' },
  { id: 'P003', name: 'Peter Jones', age: 67, gender: 'Male', lastVisit: '2025-09-25' },
];

export default function PatientsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Patient Records</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Add New Patient
        </button>
      </div>
      <div className="bg-white shadow-lg rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="p-4 font-semibold">Patient ID</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Age</th>
              <th className="p-4 font-semibold">Gender</th>
              <th className="p-4 font-semibold">Last Visit</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockPatients.map((patient) => (
              <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">{patient.id}</td>
                <td className="p-4">{patient.name}</td>
                <td className="p-4">{patient.age}</td>
                <td className="p-4">{patient.gender}</td>
                <td className="p-4">{patient.lastVisit}</td>
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