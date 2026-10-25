import PostCard from "./PostCard";
import type { PostMeta } from "@/lib/posts";

export default function PostList({
  posts,
  emptyMessage = "記事がまだありません。",
}: {
  posts: PostMeta[];
  emptyMessage?: string;
}) {
  if (posts.length === 0) {
    return <p className="py-12 text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.href} post={post} />
      ))}
    </div>
  );
}
