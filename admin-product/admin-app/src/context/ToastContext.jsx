import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, tone = 'default') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);
  const toast = { show: (m) => push(m), error: (m) => push(m, 'error') };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <div key={t.id}
            className={'pointer-events-auto flex items-center gap-2 rounded-md px-4 py-2.5 text-sm shadow-lg ' +
              (t.tone === 'error' ? 'border border-ink-900 bg-white text-ink-900' : 'bg-ink-900 text-white')}>
            <span className={'inline-block h-1.5 w-1.5 rounded-full ' + (t.tone === 'error' ? 'border border-ink-900' : 'bg-white')} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
