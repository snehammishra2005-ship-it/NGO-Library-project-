import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

// Grayscale toast confirmations (wishlist actions, notify-me, etc.).
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, tone = 'default') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const toast = {
    show: (m) => push(m, 'default'),
    error: (m) => push(m, 'error'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'pointer-events-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-sm shadow-card ' +
              (t.tone === 'error'
                ? 'border border-ink-800 bg-paper-pure text-ink-900'
                : 'bg-ink-900 text-paper-pure')
            }
          >
            <span
              className={
                'inline-block h-2 w-2 rounded-full ' +
                (t.tone === 'error' ? 'border border-ink-800' : 'bg-paper-pure')
              }
            />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
