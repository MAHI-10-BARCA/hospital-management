// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <p className="mb-6">Page not found</p>
      <Link to="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded">Go to Dashboard</Link>
    </div>
  );
}
