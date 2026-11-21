"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getAboutData } from "@/lib/public-data";

interface AboutProps {
  data: Awaited<ReturnType<typeof getAboutData>>;
}

export default function About({ data }: AboutProps) {

  return (
    <section id="tentang" className="section bg-warm-cream">
      <div className="container">
        <div className="grid gap-6 md:gap-10 lg:grid-cols-12">
          <div
            className="lg:col-span-5 border-brutal p-5 sm:p-7 shadow-hidden md:shadow-hard order-2 lg:order-1"
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-grotesk font-black text-3xl sm:text-5xl tracking-tighter text-black mb-4 leading-[1]"
            >
              {data.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl leading-relaxed text-black mb-6"
            >
              {data.description}
            </motion.p>
            <div className="space-y-3">
              {data.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-start gap-3 border-b-2 border-black pb-2 last:border-0 last:pb-0"
                >
                  <span className="font-mono font-bold text-xs text-forest-green whitespace-nowrap">
                    {fact.label}
                  </span>
                  <span className="text-sm sm:text-base">{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="photo-frame aspect-[4/3] relative">
              <Image
                src={data.image_url}
                alt={data.image_alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                priority
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="font-mono font-bold text-xs text-black uppercase tracking-wider">
                  GENSA / Community
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="font-mono font-bold text-xs text-black uppercase tracking-wider">
                  Sosial & Lingkungan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}