"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getHeroData } from "@/lib/public-data";

interface HeroProps {
  data: Awaited<ReturnType<typeof getHeroData>>;
}

export default function Hero({ data }: HeroProps) {

  return (
    <section id="beranda" className="section bg-warm-cream">
      <div className="container">
        <div className="grid gap-6 md:gap-10 lg:grid-cols-12">
          <div
            className="lg:col-span-7 order-2 lg:order-1 flex flex-col justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block border-brutal px-4 py-1.5 mb-6 bg-acid-lime shadow-hard text-center skew-negative"
            >
              <span className="unskew text-xs font-mono font-bold uppercase tracking-tighter text-black">
                {data.badge_text}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-grotesk font-black text-[clamp(2rem,8vw,4.5rem)] leading-[0.9] tracking-tighter text-black shadow-hard mb-6"
            >
              {data.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl leading-relaxed text-black mb-10 max-w-lg"
            >
              {data.description}
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={data.cta_link}
                className="border-brutal px-7 py-3 font-grotesk font-black text-base shadow-hard hover:shadow-hard-hover transition-all uppercase tracking-wider text-center"
              >
                {data.cta_text}
              </Link>
              <Link
                href={data.secondary_cta_link}
                className="px-7 py-3 border-4 border-black font-grotesk font-bold text-base uppercase tracking-wider hover:bg-black hover:text-warm-cream transition-colors text-center"
              >
                {data.secondary_cta_text}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="photo-frame aspect-[4/3] md:aspect-[16/9] relative group">
              <Image
                src={data.image_url}
                alt={data.image_alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="font-mono font-bold text-xs text-black uppercase tracking-wider">
                  GENSA / Community
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="font-mono font-bold text-xs text-black uppercase tracking-wider">
                  Dokumentasi Kegiatan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}