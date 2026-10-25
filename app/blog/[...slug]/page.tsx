import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { renderMarkdown, toPlainText } from "@/lib/markdown";
import { formatDate, getAllRoutablePosts, getPostBySlug } from "@/lib/posts";
import { site } from "@/lib/site";

// 一覧に無いパスは各ページの notFound() で 404 にする。
// false にすると dev で新しい .md を足すたびにサーバ再起動が要る（generateStaticParams がキャッシュされるため）。
export const dynamicParams = true;

type Params = { slug: string[] };

/** 日本語ファイル名にも対応するため、実行時の params は decode してから照合する。 */
export function generateStaticParams(): Params[] {
  return getAllRoutablePosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const slug = (await params).slug.map(decodeURIComponent);
  const post = getPostBySlug(slug);
  if (!post) return {};

  const description = post.description || toPlainText(post.body);

  return {
    title: post.title,
    description,
    alternates: { canonical: post.href },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: post.href,
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const slug = (await params).slug.map(decodeURIComponent);
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.body);

  return (
    <article>
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.category && (
            <Link
              href={`/blog/category/${encodeURIComponent(post.category)}`}
              className="rounded-full border border-gray-300 px-2.5 py-0.5 text-xs hover:border-gray-500"
            >
              {post.category}
            </Link>
          )}
          {!post.published && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              下書き
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{post.title}</h1>
      </header>

      <div
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {post.tags.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-2 text-sm text-gray-500">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Link href={`/blog/tag/${encodeURIComponent(tag)}`} className="hover:underline">
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 text-sm">
        <Link href={site.blog.path} className="hover:underline">
          ← 記事一覧
        </Link>
      </p>
    </article>
  );
}
