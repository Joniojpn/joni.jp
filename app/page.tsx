// app/page.js

export default function HomePage() {
  return (
    // 画面全体を覆い、コンテンツを中央に配置するためのクラス
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      
      {/* Tailwind CSS のクラス解説:
        - text-8xl: 非常に大きなフォントサイズを設定
        - font-extrabold: 非常に太いフォントウェイトを設定
        - text-gray-900: 濃いグレーの文字色
        - tracking-wider: 文字間隔を少し広く設定
      */}
      <h1 className="text-8xl font-extrabold text-gray-900 tracking-wider">
        joni.jp
      </h1>
      
    </div>
  );
}