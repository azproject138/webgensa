"use client";

import { motion } from "framer-motion";
import { getRuangGerakCategories } from "@/lib/public-data";

interface RuangGerakProps {
  categories: Awaited<ReturnType<typeof getRuangGerakCategories>>;
}

export default function RuangGerak({ categories }: RuangGerakProps) {

  return (
    <section id="ruang-gerak" className="section bg-warm-cream">
      <div className="container">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <span className="font-grotesk font-bold text-xs uppercase tracking-widest text-orange border-brutal px-4 py-1.5 shadow-hard">
            Ruang Gerak
          </span>
          <h2 className="font-grotesk font-black text-3xl sm:text-5xl tracking-tighter text-black leading-[1]">
            Kegiatan Warga
          </h2>
          <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-black">
            Pengelompokan kegiatan berdasarkan ruang gerak organisasi.
            Ini adalah kerangka editorial, bukan klaim program resmi yang
            sudah ditetapkan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, idx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={[
                "border-brutal p-5 sm:p-7 shadow-hard hover:shadow-hard-hover transition-all duration-300 group relative overflow-hidden",
                category.accent_color,
                category.accent_text_color,
              ].join(" ")}
            >
              <div className="absolute top-0 right-0 w-10 h-10 bg-black/10" aria-hidden="true" />
              <h3 className="font-grotesk font-black text-lg sm:text-xl tracking-tight text-black mb-3 group-hover:text-forest-green transition-colors">
                {category.title}
              </h3>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed">
                {category.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="shrink-0 font-mono font-bold text-forest-green">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}