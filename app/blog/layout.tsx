import Link from "next/link";
import "katex/dist/katex.min.css";
import Sidebar from "@/components/blog/Sidebar";
import SiteHeader from "@/components/blog/SiteHeader";
import { getAllCategories } from "@/lib/posts";
import { site } from "@/lib/site";

/**
 * 旧テーマ "odds" の baseof.html と同じ骨格（ヘッダー → 本文1150px（795+300） → フッター）。
 * フッターは原典の #footer_top（ロゴ＋2つのメニュー）は起こさず、
 * #footer_bottom のコピーライト帯だけを持ってきている。
 */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const categories = getAllCategories().map((term) => term.name);

  return (
    <>
      <SiteHeader categories={categories} />

      <div className="odds-main">
        <main className="odds-main__left">{children}</main>
        <Sidebar />
      </div>

      <footer className="odds-footer">
        <div className="odds-footer__inner">
          <p>
            &copy; 2020-{new Date().getFullYear()} <Link href="/blog">{site.blog.title}</Link>
            <span className="odds-footer__sep">|</span>
            <Link href="/feed.xml">RSS</Link>
          </p>
        </div>
      </footer>
    </>
  );
}
