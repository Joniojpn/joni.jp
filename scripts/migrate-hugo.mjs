#!/usr/bin/env node
/**
 * Hugo（Joniojpn/hugo-blog）の content/ を Next.js 版ブログの content/blog/ に変換する。
 *
 * 既定は dry-run。--write を付けたときだけファイルを書き出す。
 *
 *   node scripts/migrate-hugo.mjs --src /path/to/hugo-blog/content
 *   node scripts/migrate-hugo.mjs --src /path/to/hugo-blog/content --dump 2
 *   node scripts/migrate-hugo.mjs --src /path/to/hugo-blog/content --write --copy-assets
 *
 * 変換した記事はすべて published: false で出力する。
 * 「良い」と思ったものだけ後から true に書き換えて公開する運用。
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

// --- 引数 -------------------------------------------------------------------

function parseArgs(argv) {
  const args = { write: false, copyAssets: false, dump: 0, out: null, src: null, fallbackDate: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--write") args.write = true;
    else if (arg === "--copy-assets") args.copyAssets = true;
    else if (arg === "--src") args.src = argv[++i];
    else if (arg === "--out") args.out = argv[++i];
    else if (arg === "--dump") args.dump = Number(argv[++i]) || 0;
    else if (arg === "--fallback-date") args.fallbackDate = argv[++i];
    else throw new Error(`不明な引数: ${arg}`);
  }
  if (!args.src) throw new Error("--src <hugo-blog/content のパス> が必要です");
  args.src = path.resolve(args.src);
  args.out = path.resolve(args.out ?? path.join(process.cwd(), "content", "blog"));
  return args;
}

// --- ショートコード ---------------------------------------------------------

/**
 * 変換規則の根拠は hugo-blog/layouts/shortcodes/*.html の実定義。
 * inner は Markdown のまま残す（前後に空行を入れて remark に解釈させる）。
 */
const SHORTCODES = {
  // {{< html >}} は生 HTML を素通しさせるためだけのラッパー
  html: (inner) => inner.trim(),
  // {{< fix_page >}} は固定ページのレイアウト用ラッパー。中身だけ残す
  fix_page: (inner) => inner.trim(),
  well_dash: (inner) => wrapDiv("well_dash", inner),
  well_b: (inner) => wrapDiv("well_b", inner),
  well_g: (inner) => wrapDiv("well_g", inner, ' style="font-weight:bold;"'),
  point: (inner) => `<div class="point">\n<p>${inner.trim()}</p>\n</div>`,
  related: (inner) => `<div class="related">\n<ul>${inner.trim()}</ul>\n</div>`,
  mdtable: (inner) => `<div class="table-wrap">\n\n${inner.trim()}\n\n</div>`,
  "reference-op": (inner) => referenceButton("/option", inner),
  "reference-top": (inner) => referenceButton("/pine", inner),
};

function wrapDiv(className, inner, extraAttrs = "") {
  return `<div class="${className}"${extraAttrs}>\n${inner.trim()}\n</div>`;
}

function referenceButton(href, inner) {
  return `<hr>\n<div class="reference-btn">\n<a href="${href}" class="btn-flat-border">${inner.trim()}</a>\n</div>`;
}

// 内側に別のショートコードを含まないペアだけにマッチする（＝最内側から潰す）
const INNERMOST = /\{\{<\s*([a-zA-Z_-]+)\s*>\}\}((?:(?!\{\{<)[\s\S])*?)\{\{<\s*\/\s*([a-zA-Z_-]+)\s*>\}\}/;

function convertShortcodes(body, warn) {
  let result = body;
  let guard = 0;

  while (INNERMOST.test(result)) {
    if (++guard > 500) {
      warn("ショートコード変換が 500 回を超えました。入れ子が深すぎるか壊れています");
      break;
    }
    result = result.replace(INNERMOST, (match, open, inner, close) => {
      if (open !== close) {
        warn(`開始 {{< ${open} >}} と終了 {{< /${close} >}} が対応していません`);
        return match.replace(/\{\{<[^>]*>\}\}/g, "");
      }
      const handler = SHORTCODES[open];
      if (!handler) {
        warn(`未知のショートコード: ${open}`);
        return inner;
      }
      return `\n\n${handler(inner)}\n\n`;
    });
  }

  const leftover = result.match(/\{\{<[^>]*>\}\}/g);
  if (leftover) {
    warn(`対応が取れなかったショートコードを削除しました: ${[...new Set(leftover)].join(", ")}`);
    result = result.replace(/\{\{<[^>]*>\}\}/g, "");
  }

  return result.replace(/\n{3,}/g, "\n\n").trim();
}

// --- frontmatter ------------------------------------------------------------

/**
 * Hugo の date は `2023-01-03T00:00:53+09:00` の形。js-yaml が UTC の Date にしてしまうため、
 * toISOString() すると JST 深夜の記事が軒並み前日にずれる。生テキストの暦日をそのまま採る。
 */
function extractRawDate(rawFrontmatter) {
  // frontmatter が無いファイルでは gray-matter が .matter を返さないことがある
  return (rawFrontmatter ?? "").match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1] ?? null;
}

function toDateString(value, fallback) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }
  return fallback;
}

function firstString(value) {
  if (Array.isArray(value)) {
    const found = value.map(String).map((s) => s.trim()).find(Boolean);
    return found ?? null;
  }
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function toTags(value) {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((s) => s.trim()).filter(Boolean);
}

function yamlString(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function buildFrontmatter(fields) {
  const lines = ["---"];
  lines.push(`title: ${yamlString(fields.title)}`);
  lines.push(`date: ${fields.date}`);
  if (fields.category) lines.push(`category: ${yamlString(fields.category)}`);
  if (fields.tags.length > 0) lines.push(`tags: [${fields.tags.map(yamlString).join(", ")}]`);
  if (fields.description) lines.push(`description: ${yamlString(fields.description)}`);
  lines.push(`published: ${fields.published}`);
  if (!fields.listed) lines.push("listed: false");
  if (fields.math) lines.push("math: true");
  lines.push(`hugoPath: ${yamlString(fields.hugoPath)}`);
  lines.push("---");
  return lines.join("\n");
}

function summarize(text, maxLength = 140) {
  const plain = text
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}…` : plain;
}

// --- 変換 -------------------------------------------------------------------

const RESERVED_SLUGS = new Set(["category", "tag", "archive", "page", "feed.xml"]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".md") ? [full] : [];
  });
}

function convertFile(file, args, report) {
  const relative = path.relative(args.src, file);
  const warn = (message) => report.warnings.push(`${relative}: ${message}`);

  if (path.basename(file) === "_index.md") {
    report.skippedIndexes.push(relative);
    return null;
  }

  const slug = relative.replace(/\.md$/, "").split(path.sep);
  if (RESERVED_SLUGS.has(slug[0])) {
    warn(`先頭セグメント "${slug[0]}" は予約語です。手動でパスを変える必要があります`);
    report.reserved.push(relative);
  }

  const parsed = matter(fs.readFileSync(file, "utf8"));
  const { data, content } = parsed;

  const mtimeDate = fs.statSync(file).mtime.toISOString().slice(0, 10);
  const fallback = args.fallbackDate ?? mtimeDate;
  const date = extractRawDate(parsed.matter) ?? toDateString(data.date, null);
  if (!date) {
    report.missingDate.push(relative);
    warn(`date がありません。暫定で ${fallback} を入れました（要手当て）`);
  }

  for (const dropped of ["page_css", "page_js"]) {
    if (data[dropped] !== undefined) warn(`${dropped} は移行できないので捨てました: ${data[dropped]}`);
  }

  // Hugo の <!--more--> は「ここまでが抜粋」の印。本文からは印だけ消し、description に流用する。
  let body = content;
  let description = typeof data.description === "string" ? data.description.trim() : "";
  const moreIndex = body.indexOf("<!--more-->");
  if (moreIndex >= 0) {
    if (!description) description = summarize(body.slice(0, moreIndex));
    body = body.replace("<!--more-->", "");
    report.moreMarkers += 1;
  }

  const converted = convertShortcodes(body, warn);
  const isFixed = data.fixed === true || data._build?.list === "never";

  const frontmatter = buildFrontmatter({
    title: firstString(data.title) ?? slug.at(-1),
    date: date ?? fallback,
    category: firstString(data.categories),
    tags: toTags(data.tags),
    description,
    // 移行分はすべて非公開で入れる。良いと思ったものだけ後から true にする。
    published: false,
    listed: !isFixed,
    math: data.math === true,
    hugoPath: `/${relative.replace(/\.md$/, "").replace(/\\/g, "/")}/`,
  });

  if (data.draft === true) report.drafts += 1;
  if (isFixed) report.fixed += 1;

  return { relative, text: `${frontmatter}\n\n${converted}\n` };
}

function copyAssets(args, report) {
  const from = path.join(path.dirname(args.src), "static", "img");
  const to = path.join(process.cwd(), "public", "img");
  if (!fs.existsSync(from)) {
    report.warnings.push(`--copy-assets: ${from} が見つかりません`);
    return;
  }
  if (!args.write) {
    console.log(`[dry-run] 画像をコピーする: ${from} -> ${to}`);
    return;
  }
  fs.cpSync(from, to, { recursive: true });
  console.log(`画像をコピーしました: ${from} -> ${to}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(args.src)) throw new Error(`--src が存在しません: ${args.src}`);

  const report = {
    warnings: [],
    skippedIndexes: [],
    missingDate: [],
    reserved: [],
    drafts: 0,
    fixed: 0,
    moreMarkers: 0,
  };

  const files = walk(args.src).sort();
  const results = files.map((file) => convertFile(file, args, report)).filter(Boolean);

  const seen = new Map();
  for (const result of results) {
    const key = result.relative;
    if (seen.has(key)) report.warnings.push(`slug 重複: ${key}`);
    seen.set(key, true);
  }

  for (let i = 0; i < Math.min(args.dump, results.length); i += 1) {
    console.log(`\n========== ${results[i].relative} ==========\n${results[i].text}`);
  }

  if (args.write) {
    for (const result of results) {
      const target = path.join(args.out, result.relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, result.text, "utf8");
    }
  }

  if (args.copyAssets) copyAssets(args, report);

  console.log("\n--- サマリ -------------------------------------------------");
  console.log(`走査した .md            : ${files.length}`);
  console.log(`変換した記事            : ${results.length}`);
  console.log(`  うち旧 draft: true    : ${report.drafts}`);
  console.log(`  うち固定ページ        : ${report.fixed}（listed: false）`);
  console.log(`<!--more--> を処理      : ${report.moreMarkers}`);
  console.log(`スキップした _index.md  : ${report.skippedIndexes.length}`);
  if (report.skippedIndexes.length > 0) console.log(`  ${report.skippedIndexes.join(", ")}`);
  console.log(`date が無かった記事     : ${report.missingDate.length}`);
  console.log(`予約語と衝突した記事    : ${report.reserved.length}`);
  console.log(`警告                    : ${report.warnings.length}`);

  const unknown = report.warnings.filter((w) => w.includes("未知のショートコード"));
  console.log(`  うち未知ショートコード: ${unknown.length}`);
  for (const warning of report.warnings.slice(0, 20)) console.log(`  - ${warning}`);
  if (report.warnings.length > 20) console.log(`  … 他 ${report.warnings.length - 20} 件`);

  console.log(
    args.write
      ? `\n${results.length} 件を ${args.out} に書き出しました（すべて published: false）。`
      : "\n[dry-run] 何も書き出していません。実際に書き出すには --write を付けてください。",
  );
}

main();
