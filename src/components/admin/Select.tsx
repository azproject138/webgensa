"use client";

import { forwardRef, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className = "", ...props }, ref) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-xs font-mono font-bold text-white mb-1 uppercase tracking-widest">{label}</label>}
      <select
        ref={ref}
        className={`w-full px-3 py-2 text-black bg-white border-2 border-gray-400 focus:border-lime-600 focus:ring-2 focus:ring-lime-600/20 focus:outline-none transition-all disabled:bg-gray-200 disabled:text-gray-500 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""} ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-black">{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-[0.8rem] text-red-400 font-mono">{error}</p>}
    </div>
  );
});

Select.displayName = "AdminSelect";
