"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { useAdmin } from "@/components/admin/AdminContext";
import { Settings, Save, UserPlus, Users, Shield, UserCheck, Trash2 } from "lucide-react";
import Link from "next/link";

type Contact = {
  id: string;
  address: string;
  location_description: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

export default function SettingsPage() {
  const { showToast, admin } = useAdmin();
  const isSuperAdmin = admin?.role === "super_admin";
  const [settings, setSettings] = useState<Record<string, string | null>>({});
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);

  // Site settings form values keyed by setting_key
  const [siteValues, setSiteValues] = useState<Record<string, string>>({});
  const [siteSaving, setSiteSaving] = useState<Record<string, boolean>>({});

  const [contactForm, setContactForm] = useState({
    address: "", location_description: "", whatsapp: "", email: "", instagram: "", facebook: "", twitter: "",
  });
  const [contactSaving, setContactSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([fetch("/api/site-settings"), fetch("/api/contact")]);
      const sData = await sRes.json();
      const cData = await cRes.json();
      const settingsObj = (sData?.settings ?? {}) as Record<string, string | null>;
      setSettings(settingsObj);
      setSiteValues(Object.fromEntries(Object.entries(settingsObj).map(([k, v]) => [k, v ?? ""])));
      setContact(cData?.contact ?? null);
      if (cData?.contact) setContactForm(cData.contact);
    } catch (err) {
      showToast({ type: "error", title: "Gagal memuat pengaturan", message: err instanceof Error ? err.message : "" });
    } finally {
      setLoading(false);
    }
  }

  async function loadAdmins() {
    if (!isSuperAdmin) return;
    setAdminsLoading(true);
    try {
      const res = await fetch("/api/auth/admins", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setAdmins(data.admins ?? []);
    } catch (err) {
      console.error("Failed to load admins:", err);
    } finally {
      setAdminsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    loadAdmins();
  }, []);

  async function saveSetting(key: string) {
    setSiteSaving({ ...siteSaving, [key]: true });
    try {
      const res = await fetch("/api/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: siteValues[key] ?? "", type: "text" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menyimpan");
      showToast({ type: "success", title: `Pengaturan ${key} tersimpan` });
    } catch (err) {
      showToast({ type: "error", title: "Gagal menyimpan pengaturan", message: err instanceof Error ? err.message : "" });
    } finally {
      setSiteSaving({ ...siteSaving, [key]: false });
    }
  }

  async function saveContact() {
    setContactSaving(true);
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menyimpan");
      showToast({ type: "success", title: "Kontak organisasi tersimpan" });
      setContact({ ...contact!, ...contactForm });
    } catch (err) {
      showToast({ type: "error", title: "Gagal menyimpan kontak", message: err instanceof Error ? err.message : "" });
    } finally {
      setContactSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 font-mono text-sm">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={22} strokeWidth={2} className="text-acid-lime" />
        <h2 className="font-grotesk font-black text-2xl text-white tracking-tighter">Pengaturan Website</h2>
      </div>

      <div className="bg-gray-800 border-brutal shadow-hard rounded-none p-5">
        <h3 className="font-grotesk font-bold text-white mb-4">Pengaturan Situs</h3>
        <div className="space-y-3">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 border-b border-gray-700/40 pb-2 last:border-0">
              <span className="w-40 text-xs font-mono font-bold text-gray-300 uppercase">{key}</span>
              <Input
                value={siteValues[key] ?? ""}
                onChange={(e) => setSiteValues({ ...siteValues, [key]: e.target.value })}
                className="flex-1 bg-gray-900 text-white border-gray-600"
              />
              <Button onClick={() => saveSetting(key)} disabled={siteSaving[key]} className="h-8 px-3 text-xs">
                <Save size={14} strokeWidth={2} /> {siteSaving[key] ? "..." : "Simpan"}
              </Button>
            </div>
          ))}
          {Object.keys(settings).length === 0 && <p className="text-xs text-gray-500 font-mono text-center py-4">Belum ada pengaturan situs.</p>}
        </div>
      </div>

      <div className="bg-gray-800 border-brutal shadow-hard rounded-none p-5">
        <h3 className="font-grotesk font-bold text-white mb-4">Kontak Organisasi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Alamat" value={contactForm.address} onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })} />
          <Input label="Deskripsi Lokasi" value={contactForm.location_description ?? ""} onChange={(e) => setContactForm({ ...contactForm, location_description: e.target.value })} />
          <Input label="WhatsApp" value={contactForm.whatsapp ?? ""} onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })} />
          <Input label="Email" type="email" value={contactForm.email ?? ""} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
          <Input label="Instagram" value={contactForm.instagram ?? ""} onChange={(e) => setContactForm({ ...contactForm, instagram: e.target.value })} />
          <Input label="Facebook" value={contactForm.facebook ?? ""} onChange={(e) => setContactForm({ ...contactForm, facebook: e.target.value })} />
          <Input label="Twitter" value={contactForm.twitter ?? ""} onChange={(e) => setContactForm({ ...contactForm, twitter: e.target.value })} />
        </div>
          <div className="mt-4">
            <Button onClick={saveContact} disabled={contactSaving} className="w-auto">
              <Save size={16} strokeWidth={2} /> {contactSaving ? "Menyimpan..." : "Simpan Kontak"}
            </Button>
          </div>
        </div>

      {isSuperAdmin && (
        <div className="bg-gray-800 border-brutal shadow-hard rounded-none p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-grotesk font-bold text-white flex items-center gap-2">
              <Users size={20} strokeWidth={2} />
              Manajemen Admin
            </h3>
            <Link href="/admin/register">
              <Button variant="solid" className="h-8 px-3 text-xs gap-1">
                <UserPlus size={14} strokeWidth={2} /> Tambah Admin
              </Button>
            </Link>
          </div>

          {adminsLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-400 font-mono text-sm">Memuat daftar admin...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400 font-mono text-xs uppercase">
                    <th className="pb-2 pr-4">Nama</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Login Terakhir</th>
                    <th className="pb-2">Dibuat</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id} className="border-b border-gray-700/40 last:border-0">
                      <td className="py-2 pr-4 text-white font-medium">{a.name}</td>
                      <td className="py-2 pr-4 text-gray-300">{a.email}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          a.role === "super_admin" ? "bg-yellow-900/30 text-yellow-300" :
                          a.role === "admin" ? "bg-blue-900/30 text-blue-300" :
                          "bg-green-900/30 text-green-300"
                        }`}>
                          {a.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          a.is_active ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"
                        }`}>
                          <UserCheck size={10} strokeWidth={2} />
                          {a.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-gray-400 font-mono">
                        {a.last_login_at ? new Date(a.last_login_at).toLocaleDateString("id-ID") : "Belum pernah"}
                      </td>
                      <td className="py-2 text-gray-400 font-mono">
                        {new Date(a.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 font-mono text-xs">
                        Belum ada data admin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
