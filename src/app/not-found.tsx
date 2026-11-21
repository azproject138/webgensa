"use client";

import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-cream px-4">
      <div className="border-brutal p-8 sm:p-12 shadow-hard bg-warm-cream w-full max-w-md text-center">
        <div className="mb-8">
          <span className="font-grotesk font-black text-8xl sm:text-12xl text-black leading-none">404</span>
        </div>
        <h1 className="font-grotesk font-black text-2xl sm:text-3xl text-black mb-4">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-black/70 mb-8 text-lg">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="border-brutal px-6 py-3 font-grotesk font-black text-base shadow-hard hover:shadow-hard-hover transition-all uppercase tracking-wider text-center"
          >
            <Home size={18} strokeWidth={2} className="mr-2" /> Kembali ke Beranda
          </Link>
          <Link
            href="#"
            onClick={(e) => { e.preventDefault(); window.history.back(); }}
            className="px-6 py-3 border-4 border-black font-grotesk font-bold text-base uppercase tracking-wider hover:bg-black hover:text-warm-cream transition-colors text-center"
          >
            <RotateCcw size={18} strokeWidth={2} className="mr-2" /> Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}