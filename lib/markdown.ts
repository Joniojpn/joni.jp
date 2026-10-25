import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

/**
 * Hugo 時代の記事は本文に生 HTML を直接抱えている（`{{< html >}}` で透過させていた
 * div / table が約 966 ブロック）。remark-rehype と rehype-stringify の両方で
 * allowDangerousHtml を立て、rehype-raw で実ノード化しないと、それらが丸ごと消える。
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeKatex)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: "append",
    properties: { className: ["heading-anchor"], ariaHidden: "true", tabIndex: -1 },
    content: { type: "element", tagName: "span", properties: {}, children: [{ type: "text", value: "#" }] },
  })
  // サイトはライト固定なので単色テーマ。dual theme にすると各トークンに
  // --shiki-light / --shiki-dark が乗り、CSS 側の切り替えが必要になる。
  .use(rehypePrettyCode, { theme: "github-light", keepBackground: false })
  .use(rehypeStringify, { allowDangerousHtml: true })
  .freeze();

/** Markdown（生 HTML 混在可）を HTML 文字列に変換する。 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}

/** 一覧やメタデータ用に、Markdown / HTML を落としたプレーンテキストを作る。 */
export function toPlainText(markdown: string, maxLength = 140): string {
  const text = markdown
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
