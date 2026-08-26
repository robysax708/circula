// src/context/ToastContext.jsx
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'info') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none" role="log" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm w-full rounded-lg px-4 py-3 shadow-lg text-sm font-medium border-2 border-[var(--c-ink)] ${
            t.type === 'error' ? 'bg-[var(--c-pink)] text-[var(--c-paper)]'
            : t.type === 'success' ? 'bg-[var(--c-green)] text-[var(--c-paper)]'
            : 'bg-[var(--c-purple)] text-[var(--c-paper)]'
          }`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
