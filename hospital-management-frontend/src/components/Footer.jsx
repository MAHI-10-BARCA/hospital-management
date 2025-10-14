// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white shadow mt-auto py-3 text-center text-gray-600 text-sm">
      © {new Date().getFullYear()} Hospital Management System — All Rights Reserved
    </footer>
  );
}
