// ToastContext: the small messages that pop up in the bottom-right corner ("Batch claimed.").
// Any component can call showToast("message") or showToast("message", "red").
import { createContext, useContext, useState } from "react";
import Icon from "../components/Icon.jsx";

const ToastContext = createContext(null);
const TOAST_DURATION_MS = 3200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function showToast(message, tone = "green") {
    const id = Date.now() + Math.random();
    setToasts((oldToasts) => [...oldToasts, { id, message, tone }]);
    // Remove this toast again after a few seconds.
    setTimeout(() => {
      setToasts((oldToasts) => oldToasts.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] grid gap-2" role="status">
        {toasts.map((toast) => (
          <div key={toast.id} className="glass flex animate-rise items-center gap-3 bg-white/85 px-4 py-3 text-[0.875rem]">
            <Icon
              name={toast.tone === "red" ? "circle-alert" : "circle-check"}
              className={toast.tone === "red" ? "text-red-500" : "text-forest"}
            />
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
