import type { Metadata } from "next";
import PostList from "@/components/blog/PostList";
import Pagination from "@/components/blog/Pagination";
import { getAllPosts, paginate } from "@/lib/posts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: site.blog.title,
  description: site.blog.description,
  alternates: { canonical: site.blog.path },
  openGraph: {
    type: "website",
    title: site.blog.title,
    description: site.blog.description,
    url: site.blog.path,
  },
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const result = paginate(getAllPosts(), Number(page) || 1, site.blog.postsPerPage);

  return (
    <>
      <PostList posts={result.items} />
      <Pagination page={result.page} totalPages={result.totalPages} />
    </>
  );
}
