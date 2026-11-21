"use client";

import { useAdmin } from "./AdminContext";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

const icons: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const typeColors: Record<string, string> = {
  success: "bg-forest-green text-warm-cream",
  error: "bg-red-600 text-white",
  warning: "bg-orange text-white",
  info: "bg-blue-600 text-white",
};

export function ToastItem({ toast }: { toast: { id: string; type: string; title: string; message?: string } }) {
  const { removeToast } = useAdmin();
  const Icon = icons[toast.type] || Info;
  return (
    <div
      key={toast.id}
      className={`flex items-start gap-3 p-4 rounded-none border-brutal shadow-hard ${typeColors[toast.type] ?? typeColors.info} text-sm font-mono`}
    >
      <Icon size={18} strokeWidth={2} />
      <div className="flex-1">
        <div className="font-bold">{toast.title}</div>
        {toast.message && <div className="text-[0.85rem] opacity-90 mt-1">{toast.message}</div>}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-2 hover:opacity-70"
        aria-label="Tutup notifikasi"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useAdmin();
  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
