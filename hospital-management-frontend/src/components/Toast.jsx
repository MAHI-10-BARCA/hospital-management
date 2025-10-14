// src/components/Toast.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, opts = {}) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, ...opts }]);
    if (!opts.sticky) {
      setTimeout(() => {
        setToasts((t) => t.filter(x => x.id !== id));
      }, opts.duration || 3500);
    }
  }, []);

  const remove = (id) => setToasts((t) => t.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className="bg-white border rounded-lg p-3 shadow flex items-start gap-3">
            <div className="text-sm">{t.msg}</div>
            <div className="ml-2">
              <button onClick={() => remove(t.id)} className="text-xs text-gray-400">✕</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
