"use client";

import { useAdmin } from "./AdminContext";
import { X } from "lucide-react";
import { useEffect } from "react";

export function ConfirmDialog() {
  const { confirmOpen, confirmTitle, setConfirmOpen, confirmAction, setConfirmAction } = useAdmin();

  useEffect(() => {
    if (confirmOpen && !confirmAction) {
      setConfirmOpen(false);
    }
  }, [confirmOpen, confirmAction, setConfirmAction]);

  if (!confirmOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmOpen(false)} />
      <div className="relative w-full max-w-md p-6 bg-black border-brutal shadow-hard">
        <h3 className="font-grotesk font-bold text-white text-lg mb-2">{confirmTitle}</h3>
        <p className="text-gray-300 text-sm mb-6">Tindakan ini tidak dapat dibatalkan. Lanjutkan?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => { setConfirmOpen(false); setConfirmAction(null); }}
            className="px-4 py-2 text-white bg-gray-800 border-brutal border-gray-600 font-mono font-bold hover:bg-gray-700 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => { confirmAction?.(); setConfirmOpen(false); setConfirmAction(null); }}
            className="px-4 py-2 text-white bg-red-600 border-brutal font-mono font-bold hover:bg-red-700 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
