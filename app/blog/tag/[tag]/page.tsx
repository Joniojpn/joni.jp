import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostList from "@/components/blog/PostList";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { site } from "@/lib/site";

// 一覧に無いパスは各ページの notFound() で 404 にする。
// false にすると dev で新しい .md を足すたびにサーバ再起動が要る（generateStaticParams がキャッシュされるため）。
export const dynamicParams = true;

type Params = { tag: string };

/** params は実行時にエンコード済みで届くので読む側で decode する。詳細は category ページのコメント。 */
export function generateStaticParams(): Params[] {
  return getAllTags().map((term) => ({ tag: term.name }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const tag = decodeURIComponent((await params).tag);
  return {
    title: `タグ: ${tag}`,
    description: `${site.blog.title} の「${tag}」タグの記事一覧`,
    alternates: { canonical: `/blog/tag/${encodeURIComponent(tag)}` },
  };
}

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const tag = decodeURIComponent((await params).tag);
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <>
      <h2 className="mb-6 text-sm tracking-widest text-gray-500 uppercase">
        タグ: <span className="font-bold text-gray-900">#{tag}</span>
      </h2>
      <PostList posts={posts} />
    </>
  );
}
