import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";
export interface Toast { id: number; message: string; type: ToastType; }

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return { toasts, addToast };
}
