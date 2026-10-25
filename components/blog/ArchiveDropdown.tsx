"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * 旧テーマのアーカイブウィジェット（.j-dropdown）。
 * 原典は jQuery の slideToggle で開閉していた。ここは state で切り替える。
 */
export default function ArchiveDropdown({
  items,
}: {
  items: { month: string; label: string; count: number }[];
}) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="j-dropdown">
      <button
        type="button"
        className={`j-dropdown__title${open ? " is-active" : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        アーカイブ
      </button>

      {open && (
        <ul className="j-dropdown__list">
          {items.map((item) => (
            <li key={item.month}>
              <Link href={`/blog/archive/${item.month}`}>
                {item.label}
                <span className="count">{item.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
