import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating Global Toast Stack */}
      {toasts.length > 0 && (
        <div className="reloop-toast-container" role="region" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`reloop-toast ${toast.type}`}>
              <div className="d-flex align-items-center gap-2">
                {toast.type === 'success' && <CheckCircle2 size={16} className="text-success" />}
                {toast.type === 'danger' && <AlertCircle size={16} className="text-danger" />}
                {toast.type === 'info' && <Info size={16} className="text-info" />}
                {toast.type === 'warning' && <AlertCircle size={16} className="text-warning" />}
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                className="btn btn-link text-white p-0 ms-2"
                style={{ opacity: 0.7 }}
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: () => {} };
  }
  return context;
};
