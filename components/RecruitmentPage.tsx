"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { RecruitmentData } from './types';
import { RecruitmentDocument } from './RecruitmentDocument';
import { generatePdfData } from '@/app/actions';
import { RecruitmentForm } from './RecruitmentForm'; // 追加

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <p className="text-center mt-10">PDFエンジン起動中...</p> }
);

export default function RecruitmentPage() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfData, setPdfData] = useState<RecruitmentData | null>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const data = await generatePdfData(inputText);
      if (data) setPdfData(data);
    } catch (e) {
      console.error(e);
      alert("生成エラー");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6 h-screen overflow-hidden">
      
      {/* 左パネル: 入力 or 編集 */}
      <div className="w-full md:w-1/3 flex flex-col h-full">
        <h1 className="text-xl font-bold mb-4 text-gray-600">採用書類ジェネレーター</h1>
        
        {/* pdfDataがない時: AIプロンプト入力 */}
        {!pdfData ? (
          <div className="flex flex-col gap-4 h-full">
            <p className="text-sm text-gray-600">
              候補者の情報や条件を入力してください。
            </p>
            <textarea
              className="w-full flex-1 p-3 border rounded shadow-sm resize-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              placeholder="例：採用通知書の作成をお願い。 候補者：佐藤 健太（サトウ ケンタ） 2025年5月1日入社予定。 営業部の課長として採用。正社員。 基本給は40万円、役職手当が5万円。 交通費は全額支給。 試用期間は3ヶ月で条件変更なし。 面接官は田中部長と鈴木社長でした。 ちなみに採用エージェント経由で、手数料は年収の30%でOK。

"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !inputText}
              className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 transition flex justify-center items-center"
            >
              {isLoading ? 'AI解析中...' : '書類を生成する'}
            </button>
          </div>
        ) : (
          // pdfDataがある時: 編集フォーム
          <div className="flex-1 overflow-hidden border rounded bg-gray-50 p-2">
            <RecruitmentForm 
              data={pdfData} 
              onChange={(newData) => setPdfData(newData)} 
              onBack={() => {
                if(confirm("編集内容は破棄されますがよろしいですか？")) {
                  setPdfData(null);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* 右パネル: PDFプレビュー */}
      <div className="w-full md:w-2/3 bg-gray-100 rounded border h-full overflow-hidden">
        {pdfData ? (
          <PDFViewer width="100%" height="100%" className="rounded">
            <RecruitmentDocument data={pdfData} />
          </PDFViewer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="mb-2 text-3xl">📄</p>
            <p>左側のフォームに入力して<br/>「書類を生成する」を押してください</p>
          </div>
        )}
      </div>
    </div>
  );
}