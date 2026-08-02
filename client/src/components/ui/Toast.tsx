import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastTone = 'success' | 'error';

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId++;
      setToasts((list) => [...list, { id, tone, message }]);
      // Errors linger — the admin usually needs to read them.
      window.setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4000);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        className="pointer-events-none fixed bottom-5 left-1/2 z-[80] flex w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2.5"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.65, 0, 0.35, 1] }}
              className={`pointer-events-auto flex items-start gap-3 border px-4 py-3.5 text-sm shadow-lg ${
                toast.tone === 'success'
                  ? 'border-moss/30 bg-paper text-ink'
                  : 'border-ember/40 bg-paper text-ink'
              }`}
            >
              {toast.tone === 'success' ? (
                <CheckCircle2 size={17} strokeWidth={1.6} className="mt-0.5 shrink-0 text-moss" />
              ) : (
                <AlertTriangle size={17} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ember" />
              )}
              <p className="flex-1 leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-0.5 p-1 text-ink-muted hover:text-ink"
              >
                <X size={14} strokeWidth={1.8} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
