"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { Modal } from "@/components/admin/Modal";
import { useAdmin } from "@/components/admin/AdminContext";
import { Plus, Edit, Trash2, Save, Image, Search } from "lucide-react";

type Item = {
  id: string;
  title: string;
  category: string | null;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_active: boolean;
  is_placeholder: boolean;
};

export default function GalleryPage() {
  const { showToast } = useAdmin();
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({
    title: "", category: "", image_url: "", alt_text: "", caption: "",
    sort_order: "0", is_active: true, is_placeholder: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [search, category, page]);

  async function load() {
    setLoading(true);
    try {
      const url = new URL("/api/gallery", window.location.origin);
      url.searchParams.set("search", search);
      url.searchParams.set("category", category);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));
      const res = await fetch(url.toString());
      const data = await res.json();
      setItems(data?.items ?? []);
      setTotal(data?.total ?? 0);
    } catch (err) {
      showToast({ type: "error", title: "Gagal memuat galeri", message: err instanceof Error ? err.message : "" });
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Judul wajib diisi";
    if (!form.image_url.trim()) e.image_url = "URL gambar wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function openAdd() {
    setEditing(null);
    setForm({ title: "", category: "", image_url: "", alt_text: "", caption: "", sort_order: "0", is_active: true, is_placeholder: false });
    setErrors({});
    setOpen(true);
  }

  function openEdit(it: Item) {
    setEditing(it);
    setForm({ title: it.title, category: it.category ?? "", image_url: it.image_url, alt_text: it.alt_text ?? "", caption: it.caption ?? "", sort_order: String(it.sort_order ?? "0"), is_active: it.is_active, is_placeholder: it.is_placeholder });
    setErrors({});
    setOpen(true);
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      const isEdit = !!editing;
      const res = await fetch(isEdit ? `/api/gallery/${editing!.id}` : "/api/gallery", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category.trim() || null,
          image_url: form.image_url.trim(),
          alt_text: form.alt_text.trim() || null,
          caption: form.caption.trim() || null,
          sort_order: Number(form.sort_order || "0"),
          is_active: form.is_active,
          is_placeholder: form.is_placeholder,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menyimpan");
      showToast({ type: "success", title: isEdit ? "Item galeri diperbarui" : "Item galeri ditambahkan" });
      setOpen(false);
      load();
    } catch (err) {
      showToast({ type: "error", title: "Gagal menyimpan galeri", message: err instanceof Error ? err.message : "" });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!delId) return;
    try {
      const res = await fetch(`/api/gallery/${delId}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menghapus");
      showToast({ type: "success", title: "Item galeri dihapus" });
      setDelId(null);
      load();
    } catch (err) {
      showToast({ type: "error", title: "Gagal menghapus galeri", message: err instanceof Error ? err.message : "" });
      setDelId(null);
    }
  }

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 font-mono text-sm">Memuat galeri...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Image size={22} strokeWidth={2} className="text-acid-lime" />
          <h2 className="font-grotesk font-black text-2xl text-white tracking-tighter">Galeri Dokumentasi</h2>
        </div>
        <div className="flex gap-2">
          <Input label="" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari judul atau caption..." className="w-64" />
          <Input label="" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} placeholder="Filter kategori..." className="w-48" />
          <Button onClick={openAdd}>
            <Plus size={18} strokeWidth={2} /> Tambah Item
          </Button>
        </div>
      </div>

      <div className="bg-gray-800 border-brutal shadow-hard rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 border-b-4 border-black">
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Judul</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Kategori</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Gambar</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Urutan</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Tampil</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Placeholder</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-gray-700/50 hover:bg-gray-700/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-white">{it.title}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-400">{it.category ?? "-"}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-400 truncate max-w-[200px]">{it.image_url}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-300">{it.sort_order}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-mono font-bold rounded-none border ${
                      it.is_active ? "bg-forest-green/20 text-forest-green border-forest-green" : "bg-gray-700 text-gray-500 border-gray-600"
                    }`}>{it.is_active ? "Ya" : "Tidak"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-mono font-bold rounded-none border ${
                      it.is_placeholder ? "bg-orange/20 text-orange border-orange" : "bg-gray-700 text-gray-500 border-gray-600"
                    }`}>{it.is_placeholder ? "Ya" : "Tidak"}</span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button onClick={() => openEdit(it)} variant="outline">
                      <Edit size={14} strokeWidth={2} />
                    </Button>
                    <Button onClick={() => setDelId(it.id)} variant="danger">
                      <Trash2 size={14} strokeWidth={2} />
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 font-mono text-sm">Belum ada item galeri. Tambahkan item baru.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-mono text-gray-400">
          Menampilkan {((page - 1) * limit + 1)}-{Math.min(page * limit, total)} dari {total} item
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Selanjutnya</Button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Item Galeri" : "Tambah Item Galeri"}>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
          <Input label="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />
          <Input label="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="URL Gambar" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} error={errors.image_url} />
          <Input label="Alt Text" value={form.alt_text} onChange={(e) => setForm({ ...form, alt_text: e.target.value })} />
          <Textarea label="Caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} rows={3} />
          <Input label="Urutan" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input id="is_active" type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 text-forest-green border-brutal bg-gray-800 rounded-none" />
              <label htmlFor="is_active" className="text-sm font-mono text-gray-200">Tampilkan</label>
            </div>
            <div className="flex items-center gap-3">
              <input id="is_placeholder" type="checkbox" checked={form.is_placeholder} onChange={(e) => setForm({ ...form, is_placeholder: e.target.checked })} className="w-4 h-4 text-orange border-brutal bg-gray-800 rounded-none" />
              <label htmlFor="is_placeholder" className="text-sm font-mono text-gray-200">Placeholder</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : editing ? "Perbarui" : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!delId} onClose={() => setDelId(null)} title="Hapus Item Galeri">
        <p className="mb-6 text-sm font-mono text-gray-300">Yakin ingin menghapus item galeri ini?</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setDelId(null)}>Batal</Button>
          <Button type="button" variant="danger" onClick={remove}>Hapus</Button>
        </div>
      </Modal>
    </div>
  );
}
