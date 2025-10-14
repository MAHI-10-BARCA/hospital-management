// src/components/ConfirmDialog.jsx
import React from "react";

export default function ConfirmDialog({ show, onClose, onConfirm, message }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <p className="mb-4 text-gray-700">{message || "Are you sure?"}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
        </div>
      </div>
    </div>
  );
}
