
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

                                {/* Basic Settings */}
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">地域単価</label>
                                        <input
                                            type="number"
                                            value={config.regionalUnitPrice}
                                            onChange={(e) => setConfigField('regionalUnitPrice', parseFloat(e.target.value))}
                                            className="w-full p-2 border border-slate-300 rounded-md"
                                            step="0.01"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            前年度平均利用者数
                                            <span className="ml-2 text-xs text-slate-500 font-normal">※加算判定の基準</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={config.prevAvgUsers}
                                            onChange={(e) => setConfigField('prevAvgUsers', parseInt(e.target.value) || 0)}
                                            className="w-full p-2 border border-slate-300 rounded-md"
                                            step="1" // No decimals
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            営業日数
                                            <span className="ml-2 text-xs text-slate-500 font-normal">※日割り計算用</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={config.operatingDays}
                                            onChange={(e) => setConfigField('operatingDays', parseInt(e.target.value) || 0)}
                                            className="w-full p-2 border border-slate-300 rounded-md"
                                            step="1"
                                            min="1" max="31"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">追加配置パート (週合計時間)</label>
                                        <div className="flex flex-col space-y-2">
                                            <input
                                                type="range"
                                                min="0" max="200"
                                                value={config.additionalPartTimeHours}
                                                onChange={(e) => setConfigField('additionalPartTimeHours', parseInt(e.target.value) || 0)}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold">{config.additionalPartTimeHours} 時間</span>
                                                <span className="text-slate-500">+{(config.additionalPartTimeHours / 40).toFixed(1)}人 (常勤換算)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Staffing Status Display */}
                                <div className="p-3 bg-slate-100 rounded-lg text-sm space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 font-medium">現在の人員配置</span>
                                        <span className="font-bold text-slate-800">
                                            {results.totalFTE.toFixed(1)}人 (常勤換算)
                                        </span>
                                    </div>

                                    <div className="pt-2 border-t border-slate-200">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex flex-col">
                                                <span className="text-slate-600">判定区分(R6)</span>
                                                <span className="text-[10px] text-slate-400">※前年度平均 {config.prevAvgUsers}名 基準</span>
                                            </div>
                                            <span className={`font-bold ${results.calculatedRatioType === 'Ratio_I' ? 'text-green-600' :
                                                    results.calculatedRatioType === 'Ratio_II' ? 'text-yellow-600' : 'text-red-500'
                                                }`}>
                                                {results.calculatedRatioType === 'Ratio_I' ? '人員配置体制加算(I) 適用中 (12:1基準クリア)' :
                                                    results.calculatedRatioType === 'Ratio_II' ? '人員配置体制加算(II) 適用中 (30:1基準クリア)' : '加算なし (基準未達)'}
                                            </span>
                                        </div>

                                        {results.nextTierHours !== null && (
                                            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded flex items-start">
                                                <Info className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    あと <strong>{results.nextTierHours.toFixed(1)}時間/週</strong> の増員で
                                                    <br />
                                                    <strong>{results.calculatedRatioType === 'Ratio_II' ? '人員配置体制加算(I)' : '人員配置体制加算(II)'}</strong> が算定可能です
                                                </span>
                                            </div>
                                        )}
                                        {results.nextTierHours === null && (
                                            <div className="text-xs text-green-600 bg-green-50 p-1.5 rounded text-center">
                                                最高ランクの加算(I)を算定中
                                            </div>
                                        )}
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
                            </div>
                        )
                        }
                    </div >

                    {/* 2. Additions (Night/Prof) */}
                    < div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" >
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

                        {
                            activeAccordion === 'additions' && (
                                <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    {/* Night Support - Fixed Type I (Matrix) */}
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <label className="block text-sm font-medium mb-2 text-slate-700">夜間支援等体制加算 (体制I)</label>

                                        <div className="mb-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-slate-500">夜間支援員の配置人数</span>
                                                <span className="text-sm font-bold text-blue-600">{config.nightStaffCount}名</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1" max="4" step="1"
                                                value={config.nightStaffCount}
                                                onChange={(e) => setConfigField('nightStaffCount', parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                                <span>1名</span>
                                                <span>2名</span>
                                                <span>3名</span>
                                                <span>4名</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 mb-2 p-2 bg-white rounded border border-slate-100">
                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                                                適用規模
                                            </span>
                                            <span className="text-sm font-bold text-slate-800">
                                                {results.nightSupportInfo.label.split('(')[1].replace(')', '')}
                                            </span>
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            <div className="mt-1 text-slate-400 text-[10px]">
                                                ※障害区分(L4/L3/L2)により単価が異なります
                                            </div>
                                        </div>
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
                            )
                        }
                    </div >

                    {/* 3. Treatment Improvement */}
                    < div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" >
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

                        {
                            activeAccordion === 'treatment' && (
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
                            )
                        }
                    </div >

                </div >

                {/* --- RIGHT: Dashboard (8 cols) --- */}
                < div className="lg:col-span-8 space-y-6" >

                    {/* Summary Cards */}
                    < div className="grid grid-cols-1 md:grid-cols-3 gap-4" >
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
                    </div >

                    {/* Breakdown Table Area */}
                    < div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden" >
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
                    </div >

                </div >
            </main >
        </div >
    );
};
