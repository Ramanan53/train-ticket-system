import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

/* ── Types ─────────────────────────────────────────── */
type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

/* ── Context ────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

/* ── Icons ──────────────────────────────────────────── */
const ICONS: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  info:    "ℹ",
};

/* ── Individual Toast ───────────────────────────────── */
function ToastItem({ toast }: { toast: Toast }) {
  return (
    <div className={`toast toast-${toast.type}`} role="alert">
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <span>{toast.message}</span>
    </div>
  );
}

/* ── Provider ───────────────────────────────────────── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
