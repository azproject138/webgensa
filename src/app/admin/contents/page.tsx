"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { Modal } from "@/components/admin/Modal";
import { useAdmin } from "@/components/admin/AdminContext";
import { Plus, Edit, Trash2, Save, X as XIcon } from "lucide-react";

const PAGE_SLUG = "beranda";

type Section = {
  id: string;
  page_id: number;
  section_key: string;
  section_type: string;
  title: string | null;
  description: string | null;
  content: string | null;
  sort_order: number;
  is_active: boolean;
};

export default function ContentsPage() {
  const { showToast } = useAdmin();
  const [sections, setSections] = useState<Section[]>([]);
  const [pageId, setPageId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    section_key: "",
    section_type: "hero",
    title: "",
    description: "",
    content: "",
    sort_order: "0",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const pagesRes = await fetch("/api/pages");
      const pagesData = await pagesRes.json();
      const pages: { id: number; slug: string }[] = pagesData?.pages ?? [];
      const beranda = pages.find((p) => p.slug === PAGE_SLUG);
      if (!beranda) {
        showToast({ type: "error", title: "Halaman beranda tidak ditemukan" });
        setLoading(false);
        return;
      }
      setPageId(beranda.id);

      const secRes = await fetch(`/api/page-sections?page_id=${beranda.id}`);
      const secData = await secRes.json();
      setSections(secData?.sections ?? []);
    } catch (err) {
      showToast({ type: "error", title: "Gagal memuat konten halaman", message: err instanceof Error ? err.message : "" });
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.section_key.trim()) e.section_key = "Kunci section wajib diisi";
    if (!form.title.trim()) e.title = "Judul wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function openAdd() {
    setEditing(null);
    setForm({ section_key: "", section_type: "hero", title: "", description: "", content: "", sort_order: "0", is_active: true });
    setErrors({});
    setOpen(true);
  }

  function openEdit(section: Section) {
    setEditing(section);
    setForm({
      section_key: section.section_key,
      section_type: section.section_type,
      title: section.title ?? "",
      description: section.description ?? "",
      content: section.content ?? "",
      sort_order: String(section.sort_order ?? "0"),
      is_active: section.is_active,
    });
    setErrors({});
    setOpen(true);
  }

  async function save() {
    if (!validate()) return;
    if (!pageId) return;
    setSaving(true);
    try {
      const isEdit = !!editing;
      const url = isEdit ? `/api/page-sections/${editing!.id}` : "/api/page-sections";
      const method = isEdit ? "PUT" : "POST";
      interface SaveBody {
        page_id: number;
        section_key: string;
        section_type: string;
        title: string;
        description: string;
        content: string;
        sort_order: number;
        is_active: boolean;
      }
      const body: SaveBody = {
        page_id: pageId,
        section_key: form.section_key.trim(),
        section_type: form.section_type,
        title: form.title.trim(),
        description: form.description.trim(),
        content: form.content.trim(),
        sort_order: Number(form.sort_order || "0"),
        is_active: form.is_active,
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      showToast({ type: "success", title: isEdit ? "Section diperbarui" : "Section ditambahkan" });
      setOpen(false);
      load();
    } catch (err) {
      showToast({ type: "error", title: "Gagal menyimpan", message: err instanceof Error ? err.message : "" });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deletingId || !pageId) return;
    try {
      const res = await fetch(`/api/page-sections/${deletingId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      showToast({ type: "success", title: "Section dihapus" });
      setDeletingId(null);
      load();
    } catch (err) {
      showToast({ type: "error", title: "Gagal menghapus", message: err instanceof Error ? err.message : "" });
      setDeletingId(null);
    }
  }

  const sectionTypeOptions = [
    { label: "Hero", value: "hero" },
    { label: "Tentang", value: "about" },
    { label: "Ruang Gerak", value: "ruang-gerak" },
    { label: "Cerita", value: "cerita" },
    { label: "Kontak", value: "contact" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 font-mono text-sm">Memuat konten halaman...</p>
      </div>
    );
  }

  if (!pageId) {
    return <div className="text-center py-20 text-gray-400 font-mono">Halaman tidak tersedia.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-grotesk font-black text-2xl text-white tracking-tighter">Konten Halaman</h2>
          <p className="text-gray-400 font-mono text-sm">Edit isi section halaman beranda GENSA tanpa menyentuh kode.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={18} strokeWidth={2} /> Tambah Section
        </Button>
      </div>

      <div className="bg-gray-800 border-brutal shadow-hard rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 border-b-4 border-black">
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Kunci</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Tipe</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Judul</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Deskripsi</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Urutan</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Aktif</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id} className="border-b border-gray-700/50 hover:bg-gray-700/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-gray-200">{s.section_key}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-300 capitalize">{s.section_type}</td>
                  <td className="px-4 py-3 text-sm font-mono text-white">{s.title ?? "-"}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-400 truncate max-w-[300px]">{s.description ?? "-"}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-300">{s.sort_order}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-mono font-bold rounded-none border ${
                      s.is_active ? "bg-forest-green/20 text-forest-green border-forest-green" : "bg-gray-700 text-gray-500 border-gray-600"
                    }`}>{s.is_active ? "Ya" : "Tidak"}</span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button onClick={() => openEdit(s)} variant="outline">
                      <Edit size={14} strokeWidth={2} />
                    </Button>
                    <Button
                      onClick={() => setDeletingId(s.id)}
                      variant="danger"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </Button>
                  </td>
                </tr>
              ))}
              {sections.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 font-mono text-sm">Belum ada section. Tambahkan section baru.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Section" : "Tambah Section"}>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
          <Input
            label="Kunci Section (section_key)"
            value={form.section_key}
            onChange={(e) => setForm({ ...form, section_key: e.target.value })}
            error={errors.section_key}
            placeholder="contoh: hero"
          />
          <Select
            label="Tipe Section"
            options={sectionTypeOptions}
            value={form.section_type}
            onChange={(e) => setForm({ ...form, section_type: e.target.value })}
          />
          <Input
            label="Judul"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={errors.title}
          />
          <Textarea
            label="Deskripsi"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Textarea
            label="Konten (JSON / teks)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 text-forest-green border-brutal bg-gray-800 rounded-none focus:ring-0"
            />
            <label htmlFor="is_active" className="text-sm font-mono text-gray-200">Aktif ditampilkan</label>
          </div>
          <Input
            label="Urutan (sort_order)"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              <Save size={16} strokeWidth={2} /> {saving ? "Menyimpan..." : editing ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Hapus Section">
        <p className="mb-6 text-sm font-mono text-gray-300">Yakin ingin menghapus section ini? Tindakan tidak dapat dibatalkan.</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setDeletingId(null)}>
            Batal
          </Button>
          <Button type="button" variant="danger" onClick={remove} disabled={deletingId === null ? false : false}>
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
