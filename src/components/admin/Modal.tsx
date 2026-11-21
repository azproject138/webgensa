"use client";

import { X } from "lucide-react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center" aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl p-6 bg-black border-brutal shadow-hard mx-4 md:mx-0">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-grotesk font-bold text-white text-lg">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={20} strokeWidth={2} />
            </button>
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
