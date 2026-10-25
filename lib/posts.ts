import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

/**
 * `/blog/category/...` などの静的ルートは catch-all より優先されるため、
 * 記事 slug の先頭セグメントに使えない。
 */
export const RESERVED_SLUGS = new Set(["category", "tag", "archive", "page", "feed.xml"]);

const isDev = process.env.NODE_ENV === "development";

export interface PostMeta {
  /** content/blog からの相対パス（拡張子なし）をセグメントに分解したもの */
  slug: string[];
  /** "/blog/2026/hello" */
  href: string;
  title: string;
  /** "2026-08-17" */
  date: string;
  /** date から導出した "YYYY-MM" */
  archive: string;
  category: string | null;
  tags: string[];
  description: string;
  published: boolean;
  /** false なら一覧・RSS・sitemap に出さない（旧 Hugo の `_build.list: never` 相当） */
  listed: boolean;
  math: boolean;
}

export interface Post extends PostMeta {
  /** frontmatter を除いた Markdown 本文 */
  body: string;
}

export interface Term {
  name: string;
  count: number;
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".")) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    // `_index.md` など下線始まりは Hugo のセクション索引なので記事として扱わない
    if (!entry.isFile() || !entry.name.endsWith(".md") || entry.name.startsWith("_")) return [];
    return [full];
  });
}

/**
 * frontmatter の生テキストから日付を取る。
 * `date: 2023-01-03T00:00:53+09:00` を js-yaml は UTC の Date にしてしまい、
 * そのまま toISOString() すると 2023-01-02 に前日化する（JST 深夜の記事が全滅する）。
 * 書かれている暦日をそのまま採るのが正しいので、生テキストの YYYY-MM-DD を優先する。
 */
function extractRawDate(rawFrontmatter: string | undefined): string | null {
  // frontmatter が無いファイルでは gray-matter が .matter を返さないことがある
  return (rawFrontmatter ?? "").match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1] ?? null;
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }
  return "";
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function parseFile(file: string): Post | null {
  const relative = path.relative(CONTENT_DIR, file);
  const slug = relative.replace(/\.md$/, "").split(path.sep);

  if (RESERVED_SLUGS.has(slug[0])) {
    console.warn(
      `[posts] "${relative}" の先頭セグメント "${slug[0]}" は予約語のため、この記事は無視されます。`,
    );
    return null;
  }

  const parsed = matter(fs.readFileSync(file, "utf8"));
  const { data, content } = parsed;

  const date = extractRawDate(parsed.matter) ?? normalizeDate(data.date);
  if (!date) {
    console.warn(`[posts] "${relative}" に有効な date がありません。この記事は無視されます。`);
    return null;
  }

  const title = typeof data.title === "string" && data.title.trim() ? data.title.trim() : slug.at(-1)!;
  const category = typeof data.category === "string" && data.category.trim() ? data.category.trim() : null;

  return {
    slug,
    href: `/blog/${slug.join("/")}`,
    title,
    date,
    archive: date.slice(0, 7),
    category,
    tags: toStringArray(data.tags),
    description: typeof data.description === "string" ? data.description.trim() : "",
    published: data.published !== false,
    listed: data.listed !== false,
    math: data.math === true,
    body: content,
  };
}

function isVisible(post: Post | PostMeta): boolean {
  if (isDev) return true;
  return post.published && post.date <= new Date().toISOString().slice(0, 10);
}

let cached: Post[] | null = null;

function loadPosts(): Post[] {
  // 本番（＝ビルド時）は一度だけ読む。dev は毎回読み直して編集を即反映する。
  if (cached && !isDev) return cached;

  const seen = new Map<string, string>();
  const posts = walk(CONTENT_DIR)
    .map(parseFile)
    .filter((post): post is Post => post !== null)
    .filter((post) => {
      const key = post.slug.join("/");
      const previous = seen.get(key);
      if (previous) {
        console.warn(`[posts] slug "${key}" が重複しています（${previous}）。`);
        return false;
      }
      seen.set(key, key);
      return true;
    })
    .filter(isVisible)
    .sort((a, b) => (a.date === b.date ? a.href.localeCompare(b.href) : b.date.localeCompare(a.date)));

  cached = posts;
  return posts;
}

/** 一覧に出す記事（日付降順） */
export function getAllPosts(): PostMeta[] {
  return loadPosts().filter((post) => post.listed);
}

/** ルーティング対象の全記事（listed: false も含む） */
export function getAllRoutablePosts(): PostMeta[] {
  return loadPosts();
}

export function getPostBySlug(slug: string[]): Post | null {
  const key = slug.join("/");
  return loadPosts().find((post) => post.slug.join("/") === key) ?? null;
}

function countTerms(values: (post: PostMeta) => string[]): Term[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const value of values(post)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count === a.count ? a.name.localeCompare(b.name, "ja") : b.count - a.count));
}

export function getAllCategories(): Term[] {
  return countTerms((post) => (post.category ? [post.category] : []));
}

export function getAllTags(): Term[] {
  return countTerms((post) => post.tags);
}

/** アーカイブは新しい順に並べる */
export function getAllArchives(): Term[] {
  return countTerms((post) => [post.archive]).sort((a, b) => b.name.localeCompare(a.name));
}

export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPosts().filter((post) => post.category === category);
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export function getPostsByArchive(archive: string): PostMeta[] {
  return getAllPosts().filter((post) => post.archive === archive);
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((current - 1) * perPage, current * perPage),
    page: current,
    totalPages,
    total: items.length,
  };
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function formatArchive(archive: string): string {
  const [year, month] = archive.split("-");
  return `${year}年${Number(month)}月`;
}
