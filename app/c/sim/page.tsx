'use client';

import React, { useState, useMemo } from 'react';



// ==========================================
// 1. 型定義 (Types)
// ==========================================

type RegionKey = '1級地' | '2級地' | '3級地' | 'その他';
type DisabilityLevel = '区分6' | '区分5' | '区分4' | '区分3' | '区分2' | '区分1' | '非該当';
type StaffRatio = '4:1' | '5:1' | '6:1' | '基準外';
type NightShiftType = 'なし' | 'Ⅰ(夜勤)' | 'Ⅱ(宿直)' | 'Ⅲ(連絡体制)';

interface AdditionItem {
  id: string;
  name: string;
  unit: number;
  description: string;
}

// ==========================================
// 2. マスタデータ & 定数
// ==========================================

const REGION_PRICES: Record<RegionKey, number> = {
  '1級地': 11.20, '2級地': 10.90, '3級地': 10.72, 'その他': 10.00,
};

const REWARD_MATRIX: Record<StaffRatio, Record<DisabilityLevel, number>> = {
  '4:1': { '区分6': 853, '区分5': 722, '区分4': 603, '区分3': 504, '区分2': 402, '区分1': 351, '非該当': 300 },
  '5:1': { '区分6': 750, '区分5': 635, '区分4': 531, '区分3': 444, '区分2': 354, '区分1': 309, '非該当': 264 },
  '6:1': { '区分6': 650, '区分5': 550, '区分4': 460, '区分3': 385, '区分2': 307, '区分1': 268, '非該当': 229 },
  '基準外': { '区分6': 0, '区分5': 0, '区分4': 0, '区分3': 0, '区分2': 0, '区分1': 0, '非該当': 0 }
};

const OTHER_ADDITIONS: AdditionItem[] = [
  { id: 'medical', name: '医療連携体制加算(IV)', unit: 39, description: '看護職員による訪問' },
  { id: 'severe', name: '重度障害者支援加算', unit: 50, description: '区分5,6への手厚い支援' },
  { id: 'welfare', name: '福祉専門職員配置等加算(I)', unit: 10, description: '良質な有資格者配置' },
];

const FULL_TIME_HOURS = 40;
const WEEKS_PER_MONTH = 4.3;

// ==========================================
// 3. 計算ロジック関数
// ==========================================

const calculateStaffRatio = (userCount: number, totalHours: number): { ratio: StaffRatio; fte: number; rate: number } => {
  if (userCount <= 0 || totalHours <= 0) return { ratio: '基準外', fte: 0, rate: 0 };
  const fte = totalHours / FULL_TIME_HOURS;
  const rate = userCount / fte;
  let ratio: StaffRatio = '基準外';
  if (rate <= 4.0) ratio = '4:1';
  else if (rate <= 5.0) ratio = '5:1';
  else if (rate <= 6.0) ratio = '6:1';
  return { ratio, fte, rate };
};

const calculateNightUnit = (type: NightShiftType, userCount: number): number => {
  if (type === 'なし') return 0;
  if (type === 'Ⅱ(宿直)') return 10;
  if (type === 'Ⅲ(連絡体制)') return 10;
  
  if (type === 'Ⅰ(夜勤)') {
    if (userCount <= 7) return 324;
    if (userCount <= 12) return 175;
    if (userCount <= 20) return 132;
    return 76;
  }
  return 0;
};

// ==========================================
// 4. メインコンポーネント
// ==========================================

export default function GroupHomeSimulator() {
  // State
  const [region, setRegion] = useState<RegionKey>('その他');
  
  // ★ここを追加・修正: デフォルト30日
  const [days, setDays] = useState<number>(30);
  
  const [userCount, setUserCount] = useState<number>(7);
  const [staffHours, setStaffHours] = useState<number>(70);
  const [calcMode, setCalcMode] = useState<'auto' | 'manual'>('auto');
  const [manualRatio, setManualRatio] = useState<StaffRatio>('4:1');
  const [level, setLevel] = useState<DisabilityLevel>('区分4');
  const [nightType, setNightType] = useState<NightShiftType>('なし');
  const [selectedAdditions, setSelectedAdditions] = useState<string[]>([]);

  // Cost State
  const [hourlyWage, setHourlyWage] = useState<number>(1200);
  const [nightCostPerShift, setNightCostPerShift] = useState<number>(18000);
  const [fixedCost, setFixedCost] = useState<number>(300000);

  // Calculation
  const staffStatus = useMemo(() => {
    if (calcMode === 'manual') return { ratio: manualRatio, fte: 0, rate: 0 };
    return calculateStaffRatio(userCount, staffHours);
  }, [userCount, staffHours, calcMode, manualRatio]);

  const revenue = useMemo(() => {
    const currentRatio = staffStatus.ratio;
    
    const baseUnitPerDay = REWARD_MATRIX[currentRatio][level];
    // ★日数を掛け算に使用
    const totalBaseUnits = baseUnitPerDay * days * userCount;

    const nightUnitPerDay = calculateNightUnit(nightType, userCount);
    // ★日数を掛け算に使用
    const totalNightUnits = nightUnitPerDay * days * userCount;

    const activeAdditions = OTHER_ADDITIONS.filter(item => selectedAdditions.includes(item.id));
    const otherAddUnitPerDay = activeAdditions.reduce((sum, item) => sum + item.unit, 0);
    // ★日数を掛け算に使用
    const totalOtherUnits = otherAddUnitPerDay * days * userCount;

    const totalUnits = totalBaseUnits + totalNightUnits + totalOtherUnits;
    const price = REGION_PRICES[region];
    const totalAmount = Math.floor(totalUnits * price);

    return {
      baseUnit: baseUnitPerDay,
      nightUnit: nightUnitPerDay,
      totalBaseUnits,
      totalNightUnits,
      totalOtherUnits,
      totalAmount
    };
  }, [staffStatus.ratio, level, days, userCount, nightType, selectedAdditions, region]);

  const profit = useMemo(() => {
    const dayLaborCost = Math.floor(staffHours * WEEKS_PER_MONTH * hourlyWage);
    
    // ★夜勤回数も日数(days)と連動させる（30日なら30回夜勤が発生すると仮定）
    const nightLaborCost = nightType !== 'なし' ? (days * nightCostPerShift) : 0;

    const totalLaborCost = dayLaborCost + nightLaborCost;
    const totalCost = totalLaborCost + fixedCost;
    const operatingProfit = revenue.totalAmount - totalCost;

    return { dayLaborCost, nightLaborCost, totalLaborCost, fixedCost, totalCost, operatingProfit };
  }, [staffHours, hourlyWage, days, nightCostPerShift, nightType, fixedCost, revenue.totalAmount]);

  const formatYen = (val: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg mb-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🍀くろーばー GH 経営シミュレーター
            </h1>
            <p className="text-indigo-200 text-sm mt-1">人員配置・夜勤体制・収支バランスを一括計算</p>
          </div>
          <div className="mt-4 md:mt-0 text-right bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <p className="text-xs text-indigo-200">想定営業利益 ({days}日分)</p>
            <p className={`text-2xl font-bold ${profit.operatingProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatYen(profit.operatingProfit)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. 基本スペック設定 */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center">
                1. 事業所の基本スペック
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">地域区分</label>
                  <select value={region} onChange={(e)=>setRegion(e.target.value as RegionKey)} className="w-full p-2 border rounded font-bold">
                    {Object.keys(REGION_PRICES).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">利用者数 (定員)</label>
                  <div className="flex items-center">
                    <input type="number" min={1} max={20} value={userCount} onChange={(e)=>setUserCount(Number(e.target.value))} className="w-full p-2 border rounded font-bold" />
                    <span className="ml-2 text-sm">人</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">平均・障害支援区分</label>
                  <select value={level} onChange={(e)=>setLevel(e.target.value as DisabilityLevel)} className="w-full p-2 border rounded font-bold">
                    {Object.keys(REWARD_MATRIX['4:1']).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                {/* ★追加した入力項目: 月間日数 */}
                <div className="bg-yellow-50 p-1 rounded border border-yellow-200">
                  <label className="block text-xs font-bold text-yellow-800 mb-1 px-1">月間営業(請求)日数</label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      min={1} 
                      max={31} 
                      value={days} 
                      onChange={(e) => setDays(Number(e.target.value))} 
                      className="w-full p-2 border border-yellow-300 rounded font-bold bg-white text-center" 
                    />
                    <span className="ml-2 text-sm text-yellow-800 font-bold">日</span>
                  </div>
                </div>
                
              </div>
            </section>

            {/* 2. 人員・勤務体制 */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center">
                2. 人員・勤務体制
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-bold text-blue-900 mb-3">☀️ 日中スタッフ体制</h3>
                  <div className="mb-3">
                    <label className="block text-xs font-bold text-slate-600 mb-1">週延べ勤務時間 (合計)</label>
                    <input type="number" value={staffHours} onChange={(e)=>setStaffHours(Number(e.target.value))} className="w-full p-2 border rounded font-bold" />
                  </div>
                  <div className="flex justify-between items-end bg-white p-2 rounded border border-blue-200">
                    <div className="text-xs text-slate-500">
                      自動判定:<br/>
                      <span className="text-lg font-bold text-blue-600">{staffStatus.ratio}</span>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      常勤換算: {staffStatus.fte.toFixed(1)}人<br/>
                      比率: 1:{staffStatus.rate.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 mb-3">🌙 夜間スタッフ体制</h3>
                  <div className="mb-3">
                    <label className="block text-xs font-bold text-slate-600 mb-1">夜間支援区分</label>
                    <select value={nightType} onChange={(e)=>setNightType(e.target.value as NightShiftType)} className="w-full p-2 border rounded font-bold">
                      <option value="なし">なし</option>
                      <option value="Ⅰ(夜勤)">Ⅰ (夜勤) - 高単価</option>
                      <option value="Ⅱ(宿直)">Ⅱ (宿直)</option>
                      <option value="Ⅲ(連絡体制)">Ⅲ (連絡体制)</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-indigo-200">
                    <span className="text-xs text-slate-500">適用加算単価</span>
                    <span className="font-bold text-indigo-600">{revenue.nightUnit} 単位/日</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                 <label className="block text-xs font-bold text-slate-600 mb-2">その他加算オプション</label>
                 <div className="flex flex-wrap gap-3">
                    {OTHER_ADDITIONS.map(item => (
                      <label key={item.id} className="flex items-center px-3 py-2 border rounded hover:bg-slate-50 cursor-pointer bg-white">
                        <input type="checkbox" checked={selectedAdditions.includes(item.id)} onChange={()=>{
                          setSelectedAdditions(prev => prev.includes(item.id) ? prev.filter(i=>i!==item.id) : [...prev, item.id])
                        }} className="w-4 h-4 text-indigo-600" />
                        <span className="ml-2 text-sm font-bold text-slate-700">{item.name}</span>
                      </label>
                    ))}
                 </div>
              </div>
            </section>

            {/* 3. コスト設定 */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center">
                3. コスト設定 (月額経費)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">日中スタッフ平均時給</label>
                  <div className="flex items-center">
                    <input type="number" value={hourlyWage} onChange={(e)=>setHourlyWage(Number(e.target.value))} className="w-full p-2 border rounded font-bold" />
                    <span className="ml-1 text-xs">円</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">1夜勤あたりの人件費</label>
                  <div className="flex items-center">
                    <input type="number" value={nightCostPerShift} onChange={(e)=>setNightCostPerShift(Number(e.target.value))} className="w-full p-2 border rounded font-bold" />
                    <span className="ml-1 text-xs">円</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">その他固定費(家賃等)</label>
                  <div className="flex items-center">
                    <input type="number" value={fixedCost} onChange={(e)=>setFixedCost(Number(e.target.value))} className="w-full p-2 border rounded font-bold" />
                    <span className="ml-1 text-xs">円</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">📉 収支シミュレーション</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">売上 (報酬総額)</span>
                    <span className="font-bold text-slate-800">{formatYen(revenue.totalAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">経費 (人件費+固定費)</span>
                    <span className="font-bold text-red-500">-{formatYen(profit.totalCost)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 relative">
                    <div className="bg-red-400 h-2 rounded-full absolute top-0 left-0" 
                         style={{width: `${Math.min((profit.totalCost / revenue.totalAmount) * 100, 100)}%`}}></div>
                  </div>
                  <div className="text-xs text-right text-slate-400 mt-1">
                    (内 人件費: {formatYen(profit.totalLaborCost)})
                  </div>
                </div>

                <div className={`p-4 rounded-lg text-center border-2 ${profit.operatingProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-xs font-bold opacity-70 mb-1">推定営業利益</p>
                  <p className={`text-3xl font-extrabold ${profit.operatingProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatYen(profit.operatingProfit)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm">
                <h4 className="font-bold text-slate-700 mb-3">📊 報酬内訳 ({days}日分)</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>基本報酬</span>
                    <span className="font-bold">{revenue.totalBaseUnits.toLocaleString()} 単位</span>
                  </li>
                  <li className="flex justify-between text-indigo-600">
                    <span>夜間支援加算</span>
                    <span className="font-bold">+{revenue.totalNightUnits.toLocaleString()} 単位</span>
                  </li>
                  <li className="flex justify-between">
                    <span>その他加算</span>
                    <span className="font-bold">+{revenue.totalOtherUnits.toLocaleString()} 単位</span>
                  </li>
                  <li className="border-t pt-2 flex justify-between font-bold">
                    <span>合計単位数</span>
                    <span>{Math.floor(revenue.totalAmount / REGION_PRICES[region]).toLocaleString()} 単位</span>
                  </li>
                </ul>
                <div className="text-right text-xs text-slate-400 mt-2">
                  ※地域単価: {REGION_PRICES[region]}円
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}