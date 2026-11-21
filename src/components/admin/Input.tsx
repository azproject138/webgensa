"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = "", ...props }, ref) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-xs font-mono font-bold text-white mb-1 uppercase tracking-widest">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-3 py-2 text-black bg-white border-2 border-gray-400 focus:border-lime-600 focus:ring-2 focus:ring-lime-600/20 focus:outline-none transition-all placeholder:text-gray-500 disabled:bg-gray-200 disabled:text-gray-500 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-[0.8rem] text-red-400 font-mono">{error}</p>}
    </div>
  );
});

Input.displayName = "AdminInput";
