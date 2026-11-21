"use client";

import Link from "next/link";
import { getFooterData } from "@/lib/public-data";

interface FooterProps {
  data: Awaited<ReturnType<typeof getFooterData>>;
}

export function Footer({ data }: FooterProps) {
  return (
    <footer className="bg-black text-warm-cream border-t-4 border-black shadow-hard">
      <div className="container px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:items-start">
          <div className="font-mono font-bold text-xl tracking-tighter flex items-center gap-2">
            GENSA<span className="text-acid-lime">.</span>
          </div>
          <nav className="flex gap-6 sm:gap-8 text-sm sm:text-base" aria-label="Footer">
            {data.nav_items.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-visible-brutal hover:text-acid-lime transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs sm:text-sm opacity-70">
            {data.location}
          </p>
        </div>
        <p className="mt-6 sm:mt-8 text-xs opacity-60 text-center">
          {data.site_description}
        </p>
      </div>
    </footer>
  );
}