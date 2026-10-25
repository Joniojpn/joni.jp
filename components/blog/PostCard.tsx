import Link from "next/link";
import { formatDate, type PostMeta } from "@/lib/posts";

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="border-b border-gray-200 py-6 first:pt-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.category && (
          <Link
            href={`/blog/category/${encodeURIComponent(post.category)}`}
            className="rounded-full border border-gray-300 px-2.5 py-0.5 text-xs hover:border-gray-500 hover:text-gray-800"
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

      <h2 className="mt-2 text-xl font-bold tracking-tight">
        <Link href={post.href} className="hover:underline">
          {post.title}
        </Link>
      </h2>

      {post.description && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
          {post.description}
        </p>
      )}

      {post.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Link href={`/blog/tag/${encodeURIComponent(tag)}`} className="hover:underline">
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
