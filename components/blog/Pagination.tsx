import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  basePath = "/blog",
}: {
  page: number;
  totalPages: number;
  basePath?: string;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => (target === 1 ? basePath : `${basePath}?page=${target}`);
  const linkClass = "rounded border border-gray-300 px-3 py-1.5 text-sm hover:border-gray-500";

  return (
    <nav className="mt-10 flex items-center justify-between" aria-label="ページ送り">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass} rel="prev">
          ← 新しい記事
        </Link>
      ) : (
        <span />
      )}

      <span className="text-sm text-gray-500">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={linkClass} rel="next">
          古い記事 →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
