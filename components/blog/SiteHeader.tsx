"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

/**
 * 旧テーマ "odds" の partials/header.html を再現。
 * ロゴ左寄せ・メニュー右寄せ、CATEGORIES はホバーで下に開く（原典は jQuery、こちらは CSS）。
 */
export default function SiteHeader({ categories }: { categories: string[] }) {
  const pathname = usePathname();

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="odds-header">
      <div className="odds-header__inner">
        <h2 className="odds-logo">
          <Link href="/" title={site.title}>
            <Image src="/img/logo.png" alt={site.title} width={123} height={31} priority />
          </Link>
        </h2>

        <nav className="odds-gnav">
          <ul>
            {site.nav.map((item) => (
              <li key={item.href} className={isCurrent(item.href) ? "is-current" : undefined}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}

            {categories.length > 0 && (
              <li>
                <Link href="/blog">CATEGORIES</Link>
                <ul>
                  {categories.map((category) => (
                    <li key={category}>
                      <Link href={`/blog/category/${encodeURIComponent(category)}`}>{category}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}
