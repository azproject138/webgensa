"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { useAdmin } from "@/components/admin/AdminContext";
import { User, Shield, Lock } from "lucide-react";

export default function ProfilePage() {
  const { showToast } = useAdmin();
  const [admin, setAdmin] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.admin) setAdmin(data.admin);
        else setLoading(false);
      })
      .catch(() => { setLoading(false); })
      .finally(() => setLoading(false));
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.current_password) e.current_password = "Password lama wajib diisi";
    if (!form.new_password || form.new_password.length < 8) e.new_password = "Password baru minimal 8 karakter";
    if (form.new_password !== form.confirm_password) e.confirm_password = "Konfirmasi password tidak cocok";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: form.current_password, new_password: form.new_password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal mengubah password");
      showToast({ type: "success", title: "Password berhasil diubah" });
      setForm({ current_password: "", new_password: "", confirm_password: "" });
      setErrors({});
    } catch (err) {
      showToast({ type: "error", title: "Gagal mengubah password", message: err instanceof Error ? err.message : "" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 font-mono text-sm">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User size={22} strokeWidth={2} className="text-acid-lime" />
        <h2 className="font-grotesk font-black text-2xl text-white tracking-tighter">Profil Admin</h2>
      </div>

      <div className="bg-gray-800 border-brutal shadow-hard rounded-none p-5">
        <h3 className="font-grotesk font-bold text-white mb-4">Informasi Akun</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-700/40 pb-2">
            <Shield size={18} strokeWidth={2} className="text-forest-green" />
            <div>
              <div className="text-xs font-mono font-bold text-gray-400 uppercase">Nama</div>
              <div className="text-sm font-mono text-white">{admin?.name ?? "-"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-gray-700/40 pb-2">
            <Lock size={18} strokeWidth={2} className="text-acid-lime" />
            <div>
              <div className="text-xs font-mono font-bold text-gray-400 uppercase">Email</div>
              <div className="text-sm font-mono text-white">{admin?.email ?? "-"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-gray-700/40 pb-2">
            <div>
              <div className="text-xs font-mono font-bold text-gray-400 uppercase">Role</div>
              <div className="text-sm font-mono text-white capitalize">{admin?.role ?? "-"}</div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500 font-mono">
          Kredensial awal bersifat sementara. Ubah password segera sebelum deployment. Jangan berbagi password dengan siapa pun.
        </p>
      </div>

      <div className="bg-gray-800 border-brutal shadow-hard rounded-none p-5">
        <h3 className="font-grotesk font-bold text-white mb-4">Ubah Password</h3>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
          <Input type="password" label="Password Lama" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} error={errors.current_password} />
          <Input type="password" label="Password Baru" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} error={errors.new_password} />
          <Input type="password" label="Konfirmasi Password Baru" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} error={errors.confirm_password} />
          <Button type="submit" disabled={saving} className="w-auto">{saving ? "Mengubah..." : "Simpan Perubahan"}</Button>
        </form>
      </div>
    </div>
  );
}
