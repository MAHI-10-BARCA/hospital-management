import React from 'react';

export default function Navbar({ pageTitle }) {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* This element is intentionally left empty to push content to the right, can be used for breadcrumbs later */}
      <div></div>
      <div className="flex items-center">
        <span className="text-gray-600 mr-4">Welcome, Admin!</span>
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
          A
        </div>
      </div>
    </header>
  );
}