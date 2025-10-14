// src/components/SearchBar.jsx
import React from "react";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="flex items-center gap-2">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
             className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hospital-500" />
      <button className="btn-outline small">Search</button>
    </div>
  );
}
