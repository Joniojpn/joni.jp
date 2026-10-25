# joni.jp

Next.js (App Router) 製の joni.jp。

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## ブログ

`/blog` 配下。記事は `content/blog/` に Markdown（`.md`）で置く。**ファイルのパスがそのまま URL になる。**

| ファイル | URL |
| --- | --- |
| `content/blog/2026/hello.md` | `/blog/2026/hello` |
| `content/blog/trading/zigzag.md` | `/blog/trading/zigzag` |

先頭ディレクトリに `category` / `tag` / `archive` / `page` は使えない（一覧ページの URL と衝突するため、
`lib/posts.ts` の `RESERVED_SLUGS` で弾いて警告を出す）。

### frontmatter

```yaml
---
title: "記事タイトル"       # 必須
date: 2026-08-17            # 必須。これが無い記事は読み込まれない
category: "日記"            # 任意・1つだけ
tags: ["nikkei", "option"]  # 任意
description: "一覧・RSS・OGP に出る要約"
published: true             # false = 本番ビルドから除外（dev では見える）
listed: false               # 任意。一覧/RSS/sitemap から外すが URL は生きる
math: true                  # 任意。KaTeX を使う記事の目印
---
```

`npm run dev` では `published: false` の記事も表示され、「下書き」バッジが付く。
本番ビルド（`npm run build`）では除外される。

### 書けるもの

- Markdown + GFM（表・打ち消し線・タスクリスト）
- **生 HTML**（`rehype-raw`）— Hugo 時代の `<div class="well_dash">` などがそのまま動く
- 数式（`$...$` / `$$...$$`、KaTeX）
- コードブロックのシンタックスハイライト（Shiki / `rehype-pretty-code`）
- 見出しへの自動アンカー

パイプラインの定義は `lib/markdown.ts`、記事の読み込みは `lib/posts.ts`。

### 生成物

- `/blog`（ページ送りは `?page=2`、15件/頁）
- `/blog/category/[名前]`, `/blog/tag/[名前]`, `/blog/archive/YYYY-MM`
- `/feed.xml`（RSS 2.0）, `/sitemap.xml`, `/robots.txt`

## 旧 Hugo ブログの移行（**未実行**）

旧ブログ [Joniojpn/hugo-blog](https://github.com/Joniojpn/hugo-blog)（md 413本）を
`content/blog/` の形式に変換するスクリプトを用意してある。**まだ一度も実行していない。**

```bash
# 旧リポジトリを取得
gh api repos/Joniojpn/hugo-blog/tarball/master > /tmp/hugo.tgz && tar xzf /tmp/hugo.tgz -C /tmp

# dry-run（何も書かない）
npm run migrate:hugo -- --src /tmp/Joniojpn-hugo-blog-*/content

# 変換結果を2件だけ標準出力で確認
npm run migrate:hugo -- --src /tmp/Joniojpn-hugo-blog-*/content --dump 2

# 実際に書き出す + 画像を public/img へコピー
npm run migrate:hugo -- --src /tmp/Joniojpn-hugo-blog-*/content --write --copy-assets
```

変換の中身:

- Hugo ショートコード（`html` / `well_dash` / `well_g` / `well_b` / `point` / `related` /
  `mdtable` / `reference-op` / `reference-top` / `fix_page`）→ 対応する HTML。
  クラスのスタイルは `app/globals.css` に移植済み
- `categories: ["X"]` → `category: "X"`、`archives` は破棄（date から導出）
- `<!--more-->` の手前を `description` に流用してマーカーを除去
- `fixed: true` / `_build.list: never` の固定ページ（103本）→ `listed: false`
- 元の Hugo URL を `hugoPath` として残す（後からリダイレクトを作りたくなった時のため）
- **変換した記事はすべて `published: false`。良いと思ったものだけ手で `true` にして公開する**

dry-run で確認済みの数字（413本走査）:

| 項目 | 件数 |
| --- | --- |
| 変換対象 | 409（`_index.md` 4本はスキップ） |
| 未知のショートコード | 0 |
| 予約語との衝突 | 0 |
| `date` が無い（固定ページ） | 103 → 暫定日付が入るので要手当て |
| `page_css` を落とした | 10 |

## Deploy

Vercel。`main` への push がそのまま公開に繋がる。
