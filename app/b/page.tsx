// app/page.tsx
import RecruitmentPage from '@/components/RecruitmentPage';

export const metadata = {
  title: '採用書類ジェネレーター',
  description: 'AIを活用して採用通知書と稟議書を自動生成します',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* RecruitmentPageは "use client" なので、
        このサーバーコンポーネントから安全に呼び出せます。
      */}
      <RecruitmentPage />
    </main>
  );
}