// b/page.js

import Link from 'next/link'; // リンクを使う場合はimport

export default function BondsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-16">
      <h1 className="text-8xl font-extrabold text-gray-900 tracking-wider">
        Bonds Japan
      </h1>

      {/* メニューリスト */}
      <div className="grid grid-cols-3 gap-8">
        {[
          { label: '採用書類作成', sub: 'Create Documents', href: '/b/recruitment_doc' }, // 先ほどのページへリンクさせる想定
          { label: '社員管理dammy', sub: 'Manage Members', href: '#' },
          { label: '設定dammy', sub: 'System Settings', href: '#' },
        ].map((item) => (
          <Link 
            key={item.label} 
            href={item.href}
            className="group flex flex-col items-center justify-center w-48 h-48 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 mb-4 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              {/* 簡易アイコン（丸） */}
              <span className="text-xl">📄</span>
            </div>
            <span className="font-bold text-gray-800">{item.label}</span>
            <span className="text-xs text-gray-400 mt-1 font-light tracking-wide">{item.sub}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}