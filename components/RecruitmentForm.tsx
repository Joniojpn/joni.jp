// components/RecruitmentForm.tsx
import React from 'react';
import { RecruitmentData } from './types';

interface Props {
  data: RecruitmentData;
  onChange: (newData: RecruitmentData) => void;
  onBack: () => void;
}

export const RecruitmentForm: React.FC<Props> = ({ data, onChange, onBack }) => {
  // 深い階層のデータを更新するためのヘルパー関数
  const handleChange = (section: keyof RecruitmentData, key: string, value: any, subSection?: string) => {
    const newData = { ...data };
    
    if (subSection) {
      (newData as any)[section][subSection][key] = value;
    } else {
      (newData as any)[section][key] = value;
    }
    onChange(newData);
  };

  // 共通スタイル定義
  const labelStyle = "block text-sm font-medium text-gray-900 mb-1";
  const inputStyle = "border border-gray-300 text-gray-900 w-full p-1.5 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-2">
      <div className="flex justify-between items-center mb-2 pb-2 border-b">
        <h2 className="text-lg font-bold text-gray-900">内容の編集</h2>
        <button onClick={onBack} className="text-sm text-blue-600 hover:text-blue-800 underline font-medium">
          ← AI入力に戻る
        </button>
      </div>

      {/* --- 候補者情報 --- */}
      <section className="border p-4 rounded bg-white shadow-sm">
        <h3 className="font-bold mb-3 text-gray-800 border-l-4 border-blue-500 pl-2">候補者情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className={labelStyle}>
            氏名
            <input className={inputStyle}
              value={data.candidate.name} 
              onChange={(e) => handleChange('candidate', 'name', e.target.value)} />
          </label>
          <label className={labelStyle}>
            フリガナ
            <input className={inputStyle}
              value={data.candidate.furigana} 
              onChange={(e) => handleChange('candidate', 'furigana', e.target.value)} />
          </label>
        </div>
      </section>

      {/* --- 採用条件 --- */}
      <section className="border p-4 rounded bg-white shadow-sm">
        <h3 className="font-bold mb-3 text-gray-800 border-l-4 border-blue-500 pl-2">採用条件</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className={labelStyle}>入社日
            <input className={inputStyle} value={data.employment.joiningDate} onChange={(e) => handleChange('employment', 'joiningDate', e.target.value)} />
          </label>
          <label className={labelStyle}>部署
            <input className={inputStyle} value={data.employment.department} onChange={(e) => handleChange('employment', 'department', e.target.value)} />
          </label>
          <label className={labelStyle}>役職
            <input className={inputStyle} value={data.employment.position} onChange={(e) => handleChange('employment', 'position', e.target.value)} />
          </label>
           <label className={labelStyle}>勤務地
            <input className={inputStyle} value={data.employment.workLocation} onChange={(e) => handleChange('employment', 'workLocation', e.target.value)} />
          </label>
        </div>
      </section>

      {/* --- 給与 (本採用時のみ抜粋) --- */}
      <section className="border p-4 rounded bg-white shadow-sm">
        <h3 className="font-bold mb-3 text-gray-800 border-l-4 border-blue-500 pl-2">給与 (本採用時)</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className={labelStyle}>基本給
            <input type="number" className={inputStyle}
              value={data.salary.official.basic} 
              onChange={(e) => handleChange('salary', 'basic', Number(e.target.value), 'official')} />
          </label>
          <label className={labelStyle}>月額合計
            <input type="number" className={inputStyle}
              value={data.salary.official.totalMonthly} 
              onChange={(e) => handleChange('salary', 'totalMonthly', Number(e.target.value), 'official')} />
          </label>
          <label className={labelStyle}>理論年収
            <input type="number" className={inputStyle}
              value={data.salary.annualIncome} 
              onChange={(e) => handleChange('salary', 'annualIncome', Number(e.target.value))} />
          </label>
        </div>
      </section>

       {/* --- 稟議情報 --- */}
       <section className="border p-4 rounded bg-white shadow-sm mb-4">
        <h3 className="font-bold mb-3 text-gray-800 border-l-4 border-blue-500 pl-2">稟議・承認</h3>
        <div className="flex flex-col gap-4">
          <label className={labelStyle}>応募経路
            <input className={inputStyle} value={data.approvalRequest.recruitmentRoute} onChange={(e) => handleChange('approvalRequest', 'recruitmentRoute', e.target.value)} />
          </label>
          <label className={labelStyle}>採用Fee (円)
            <input type="number" className={inputStyle} value={data.approvalRequest.recruitmentFee} onChange={(e) => handleChange('approvalRequest', 'recruitmentFee', Number(e.target.value))} />
          </label>
          <label className={labelStyle}>備考
            <textarea className={`${inputStyle} h-24 resize-none`} value={data.approvalRequest.notes} onChange={(e) => handleChange('approvalRequest', 'notes', e.target.value)} />
          </label>
        </div>
      </section>
    </div>
  );
};