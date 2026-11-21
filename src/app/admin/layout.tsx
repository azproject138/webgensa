"use client";

import { usePathname } from "next/navigation";
import { AdminProvider } from "@/components/admin/AdminContext";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Halaman login tidak dibungkus shell dashboard
  if (pathname === "/admin/login") {
    return <AdminProvider>{children}</AdminProvider>;
  }

  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
