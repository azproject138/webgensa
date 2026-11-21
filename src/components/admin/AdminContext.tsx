"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

interface AdminContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  confirmTitle: string;
  setConfirmTitle: (title: string) => void;
  confirmAction: (() => void) | null;
  setConfirmAction: (action: (() => void) | null) => void;
  admin: AdminUser | null;
  adminLoading: boolean;
  refreshAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  const fetchAdmin = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAdmin(data.admin ?? null);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshAdmin = useCallback(async () => {
    setAdminLoading(true);
    await fetchAdmin();
  }, [fetchAdmin]);

  return (
    <AdminContext.Provider value={{
      sidebarOpen,
      setSidebarOpen,
      toasts,
      showToast,
      removeToast,
      confirmOpen,
      setConfirmOpen,
      confirmTitle,
      setConfirmTitle,
      confirmAction,
      setConfirmAction,
      admin,
      adminLoading,
      refreshAdmin,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return ctx;
}
