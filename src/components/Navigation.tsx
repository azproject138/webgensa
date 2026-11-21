"use client";

import Link from "next/link";
import { getNavigationItems } from "@/lib/public-data";

interface NavigationProps {
  items: Awaited<ReturnType<typeof getNavigationItems>>;
}

export function Navigation({ items }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 bg-warm-cream border-b-4 border-black" aria-label="Utama">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="#beranda"
            className="font-mono font-bold text-base tracking-tighter flex items-center gap-2 focus-visible-brutal"
            title="Beranda"
          >
            GENSA<span className="text-acid-lime">.</span>
          </Link>

          <div className="hidden sm:flex items-center gap-6 sm:gap-8">
            {items.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium focus-visible-brutal transition-colors hover:text-forest-green"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-2 sm:mt-0 sm:hidden border-t-4 border-black pt-3">
          <div className="nav-scroll -mx-4 px-4">
            {items.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link px-3 py-2 text-sm font-bold focus-visible-brutal border-brutal shadow-hard hover:bg-acid-lime transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}