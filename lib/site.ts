export const site = {
  url: "https://joni.jp",
  title: "joni.jp",
  description: "日経225のトレードとオッズに合う生き方を考察",
  blog: {
    title: "オッズに合う",
    description: "日経225のトレードとオッズに合う生き方を考察",
    path: "/blog",
    postsPerPage: 15,
  },
  author: "joni",
  locale: "ja_JP",
  /**
   * 旧テーマのグローバルメニュー。原典は HOME / ABOUT / PINE SCRIPT / OPTION /
   * CATEGORIES(相場・プログラミング・ライフスタイル) だったが、ABOUT・PINE・OPTION は
   * まだ移行していない固定ページ（103本）なので、出来次第ここに足す。
   */
  nav: [
    { label: "HOME", href: "/" },
    { label: "BLOG", href: "/blog" },
  ],
  /** 旧サイドバー最上段のバナー */
  sidebarBanner: {
    href: "https://jp.tradingview.com/script/08ENS72f/?share_your_love=jonico",
    src: "/img/tv-ci-00.jpg",
  },
  /** よく読まれている記事の目印。旧ブログの慣習をそのまま使う */
  recommendedTag: "rec",
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}
