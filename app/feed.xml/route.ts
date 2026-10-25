import { toPlainText } from "@/lib/markdown";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET(): Response {
  const posts = getAllPosts().slice(0, 50);

  const items = posts
    .map((meta) => {
      const post = getPostBySlug(meta.slug);
      const description = meta.description || (post ? toPlainText(post.body, 300) : "");
      const url = absoluteUrl(meta.href);

      return [
        "    <item>",
        `      <title>${escapeXml(meta.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${new Date(`${meta.date}T00:00:00+09:00`).toUTCString()}</pubDate>`,
        meta.category ? `      <category>${escapeXml(meta.category)}</category>` : "",
        `      <description>${escapeXml(description)}</description>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.blog.title)}</title>
    <link>${escapeXml(absoluteUrl(site.blog.path))}</link>
    <description>${escapeXml(site.blog.description)}</description>
    <language>ja</language>
    <atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
