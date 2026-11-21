"use client";

import { useAdmin } from "./AdminContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Layout, List, Activity, Newspaper, Image, Settings, User, LogOut, FileImage } from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/admin", icon: Layout },
  { key: "contents", label: "Konten Halaman", href: "/admin/contents", icon: List },
  { key: "ruang-gerak", label: "Ruang Gerak", href: "/admin/ruang-gerak", icon: Activity },
  { key: "articles", label: "Artikel & Berita", href: "/admin/articles", icon: Newspaper },
  { key: "gallery", label: "Galeri", href: "/admin/gallery", icon: Image },
  { key: "media", label: "Media Library", href: "/admin/media", icon: FileImage },
  { key: "navigation", label: "Navigasi Website", href: "/admin/navigation", icon: Menu },
  { key: "settings", label: "Pengaturan Website", href: "/admin/settings", icon: Settings },
  { key: "profile", label: "Profil Admin", href: "/admin/profile", icon: User },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAdmin();
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 border-r-4 border-black shadow-hard transition-transform duration-300 ${
        sidebarOpen ? "w-64 translate-x-0" : "w-16 -translate-x-full md:translate-x-0 md:w-16"
      } bg-black`}
    >
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <span className="text-acid-lime font-grotesk font-black text-lg tracking-tighter">GENSA</span>
          <span className="text-warm-cream font-mono font-bold text-xs hidden md:block">Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-warm-cream hover:text-acid-lime md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
      </div>

      <nav className="mt-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.key !== "dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-none transition-colors ${
                isActive
                  ? "bg-forest-green text-warm-cream shadow-md"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              <span className={sidebarOpen ? "font-mono font-bold text-xs" : "hidden"}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 w-full p-4 border-t-4 border-black">
        <button
          onClick={(e) => { e.preventDefault(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          <span className={sidebarOpen ? "font-mono font-bold text-xs" : "hidden"}>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
