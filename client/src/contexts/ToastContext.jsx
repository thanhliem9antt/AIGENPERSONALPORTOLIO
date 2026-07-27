import { createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const notify = (message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3500);
  };
  const value = useMemo(() => ({ notify }), []);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] grid gap-2" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="glass flex min-w-72 items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl">
            {toast.type === 'error' ? (
              <XCircle className="text-red-400" />
            ) : (
              <CheckCircle2 className="text-emerald-400" />
            )}
            <span className="flex-1 text-sm">{toast.message}</span>
            <button
              aria-label="Đóng thông báo"
              onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
