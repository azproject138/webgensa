"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { Modal } from "@/components/admin/Modal";
import { useAdmin } from "@/components/admin/AdminContext";
import { Plus, Edit, Trash2, Save, Menu, Search } from "lucide-react";

type Item = {
  id: string;
  label: string;
  href: string;
  target_section: string | null;
  location: string;
  sort_order: number;
  is_active: boolean;
};

const LOCATIONS = [
  { label: "Navbar", value: "navbar" },
  { label: "Footer", value: "footer" },
];
const TARGETS = [
  { label: "Beranda", value: "home" },
  { label: "Tentang", value: "tentang" },
  { label: "Ruang Gerak", value: "ruang-gerak" },
  { label: "Cerita", value: "cerita" },
  { label: "Kontak", value: "kontak" },
  { label: "Tanpa Target", value: "" },
];

export default function NavigationPage() {
  const { showToast } = useAdmin();
  const [items, setItems] = useState<Item[]>([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({ label: "", href: "", target_section: "", location: "navbar", sort_order: "0", is_active: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [filterLocation, search]);

  async function load() {
    setLoading(true);
    try {
      const url = new URL("/api/navigation", window.location.origin);
      url.searchParams.set("location", filterLocation);
      url.searchParams.set("search", search);
      const res = await fetch(url.toString());
      const data = await res.json();
      setItems(data?.items ?? []);
    } catch (err) {
      showToast({ type: "error", title: "Gagal memuat navigasi", message: err instanceof Error ? err.message : "" });
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.label.trim()) e.label = "Label wajib diisi";
    if (!form.href.trim()) e.href = "URL wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function openAdd() {
    setEditing(null);
    setForm({ label: "", href: "", target_section: "", location: "navbar", sort_order: "0", is_active: true });
    setErrors({});
    setOpen(true);
  }

  function openEdit(it: Item) {
    setEditing(it);
    setForm({ label: it.label, href: it.href, target_section: it.target_section ?? "", location: it.location, sort_order: String(it.sort_order ?? "0"), is_active: it.is_active });
    setErrors({});
    setOpen(true);
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      const isEdit = !!editing;
      const res = await fetch(isEdit ? `/api/navigation/${editing!.id}` : "/api/navigation", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label.trim(),
          href: form.href.trim(),
          target_section: form.target_section || null,
          location: form.location,
          sort_order: Number(form.sort_order || "0"),
          is_active: form.is_active,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menyimpan");
      showToast({ type: "success", title: isEdit ? "Menu diperbarui" : "Menu ditambahkan" });
      setOpen(false);
      load();
    } catch (err) {
      showToast({ type: "error", title: "Gagal menyimpan menu", message: err instanceof Error ? err.message : "" });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!delId) return;
    try {
      const res = await fetch(`/api/navigation/${delId}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menghapus");
      showToast({ type: "success", title: "Menu dihapus" });
      setDelId(null);
      load();
    } catch (err) {
      showToast({ type: "error", title: "Gagal menghapus menu", message: err instanceof Error ? err.message : "" });
      setDelId(null);
    }
  }

  const navbarItems = items.filter((i) => i.location === "navbar");
  const footerItems = items.filter((i) => i.location === "footer");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 font-mono text-sm">Memuat navigasi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Menu size={22} strokeWidth={2} className="text-acid-lime" />
          <h2 className="font-grotesk font-black text-2xl text-white tracking-tighter">Navigasi Website</h2>
        </div>
        <div className="flex gap-2">
          <Select
            options={[{ label: "Semua", value: "" }, ...LOCATIONS]}
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          />
          <Input label="" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari label atau URL..." className="w-64" />
          <Button onClick={openAdd}>
            <Plus size={18} strokeWidth={2} /> Tambah Menu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {LOCATIONS.map((loc) => {
          const list = items.filter((i) => i.location === loc.value);
          return (
            <div key={loc.value} className="bg-gray-800 border-brutal shadow-hard rounded-none overflow-hidden">
              <div className="bg-gray-900/50 border-b-2 border-black px-4 py-3">
                <h3 className="font-grotesk font-bold text-white">{loc.label}</h3>
                <p className="text-xs font-mono text-gray-400">{list.length} item</p>
              </div>
              <div className="p-4 space-y-3">
                {list.map((it) => (
                  <div key={it.id} className="flex items-center justify-between gap-3 bg-gray-900/30 border-brutal p-3">
                    <div className="flex-1">
                      <div className="text-sm font-mono font-bold text-white">{it.label}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{it.href}</div>
                      {it.target_section && <div className="text-[0.7rem] text-gray-500 font-mono mt-1">Target: {it.target_section}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-mono font-bold rounded-none border ${
                        it.is_active ? "bg-forest-green/20 text-forest-green border-forest-green" : "bg-gray-700 text-gray-500 border-gray-600"
                      }`}>{it.is_active ? "Aktif" : "Tidak"}</span>
                      <Button onClick={() => openEdit(it)} variant="outline" className="h-8 px-2 text-xs">
                        <Edit size={12} strokeWidth={2} />
                      </Button>
                      <Button onClick={() => setDelId(it.id)} variant="danger" className="h-8 px-2 text-xs">
                        <Trash2 size={12} strokeWidth={2} />
                      </Button>
                    </div>
                  </div>
                ))}
                {list.length === 0 && <div className="text-xs text-gray-500 font-mono text-center py-4">Kosong</div>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Menu" : "Tambah Menu"}>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
          <Input label="Label Menu" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} error={errors.label} />
          <Input label="URL / href" value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} error={errors.href} placeholder="contoh: #tentang" />
          <Select label="Target Section" options={TARGETS} value={form.target_section} onChange={(e) => setForm({ ...form, target_section: e.target.value })} />
          <Select label="Lokasi" options={LOCATIONS} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input label="Urutan" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          <div className="flex items-center gap-3">
            <input id="is_active" type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 text-forest-green border-brutal bg-gray-800 rounded-none" />
            <label htmlFor="is_active" className="text-sm font-mono text-gray-200">Aktif</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : editing ? "Perbarui" : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!delId} onClose={() => setDelId(null)} title="Hapus Menu">
        <p className="mb-6 text-sm font-mono text-gray-300">Yakin ingin menghapus menu ini?</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setDelId(null)}>Batal</Button>
          <Button type="button" variant="danger" onClick={remove}>Hapus</Button>
        </div>
      </Modal>
    </div>
  );
}
