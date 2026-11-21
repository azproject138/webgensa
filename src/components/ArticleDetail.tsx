"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail_url: string | null;
  category: string | null;
  published_at: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ArticleDetailProps {
  post: Post;
}

export function ArticleDetail({ post }: ArticleDetailProps) {
  const publishedDate = post.published_at ? format(new Date(post.published_at), "d MMMM yyyy", { locale: id }) : null;
  const updatedDate = format(new Date(post.updated_at), "d MMMM yyyy", { locale: id });

  return (
    <article className="section bg-warm-cream">
      <div className="container max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono font-bold text-forest-green mb-8 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2} /> Kembali ke Beranda
        </Link>

        <header className="mb-10">
          {post.category && (
            <span className="inline-block border-brutal px-3 py-1 bg-acid-lime shadow-hard text-xs font-mono font-bold uppercase tracking-wider mb-4">
              {post.category}
            </span>
          )}
          <h1 className="font-grotesk font-black text-3xl sm:text-5xl tracking-tighter text-black leading-[1] mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-gray-500">
            {publishedDate && (
              <span className="flex items-center gap-1">
                <Calendar size={14} strokeWidth={2} /> {publishedDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={14} strokeWidth={2} /> Diperbarui {updatedDate}
            </span>
          </div>
        </header>

        {post.thumbnail_url && (
          <div className="photo-frame aspect-[16/9] mb-10 relative">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              priority
              className="object-cover"
            />
          </div>
        )}

        <div className="prose prose-black max-w-none font-sans" dangerouslySetInnerHTML={{ __html: post.content }} />

        <hr className="border-black my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 border-brutal px-6 py-3 font-grotesk font-black text-base shadow-hard hover:shadow-hard-hover transition-all uppercase tracking-wider text-center"
          >
            <ArrowLeft size={18} strokeWidth={2} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </article>
  );
}