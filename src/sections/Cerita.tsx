"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getCeritaData, getGalleryItems } from "@/lib/public-data";

interface CeritaProps {
  data: Awaited<ReturnType<typeof getCeritaData>>;
  galleryItems: Awaited<ReturnType<typeof getGalleryItems>>;
}

export default function Cerita({ data, galleryItems }: CeritaProps) {

  return (
    <section id="cerita" className="section bg-warm-cream">
      <div className="container">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <span className="font-grotesk font-bold text-xs uppercase tracking-widest text-orange border-brutal px-4 py-1.5 shadow-hard">
            {data.title}
          </span>
          <h2 className="font-grotesk font-black text-3xl sm:text-5xl tracking-tighter text-black leading-[1]">
            {data.subtitle}
          </h2>
          <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-black">
            {data.description}
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-12 lg:grid-cols-12">
          {galleryItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={[
                idx % 3 === 0 ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-4",
                idx % 2 === 0 && idx !== 0 ? "lg:row-span-2" : "",
              ].join(" ").trim()}
            >
              <div className="photo-frame aspect-[4/3] relative group">
                <Image
                  src={item.image_url}
                  alt={item.alt_text || item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="font-mono font-bold text-xs text-black uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="font-mono font-bold text-xs text-black uppercase tracking-wider">
                    {item.title}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}