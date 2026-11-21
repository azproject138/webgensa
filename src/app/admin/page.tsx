"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import { useAdmin } from "@/components/admin/AdminContext";
import { Activity, Newspaper, Image, Layout, User, Clock } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  color?: string;
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, color = "text-white", subtitle }: StatCardProps) {
  return (
    <div className="bg-gray-800 border-brutal shadow-hard p-5 rounded-none">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-grotesk font-bold {color}">{value}</p>
          {subtitle && <p className="text-[0.75rem] text-gray-500 font-mono">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 flex items-center justify-center bg-gray-700/50 border-brutal">
          <Icon size={20} strokeWidth={2} className={color} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { showToast } = useAdmin();
  const router = useRouter();
  const go = (href: string) => () => router.push(href);
  interface StatsData {
    posts: { total: number; published: number; draft: number; archived: number };
    gallery: number;
    categories: number;
    pages: number;
    recentAdmins: { id: string; name: string; email: string; last_login_at: string | null }[];
    recentlyUpdated: { type: string; title: string; updated_at: string }[];
  }
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => {
        if (!r.status) return r.json().then((j) => { throw j; });
        return r.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat statistik");
        showToast({ type: "error", title: "Gagal memuat statistik", message: err instanceof Error ? err.message : "" });
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-mono text-sm">Memuat statistik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-600 text-white border-brutal shadow-hard p-6 inline-block">
          <h3 className="font-grotesk font-bold text-lg mb-2">Gagal Memuat</h3>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  const posts = stats?.posts ?? { total: 0, published: 0, draft: 0, archived: 0 };
  const recentAdmins = stats?.recentAdmins ?? [];
  const recentlyUpdated = stats?.recentlyUpdated ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-grotesk font-black text-3xl text-white tracking-tighter">Dashboard</h2>
        <p className="text-gray-400 font-mono text-sm mt-1">Selamat datang kembali di sistem administrator GENSA.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Artikel" value={posts.total ?? 0} icon={Newspaper} subtitle={`${(posts.published ?? 0)} terpublikasi`} />
        <StatCard title="Draft" value={posts.draft ?? 0} icon={Newspaper} color="text-orange-400" />
        <StatCard title="Terpublikasi" value={posts.published ?? 0} icon={Newspaper} color="text-acid-lime" />
        <StatCard title="Total Galeri" value={stats?.gallery ?? 0} icon={Image} />
        <StatCard title="Kategori" value={stats?.categories ?? 0} icon={Activity} />
        <StatCard title="Halaman" value={stats?.pages ?? 0} icon={Layout} />
        <StatCard title="Admin Terakhir Masuk" value={recentAdmins.length > 0 ? recentAdmins[0].name : "-"} icon={User} subtitle={recentAdmins.length > 0 ? recentAdmins[0].email : "Belum ada"} />
        <StatCard title="Konten Terbaru Diupdate" value={recentlyUpdated.length > 0 ? recentlyUpdated[0].title : "-"} icon={Clock} color="text-acid-lime" subtitle={recentlyUpdated.length > 0 ? recentlyUpdated[0].type : "Belum ada"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-gray-800 border-brutal shadow-hard p-5 rounded-none">
          <h3 className="font-grotesk font-bold text-white mb-4 flex items-center gap-2">
            <User size={18} strokeWidth={2} className="text-acid-lime" /> Aktivitas Admin Terbaru
          </h3>
          {recentAdmins.length === 0 ? (
            <EmptyState title="Belum ada aktivitas" description="Belum ada admin yang masuk." />
          ) : (
            <div className="space-y-3">
              {recentAdmins.map((a) => (
                <div key={a.id} className="flex items-center gap-3 border-b border-gray-700 pb-2 last:border-0">
                  <div className="text-xs font-mono font-bold text-gray-400">{a.last_login_at ? new Date(a.last_login_at).toLocaleString("id-ID") : "-"}</div>
                  <div className="flex-1">
                    <div className="text-sm font-mono font-bold text-white">{a.name}</div>
                    <div className="text-xs text-gray-400">{a.email}</div>
                  </div>
                  <span className="text-[0.75rem] font-mono text-forest-green">Aktif</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-gray-800 border-brutal shadow-hard p-5 rounded-none">
          <h3 className="font-grotesk font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={18} strokeWidth={2} className="text-acid-lime" /> Konten Terbaru Diupdate
          </h3>
          {recentlyUpdated.length === 0 ? (
            <EmptyState title="Belum ada konten" description="Belum ada konten yang diperbarui." />
          ) : (
            <div className="space-y-3">
              {recentlyUpdated.map((c, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-gray-700 pb-2 last:border-0">
                  <div className="text-[0.75rem] font-mono text-gray-400 w-12">{c.type}</div>
                  <div className="flex-1">
                    <div className="text-sm font-mono font-bold text-white">{c.title}</div>
                    <div className="text-xs text-gray-400">{new Date(c.updated_at).toLocaleString("id-ID")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="bg-gray-800 border-brutal shadow-hard p-6 rounded-none">
        <h3 className="font-grotesk font-bold text-white mb-4">Pintasan Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button onClick={go("/admin/contents")} className="w-full px-4 py-3 bg-black text-white border-brutal font-mono font-bold hover:bg-gray-800 justify-between">
            Konten Halaman
            <Layout size={16} strokeWidth={2} />
          </Button>
          <Button onClick={go("/admin/ruang-gerak")} className="w-full px-4 py-3 bg-black text-white border-brutal font-mono font-bold hover:bg-gray-800 justify-between">
            Ruang Gerak
            <Activity size={16} strokeWidth={2} />
          </Button>
          <Button onClick={go("/admin/articles")} className="w-full px-4 py-3 bg-black text-white border-brutal font-mono font-bold hover:bg-gray-800 justify-between">
            Artikel & Berita
            <Newspaper size={16} strokeWidth={2} />
          </Button>
          <Button onClick={go("/admin/gallery")} className="w-full px-4 py-3 bg-black text-white border-brutal font-mono font-bold hover:bg-gray-800 justify-between">
            Galeri
            <Image size={16} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}
