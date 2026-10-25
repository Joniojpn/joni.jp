---
title: "ブログを再開しました"
date: 2026-08-17
category: "日記"
tags: ["blog", "nextjs"]
description: "Hugo で書いていたブログを Next.js に載せ替えました。この記事は書き方のひな形も兼ねています。"
published: true
math: true
---

Hugo で書いていた「オッズに合う」を、Next.js の上に載せ替えました。
この記事はそのまま**動作確認と執筆テンプレート**を兼ねています。新しい記事を書くときは、
このファイルをコピーして frontmatter を書き換えるのが早いです。

## 記事の置き場所

`content/blog/` 配下に `.md` を置くだけで公開されます。ファイルのパスがそのまま URL になります。

| ファイル | URL |
| --- | --- |
| `content/blog/2026/hello.md` | `/blog/2026/hello` |
| `content/blog/trading/zigzag.md` | `/blog/trading/zigzag` |

先頭のディレクトリ名に `category` / `tag` / `archive` / `page` は使えません（一覧ページのURLと衝突するため）。

## frontmatter

- `title` — 必須
- `date` — 必須。これが無い記事は無視されます
- `category` — 1つだけ。`/blog/category/日記` の一覧に出ます
- `tags` — 複数可
- `description` — 一覧・RSS・OGP に出る要約
- `published` — `false` にすると本番ビルドから外れる（`npm run dev` では見える）
- `math` — 数式を使う記事の目印

## 書けるもの

### コードブロック

```ts
const edge = (win: number, lose: number) => win / (win + lose);
```

### 数式

インラインなら $E = pW - (1-p)L$、ブロックならこう書けます。

$$
\mathrm{EV} = p \cdot W - (1 - p) \cdot L
$$

### 生 HTML

Hugo 時代の記事は本文に直接 HTML を書いていたので、それがそのまま動くようにしてあります。

<div class="well_dash">
<p style="margin-bottom:5px;"><b>旧テーマのクラスも生きています</b></p>
<li>well_dash / well_g / well_b</li>
<li>point / related / table-wrap</li>
</div>

<div class="point">
移行スクリプト（<code>npm run migrate:hugo</code>）は用意してありますが、まだ実行していません。
</div>
