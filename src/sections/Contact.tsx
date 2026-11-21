"use client";

import { getContactData } from "@/lib/public-data";

interface ContactProps {
  data: Awaited<ReturnType<typeof getContactData>>;
}

export default function Contact({ data }: ContactProps) {

  return (
    <section id="kontak" className="section bg-warm-cream">
      <div className="container">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="font-grotesk font-bold text-xs uppercase tracking-widest text-orange border-brutal px-4 py-1.5 shadow-hard">
            {data.title}
          </span>
          <h2 className="font-grotesk font-black text-3xl sm:text-5xl tracking-tighter text-black leading-[1]">
            {data.subtitle}
          </h2>
        </div>
        <div className="mt-8 max-w-md mx-auto border-brutal p-6 sm:p-8 shadow-hard">
          <dl className="space-y-4 text-lg sm:text-xl leading-relaxed">
            <div className="flex items-start gap-3">
              <dt className="font-mono font-bold text-forest-green shrink-0 whitespace-nowrap">
                Lokasi
              </dt>
              <dd className="text-black">
                {data.address}
              </dd>
            </div>
            {data.location_description && (
              <div className="flex items-start gap-3">
                <dt className="font-mono font-bold text-forest-green shrink-0 whitespace-nowrap">
                  Keterangan
                </dt>
                <dd className="text-black">
                  {data.location_description}
                </dd>
              </div>
            )}
            {data.whatsapp && (
              <div className="flex items-start gap-3">
                <dt className="font-mono font-bold text-forest-green shrink-0 whitespace-nowrap">
                  WhatsApp
                </dt>
                <dd className="text-black">
                  <a href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-forest-green transition-colors">
                    {data.whatsapp}
                  </a>
                </dd>
              </div>
            )}
            {data.email && (
              <div className="flex items-start gap-3">
                <dt className="font-mono font-bold text-forest-green shrink-0 whitespace-nowrap">
                  Email
                </dt>
                <dd className="text-black">
                  <a href={`mailto:${data.email}`} className="hover:text-forest-green transition-colors">
                    {data.email}
                  </a>
                </dd>
              </div>
            )}
            {data.instagram && (
              <div className="flex items-start gap-3">
                <dt className="font-mono font-bold text-forest-green shrink-0 whitespace-nowrap">
                  Instagram
                </dt>
                <dd className="text-black">
                  <a href={`https://instagram.com/${data.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-forest-green transition-colors">
                    @{data.instagram}
                  </a>
                </dd>
              </div>
            )}
            {data.facebook && (
              <div className="flex items-start gap-3">
                <dt className="font-mono font-bold text-forest-green shrink-0 whitespace-nowrap">
                  Facebook
                </dt>
                <dd className="text-black">
                  <a href={data.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-forest-green transition-colors">
                    {data.facebook}
                  </a>
                </dd>
              </div>
            )}
            {data.twitter && (
              <div className="flex items-start gap-3">
                <dt className="font-mono font-bold text-forest-green shrink-0 whitespace-nowrap">
                  Twitter
                </dt>
                <dd className="text-black">
                  <a href={data.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-forest-green transition-colors">
                    {data.twitter}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}