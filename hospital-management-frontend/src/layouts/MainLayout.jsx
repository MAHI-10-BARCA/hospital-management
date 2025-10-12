import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// This is the fix: "export default" on the function itself.
export default function MainLayout() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar pageTitle="Hospital Dashboard" />
        <main className="flex-1 p-6">
          {/* Your pages will be rendered here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}