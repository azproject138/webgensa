import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/public-data";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: {
      template: `%s | ${settings.site_title}`,
      default: settings.site_title,
    },
    description: settings.site_description,
    authors: [{ name: "GENSA" }],
    openGraph: {
      siteName: settings.site_title,
      title: settings.site_title,
      description: settings.site_description,
      locale: settings.site_locale,
      type: "website",
      images: settings.og_image ? [{ url: settings.og_image }] : [],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${dmSans.variable} ${spaceMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-black antialiased selection:bg-acid-lime selection:text-black">{children}</body>
    </html>
  );
}