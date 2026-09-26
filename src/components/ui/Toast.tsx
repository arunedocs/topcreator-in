"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface ToastItem {
  id: number;
  message: string;
}

const ToastContext = createContext<(message: string) => void>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-20 right-4 z-[70] flex w-[min(92vw,22rem)] flex-col gap-2 sm:bottom-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-2xl border border-white/10 bg-zinc-900/95 px-4 py-3 text-sm text-zinc-100 shadow-2xl backdrop-blur"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
