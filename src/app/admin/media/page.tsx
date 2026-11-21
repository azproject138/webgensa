"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Modal } from "@/components/admin/Modal";
import { useAdmin } from "@/components/admin/AdminContext";
import { Image, Plus, Trash2, Upload, Copy, Check } from "lucide-react";
import ImageNext from "next/image";

type MediaItem = {
  id: string;
  original_name: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  created_at: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function MediaPage() {
  const { showToast } = useAdmin();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const [delId, setDelId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/media", window.location.origin);
      url.searchParams.set("search", search);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));
      const res = await fetch(url.toString());
      const data = await res.json();
      setItems(data?.items ?? []);
      setTotal(data?.total ?? 0);
    } catch (err) {
      showToast({ type: "error", title: "Gagal memuat media", message: err instanceof Error ? err.message : "" });
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, showToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleUpload(files: FileList) {
    if (files.length === 0) return;
    setUploading(true);
    const newProgress: Record<string, number> = {};
    Array.from(files).forEach((f) => { newProgress[f.name] = 0; });
    setUploadProgress(newProgress);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Gagal mengunggah ${file.name}`);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      }
      showToast({ type: "success", title: "File berhasil diunggah" });
      setUploadProgress({});
      load();
    } catch (err) {
      showToast({ type: "error", title: "Gagal mengunggah", message: err instanceof Error ? err.message : "" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function remove() {
    if (!delId) return;
    try {
      const res = await fetch(`/api/media/${delId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      showToast({ type: "success", title: "Media dihapus" });
      setDelId(null);
      load();
    } catch (err) {
      showToast({ type: "error", title: "Gagal menghapus", message: err instanceof Error ? err.message : "" });
      setDelId(null);
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  function openPreview(item: MediaItem) {
    setPreviewItem(item);
  }

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 font-mono text-sm">Memuat media library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Image size={22} strokeWidth={2} className="text-acid-lime" aria-hidden="true" />
          <h2 className="font-grotesk font-black text-2xl text-white tracking-tighter">Media Library</h2>
        </div>
        <div className="flex gap-2">
          <Input label="" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama file..." className="w-64" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload size={18} strokeWidth={2} /> {uploading ? "Mengunggah..." : "Unggah"}
            </Button>
          </label>
        </div>
      </div>

      {Object.keys(uploadProgress).length > 0 && (
        <div className="bg-gray-800 border-brutal shadow-hard p-4 space-y-2">
          <div className="text-xs font-mono font-bold text-gray-300">Progres Unggah</div>
          {Object.entries(uploadProgress).map(([name, progress]) => (
            <div key={name} className="flex items-center gap-3 text-sm font-mono text-gray-200">
              <div className="w-40 truncate">{name}</div>
              <div className="flex-1 h-2 bg-gray-700 border-brutal overflow-hidden">
                <div
                  className="h-full bg-acid-lime transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="w-12 text-right">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-800 border-brutal shadow-hard rounded-none overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative border-brutal bg-gray-900 overflow-hidden cursor-pointer"
              onClick={() => openPreview(item)}
            >
              <div className="aspect-square relative">
                <ImageNext
                  src={item.file_url}
                  alt={item.original_name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); copyUrl(item.file_url); }}
                    className="h-8 w-8 p-0"
                  >
                    {copiedUrl === item.file_url ? <Check size={14} strokeWidth={2} className="text-forest-green" /> : <Copy size={14} strokeWidth={2} />}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={(e) => { e.stopPropagation(); setDelId(item.id); }}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </Button>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <p className="text-xs font-mono text-white truncate" title={item.original_name}>{item.original_name}</p>
                <p className="text-[0.7rem] font-mono text-gray-400">
                  {formatFileSize(item.file_size)} • {item.width && item.height ? `${item.width}×${item.height}` : "—"}
                </p>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 font-mono text-sm">
              <Image size={48} strokeWidth={1.5} className="mb-3 opacity-50" aria-hidden="true" />
              <p>Belum ada media. Klik Unggah untuk menambah file.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-mono text-gray-400">
          Menampilkan {((page - 1) * limit + 1)}-{Math.min(page * limit, total)} dari {total} file
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Selanjutnya</Button>
        </div>
      </div>

      <Modal open={!!delId} onClose={() => setDelId(null)} title="Hapus Media">
        <p className="mb-6 text-sm font-mono text-gray-300">Yakin ingin menghapus file ini? File yang dihapus tidak dapat dipulihkan.</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setDelId(null)}>Batal</Button>
          <Button type="button" variant="danger" onClick={remove}>Hapus</Button>
        </div>
      </Modal>

      <Modal open={!!previewItem} onClose={() => setPreviewItem(null)} title="Pratinjau Media">
        {previewItem && (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-900 border-brutal overflow-hidden">
              <ImageNext
                src={previewItem.file_url}
                alt={previewItem.original_name}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-contain"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <p className="text-gray-400">Nama File</p>
                <p className="text-white truncate">{previewItem.original_name}</p>
              </div>
              <div>
                <p className="text-gray-400">Ukuran</p>
                <p className="text-white">{formatFileSize(previewItem.file_size)}</p>
              </div>
              <div>
                <p className="text-gray-400">Dimensi</p>
                <p className="text-white">{previewItem.width && previewItem.height ? `${previewItem.width} × ${previewItem.height} px` : "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">Tipe</p>
                <p className="text-white">{previewItem.mime_type}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">URL</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={window.location.origin + previewItem.file_url}
                    readOnly
                    className="flex-1 bg-gray-900 border-brutal px-3 py-2 text-xs font-mono text-gray-300"
                  />
                  <Button variant="outline" onClick={() => copyUrl(previewItem.file_url)} className="h-10 px-3">
                    {copiedUrl === previewItem.file_url ? <Check size={14} strokeWidth={2} className="text-forest-green" /> : <Copy size={14} strokeWidth={2} />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}