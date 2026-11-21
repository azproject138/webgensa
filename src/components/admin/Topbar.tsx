"use client";

import { useAdmin } from "./AdminContext";
import { useRouter, usePathname } from "next/navigation";
import { Sun, Moon, Bell, UserCircle } from "lucide-react";

export function Topbar() {
  const { setSidebarOpen } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      router.push("/admin/login");
    });
  };

  return (
    <header className="h-16 border-b-4 border-black bg-gray-900 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen((prev: boolean) => !prev)}
          className="text-gray-300 hover:text-white md:hidden"
          aria-label="Buka menu"
        >
          <Sun size={20} strokeWidth={2} />
        </button>
        <div className="hidden md:block">
          <h1 className="font-grotesk font-black text-xl text-white tracking-tighter">GENSA <span className="text-acid-lime">Admin</span></h1>
          <p className="text-[0.75rem] text-gray-400 font-mono uppercase tracking-wider">Dashboard Administrator</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-300 hover:text-white rounded-none border-brutal border-transparent hover:border-white transition-all" aria-label="Notifikasi">
          <Bell size={20} strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-700">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-mono font-bold text-white">Admin GENSA</span>
            <span className="text-[0.75rem] text-gray-400">super_admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-mono font-bold text-white bg-red-600 border-brutal hover:bg-red-700 transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
