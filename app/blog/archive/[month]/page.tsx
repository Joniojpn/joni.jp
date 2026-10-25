import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostList from "@/components/blog/PostList";
import { formatArchive, getAllArchives, getPostsByArchive } from "@/lib/posts";
import { site } from "@/lib/site";

// 一覧に無いパスは各ページの notFound() で 404 にする。
// false にすると dev で新しい .md を足すたびにサーバ再起動が要る（generateStaticParams がキャッシュされるため）。
export const dynamicParams = true;

type Params = { month: string };

export function generateStaticParams(): Params[] {
  return getAllArchives().map((term) => ({ month: term.name }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { month } = await params;
  const label = formatArchive(month);
  return {
    title: `アーカイブ: ${label}`,
    description: `${site.blog.title} の ${label} の記事一覧`,
    alternates: { canonical: `/blog/archive/${month}` },
  };
}

export default async function ArchivePage({ params }: { params: Promise<Params> }) {
  const { month } = await params;
  const posts = getPostsByArchive(month);
  if (posts.length === 0) notFound();

  return (
    <>
      <h2 className="mb-6 text-sm tracking-widest text-gray-500 uppercase">
        アーカイブ:{" "}
        <span className="font-bold text-gray-900">{formatArchive(month)}</span>
      </h2>
      <PostList posts={posts} />
    </>
  );
}
