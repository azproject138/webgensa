"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { useAdmin } from "@/components/admin/AdminContext";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useAdmin();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "editor",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(field: string, value: string) {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {};

    if (!form.name.trim()) e.name = "Nama wajib diisi";
    else if (form.name.trim().length < 2) e.name = "Nama minimal 2 karakter";

    if (!form.email.trim()) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Format email tidak valid";

    if (!form.password) e.password = "Password wajib diisi";
    else if (form.password.length < 8) e.password = "Password minimal 8 karakter";

    if (form.password !== form.confirmPassword) e.confirmPassword = "Konfirmasi password tidak cocok";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat admin");
      }

      showToast({ type: "success", title: "Berhasil", message: `Admin ${data.admin.name} dibuat` });
      router.push("/admin/settings");
    } catch (err) {
      showToast({ type: "error", title: "Gagal", message: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-none p-8">
        <Link href="/admin/settings" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Pengaturan
        </Link>

        <div className="text-center mb-8">
          <UserPlus className="w-12 h-12 text-lime-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Tambah Admin Baru</h1>
          <p className="text-gray-400 mt-1">Hanya super_admin yang dapat membuat akun admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              id="name"
              type="text"
              label="Nama Lengkap"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              placeholder="Nama lengkap"
              autoComplete="name"
            />
          </div>

          <div>
            <Input
              id="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              placeholder="admin@domain.com"
              autoComplete="email"
            />
          </div>

          <div>
            <Input
              id="password"
              type="password"
              label="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
            />
          </div>

          <div>
            <Input
              id="confirmPassword"
              type="password"
              label="Konfirmasi Password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              placeholder="Ulangi password"
              autoComplete="new-password"
            />
          </div>

          <div>
            <Select
              id="role"
              label="Role"
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              error={errors.role}
              options={[
                { value: "editor", label: "Editor - Kelola konten saja" },
                { value: "admin", label: "Admin - Akses penuh CMS" },
                { value: "super_admin", label: "Super Admin - Kelola admin lain" },
              ]}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Membuat..." : "Buat Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}