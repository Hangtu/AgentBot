import type { MetadataRoute } from "next";

import { APP_CONFIG } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes — add more as you build pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: APP_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Dynamic routes — add database queries here when you have public content
  // Example:
  // const posts = await db.query.posts.findMany({
  //   where: eq(posts.published, true),
  //   columns: { slug: true, updated_at: true },
  // });
  // const dynamicRoutes = posts.map((p) => ({
  //   url: `${APP_CONFIG.url}/blog/${p.slug}`,
  //   lastModified: p.updated_at,
  //   changeFrequency: "weekly" as const,
  //   priority: 0.8,
  // }));

  return [...staticRoutes];
}
