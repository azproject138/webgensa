"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "solid", className = "", disabled, ...props }, ref) => {
  const base = "inline-flex items-center justify-center gap-2 font-mono font-bold rounded-none border-brutal shadow-hard transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<string, string> = {
    solid: "bg-black text-white hover:bg-gray-800",
    outline: "bg-transparent text-black hover:bg-warm-cream",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button ref={ref} disabled={disabled} className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
});

Button.displayName = "AdminButton";
