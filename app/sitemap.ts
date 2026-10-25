import type { MetadataRoute } from "next";
import { getAllArchives, getAllCategories, getAllPosts, getAllTags } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.date;

  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly" },
    { url: absoluteUrl(site.blog.path), lastModified: latest, changeFrequency: "weekly" },
    ...posts.map((post) => ({
      url: absoluteUrl(post.href),
      lastModified: post.date,
    })),
    ...getAllCategories().map((term) => ({
      url: absoluteUrl(`/blog/category/${encodeURIComponent(term.name)}`),
      lastModified: latest,
    })),
    ...getAllTags().map((term) => ({
      url: absoluteUrl(`/blog/tag/${encodeURIComponent(term.name)}`),
      lastModified: latest,
    })),
    ...getAllArchives().map((term) => ({
      url: absoluteUrl(`/blog/archive/${term.name}`),
      lastModified: latest,
    })),
  ];
}
