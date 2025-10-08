import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    api.get("/patients")
      .then(res => setPatients(res.data))
      .catch(err => console.error("❌ Error fetching patients:", err));
  }, []);

  return (
    <div className="p-6">
      <h2>🩺 Patient List</h2>
      <table border="1" cellPadding="10" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td>{p.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsPage;
