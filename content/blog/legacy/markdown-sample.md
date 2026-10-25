---
title: "【独自テーマ用】マークダウンのサンプル集"
date: 2020-10-23
category: "Hugo"
description: "Hugoで記事を作成する時のマークダウンサンプル。"
published: false
hugoPath: "/legacy/markdown-sample/"
---

Hugoで記事を作成する時のマークダウンサンプル。

---

`#`
# h1 Heading 
`##`
## h2 Heading
`###`
### h3 Heading
`####`
#### h4 Heading
`#####`
##### h5 Heading

## 水平線
`---`や`***`で水平線

---

***

## 強調

#### 太文字 + 赤のアンダーライン

`**`や`__`の２つで文章の左右を挟むと太字＋赤マーカーで強調

**This is bold text**

__サンプル　テキスト__

#### 太文字
`*`や`_`が１つだと太字

※両サイドにスペースを入れないと動作しない時がある。

*This is italic text*

_サンプル　テキスト_

#### 打消し線
`~~`チルダ2個で打消し
~~Strikethrough~~

## 引用
引用は、`>`を文章の最初に

> Blockquotes can also be nested...

## 記事装飾用のショートコードのサンプル

`{{}}`の中にに`< ショートコード名 >`

終わりは`/ショートコード名`

マークダウンは処理されないので、HTMLで中身を記述する
#### Point

<div class="point">
<p>サンプル</p>
</div>

#### related

<div class="related">
<ul><li><a href="">関連記事のタイトルA</a></li>
<li><a href="">関連記事のタイトルのタイトルが長い場合のサンプル</a></li></ul>
</div>

#### well_dash

<div class="well_dash">
通常のテキスト
<br><a href="/">リンク</a>
<li> サンプル </li>
</div>

#### well_b

<div class="well_b">
テキスト
</div>

## リスト

#### 番号無し

文章の最初に `+`, `-`, or `*`を記載。
+ 通常のリスト
  - ネストする場合は、スペース２でインデント
    * ネストの中で更にインデントすることで第3階層
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

#### 番号有り

`数字とドット(.)`ではじめる

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa

## コード

#### Inline 
` shift + ~ `で囲う

`sample` 

#### Syntax highlighting

`3連アポストロフィー`の後に`言語`で改行してコードを記入。

`3連アポストロフィー`で囲む。

``` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
```

## Tables
ショーコード```mdtable```でレスポンシブに対応したテーブルに。

<div class="table-wrap">

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

</div>

Right aligned columns

<div class="table-wrap">

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

</div>

中央揃えは`:---: `
## Links

`[リンクのテキスト](http://exsample.com)`

[link text](http://dev.nodeca.com)

URLそのままで下記のようにコンバートされる

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)

## Images
`![代替テキスト](画像URL)`で画像表示

![Minion](https://octodex.github.com/images/minion.png)

##### 画像にリンクを設定する
`[![代替テキスト](画像URL)](URL)`で画像にリンクを設定

画像表示部分を`[ ]`で囲い、`(URL)`をその後につける（ネストする）
[![minion](https://octodex.github.com/images/minion.png)](https://octodex.github.com/images/minion.png)

## Plugins

The killer feature of `markdown-it` is very effective support of
[syntax plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin).

### Footnotes
(https://github.com/markdown-it/markdown-it-footnote)

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

and multiple paragraphs.

[^second]: Footnote text.
