import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostForDetail, getSiteSettings } from "@/lib/post-detail-data";
import { ArticleDetail } from "@/components/ArticleDetail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostForDetail(slug);

  if (!post) {
    return { title: "Artikel Tidak Ditemukan" };
  }

  const settings = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gensa.id";
  const postUrl = `${baseUrl}/artikel/${post.slug}`;

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || settings.site_description,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || settings.site_description,
      type: "article",
      url: postUrl,
      siteName: settings.site_title,
      locale: settings.site_locale,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: post.author_id ? ["GENSA"] : undefined,
      images: post.thumbnail_url ? [{ url: post.thumbnail_url }] : (settings.og_image ? [{ url: settings.og_image }] : []),
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || settings.site_description,
      images: post.thumbnail_url ? [post.thumbnail_url] : (settings.og_image ? [settings.og_image] : []),
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostForDetail(slug);

  if (!post) {
    notFound();
  }

  return <ArticleDetail post={post} />;
}