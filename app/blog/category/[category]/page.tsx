import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostList from "@/components/blog/PostList";
import { getAllCategories, getPostsByCategory } from "@/lib/posts";
import { site } from "@/lib/site";

// 一覧に無いパスは各ページの notFound() で 404 にする。
// false にすると dev で新しい .md を足すたびにサーバ再起動が要る（generateStaticParams がキャッシュされるため）。
export const dynamicParams = true;

type Params = { category: string };

/**
 * generateStaticParams には生の UTF-8（"日記"）を渡す。ここでエンコードすると
 * prerender-manifest のキーが二重エンコードされて 404 になる。
 * 一方、実行時に届く params は必ずパーセントエンコード済みなので、読む側で decode する。
 */
export function generateStaticParams(): Params[] {
  return getAllCategories().map((term) => ({ category: term.name }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const category = decodeURIComponent((await params).category);
  const title = `カテゴリ: ${category}`;
  return {
    title,
    description: `${site.blog.title} の「${category}」カテゴリの記事一覧`,
    alternates: { canonical: `/blog/category/${encodeURIComponent(category)}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const category = decodeURIComponent((await params).category);
  const posts = getPostsByCategory(category);
  if (posts.length === 0) notFound();

  return (
    <>
      <h2 className="mb-6 text-sm tracking-widest text-gray-500 uppercase">
        カテゴリ: <span className="font-bold text-gray-900">{category}</span>
      </h2>
      <PostList posts={posts} />
    </>
  );
}
