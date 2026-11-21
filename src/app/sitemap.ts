import { MetadataRoute } from "next";
import { getPostsForSitemap } from "@/lib/post-detail-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gensa.id";

  const posts = await getPostsForSitemap();

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  ];

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/artikel/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...postUrls];
}