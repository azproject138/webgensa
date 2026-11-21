"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { Modal } from "@/components/admin/Modal";
import { useAdmin } from "@/components/admin/AdminContext";
import { Plus, Edit, Trash2, Save, ArrowLeft, Activity } from "lucide-react";

type Category = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  accent_color: string | null;
  accent_text_color: string | null;
  sort_order: number;
  is_published: boolean;
};
type Item = {
  id: string;
  category_id: string;
  title: string;
  sort_order: number;
};

export default function RuangGerakPage() {
  const { showToast } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemLoading, setItemLoading] = useState(false);

  // Category form
  const [catOpen, setCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    image_url: "",
    accent_color: "#193B2D",
    accent_text_color: "#F3EBDD",
    sort_order: "0",
    is_published: true,
  });
  const [catErrors, setCatErrors] = useState<Record<string, string>>({});
  const [catSaving, setCatSaving] = useState(false);

  // Item form
  const [itemOpen, setItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemForm, setItemForm] = useState({ title: "", sort_order: "0" });
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [itemSaving, setItemSaving] = useState(false);

  // Delete
  const [delType, setDelType] = useState<"category" | "item" | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/program-categories");
      const data = await res.json();
      setCategories(data?.categories ?? []);
    } catch (err) {
      showToast({ type: "error", title: "Gagal memuat kategori", message: err instanceof Error ? err.message : "" });
    } finally {
      setLoading(false);
    }
  }

  async function loadItems(categoryId: string) {
    setItemLoading(true);
    try {
      const res = await fetch(`/api/program-items?category_id=${categoryId}`);
      const data = await res.json();
      setItems(data?.items ?? []);
    } catch (err) {
      showToast({ type: "error", title: "Gagal memuat item", message: err instanceof Error ? err.message : "" });
    } finally {
      setItemLoading(false);
    }
  }

  function selectCategory(cat: Category) {
    setSelectedCategory(cat);
    setItems([]);
    loadItems(cat.id);
  }

  function validateCat() {
    const e: Record<string, string> = {};
    if (!catForm.name.trim()) e.name = "Nama kategori wajib diisi";
    setCatErrors(e);
    return Object.keys(e).length === 0;
  }

  function openCatAdd() {
    setEditingCat(null);
    setCatForm({ name: "", description: "", image_url: "", accent_color: "#193B2D", accent_text_color: "#F3EBDD", sort_order: "0", is_published: true });
    setCatErrors({});
    setCatOpen(true);
  }

  function openCatEdit(cat: Category) {
    setEditingCat(cat);
    setCatForm({ name: cat.name, description: cat.description ?? "", image_url: cat.image_url ?? "", accent_color: cat.accent_color ?? "#193B2D", accent_text_color: cat.accent_text_color ?? "#F3EBDD", sort_order: String(cat.sort_order ?? "0"), is_published: cat.is_published });
    setCatErrors({});
    setCatOpen(true);
  }

  async function saveCat() {
    if (!validateCat()) return;
    setCatSaving(true);
    try {
      const isEdit = !!editingCat;
      const res = await fetch(isEdit ? `/api/program-categories/${editingCat!.id}` : "/api/program-categories", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catForm.name.trim(),
          description: catForm.description.trim(),
          image_url: catForm.image_url.trim() || null,
          accent_color: catForm.accent_color,
          accent_text_color: catForm.accent_text_color,
          sort_order: Number(catForm.sort_order || "0"),
          is_published: catForm.is_published,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menyimpan");
      showToast({ type: "success", title: isEdit ? "Kategori diperbarui" : "Kategori ditambahkan" });
      setCatOpen(false);
      loadCategories();
    } catch (err) {
      showToast({ type: "error", title: "Gagal menyimpan kategori", message: err instanceof Error ? err.message : "" });
    } finally {
      setCatSaving(false);
    }
  }

  async function deleteCat() {
    if (!delId) return;
    try {
      const res = await fetch(`/api/program-categories/${delId}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menghapus");
      showToast({ type: "success", title: "Kategori dihapus" });
      setDelId(null);
      loadCategories();
      if (selectedCategory?.id === delId) setSelectedCategory(null);
    } catch (err) {
      showToast({ type: "error", title: "Gagal menghapus kategori", message: err instanceof Error ? err.message : "" });
      setDelId(null);
    }
  }

  function validateItem() {
    const e: Record<string, string> = {};
    if (!itemForm.title.trim()) e.title = "Judul item wajib diisi";
    setItemErrors(e);
    return Object.keys(e).length === 0;
  }

  function openItemAdd() {
    setEditingItem(null);
    setItemForm({ title: "", sort_order: "0" });
    setItemErrors({});
    setItemOpen(true);
  }

  function openItemEdit(it: Item) {
    setEditingItem(it);
    setItemForm({ title: it.title, sort_order: String(it.sort_order ?? "0") });
    setItemErrors({});
    setItemOpen(true);
  }

  async function saveItem() {
    if (!validateItem()) return;
    if (!selectedCategory) return;
    setItemSaving(true);
    try {
      const isEdit = !!editingItem;
      const res = await fetch(isEdit ? `/api/program-items/${editingItem!.id}` : "/api/program-items", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: selectedCategory.id,
          title: itemForm.title.trim(),
          sort_order: Number(itemForm.sort_order || "0"),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menyimpan");
      showToast({ type: "success", title: isEdit ? "Item diperbarui" : "Item ditambahkan" });
      setItemOpen(false);
      loadItems(selectedCategory.id);
    } catch (err) {
      showToast({ type: "error", title: "Gagal menyimpan item", message: err instanceof Error ? err.message : "" });
    } finally {
      setItemSaving(false);
    }
  }

  async function deleteItem() {
    if (!delId) return;
    try {
      const res = await fetch(`/api/program-items/${delId}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menghapus");
      showToast({ type: "success", title: "Item dihapus" });
      setDelId(null);
      if (selectedCategory) loadItems(selectedCategory.id);
    } catch (err) {
      showToast({ type: "error", title: "Gagal menghapus item", message: err instanceof Error ? err.message : "" });
      setDelId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 font-mono text-sm">Memuat Ruang Gerak...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity size={22} strokeWidth={2} className="text-acid-lime" />
          <h2 className="font-grotesk font-black text-2xl text-white tracking-tighter">Ruang Gerak</h2>
        </div>
        <Button onClick={openCatAdd}>
          <Plus size={18} strokeWidth={2} /> Tambah Kategori
        </Button>
      </div>

      {selectedCategory ? (
        <div className="flex items-center gap-3 mb-2">
          <Button variant="outline" onClick={() => setSelectedCategory(null)}>
            <ArrowLeft size={16} strokeWidth={2} /> Kembali ke Kategori
          </Button>
          <h2 className="font-grotesk font-bold text-white text-lg">{selectedCategory.name}</h2>
          <span className={`px-2 py-1 text-xs font-mono font-bold rounded-none border ${
            selectedCategory.is_published ? "bg-forest-green/20 text-forest-green border-forest-green" : "bg-gray-700 text-gray-500 border-gray-600"
          }`}>{selectedCategory.is_published ? "Dipublikasi" : "Tidak Dipublikasi"}</span>
          <Button onClick={openItemAdd}>
            <Plus size={16} strokeWidth={2} /> Tambah Item
          </Button>
        </div>
      ) : null}

      {/* Kategori list */}
      {!selectedCategory && (
        <div className="bg-gray-800 border-brutal shadow-hard rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 border-b-4 border-black">
                  <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Nama</th>
                  <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Urutan</th>
                  <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Item</th>
                  <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => {
                  const itemCount = items.filter((i) => i.category_id === c.id).length;
                  return (
                    <tr key={c.id} className="border-b border-gray-700/50 hover:bg-gray-700/40 transition-colors cursor-pointer" onClick={() => selectCategory(c)}>
                      <td className="px-4 py-3 text-sm font-mono text-white">{c.name}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-300">{c.sort_order}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-mono font-bold rounded-none border ${
                          c.is_published ? "bg-forest-green/20 text-forest-green border-forest-green" : "bg-gray-700 text-gray-500 border-gray-600"
                        }`}>{c.is_published ? "Aktif" : "Nonaktif"}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-300">{itemCount}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <Button onClick={(e) => { e.stopPropagation(); openCatEdit(c); }} variant="outline">
                          <Edit size={14} strokeWidth={2} />
                        </Button>
                        <Button onClick={(e) => { e.stopPropagation(); setDelType("category"); setDelId(c.id); }} variant="danger">
                          <Trash2 size={14} strokeWidth={2} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {categories.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-mono text-sm">Belum ada kategori. Tambahkan kategori baru.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item list */}
      {selectedCategory && (
        <div className="bg-gray-800 border-brutal shadow-hard rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 border-b-4 border-black">
                  <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Judul Item</th>
                  <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Urutan</th>
                  <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-gray-700/50 hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-white">{it.title}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-300">{it.sort_order}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Button onClick={() => openItemEdit(it)} variant="outline">
                        <Edit size={14} strokeWidth={2} />
                      </Button>
                      <Button onClick={() => { setDelType("item"); setDelId(it.id); }} variant="danger">
                        <Trash2 size={14} strokeWidth={2} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500 font-mono text-sm">Belum ada item. Tambahkan item baru.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Modal */}
      <Modal open={catOpen} onClose={() => setCatOpen(false)} title={editingCat ? "Edit Kategori" : "Tambah Kategori"}>
        <form onSubmit={(e) => { e.preventDefault(); saveCat(); }} className="space-y-4">
          <Input label="Nama Kategori" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} error={catErrors.name} />
          <Textarea label="Deskripsi" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
          <Input label="URL Gambar (opsional)" value={catForm.image_url} onChange={(e) => setCatForm({ ...catForm, image_url: e.target.value })} />
          <Input label="Warna Aksen (hex)" value={catForm.accent_color} onChange={(e) => setCatForm({ ...catForm, accent_color: e.target.value })} />
          <Input label="Warna Teks Aksen (hex)" value={catForm.accent_text_color} onChange={(e) => setCatForm({ ...catForm, accent_text_color: e.target.value })} />
          <Input label="Urutan" type="number" value={catForm.sort_order} onChange={(e) => setCatForm({ ...catForm, sort_order: e.target.value })} />
          <div className="flex items-center gap-3">
            <input id="is_published" type="checkbox" checked={catForm.is_published} onChange={(e) => setCatForm({ ...catForm, is_published: e.target.checked })} className="w-4 h-4 text-forest-green border-brutal bg-gray-800 rounded-none" />
            <label htmlFor="is_published" className="text-sm font-mono text-gray-200">Dipublikasi</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setCatOpen(false)}>Batal</Button>
            <Button type="submit" disabled={catSaving}>{catSaving ? "Menyimpan..." : editingCat ? "Perbarui" : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      {/* Item Modal */}
      <Modal open={itemOpen} onClose={() => setItemOpen(false)} title={editingItem ? "Edit Item" : "Tambah Item"}>
        <form onSubmit={(e) => { e.preventDefault(); saveItem(); }} className="space-y-4">
          <Input label="Judul Item" value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} error={itemErrors.title} />
          <Input label="Urutan" type="number" value={itemForm.sort_order} onChange={(e) => setItemForm({ ...itemForm, sort_order: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setItemOpen(false)}>Batal</Button>
            <Button type="submit" disabled={itemSaving}>{itemSaving ? "Menyimpan..." : editingItem ? "Perbarui" : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!delId} onClose={() => setDelId(null)} title="Hapus">
        <p className="mb-6 text-sm font-mono text-gray-300">Yakin ingin menghapus {delType === "category" ? "kategori ini (dan item dalamnya)" : "item ini"}?</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setDelId(null)}>Batal</Button>
          <Button type="button" variant="danger" onClick={delType === "category" ? deleteCat : deleteItem}>Hapus</Button>
        </div>
      </Modal>
    </div>
  );
}
