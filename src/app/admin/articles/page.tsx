"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { Modal } from "@/components/admin/Modal";
import { useAdmin } from "@/components/admin/AdminContext";
import { Plus, Edit, Trash2, Save, Search, Filter, FileText } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  created_at: string;
  updated_at: string;
};

export default function ArticlesPage() {
  const { showToast } = useAdmin();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", thumbnail_url: "", category: "",
    status: "draft", seo_title: "", seo_description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [search, status, page]);

  async function load() {
    setLoading(true);
    try {
      const url = new URL("/api/posts", window.location.origin);
      url.searchParams.set("search", search);
      url.searchParams.set("status", status);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));
      const res = await fetch(url.toString());
      const data = await res.json();
      setPosts(data?.posts ?? []);
      setTotal(data?.total ?? 0);
    } catch (err) {
      showToast({ type: "error", title: "Gagal memuat artikel", message: err instanceof Error ? err.message : "" });
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Judul wajib diisi";
    if (!form.slug.trim()) e.slug = "Slug wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function openAdd() {
    setEditing(null);
    setForm({ title: "", slug: "", excerpt: "", content: "", thumbnail_url: "", category: "", status: "draft", seo_title: "", seo_description: "" });
    setErrors({});
    setOpen(true);
  }

  function openEdit(p: Post) {
    setEditing(p);
    setForm({ title: p.title, slug: p.slug, excerpt: "", content: "", thumbnail_url: "", category: p.category ?? "", status: p.status, seo_title: "", seo_description: "" });
    setErrors({});
    setOpen(true);
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      const isEdit = !!editing;
      const res = await fetch(isEdit ? `/api/posts/${editing!.id}` : "/api/posts", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim(),
          excerpt: form.excerpt.trim(),
          content: form.content.trim(),
          thumbnail_url: form.thumbnail_url.trim() || null,
          category: form.category.trim() || null,
          status: form.status,
          seo_title: form.seo_title.trim() || null,
          seo_description: form.seo_description.trim() || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menyimpan");
      showToast({ type: "success", title: isEdit ? "Artikel diperbarui" : "Artikel ditambahkan" });
      setOpen(false);
      load();
    } catch (err) {
      showToast({ type: "error", title: "Gagal menyimpan artikel", message: err instanceof Error ? err.message : "" });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!delId) return;
    try {
      const res = await fetch(`/api/posts/${delId}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menghapus");
      showToast({ type: "success", title: "Artikel dihapus" });
      setDelId(null);
      load();
    } catch (err) {
      showToast({ type: "error", title: "Gagal menghapus artikel", message: err instanceof Error ? err.message : "" });
      setDelId(null);
    }
  }

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Archived", value: "archived" },
  ];

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 font-mono text-sm">Memuat artikel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText size={22} strokeWidth={2} className="text-acid-lime" />
          <h2 className="font-grotesk font-black text-2xl text-white tracking-tighter">Artikel & Berita</h2>
        </div>
        <div className="flex gap-2">
          <Input
            label=""
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari judul, slug, isi..."
            className="w-64"
          />
          <Select
            options={statusOptions.map((s) => ({ label: s.label, value: s.value }))}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-48"
          />
          <Button onClick={openAdd}>
            <Plus size={18} strokeWidth={2} /> Tambah Artikel
          </Button>
        </div>
      </div>

      <div className="bg-gray-800 border-brutal shadow-hard rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 border-b-4 border-black">
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Judul</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Slug</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Kategori</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Dibuat</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-gray-700/50 hover:bg-gray-700/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-white">{p.title}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-300 truncate max-w-[200px]">{p.slug}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-400">{p.category ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-mono font-bold rounded-none border ${
                      p.status === "published" ? "bg-forest-green/20 text-forest-green border-forest-green" :
                      p.status === "draft" ? "bg-orange/20 text-orange border-orange" : "bg-gray-700 text-gray-500 border-gray-600"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-300">{new Date(p.created_at).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button onClick={() => openEdit(p)} variant="outline">
                      <Edit size={14} strokeWidth={2} />
                    </Button>
                    <Button onClick={() => setDelId(p.id)} variant="danger">
                      <Trash2 size={14} strokeWidth={2} />
                    </Button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-mono text-sm">Belum ada artikel. Tambahkan artikel baru.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-mono text-gray-400">
          Menampilkan {((page - 1) * limit + 1)}-{Math.min(page * limit, total)} dari {total} artikel
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Selanjutnya</Button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Artikel" : "Tambah Artikel"}>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
          <Input label="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />
          <Input label="Slug (unik)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} error={errors.slug} />
          <Select label="Status" options={statusOptions} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" | "archived" })} />
          <Textarea label="Ringkasan (excerpt)" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <Textarea label="Isi Artikel" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} />
          <Input label="Gambar Cover (URL)" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />
          <Input label="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="SEO Title" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
          <Textarea label="SEO Description" value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} rows={3} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : editing ? "Perbarui" : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!delId} onClose={() => setDelId(null)} title="Hapus Artikel">
        <p className="mb-6 text-sm font-mono text-gray-300">Yakin ingin menghapus artikel ini?</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setDelId(null)}>Batal</Button>
          <Button type="button" variant="danger" onClick={remove}>Hapus</Button>
        </div>
      </Modal>
    </div>
  );
}
