
"use client";

import React, { useState } from 'react';
import { useSimulationLogic, ResidentState } from './useSimulationLogic';
import { Settings, Users, ArrowRight, AlertTriangle, TrendingUp, DollarSign, Calculator } from 'lucide-react';

export const SimulatorDashboard: React.FC = () => {
    const {
        config,
        setConfigField,
        setResident,
        results,
    } = useSimulationLogic();

    const [showDetails, setShowDetails] = useState(false);

    const handleResidentChange = (cls: keyof ResidentState, val: number) => {
        setResident(cls, val);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-blue-900 mb-2">グループホーム収益シミュレーター</h1>
                <p className="text-gray-600">人員配置と利用者構成を調整し、最大利益をシミュレーションします。</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Control Panel */}
                <div className="space-y-6">
                    {/* User Configuration */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
                            <Users className="w-5 h-5 mr-2" /> 利用者構成 (現在の空き: {30 - results.totalResidents}床)
                        </h2>
                        <div className="space-y-4">
                            {(Object.keys(config.residents) as Array<keyof ResidentState>).map((cls) => (
                                <div key={cls} className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-600 w-24">
                                        {cls.replace('class', '区分')}
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="15"
                                        value={config.residents[cls]}
                                        onChange={(e) => handleResidentChange(cls, parseInt(e.target.value))}
                                        className="flex-1 mx-4 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <input
                                        type="number"
                                        value={config.residents[cls]}
                                        onChange={(e) => handleResidentChange(cls, parseInt(e.target.value))}
                                        className="w-16 p-1 text-center border rounded-md"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Staffing Configuration */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
                            <Settings className="w-5 h-5 mr-2" /> 配員設定
                        </h2>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                追加パート時間 (週)
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    step="1"
                                    value={config.additionalPartTimeHours}
                                    onChange={(e) => setConfigField('additionalPartTimeHours', parseInt(e.target.value))}
                                    className="flex-1 mr-4 h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                                <span className="text-lg font-bold text-green-700 w-20 text-right">
                                    {config.additionalPartTimeHours}h
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                常勤換算: +{(config.additionalPartTimeHours / 40).toFixed(2)} 人
                            </p>
                        </div>

                        {/* Accordion for Details */}
                        <details className="group">
                            <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-500 hover:text-gray-700">
                                <span>詳細設定 (コスト・加算)</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <div className="mt-4 space-y-4 text-sm border-t pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-600 mb-1">時給 (円)</label>
                                        <input
                                            type="number"
                                            value={config.hourlyRate}
                                            onChange={(e) => setConfigField('hourlyRate', parseInt(e.target.value))}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 mb-1">法定福利費 (%)</label>
                                        <input
                                            type="number"
                                            value={config.socialInsuranceRate}
                                            onChange={(e) => setConfigField('socialInsuranceRate', parseFloat(e.target.value))}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={config.nightSupportTypeI}
                                        onChange={(e) => setConfigField('nightSupportTypeI', e.target.checked)}
                                        id="nightSupport"
                                    />
                                    <label htmlFor="nightSupport">夜間支援等体制加算（Ⅰ）</label>
                                </div>
                            </div>
                        </details>
                    </section>
                </div>

                {/* Right Column: Results */}
                <div className="space-y-6">
                    {/* Main KPI Card */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">現在の配置基準</h3>
                        <div className="flex items-end justify-between">
                            <div>
                                <span className={`text-5xl font-extrabold ${results.staffingRatioType === '4:1' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {results.staffingRatio} : 1
                                </span>
                                <span className="ml-2 text-xl font-bold text-gray-400">
                                    ({results.staffingRatioType})
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">総利用者数: {results.totalResidents}名</div>
                                <div className="text-sm text-gray-500">総常勤換算: {results.totalFTE.toFixed(1)}人</div>
                            </div>
                        </div>
                        {results.staffingRatio > 4.0 && (
                            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                <span>配置基準 4:1 を満たしていません。減算対象になる可能性があります。</span>
                            </div>
                        )}
                        {results.totalResidents > 30 && (
                            <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                <span>定員（30名）を超過しています。</span>
                            </div>
                        )}
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h4 className="text-gray-500 text-sm font-medium mb-1">月間予想売上</h4>
                            <div className="text-2xl font-bold text-gray-800">
                                ¥{results.monthlyRevenue.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" /> 加算込み
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h4 className="text-gray-500 text-sm font-medium mb-1">人件費（固定+追加）</h4>
                            <div className="text-2xl font-bold text-gray-800">
                                ¥{results.monthlyPersonnelCost.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Profit Highlight */}
                    <div className={`p-6 rounded-xl shadow-md text-white ${results.monthlyProfit >= 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
                        <h3 className="text-lg font-medium opacity-90 mb-1 flex items-center">
                            <DollarSign className="w-5 h-5 mr-1" /> 営業利益予測
                        </h3>
                        <div className="text-4xl font-extrabold tracking-tight">
                            ¥{results.monthlyProfit.toLocaleString()}
                        </div>
                        <p className="mt-2 text-sm opacity-80">
                            {results.monthlyProfit >= 0
                                ? "黒字達成中。さらなる人員配置の最適化を検討可能です。"
                                : "赤字予測です。利用者構成の見出しかもしくはコスト削減が必要です。"}
                        </p>
                    </div>

                    {/* Detail Toggle */}
                    <div className="text-center">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <Calculator className="w-4 h-4 mr-2" />
                            {showDetails ? '計算式を隠す' : '計算式の詳細を確認する'}
                        </button>
                    </div>

                    {/* Detailed Breakdown */}
                    {showDetails && (
                        <div className="bg-white p-6 rounded-xl shadow-inner border border-gray-200 text-sm space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">

                            {/* Revenue Breakdown */}
                            <div>
                                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">売上内訳</h4>
                                <div className="space-y-1 text-gray-600">
                                    <p className="font-semibold">基本報酬</p>
                                    <ul className="pl-0 space-y-2 mb-4">
                                        {results.breakdownRows
                                            .filter(r => r.category === 'Revenue' && r.id.startsWith('revenue-base'))
                                            .map((item) => (
                                                <li key={item.id} className="text-sm border-b border-gray-100 pb-1">
                                                    <div className="flex justify-between">
                                                        <span>{item.label}</span>
                                                        <span className="font-medium">¥{item.subtotal.toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">{item.formula}</div>
                                                </li>
                                            ))}
                                    </ul>
                                    <p className="font-semibold pt-2">加算</p>
                                    <ul className="pl-0 space-y-2">
                                        {results.breakdownRows
                                            .filter(r => r.category === 'Revenue' && !r.id.startsWith('revenue-base'))
                                            .map((item) => (
                                                <li key={item.id} className="text-sm border-b border-gray-100 pb-1">
                                                    <div className="flex justify-between">
                                                        <span>{item.label}</span>
                                                        <span className="font-medium">¥{item.subtotal.toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">{item.formula}</div>
                                                </li>
                                            ))}
                                    </ul>
                                    <div className="mt-2 pt-2 border-t border-dashed flex justify-between font-bold text-gray-800">
                                        <span>売上計</span>
                                        <span>¥{results.monthlyRevenue.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div>
                                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">コスト内訳</h4>
                                <div className="space-y-1 text-gray-600">
                                    <ul className="pl-0 space-y-2">
                                        {results.breakdownRows
                                            .filter(r => r.category === 'Cost')
                                            .map((item) => (
                                                <li key={item.id} className="text-sm border-b border-gray-100 pb-1">
                                                    <div className="flex justify-between">
                                                        <span>{item.label}</span>
                                                        <span className="font-medium">¥{item.subtotal.toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">{item.formula}</div>
                                                </li>
                                            ))}
                                    </ul>
                                    <div className="mt-2 pt-2 border-t border-dashed flex justify-between font-bold text-gray-800">
                                        <span>コスト計</span>
                                        <span>¥{results.monthlyPersonnelCost.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
