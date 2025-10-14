// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getProfile, updateProfile } from "../services/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        setUser(res.data);
        setForm(res.data || {});
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const save = async () => {
    try {
      const res = await updateProfile(form);
      setUser(res.data);
      setEditing(false);
      alert("Profile updated");
    } catch (err) {
      alert("Update failed");
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <>
      <Navbar pageTitle="Profile" />
      <div className="p-6">
        <div className="bg-white rounded shadow p-6 max-w-xl">
          <h2 className="text-xl font-semibold mb-4">Your profile</h2>
          <label className="block mb-2">
            <div className="text-sm">Username</div>
            <input value={form.username} onChange={(e)=>setForm({...form, username: e.target.value})} className="w-full border p-2 rounded" disabled />
          </label>
          {/* Add other editable fields if your User has them */}
          <div className="mt-4 flex gap-2">
            {editing ? (
              <>
                <button onClick={()=>save()} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
                <button onClick={()=>{setEditing(false); setForm(user);}} className="px-3 py-1 border rounded">Cancel</button>
              </>
            ) : (
              <button onClick={()=>setEditing(true)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
