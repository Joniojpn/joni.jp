import Image from "next/image";
import Link from "next/link";
import ArchiveDropdown from "./ArchiveDropdown";
import {
  formatArchive,
  getAllArchives,
  getAllCategories,
  getAllPosts,
  getPostsByTag,
  type PostMeta,
} from "@/lib/posts";
import { site } from "@/lib/site";

/** 旧テーマの .side_post_list ウィジェット */
function PostListWidget({
  title,
  posts,
  className = "side_post_list",
}: {
  title: string;
  posts: PostMeta[];
  className?: string;
}) {
  if (posts.length === 0) return null;

  return (
    <div className={`side_widget ${className}`}>
      <h3 className="side_headline">
        <span>{title}</span>
      </h3>
      <ol className="side_post_list">
        {posts.map((post) => (
          <li key={post.href}>
            <div className="info">
              <Link className="title" href={post.href}>
                {post.title}
              </Link>
              <p className="date">{post.date.replace(/-/g, "/")}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * 旧テーマ "odds" の partials/sidebar.html を再現。
 * 原典のウィジェット順は バナー → カテゴリー → 最新記事 → よく読まれている記事 →
 * トレード日記 → アーカイブ。「トレード日記」は移行していないページ（/cycle,
 * /trading/study/instructions）への固定リンクなので、いまは出していない。
 */
export default function Sidebar() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const archives = getAllArchives();
  const recommended = getPostsByTag(site.recommendedTag);

  return (
    <div className="odds-main__side">
      <div className="side_widget">
        <div className="img_block">
          <a href={site.sidebarBanner.href} target="_blank" rel="noopener noreferrer">
            <Image src={site.sidebarBanner.src} alt="" width={300} height={250} />
          </a>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="side_widget side_category_list_widget">
          <h3 className="side_headline">
            <span>カテゴリー</span>
          </h3>
          <ul className="side_category_list">
            {categories.map((term) => (
              <li key={term.name}>
                <Link href={`/blog/category/${encodeURIComponent(term.name)}`}>
                  {term.name}
                  <span className="count">{term.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <PostListWidget title="最新記事" posts={posts.slice(0, 5)} />

      <PostListWidget
        title="よく読まれている記事"
        posts={recommended}
        className="side_post_list side_reco_post_list"
      />

      <div className="side_widget side_archive_list_widget">
        <ArchiveDropdown
          items={archives.map((term) => ({
            month: term.name,
            label: formatArchive(term.name),
            count: term.count,
          }))}
        />
      </div>
    </div>
  );
}
