
"use client";

import React, { useState } from 'react';
import { useSimulationLogic, SimulationConfig, CalculationItem } from './useSimulationLogic';
import {
    Settings, Users, Calculator, Info,
    ChevronDown, ChevronUp, DollarSign,
    Building2, Briefcase, Activity
} from 'lucide-react';

export const RevenueSimulator: React.FC = () => {
    const { config, setConfigField, setResident, results } = useSimulationLogic();
    const [activeAccordion, setActiveAccordion] = useState<string | null>('basic');
    const [showBreakdown, setShowBreakdown] = useState(true); // Default open for visibility

    // Helper for Accordion
    const toggleAccordion = (id: string) => {
        setActiveAccordion(activeAccordion === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    <h1 className="text-xl font-bold text-slate-800">グループホーム収益シミュレーター</h1>
                </div>
                <div className="text-sm text-slate-500 hidden md:block">
                    定員30名 (A:10 / B:20) | 地域単価: {config.regionalUnitPrice.toFixed(2)}円
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* --- LEFT: Settings Panel (4 cols) --- */}
                <div className="lg:col-span-4 space-y-4">

                    {/* 1. Basic & Staffing */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <button
                            onClick={() => toggleAccordion('basic')}
                            className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
                        >
                            <div className="flex items-center font-semibold text-slate-700">
                                <Users className="w-5 h-5 mr-2 text-blue-500" />
                                基本設定・人員
                            </div>
                            {activeAccordion === 'basic' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {activeAccordion === 'basic' && (
                            <div className="p-5 space-y-6 animate-in slide-in-from-top-2 duration-200">

                                {/* Region Price */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">地域単価 (円/単位)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={config.regionalUnitPrice}
                                        onChange={(e) => setConfigField('regionalUnitPrice', parseFloat(e.target.value))}
                                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Operating Days - Added */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">営業日数 (日/月)</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="range"
                                            min="28" max="31" step="1"
                                            value={config.operatingDays || 30}
                                            onChange={(e) => setConfigField('operatingDays', parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="font-bold text-slate-700 w-8 text-right">{config.operatingDays || 30}日</span>
                                    </div>
                                </div>

                                {/* Residents */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">利用者構成 (人)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[1, 2, 3, 4, 5, 6].map(num => {
                                            const key = `class${num}` as keyof typeof config.residents;
                                            return (
                                                <div key={key} className="flex items-center">
                                                    <span className="text-sm w-12 text-slate-600">区分{num}</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={config.residents[key]}
                                                        onChange={(e) => setResident(key, parseInt(e.target.value) || 0)}
                                                        className="w-full p-1 border border-slate-300 rounded text-center"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-2 text-right text-xs text-slate-500">
                                        合計: {results.totalResidents} 名 (空き: {30 - results.totalResidents})
                                    </div>
                                </div>

                                {/* Staffing Override */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">人員配置体制 (判定/指定)</label>
                                    <select
                                        value={config.staffingRatioOverride}
                                        onChange={(e) => setConfigField('staffingRatioOverride', e.target.value as any)}
                                        className="w-full p-2 border border-slate-300 rounded-md bg-white"
                                    >
                                        <option value="Auto">自動判定 ({results.staffingRatioType})</option>
                                        <option value="4:1">4:1 (強制)</option>
                                        <option value="5:1">5:1 (強制)</option>
                                        <option value="Other">その他 (強制)</option>
                                    </select>
                                </div>

                                {/* Additional Hours */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">追加パート時間 (週)</label>
                                    <input
                                        type="range"
                                        min="0" max="200"
                                        value={config.additionalPartTimeHours}
                                        onChange={(e) => setConfigField('additionalPartTimeHours', parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-sm mt-1">
                                        <span>{config.additionalPartTimeHours} 時間</span>
                                        <span className="text-slate-500">常勤換算 +{(config.additionalPartTimeHours / 40).toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Additions (Night/Prof) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <button
                            onClick={() => toggleAccordion('additions')}
                            className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
                        >
                            <div className="flex items-center font-semibold text-slate-700">
                                <Activity className="w-5 h-5 mr-2 text-green-500" />
                                体制加算設定
                            </div>
                            {activeAccordion === 'additions' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {activeAccordion === 'additions' && (
                            <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="block text-sm font-medium mb-1">夜間支援等体制加算 (夜間形態)</label>
                                    <select
                                        value={config.nightShiftType}
                                        onChange={(e) => setConfigField('nightShiftType', e.target.value as any)}
                                        className="w-full p-2 border border-slate-300 rounded-md"
                                    >
                                        <option value="staff">体制Ⅰ (常駐タイプ)</option>
                                        <option value="sleep_in">体制Ⅱ (宿直タイプ)</option>
                                        <option value="on_call">体制Ⅲ (連絡体制)</option>
                                        <option value="none">なし</option>
                                    </select>
                                    {config.nightShiftType !== 'none' && (
                                        <div className="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                            <span className="font-bold">自動判定:</span> {results.nightSupportInfo.label} ({results.nightSupportInfo.unit}単位)
                                            <br />
                                            <span className="opacity-80">※利用者数 {results.totalResidents}名により判定</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">福祉専門職員配置等加算</label>
                                    <select
                                        value={config.professionalStaffType}
                                        onChange={(e) => setConfigField('professionalStaffType', e.target.value as any)}
                                        className="w-full p-2 border border-slate-300 rounded-md"
                                    >
                                        <option value="I">Ⅰ (良)</option>
                                        <option value="II">Ⅱ</option>
                                        <option value="None">なし</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Treatment Improvement */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <button
                            onClick={() => toggleAccordion('treatment')}
                            className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
                        >
                            <div className="flex items-center font-semibold text-slate-700">
                                <Briefcase className="w-5 h-5 mr-2 text-orange-500" />
                                処遇改善加算率
                            </div>
                            {activeAccordion === 'treatment' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {activeAccordion === 'treatment' && (
                            <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500">処遇改善加算 (%)</label>
                                        <input
                                            type="number" step="0.1"
                                            value={config.treatmentImprovementRates.treatment}
                                            onChange={(e) => setConfigField('treatmentImprovementRates', { ...config.treatmentImprovementRates, treatment: parseFloat(e.target.value) })}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500">特定処遇改善加算 (%)</label>
                                        <input
                                            type="number" step="0.1"
                                            value={config.treatmentImprovementRates.special}
                                            onChange={(e) => setConfigField('treatmentImprovementRates', { ...config.treatmentImprovementRates, special: parseFloat(e.target.value) })}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500">ベースアップ等 (%)</label>
                                        <input
                                            type="number" step="0.1"
                                            value={config.treatmentImprovementRates.baseUp}
                                            onChange={(e) => setConfigField('treatmentImprovementRates', { ...config.treatmentImprovementRates, baseUp: parseFloat(e.target.value) })}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* --- RIGHT: Dashboard (8 cols) --- */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5"><DollarSign className="w-16 h-16" /></div>
                            <p className="text-sm font-medium text-slate-500">月間総売上</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">¥{results.monthlyRevenue.toLocaleString()}</p>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2 inline-block">
                                加算込 / 地域単価反映
                            </span>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5"><Users className="w-16 h-16" /></div>
                            <p className="text-sm font-medium text-slate-500">人件費目安</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">¥{results.monthlyPersonnelCost.toLocaleString()}</p>
                        </div>

                        <div className={`p-5 rounded-xl border shadow-sm relative overflow-hidden text-white 
                    ${results.monthlyProfit >= 0 ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-600' : 'bg-gradient-to-br from-red-500 to-rose-600 border-red-500'}`}>
                            <p className="text-sm font-medium opacity-80">営業利益</p>
                            <p className="text-3xl font-extrabold mt-1">¥{results.monthlyProfit.toLocaleString()}</p>
                            <p className="text-sm opacity-80 mt-1">粗利率: {((results.monthlyProfit / results.monthlyRevenue) * 100).toFixed(1)}%</p>
                        </div>
                    </div>

                    {/* Breakdown Table Area */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-700 flex items-center">
                                <Calculator className="w-5 h-5 mr-2 text-slate-400" />
                                計算詳細・内訳
                            </h3>
                            <button
                                onClick={() => setShowBreakdown(!showBreakdown)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {showBreakdown ? '閉じる' : '展開する'}
                            </button>
                        </div>

                        <div className={`transition-all duration-300 ${showBreakdown ? 'max-h-[800px] opacity-100' : 'max-h-[300px] opacity-100'} overflow-auto`}>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 min-w-[180px]">項目名</th>
                                        <th className="px-2 py-3">単価</th>
                                        <th className="px-2 py-3 text-center">日</th>
                                        <th className="px-2 py-3 text-center">人</th>
                                        <th className="px-4 py-3 min-w-[200px]">計算式</th>
                                        <th className="px-4 py-3 text-right">小計 (円)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {results.breakdownRows.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-700">{row.label}</td>
                                            <td className="px-2 py-3 text-slate-500">{typeof row.unitPrice === 'number' ? row.unitPrice.toLocaleString() : row.unitPrice}</td>
                                            <td className="px-2 py-3 text-center text-slate-500">{row.days}</td>
                                            <td className="px-2 py-3 text-center text-slate-500">{row.count}</td>
                                            <td className="px-4 py-3 text-xs text-blue-600 font-mono bg-blue-50/50 rounded inline-block my-2 w-full">
                                                {row.formula}
                                            </td>
                                            <td className={`px-4 py-3 text-right font-bold ${row.category === 'Cost' ? 'text-red-600' : 'text-slate-800'}`}>
                                                {row.category === 'Cost' ? '-' : ''}¥{row.subtotal.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
                                    <tr>
                                        <td className="px-4 py-3" colSpan={5}>合計 (利益)</td>
                                        <td className={`px-4 py-3 text-right text-lg ${results.monthlyProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                            ¥{results.monthlyProfit.toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};
