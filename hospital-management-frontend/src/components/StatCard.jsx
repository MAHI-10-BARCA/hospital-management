// src/components/StatCard.jsx
import React from "react";

export default function StatCard({ title, value, delta, icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-14 h-14 rounded-lg bg-hospital-50 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-hospital-800">{value}</div>
      </div>
      {delta && (
        <div className={`text-sm ${delta > 0 ? "text-green-600" : "text-red-600"}`}>
          {delta > 0 ? `+${delta}%` : `${delta}%`}
        </div>
      )}
    </div>
  );
}
